import { FILE_CHUNK_SIZE } from "@/lib/constants";

export async function fileToBase64Chunks(file: File, chunkSize = FILE_CHUNK_SIZE) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const totalChunks = Math.ceil(bytes.byteLength / chunkSize);
  const chunks: string[] = [];

  for (let index = 0; index < totalChunks; index += 1) {
    const start = index * chunkSize;
    const end = Math.min(start + chunkSize, bytes.byteLength);
    let binary = "";

    bytes.slice(start, end).forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    chunks.push(btoa(binary));
  }

  return {
    chunks,
    totalChunks,
    totalBytes: bytes.byteLength,
  };
}

export function chunksToBlob(chunks: string[], mimeType: string) {
  const parts = chunks.map((chunk) => {
    const binary = atob(chunk);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  });

  return new Blob(parts, { type: mimeType });
}
