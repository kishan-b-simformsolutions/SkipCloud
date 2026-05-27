import { FileTransferMeta } from "@/types";
import { chunksToBlob, fileToBase64Chunks } from "@/utils/fileChunk";

export async function prepareFileTransfer(file: File, senderId: string, receiverId: string) {
  const { chunks, totalChunks, totalBytes } = await fileToBase64Chunks(file);
  const meta: FileTransferMeta = {
    id: crypto.randomUUID(),
    name: file.name,
    size: totalBytes,
    mimeType: file.type || "application/octet-stream",
    totalChunks,
    senderId,
    receiverId,
    createdAt: new Date().toISOString(),
  };

  return { meta, chunks };
}

export function createFileDownloadUrl(meta: FileTransferMeta, chunks: string[]) {
  const blob = chunksToBlob(chunks, meta.mimeType);
  return URL.createObjectURL(blob);
}
