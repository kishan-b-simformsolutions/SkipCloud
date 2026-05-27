const DEFAULT_STUN_URLS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
];

function parseUrls(value: string | undefined, fallback: string[] = []) {
  const urls = (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return urls.length ? urls : fallback;
}

function getIceTransportPolicy(): RTCIceTransportPolicy | undefined {
  const value = process.env.NEXT_PUBLIC_WEBRTC_ICE_TRANSPORT_POLICY?.trim().toLowerCase();

  if (value === "all" || value === "relay") {
    return value;
  }

  return undefined;
}

export function getRtcConfiguration(): RTCConfiguration {
  const stunUrls = parseUrls(process.env.NEXT_PUBLIC_WEBRTC_STUN_URLS, DEFAULT_STUN_URLS);
  const turnUrls = parseUrls(process.env.NEXT_PUBLIC_WEBRTC_TURN_URLS);
  const turnUsername = process.env.NEXT_PUBLIC_WEBRTC_TURN_USERNAME?.trim();
  const turnCredential = process.env.NEXT_PUBLIC_WEBRTC_TURN_CREDENTIAL?.trim();
  const iceServers: RTCIceServer[] = [];

  if (stunUrls.length) {
    iceServers.push({ urls: stunUrls });
  }

  if (turnUrls.length && turnUsername && turnCredential) {
    iceServers.push({
      urls: turnUrls,
      username: turnUsername,
      credential: turnCredential,
    });
  } else if (turnUrls.length) {
    console.warn("TURN URLs were provided without both TURN username and credential. TURN relay will be skipped.");
  }

  const iceTransportPolicy = getIceTransportPolicy();

  return {
    iceServers,
    ...(iceTransportPolicy ? { iceTransportPolicy } : {}),
  };
}