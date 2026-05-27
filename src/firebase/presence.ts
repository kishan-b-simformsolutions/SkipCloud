import { DataSnapshot, onDisconnect, onValue, ref, serverTimestamp, set } from "firebase/database";
import { realtimeDb } from "@/firebase/config";
import { PresenceRecord } from "@/types";

function isPermissionDeniedError(error: unknown) {
  return typeof error === "object"
    && error !== null
    && "code" in error
    && (error as { code?: string }).code === "PERMISSION_DENIED";
}

async function runPresenceWrite(task: () => Promise<void>) {
  try {
    await task();
  } catch (error) {
    if (!isPermissionDeniedError(error)) {
      throw error;
    }
  }
}

export async function bindPresence(userId: string) {
  const connectedRef = ref(realtimeDb, ".info/connected");
  const presenceRef = ref(realtimeDb, `/status/${userId}`);

  const getOfflineState = () => ({
    online: false,
    lastSeen: Date.now(),
  });

  const getOnlineState = () => ({
    online: true,
    lastSeen: Date.now(),
    updatedAt: serverTimestamp(),
  });

  const unsubscribeConnected = onValue(connectedRef, async (snapshot) => {
    if (!snapshot.val()) {
      return;
    }

    await runPresenceWrite(async () => {
      await onDisconnect(presenceRef).set(getOfflineState());
    });

    await runPresenceWrite(async () => {
      await set(presenceRef, getOnlineState());
    });
  });

  return async () => {
    unsubscribeConnected();

    await runPresenceWrite(async () => {
      await onDisconnect(presenceRef).cancel();
    });

    await runPresenceWrite(async () => {
      await set(presenceRef, getOfflineState());
    });
  };
}

export function subscribeToPresence(userIds: string[], callback: (presence: Record<string, PresenceRecord>) => void) {
  const unsubscribers = userIds.map((userId) => {
    const statusRef = ref(realtimeDb, `/status/${userId}`);
    return onValue(statusRef, (snapshot: DataSnapshot) => {
      callback({
        [userId]: (snapshot.val() as PresenceRecord) || { online: false, lastSeen: Date.now() },
      });
    });
  });

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
}
