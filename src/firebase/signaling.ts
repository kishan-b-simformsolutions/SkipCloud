import { clearSignal, sendSignal, subscribeToSignals } from "@/firebase/firestore";
import { SignalRecord } from "@/types";

type SignalHandlerResult = boolean | void;

export async function emitOffer(fromUserId: string, toUserId: string, sdp: RTCSessionDescriptionInit) {
  return sendSignal(fromUserId, toUserId, "offer", JSON.stringify(sdp));
}

export async function emitAnswer(fromUserId: string, toUserId: string, sdp: RTCSessionDescriptionInit) {
  return sendSignal(fromUserId, toUserId, "answer", JSON.stringify(sdp));
}

export async function emitIceCandidate(fromUserId: string, toUserId: string, candidate: RTCIceCandidateInit) {
  return sendSignal(fromUserId, toUserId, "ice", JSON.stringify(candidate));
}

export function listenForSignals(userId: string, callback: (signal: SignalRecord) => Promise<SignalHandlerResult> | SignalHandlerResult) {
  return subscribeToSignals(userId, async (signals) => {
    for (const signal of signals) {
      let handled = false;

      try {
        handled = (await callback(signal)) !== false;
      } catch (error) {
        console.warn("Failed to handle signaling message", signal, error);
      }

      if (handled) {
        await clearSignal(signal.id).catch(() => undefined);
      }
    }
  });
}
