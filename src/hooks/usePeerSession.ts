"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage, FileTransferMeta, FileTransferProgress, PeerPacket, UserRecord } from "@/types";
import { PeerConnectionManager } from "@/webrtc/peerConnection";
import { createFileDownloadUrl, prepareFileTransfer } from "@/webrtc/fileTransfer";

const HANDSHAKE_TIMEOUT_MS = 8000;

export function usePeerSession(currentUser: UserRecord | null, peerUser: UserRecord | null) {
  const managerRef = useRef<PeerConnectionManager | null>(null);
  const handshakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelStateRef = useRef("closed");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionState, setConnectionState] = useState<string>("idle");
  const [channelState, setChannelState] = useState<string>("closed");
  const [transfer, setTransfer] = useState<FileTransferProgress | null>(null);
  const [sessionError, setSessionError] = useState<string>("");
  const incomingMetaRef = useRef<Record<string, FileTransferMeta>>({});
  const incomingChunksRef = useRef<Record<string, string[]>>({});
  const objectUrlsRef = useRef<string[]>([]);

  function trackObjectUrl(url: string) {
    objectUrlsRef.current.push(url);
    return url;
  }

  function updateFileMessage(fileId: string, updater: (message: ChatMessage) => ChatMessage) {
    setMessages((current) => current.map((message) => (message.id === fileId ? updater(message) : message)));
  }

  function createFileMessage(meta: FileTransferMeta, direction: "sending" | "receiving", downloadUrl?: string): ChatMessage {
    return {
      id: meta.id,
      fromUserId: meta.senderId,
      toUserId: meta.receiverId,
      body: meta.name,
      createdAt: meta.createdAt,
      status: direction === "sending" ? "sending" : "received",
      messageType: "file",
      file: {
        fileId: meta.id,
        fileName: meta.name,
        fileSize: meta.size,
        mimeType: meta.mimeType,
        direction,
        progress: 0,
        transferredBytes: 0,
        totalBytes: meta.size,
        transferStatus: "running",
        downloadUrl,
      },
    };
  }

  function clearHandshakeTimer() {
    if (!handshakeTimerRef.current) {
      return;
    }

    clearTimeout(handshakeTimerRef.current);
    handshakeTimerRef.current = null;
  }

  function scheduleHandshakeTimeout() {
    clearHandshakeTimer();
    handshakeTimerRef.current = setTimeout(() => {
      if (channelStateRef.current === "open") {
        return;
      }

      setSessionError("Handshake sent. Ask the other member to open this same conversation with your name selected, then retry if needed.");
    }, HANDSHAKE_TIMEOUT_MS);
  }

  const handlePacket = useCallback((packet: PeerPacket) => {
    if (packet.type === "message") {
      setMessages((current) => [
        ...current,
        {
          ...packet.payload,
          status: "received",
        },
      ]);
      return;
    }

    if (packet.type === "file-meta") {
      incomingMetaRef.current[packet.payload.id] = packet.payload;
      incomingChunksRef.current[packet.payload.id] = [];
      setMessages((current) => [...current, createFileMessage(packet.payload, "receiving")]);
      setTransfer({
        fileId: packet.payload.id,
        fileName: packet.payload.name,
        direction: "receiving",
        percentage: 0,
        transferredBytes: 0,
        totalBytes: packet.payload.size,
        status: "running",
      });
      return;
    }

    if (packet.type === "file-chunk") {
      const meta = incomingMetaRef.current[packet.payload.fileId];
      if (!meta) return;
      const currentChunks = incomingChunksRef.current[packet.payload.fileId] || [];
      const nextChunks = [...currentChunks];
      nextChunks[packet.payload.chunkIndex] = packet.payload.content;
      incomingChunksRef.current[packet.payload.fileId] = nextChunks;
      const receivedChunkCount = nextChunks.filter(Boolean).length;
      const percentage = Math.round((receivedChunkCount / packet.payload.totalChunks) * 100);
      const transferredBytes = Math.min(meta.size, Math.round((meta.size * receivedChunkCount) / packet.payload.totalChunks));

      updateFileMessage(packet.payload.fileId, (message) => ({
        ...message,
        file: message.file
          ? {
              ...message.file,
              progress: percentage,
              transferredBytes,
              transferStatus: percentage === 100 ? "completed" : "running",
            }
          : message.file,
      }));

      setTransfer({
        fileId: meta.id,
        fileName: meta.name,
        direction: "receiving",
        percentage,
        transferredBytes,
        totalBytes: meta.size,
        status: percentage === 100 ? "completed" : "running",
      });
      return;
    }

    if (packet.type === "file-complete") {
      const meta = incomingMetaRef.current[packet.payload.fileId];
      if (!meta) return;
      const downloadUrl = trackObjectUrl(createFileDownloadUrl(meta, incomingChunksRef.current[packet.payload.fileId] || []));

      updateFileMessage(packet.payload.fileId, (message) => ({
        ...message,
        file: message.file
          ? {
              ...message.file,
              progress: 100,
              transferredBytes: meta.size,
              transferStatus: "completed",
              downloadUrl,
            }
          : message.file,
      }));

      setTransfer({
        fileId: meta.id,
        fileName: meta.name,
        direction: "receiving",
        percentage: 100,
        transferredBytes: meta.size,
        totalBytes: meta.size,
        status: "completed",
      });
    }
  }, []);

  useEffect(() => {
    channelStateRef.current = channelState;

    if (channelState === "open") {
      clearHandshakeTimer();
    }
  }, [channelState]);

  useEffect(() => {
    if (!currentUser || !peerUser) return;

    const manager = new PeerConnectionManager(currentUser.id, peerUser.id, {
      onStateChange: (state) => {
        setConnectionState(state);
        if (state === "connected") {
          clearHandshakeTimer();
          setSessionError("");
        }
      },
      onChannelStateChange: (state) => {
        if (state === "open") {
          clearHandshakeTimer();
          setSessionError("");
        }
        setChannelState(state);
      },
      onPacket: (packet) => handlePacket(packet),
    });

    manager.attach();
    managerRef.current = manager;

    return () => {
      clearHandshakeTimer();
      manager.disconnect();
      managerRef.current = null;
      setMessages([]);
      setTransfer(null);
      setSessionError("");
      setConnectionState("idle");
      setChannelState("closed");
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
      incomingMetaRef.current = {};
      incomingChunksRef.current = {};
    };
  }, [currentUser, handlePacket, peerUser]);

  async function connect() {
    if (!managerRef.current) return;
    setSessionError("");
    if (connectionState === "idle" || connectionState === "closed" || connectionState === "failed") {
      setConnectionState("connecting");
    }
    await managerRef.current.start();
    scheduleHandshakeTimeout();
  }

  function sendMessage(body: string) {
    if (!currentUser || !peerUser || !body.trim()) return;
    if (channelState !== "open") {
      setSessionError("Open the peer connection before sending a message.");
      return;
    }

    const packet: PeerPacket = {
      type: "message",
      payload: {
        id: crypto.randomUUID(),
        body,
        fromUserId: currentUser.id,
        toUserId: peerUser.id,
        createdAt: new Date().toISOString(),
      },
    };

    void (async () => {
      const sent = await managerRef.current?.send(packet);
      if (!sent) {
        setSessionError("The data channel is not open yet. Click Connect and wait for it to open.");
        return;
      }

      setSessionError("");
      setMessages((current) => [
        ...current,
        {
          ...packet.payload,
          status: "sent",
        },
      ]);
    })();
  }

  async function sendFile(file: File) {
    if (!currentUser || !peerUser || !managerRef.current) return;
    if (channelState !== "open") {
      setSessionError("Open the peer connection before sending a file.");
      return;
    }

    const { meta, chunks } = await prepareFileTransfer(file, currentUser.id, peerUser.id);
    const downloadUrl = trackObjectUrl(URL.createObjectURL(file));

    setMessages((current) => [...current, createFileMessage(meta, "sending", downloadUrl)]);

    const metaSent = await managerRef.current.send({ type: "file-meta", payload: meta });
    if (!metaSent) {
      updateFileMessage(meta.id, (message) => ({
        ...message,
        file: message.file
          ? {
              ...message.file,
              transferStatus: "failed",
            }
          : message.file,
      }));
      setSessionError("The data channel is not open yet. Click Connect and wait for it to open.");
      return;
    }

    setSessionError("");

    for (let index = 0; index < chunks.length; index += 1) {
      const chunkSent = await managerRef.current.send({
        type: "file-chunk",
        payload: {
          fileId: meta.id,
          chunkIndex: index,
          totalChunks: chunks.length,
          content: chunks[index],
        },
      });

      if (!chunkSent) {
        updateFileMessage(meta.id, (message) => ({
          ...message,
          file: message.file
            ? {
                ...message.file,
                progress: Math.round((index / chunks.length) * 100),
                transferredBytes: Math.round((meta.size * index) / chunks.length),
                transferStatus: "failed",
              }
            : message.file,
        }));
        setSessionError("The data channel closed while the file was being sent.");
        setTransfer({
          fileId: meta.id,
          fileName: meta.name,
          direction: "sending",
          percentage: Math.round((index / chunks.length) * 100),
          transferredBytes: Math.round((meta.size * index) / chunks.length),
          totalBytes: meta.size,
          status: "failed",
        });
        return;
      }

      const percentage = Math.round(((index + 1) / chunks.length) * 100);
      const transferredBytes = Math.min(meta.size, Math.round((meta.size * (index + 1)) / chunks.length));

      updateFileMessage(meta.id, (message) => ({
        ...message,
        status: percentage === 100 ? "sent" : message.status,
        file: message.file
          ? {
              ...message.file,
              progress: percentage,
              transferredBytes,
              transferStatus: percentage === 100 ? "completed" : "running",
            }
          : message.file,
      }));

      setTransfer({
        fileId: meta.id,
        fileName: meta.name,
        direction: "sending",
        percentage,
        transferredBytes,
        totalBytes: meta.size,
        status: percentage === 100 ? "completed" : "running",
      });
    }

    const completionSent = await managerRef.current.send({ type: "file-complete", payload: { fileId: meta.id } });
    if (!completionSent) {
      updateFileMessage(meta.id, (message) => ({
        ...message,
        file: message.file
          ? {
              ...message.file,
              transferStatus: "failed",
            }
          : message.file,
      }));
      setSessionError("The data channel closed before the file transfer could finish.");
    }
  }

  return {
    connect,
    sendMessage,
    sendFile,
    messages,
    connectionState,
    channelState,
    transfer,
    sessionError,
  };
}

export function useAutoStartPeerSession({
  currentUserId,
  peerUserId,
  peerOnline,
  connectionState,
  connect,
}: Readonly<{
  currentUserId?: string;
  peerUserId?: string;
  peerOnline: boolean;
  connectionState: string;
  connect: () => Promise<void>;
}>) {
  const lastAttemptKeyRef = useRef<string>("");

  useEffect(() => {
    if (!currentUserId || !peerUserId || !peerOnline) return;
    if (currentUserId > peerUserId) return;
    if (!["idle", "closed", "failed"].includes(connectionState)) return;

    const nextAttemptKey = `${peerUserId}:${connectionState}`;
    if (lastAttemptKeyRef.current === nextAttemptKey) return;

    lastAttemptKeyRef.current = nextAttemptKey;
    connect().catch(() => undefined);
  }, [connect, connectionState, currentUserId, peerOnline, peerUserId]);

  useEffect(() => {
    lastAttemptKeyRef.current = "";
  }, [peerUserId]);
}
