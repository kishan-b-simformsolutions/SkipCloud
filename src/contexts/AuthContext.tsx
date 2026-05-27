"use client";

import {
  ReactNode,
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FirebaseError } from "firebase/app";
import { bindPresence, subscribeToPresence } from "@/firebase/presence";
import { getCurrentUserProfile, logoutUser, subscribeToAuthState } from "@/firebase/auth";
import { listOrganizationMembers, subscribeToConversationRequests, subscribeToOrganizationMembers, subscribeToUserProfile } from "@/firebase/firestore";
import { ConversationRequestRecord, PresenceRecord, UserRecord } from "@/types";

/**
 * Firebase Auth can resolve before the matching Firestore profile is readable.
 * This retry loop keeps bootstrap logic resilient during that short consistency window.
 */
async function waitForUserProfile(userId: string, attempts = 10, delayMs = 300) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const profile = await getCurrentUserProfile(userId, { source: "server" });

    if (profile) {
      return profile;
    }

    if (attempt < attempts - 1) {
      await new Promise((resolve) => globalThis.setTimeout(resolve, delayMs));
    }
  }

  return null;
}

function isRecoverableBootstrapError(error: unknown) {
  return error instanceof FirebaseError
    && (error.code === "unavailable" || error.code === "permission-denied");
}

interface AuthContextValue {
  user: UserRecord | null;
  members: UserRecord[];
  presence: Record<string, PresenceRecord>;
  conversationRequests: ConversationRequestRecord[];
  loading: boolean;
  refreshMembers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [members, setMembers] = useState<UserRecord[]>([]);
  const [presence, setPresence] = useState<Record<string, PresenceRecord>>({});
  const [conversationRequests, setConversationRequests] = useState<ConversationRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  function updateUser(nextUser: UserRecord | null) {
    startTransition(() => {
      setUser(nextUser);
    });
  }

  function updateMembers(nextMembers: UserRecord[]) {
    startTransition(() => {
      setMembers(nextMembers);
    });
  }

  function updateRequests(nextRequests: ConversationRequestRecord[]) {
    startTransition(() => {
      setConversationRequests(nextRequests);
    });
  }

  function updatePresence(nextPresence: Record<string, PresenceRecord>) {
    startTransition(() => {
      setPresence((current: Record<string, PresenceRecord>) => ({ ...current, ...nextPresence }));
    });
  }

  function resetSessionState() {
    startTransition(() => {
      setUser(null);
      setMembers([]);
      setPresence({});
      setConversationRequests([]);
      setLoading(false);
    });
  }

  useEffect(() => {
    let cleanupPresence: (() => void | Promise<void>) | undefined;
    let cleanupMembers: (() => void) | undefined;
    let cleanupProfile: (() => void) | undefined;
    let cleanupRequests: (() => void) | undefined;

    const clearSubscriptions = () => {
      void cleanupPresence?.();
      cleanupMembers?.();
      cleanupProfile?.();
      cleanupRequests?.();
    };

    const bootstrapSession = async (firebaseUser: Parameters<Parameters<typeof subscribeToAuthState>[0]>[0]) => {
      if (!firebaseUser) {
        resetSessionState();
        clearSubscriptions();
        return;
      }

      try {
        setLoading(true);
        const profile = await waitForUserProfile(firebaseUser.uid);

        startTransition(() => {
          setUser(profile);
          setLoading(false);
        });

        if (!profile) {
          console.warn("Authenticated user is missing a Firestore profile", firebaseUser.uid);
          await logoutUser().catch(() => undefined);
          return;
        }

        // Presence, profile, member, and request listeners are all session scoped.
        try {
          cleanupPresence = await bindPresence(profile.id);
        } catch (error) {
          console.warn("Failed to bind realtime presence", error);
        }

        cleanupProfile = subscribeToUserProfile(profile.id, updateUser);
        cleanupMembers = subscribeToOrganizationMembers(profile.orgId, updateMembers);
        cleanupRequests = subscribeToConversationRequests(profile.orgId, updateRequests);
      } catch (error) {
        const isRecoverableError = isRecoverableBootstrapError(error);
        console.error("Failed to bootstrap authenticated session", error);
        resetSessionState();

        if (error instanceof FirebaseError && error.code === "permission-denied") {
          await logoutUser().catch(() => undefined);
        }

        if (!isRecoverableError) {
          throw error;
        }
      }
    };

    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      void bootstrapSession(firebaseUser);
    });

    return () => {
      unsubscribe();
      clearSubscriptions();
    };
  }, []);

  useEffect(() => {
    if (!members.length) return;

    const unsubscribePresence = subscribeToPresence(
      members.map((member) => member.id),
      updatePresence,
    );

    return () => unsubscribePresence();
  }, [members]);

  const value = useMemo(
    () => ({
      user,
      members,
      presence,
      conversationRequests,
      loading,
      refreshMembers: async () => {
        if (!user) return;
        const nextMembers = await listOrganizationMembers(user.orgId);
        updateMembers(nextMembers);
      },
    }),
    [conversationRequests, loading, members, presence, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
