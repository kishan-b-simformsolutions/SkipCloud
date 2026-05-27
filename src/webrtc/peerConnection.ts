import { emitAnswer, emitIceCandidate, emitOffer, listenForSignals } from "@/firebase/signaling";
import { parsePacket, sendPacket } from "@/webrtc/dataChannel";
import { getRtcConfiguration } from "./config";
import { PeerPacket, SignalRecord } from "@/types";

export interface PeerSessionHandlers {
  onStateChange?: (state: RTCPeerConnectionState) => void;
  onChannelStateChange?: (state: RTCDataChannelState | "closed") => void;
  onPacket?: (packet: PeerPacket) => void;
}

/**
 * Coordinates the control plane for a peer session.
 * Firebase carries signaling messages while the data channel carries chat and file packets.
 */
export class PeerConnectionManager {
  private connection: RTCPeerConnection | null = null;
  private channel: RTCDataChannel | null = null;
  private unsubscribeSignals: (() => void) | null = null;
  private readonly processedSignalIds = new Set<string>();
  private pendingIceCandidates: RTCIceCandidateInit[] = [];

  constructor(
    private readonly currentUserId: string,
    private readonly peerUserId: string,
    private readonly handlers: PeerSessionHandlers,
  ) {}

  async start() {
    if (this.connection?.connectionState === "failed" || this.connection?.connectionState === "closed") {
      this.disconnect();
    }

    this.ensureConnection(true);
    this.ensureSignalListener();

    const connection = this.connection;
    if (!connection) return;

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    await emitOffer(this.currentUserId, this.peerUserId, offer);
  }

  async attach() {
    this.ensureConnection(false);
    this.ensureSignalListener();
  }

  async send(packet: PeerPacket) {
    return sendPacket(this.channel, packet);
  }

  disconnect() {
    this.unsubscribeSignals?.();
    this.unsubscribeSignals = null;
    this.processedSignalIds.clear();
    this.pendingIceCandidates = [];
    this.channel?.close();
    this.channel = null;
    this.connection?.close();
    this.connection = null;
    this.handlers.onChannelStateChange?.("closed");
    this.handlers.onStateChange?.("closed");
  }

  private ensureConnection(createDataChannel: boolean) {
    if (this.connection) {
      if (createDataChannel && !this.channel) {
        const channel = this.connection.createDataChannel("skipcloud");
        this.bindChannel(channel);
      }
      return;
    }

    this.connection = new RTCPeerConnection(getRtcConfiguration());
    this.connection.onicecandidate = async (event) => {
      if (event.candidate) {
        await emitIceCandidate(this.currentUserId, this.peerUserId, event.candidate.toJSON());
      }
    };
    this.connection.onconnectionstatechange = () => {
      if (this.connection) {
        this.handlers.onStateChange?.(this.connection.connectionState);
      }
    };
    this.connection.ondatachannel = (event) => {
      this.bindChannel(event.channel);
    };

    if (createDataChannel) {
      const channel = this.connection.createDataChannel("skipcloud");
      this.bindChannel(channel);
    }
  }

  private ensureSignalListener() {
    if (this.unsubscribeSignals) return;

    this.unsubscribeSignals = listenForSignals(this.currentUserId, async (signal) => {
      if (signal.fromUserId !== this.peerUserId) return false;
      return this.handleSignal(signal);
    });
  }

  private bindChannel(channel: RTCDataChannel) {
    this.channel = channel;
    channel.onopen = () => this.handlers.onChannelStateChange?.(channel.readyState);
    channel.onclose = () => this.handlers.onChannelStateChange?.("closed");
    channel.onerror = () => this.handlers.onChannelStateChange?.("closing");
    channel.onmessage = (event) => {
      this.handlers.onPacket?.(parsePacket(event.data));
    };
  }

  private async handleSignal(signal: SignalRecord) {
    if (this.processedSignalIds.has(signal.id)) {
      return true;
    }

    this.ensureConnection(signal.type !== "offer");
    const connection = this.connection;
    if (!connection) return false;

    const payload = JSON.parse(signal.data);

    if (signal.type === "offer") {
      // Ignore duplicate or out-of-order offers until the connection returns to a stable state.
      if (connection.signalingState !== "stable") {
        return false;
      }

      this.processedSignalIds.add(signal.id);
      await connection.setRemoteDescription(payload);
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      await emitAnswer(this.currentUserId, this.peerUserId, answer);
      await this.flushPendingIceCandidates();
      return true;
    }

    if (signal.type === "answer") {
      if (connection.signalingState !== "have-local-offer") {
        return false;
      }

      if (connection.currentRemoteDescription?.type === "answer") {
        this.processedSignalIds.add(signal.id);
        return true;
      }

      this.processedSignalIds.add(signal.id);
      await connection.setRemoteDescription(payload);
      await this.flushPendingIceCandidates();
      return true;
    }

    this.processedSignalIds.add(signal.id);

    if (!connection.remoteDescription) {
      // ICE candidates can arrive before the remote description is applied.
      this.pendingIceCandidates.push(payload);
      return true;
    }

    await connection.addIceCandidate(payload);
    return true;
  }

  private async flushPendingIceCandidates() {
    const connection = this.connection;
    if (!connection?.remoteDescription || !this.pendingIceCandidates.length) {
      return;
    }

    const pendingCandidates = [...this.pendingIceCandidates];
    this.pendingIceCandidates = [];

    for (const candidate of pendingCandidates) {
      await connection.addIceCandidate(candidate);
    }
  }
}
