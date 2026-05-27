import { PeerPacket } from "@/types";

const CHANNEL_BUFFER_LOW_WATERMARK = 64 * 1024;
const CHANNEL_BUFFER_HIGH_WATERMARK = 256 * 1024;

async function waitForChannelDrain(channel: RTCDataChannel) {
  if (channel.readyState !== "open") {
    return false;
  }

  if (channel.bufferedAmount <= CHANNEL_BUFFER_HIGH_WATERMARK) {
    return true;
  }

  channel.bufferedAmountLowThreshold = CHANNEL_BUFFER_LOW_WATERMARK;

  return new Promise<boolean>((resolve) => {
    const cleanup = () => {
      channel.removeEventListener("bufferedamountlow", handleDrain);
      channel.removeEventListener("close", handleClose);
      channel.removeEventListener("error", handleClose);
    };

    const handleDrain = () => {
      if (channel.bufferedAmount > CHANNEL_BUFFER_LOW_WATERMARK) {
        return;
      }

      cleanup();
      resolve(channel.readyState === "open");
    };

    const handleClose = () => {
      cleanup();
      resolve(false);
    };

    channel.addEventListener("bufferedamountlow", handleDrain);
    channel.addEventListener("close", handleClose);
    channel.addEventListener("error", handleClose);
  });
}

export async function sendPacket(channel: RTCDataChannel | null, packet: PeerPacket) {
  if (channel?.readyState !== "open") {
    return false;
  }

  const serializedPacket = JSON.stringify(packet);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const readyToSend = await waitForChannelDrain(channel);
    if (!readyToSend) {
      return false;
    }

    try {
      channel.send(serializedPacket);
      return true;
    } catch {
      if (channel.readyState !== "open") {
        return false;
      }
    }
  }

  return false;
}

export function parsePacket(data: string): PeerPacket {
  return JSON.parse(data) as PeerPacket;
}
