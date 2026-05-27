import {
  addDoc,
  QueryDocumentSnapshot,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { ConversationRequestRecord, ConversationRequestStatus, OrganizationRecord, SignalRecord, UploadUserRow, UserRecord, UserRole } from "@/types";

const organizationsRef = collection(db, "organizations");
const usersRef = collection(db, "users");
const signalsRef = collection(db, "signals");
const conversationRequestsRef = collection(db, "conversationRequests");

function sortMembers(members: UserRecord[]) {
  return [...members].sort((left, right) => left.firstName.localeCompare(right.firstName));
}

function sortSignals(signals: SignalRecord[]) {
  return [...signals].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function sortConversationRequests(requests: ConversationRequestRecord[]) {
  return [...requests].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function createOrganization(name: string, adminId: string) {
  const organizationRef = doc(organizationsRef);
  const payload: OrganizationRecord = {
    id: organizationRef.id,
    name,
    adminId,
    createdAt: new Date().toISOString(),
  };

  await setDoc(organizationRef, {
    ...payload,
    createdAtServer: serverTimestamp(),
  });

  return payload;
}

export async function createUserProfile(user: Omit<UserRecord, "createdAt">) {
  const payload: UserRecord = {
    ...user,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(usersRef, user.id), {
    ...payload,
    createdAtServer: serverTimestamp(),
  });

  return payload;
}

export async function getUserProfile(userId: string, options?: { source?: "default" | "server" }) {
  const userRef = doc(usersRef, userId);
  const snapshot = options?.source === "server"
    ? await getDocFromServer(userRef)
    : await getDoc(userRef);
  return snapshot.exists() ? (snapshot.data() as UserRecord) : null;
}

export function subscribeToUserProfile(userId: string, callback: (user: UserRecord | null) => void) {
  return onSnapshot(doc(usersRef, userId), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data() as UserRecord) : null);
  });
}

export async function updateUserProfile(userId: string, updates: Partial<Pick<UserRecord, "firstName" | "lastName" | "position">>) {
  await updateDoc(doc(usersRef, userId), {
    ...updates,
    updatedAtServer: serverTimestamp(),
  });
}

export async function listOrganizationMembers(orgId: string) {
  const membersQuery = query(usersRef, where("orgId", "==", orgId));
  const snapshot = await getDocs(membersQuery);
  return sortMembers(snapshot.docs.map((member: QueryDocumentSnapshot) => member.data() as UserRecord));
}

export function subscribeToOrganizationMembers(orgId: string, callback: (members: UserRecord[]) => void) {
  const membersQuery = query(usersRef, where("orgId", "==", orgId));
  return onSnapshot(membersQuery, (snapshot) => {
    callback(sortMembers(snapshot.docs.map((member: QueryDocumentSnapshot) => member.data() as UserRecord)));
  });
}

export async function createBulkUserProfiles(orgId: string, rows: UploadUserRow[], role: UserRole = "user") {
  const createdUsers: Array<Omit<UserRecord, "createdAt">> = [];

  for (const row of rows) {
    const userRef = doc(usersRef);
    const profile = {
      id: userRef.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      position: row.position,
      orgId,
      role,
    };

    await createUserProfile(profile);
    createdUsers.push(profile);
  }

  return createdUsers;
}

export async function sendSignal(fromUserId: string, toUserId: string, type: SignalRecord["type"], data: string) {
  const signalDoc = await addDoc(signalsRef, {
    fromUserId,
    toUserId,
    type,
    data,
    createdAt: new Date().toISOString(),
    createdAtServer: serverTimestamp(),
  });

  return signalDoc.id;
}

export function subscribeToSignals(userId: string, callback: (signals: SignalRecord[]) => void) {
  const signalQuery = query(signalsRef, where("toUserId", "==", userId));
  return onSnapshot(signalQuery, (snapshot) => {
    callback(
      sortSignals(
        snapshot.docs.map((signal: QueryDocumentSnapshot) => ({
          id: signal.id,
          ...(signal.data() as Omit<SignalRecord, "id">),
        })),
      ),
    );
  });
}

export async function clearSignal(signalId: string) {
  await deleteDoc(doc(signalsRef, signalId));
}

export async function upsertConversationRequest(input: {
  orgId: string;
  fromUserId: string;
  toUserId: string;
  status?: ConversationRequestStatus;
}) {
  const requestId = `${input.fromUserId}__${input.toUserId}`;
  const requestRef = doc(conversationRequestsRef, requestId);
  const timestamp = new Date().toISOString();

  const payload: ConversationRequestRecord = {
    id: requestId,
    orgId: input.orgId,
    fromUserId: input.fromUserId,
    toUserId: input.toUserId,
    status: input.status ?? "pending",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await setDoc(requestRef, {
    ...payload,
    updatedAtServer: serverTimestamp(),
    createdAtServer: serverTimestamp(),
  }, { merge: true });

  return payload;
}

export async function updateConversationRequestStatus(requestId: string, status: ConversationRequestStatus) {
  await updateDoc(doc(conversationRequestsRef, requestId), {
    status,
    updatedAt: new Date().toISOString(),
    updatedAtServer: serverTimestamp(),
  });
}

export function subscribeToConversationRequests(orgId: string, callback: (requests: ConversationRequestRecord[]) => void) {
  const requestsQuery = query(conversationRequestsRef, where("orgId", "==", orgId));
  return onSnapshot(requestsQuery, (snapshot) => {
    callback(
      sortConversationRequests(
        snapshot.docs.map((request) => request.data() as ConversationRequestRecord),
      ),
    );
  });
}
