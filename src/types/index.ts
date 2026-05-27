export type UserRole = "admin" | "user";
export type SignalType = "offer" | "answer" | "ice";
export type PeerPacketType = "message" | "file-meta" | "file-chunk" | "file-complete" | "presence";
export type ConversationRequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export interface OrganizationRecord {
  id: string;
  name: string;
  adminId: string;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  orgId: string;
  role: UserRole;
  createdAt: string;
}

export interface PresenceRecord {
  online: boolean;
  lastSeen: number;
}

export interface SignalRecord {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: SignalType;
  data: string;
  createdAt: string;
}

export interface ConversationRequestRecord {
  id: string;
  orgId: string;
  fromUserId: string;
  toUserId: string;
  status: ConversationRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UploadUserRow {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
}

export interface ChatMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  createdAt: string;
  status: "sending" | "sent" | "received";
  messageType?: "text" | "file";
  file?: {
    fileId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    direction: "sending" | "receiving";
    progress: number;
    transferredBytes: number;
    totalBytes: number;
    transferStatus: FileTransferProgress["status"];
    downloadUrl?: string;
  };
}

export interface FileTransferMeta {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  totalChunks: number;
  senderId: string;
  receiverId: string;
  createdAt: string;
}

export interface FileTransferProgress {
  fileId: string;
  fileName: string;
  direction: "sending" | "receiving";
  percentage: number;
  transferredBytes: number;
  totalBytes: number;
  status: "idle" | "running" | "completed" | "failed";
}

export interface PeerPacketBase {
  type: PeerPacketType;
}

export interface MessagePacket extends PeerPacketBase {
  type: "message";
  payload: {
    id: string;
    body: string;
    fromUserId: string;
    toUserId: string;
    createdAt: string;
  };
}

export interface FileMetaPacket extends PeerPacketBase {
  type: "file-meta";
  payload: FileTransferMeta;
}

export interface FileChunkPacket extends PeerPacketBase {
  type: "file-chunk";
  payload: {
    fileId: string;
    chunkIndex: number;
    totalChunks: number;
    content: string;
  };
}

export interface FileCompletePacket extends PeerPacketBase {
  type: "file-complete";
  payload: {
    fileId: string;
  };
}

export interface PresencePacket extends PeerPacketBase {
  type: "presence";
  payload: {
    status: "connected" | "disconnected";
  };
}

export type PeerPacket =
  | MessagePacket
  | FileMetaPacket
  | FileChunkPacket
  | FileCompletePacket
  | PresencePacket;
