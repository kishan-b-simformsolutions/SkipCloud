# WebRTC Micro Session for SkipCloud

## Goal of This Session

This session is designed for a `20-25 minute` internal knowledge sharing talk.

The goal is to explain:

- what WebRTC is
- how it works in simple terms
- how this project uses WebRTC for direct chat and file sharing
- what the current implementation does well
- what limitations still exist in the project

This document is written in a simple, project-focused way so it can be used directly as speaking notes.

---

## 1. Simple Definition of WebRTC

WebRTC stands for `Web Real-Time Communication`.

In simple words:

- it allows two browsers to talk directly to each other
- it can be used for audio, video, chat, and file sharing
- it reduces the need to send data through your own backend server after the connection is established

In this project, we are using WebRTC mainly for:

- direct browser-to-browser messaging
- direct browser-to-browser file sharing

We are not using it here for:

- video calling
- audio calling

---

## 2. Big Picture in One Line

In SkipCloud, Firebase is used to help two users find each other and exchange connection setup information, and once the connection is ready, WebRTC DataChannel is used to send chat messages and file chunks directly between browsers.

---

## 3. Real-Life Analogy

You can explain WebRTC like this:

1. Two people want to talk privately.
2. They first use a receptionist to exchange contact details.
3. After that, they talk directly without the receptionist being in the middle.

In our project:

- `Firebase / Firestore` is the receptionist
- `WebRTC` is the direct private connection
- `DataChannel` is the private pipe used for messages and files

---

## 4. Session Agenda for 20-25 Minutes

You can use this speaking flow:

1. `2-3 min` - What WebRTC is
2. `3-4 min` - Important concepts: signaling, ICE, STUN, DataChannel
3. `6-8 min` - How SkipCloud uses WebRTC in this project
4. `4-5 min` - Walkthrough of the actual file flow in code
5. `3-4 min` - Current issues and limitations
6. `2-3 min` - Summary and Q&A

---

## 5. Important WebRTC Concepts

### 5.1 Signaling

WebRTC does not define how two users initially find each other.

So we need signaling.

Signaling means:

- exchanging `offer`
- exchanging `answer`
- exchanging `ICE candidates`

In SkipCloud, signaling is implemented using Firestore.

Relevant files:

- `src/firebase/signaling.ts`
- `src/firebase/firestore.ts`

### 5.2 Offer and Answer

When one user wants to start a connection:

1. that user creates an `offer`
2. the offer is sent to the other user through signaling
3. the second user receives the offer and creates an `answer`
4. the answer is sent back

After this, both browsers know how to start building the direct connection.

### 5.3 ICE Candidates

Browsers may have different network paths.

ICE candidates help both browsers figure out:

- how they can reach each other
- which route should be used for the peer connection

These candidates are also exchanged through signaling.

### 5.4 STUN

This project uses STUN servers:

- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

STUN helps browsers discover their public-facing network address.

Current project note:

- the project now supports `STUN + optional TURN`
- STUN is still the default path for direct peer-to-peer traffic
- TURN can be configured through environment variables when direct connectivity fails on stricter networks

Relevant file:

- `src/webrtc/peerConnection.ts`
- `src/webrtc/config.ts`

### 5.5 TURN

TURN is the fallback relay server used when two browsers cannot connect directly.

This matters for:

- office Wi-Fi with strict firewall rules
- mobile carriers
- hotel or public Wi-Fi
- symmetric NAT environments

SkipCloud now supports TURN via these client environment variables:

- `NEXT_PUBLIC_WEBRTC_TURN_URLS`
- `NEXT_PUBLIC_WEBRTC_TURN_USERNAME`
- `NEXT_PUBLIC_WEBRTC_TURN_CREDENTIAL`
- `NEXT_PUBLIC_WEBRTC_ICE_TRANSPORT_POLICY`

`NEXT_PUBLIC_WEBRTC_ICE_TRANSPORT_POLICY=all` means:

- try direct first
- fall back to TURN when needed

`NEXT_PUBLIC_WEBRTC_ICE_TRANSPORT_POLICY=relay` means:

- force TURN relay only
- useful for testing whether TURN is configured correctly

### 5.5 DataChannel

Once the WebRTC peer connection is established, a `RTCDataChannel` is used.

That channel carries:

- text messages
- file metadata
- file chunks
- file completion events

Relevant files:

- `src/webrtc/dataChannel.ts`
- `src/types/index.ts`

---

## 6. How WebRTC Works in SkipCloud

Here is the exact project flow.

### Step 1: User selects another member

From the chat page:

- user searches for a teammate
- user selects a teammate
- that teammate becomes the active peer user

Relevant file:

- `src/app/chat/page.tsx`

### Step 2: A peer session is created

The chat page uses:

- `usePeerSession(...)`
- `useAutoStartPeerSession(...)`

This hook creates and manages the peer session state.

Relevant file:

- `src/hooks/usePeerSession.ts`

### Step 3: PeerConnectionManager attaches

`PeerConnectionManager` is the main class that handles:

- creating the `RTCPeerConnection`
- creating the DataChannel on the initiator side
- listening for remote DataChannel on the receiver side
- sending offers
- receiving answers
- handling ICE candidates

Relevant file:

- `src/webrtc/peerConnection.ts`
- `src/webrtc/config.ts`

### Step 4: Signaling happens through Firestore

SkipCloud uses Firestore documents for signaling messages.

Signal types in the project:

- `offer`
- `answer`
- `ice`

Flow:

1. initiator calls `emitOffer(...)`
2. receiver listens through `listenForSignals(...)`
3. receiver handles the offer and sends `emitAnswer(...)`
4. both sides continue sharing ICE candidates with `emitIceCandidate(...)`

Relevant files:

- `src/firebase/signaling.ts`
- `src/firebase/firestore.ts`

### Step 5: DataChannel opens

Once the connection is successful:

- DataChannel state becomes `open`
- messages can be sent
- files can be sent

In the UI, this is reflected through:

- `connectionState`
- `channelState`

Relevant file:

- `src/hooks/usePeerSession.ts`

---

## 7. Current Project Packet Types

This is useful to explain because the project is not sending random JSON. It has a defined packet model.

Relevant file:

- `src/types/index.ts`

Packet types used in this project:

- `message`
- `file-meta`
- `file-chunk`
- `file-complete`
- `presence`

### 7.1 Message Packet

Used for normal direct chat.

---

## 8. TURN Deployment Notes

### Example Environment Setup

For a Coturn server:

```bash
NEXT_PUBLIC_WEBRTC_STUN_URLS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
NEXT_PUBLIC_WEBRTC_TURN_URLS=turn:turn.yourdomain.com:3478?transport=udp,turn:turn.yourdomain.com:3478?transport=tcp,turns:turn.yourdomain.com:5349?transport=tcp
NEXT_PUBLIC_WEBRTC_TURN_USERNAME=skipcloud
NEXT_PUBLIC_WEBRTC_TURN_CREDENTIAL=replace-with-strong-password
NEXT_PUBLIC_WEBRTC_ICE_TRANSPORT_POLICY=all
```

For troubleshooting TURN itself:

```bash
NEXT_PUBLIC_WEBRTC_ICE_TRANSPORT_POLICY=relay
```

If relay mode works and all mode also works, the TURN setup is healthy.

### Recommended Production Setup

1. Use a dedicated TURN host such as Coturn on a small VPS or a managed TURN provider.
2. Open `3478/udp`, `3478/tcp`, and optionally `5349/tcp` for TLS.
3. Use DNS such as `turn.yourdomain.com`.
4. Start with static credentials for internal testing.
5. Move to time-limited TURN credentials for production if external users or untrusted clients are involved.

### Cost Guidance

TURN cost has two parts:

- the relay server itself
- the traffic relayed through it

Typical small-team estimate:

- small VPS running Coturn: about `$5-$12/month`
- bandwidth-heavy usage can increase cost more than the VM itself

Rough relay bandwidth examples:

- chat only: usually very low cost
- document transfer: moderate
- large file transfer through TURN: this is the main cost driver

Practical expectation for SkipCloud:

- if most users connect directly with STUN, TURN cost stays low
- if many users sit behind strict NAT and send large files, TURN bandwidth becomes the real bill

Managed provider pricing varies, but expect to pay for relayed GB or peak usage rather than just server uptime.

### Flow Check After TURN Is Added

To validate the full flow:

1. set TURN env values
2. restart the Next.js app
3. open the same conversation on two users
4. first test with `NEXT_PUBLIC_WEBRTC_ICE_TRANSPORT_POLICY=relay`
5. confirm chat opens and a small file transfers
6. switch back to `all` for normal production behavior

Contains:

- message id
- sender id
- receiver id
- message body
- timestamp

### 7.2 File Meta Packet

Sent before sending the file chunks.

Contains:

- file id
- file name
- size
- mime type
- total chunks
- sender id
- receiver id

### 7.3 File Chunk Packet

Sent repeatedly until the whole file is transferred.

Contains:

- file id
- chunk index
- total chunks
- base64 content

### 7.4 File Complete Packet

Sent after all chunks are sent.

This tells the receiver that the file is complete and can be reconstructed and downloaded.

---

## 8. Chat Flow in This Project

Here is the message flow in simple steps:

1. user selects another user in chat
2. `usePeerSession` prepares the peer manager
3. one side starts the connection
4. offer/answer/ICE are exchanged through Firestore
5. DataChannel opens
6. sender creates a `message` packet
7. packet is sent using `sendPacket(...)`
8. receiver parses packet using `parsePacket(...)`
9. message is added to UI state

Relevant files:

- `src/hooks/usePeerSession.ts`
- `src/webrtc/dataChannel.ts`

---

## 9. File Sharing Flow in This Project

Here is the file flow in simple steps:

1. sender picks a file
2. file is converted into base64 chunks
3. sender sends `file-meta`
4. sender sends many `file-chunk` packets
5. sender sends `file-complete`
6. receiver rebuilds the file from chunks
7. receiver automatically downloads the file

Relevant files:

- `src/webrtc/fileTransfer.ts`
- `src/utils/fileChunk.ts`
- `src/hooks/usePeerSession.ts`

Important point to explain:

- file data is not uploaded to cloud storage in this flow
- it moves directly between browsers after the peer connection is ready

---

## 10. What Each Important File Does

### `src/webrtc/peerConnection.ts`

Main WebRTC engine.

Responsibilities:

- create peer connection
- create data channel on initiator side
- listen for remote data channel
- handle offer/answer/ICE
- flush pending ICE candidates
- disconnect cleanly

### `src/hooks/usePeerSession.ts`

React integration layer.

Responsibilities:

- create and clean up peer manager
- expose connection state to UI
- store messages
- handle incoming file metadata and chunks
- provide `connect`, `sendMessage`, and `sendFile`
- show handshake timeout message if peer does not join

### `src/firebase/signaling.ts`

Thin signaling helper layer.

Responsibilities:

- emit offer
- emit answer
- emit ICE candidate
- listen to signals for current user
- clear only handled signals

### `src/firebase/firestore.ts`

Firestore access layer.

Responsibilities for WebRTC:

- store signaling documents
- subscribe to signals for a specific user
- clear processed signals

### `src/webrtc/dataChannel.ts`

Small utility layer.

Responsibilities:

- serialize packet before sending
- parse packet after receiving

### `src/webrtc/fileTransfer.ts`

File helper layer.

Responsibilities:

- prepare file metadata
- convert file into transferable chunks
- rebuild and download received file

---

## 11. Project-Specific Design Decisions

These points are important because they explain why the app behaves the way it does.

### 11.1 Direct conversation model

This project is currently designed for `one-to-one` communication.

It is not currently a group WebRTC mesh system.

### 11.2 Same conversation requirement

For the live session to work properly:

- both users should open the same conversation
- one user selecting another person is not enough if the other person is on a different chat session

This is why the UI now guides users to open the same conversation.

### 11.3 Auto-start logic

This project includes auto-start behavior so the tunnel can open automatically when both users are in the same conversation and one deterministic side starts the connection.

Relevant file:

- `src/hooks/usePeerSession.ts`

### 11.4 Firestore is only for signaling, not for message transport

This is a key architecture point:

- Firestore helps establish the connection
- actual messages and files move through WebRTC DataChannel

---

## 12. Current Limitations in the Project

This section is useful for the final 3-4 minutes of the talk.

### Limitation 1: No TURN server

Current state:

- STUN is configured
- TURN is not configured

Impact:

- some users on strict networks may fail to connect

### Limitation 2: No persistent chat history over backend

Current state:

- messages are stored in React state during the session
- they are not persisted to Firestore as chat history

Impact:

- refresh can lose chat history

### Limitation 3: One-to-one only

Current state:

- direct peer session between two users

Impact:

- no group call or group real-time chat through WebRTC mesh/SFU

### Limitation 4: Connection depends on both users opening the same session

Impact:

- users can think the feature is broken if only one side opens the active conversation

### Limitation 5: File transfer is memory-heavy for large files

Current state:

- file is chunked into base64 strings

Impact:

- base64 adds overhead
- very large files may be less efficient

---

## 13. Good Things About Current Implementation

This is worth highlighting in the session.

- clean separation between signaling and peer transport
- easy-to-read React hook for session management
- packet-based design is simple and extensible
- direct file transfer avoids server-side file relay after connection setup
- project gives good learning value for understanding practical WebRTC

---

## 14. Suggested Live Demo Flow

If you want to demonstrate the project during the session:

1. Log in as User A
2. Log in as User B in another browser
3. Search User B from chat
4. Open the same conversation in both browsers
5. Show connection state moving from idle/connecting to open
6. Send a text message
7. Send a small file
8. Show automatic download on the receiver side

---

## 15. Simple Script You Can Speak

You can present it like this:

"In our project, WebRTC is used to create a direct connection between two browsers. Firebase is used only as a signaling layer to exchange offer, answer, and ICE candidate data. Once the connection is established, a WebRTC DataChannel is opened. That channel is then used to send chat messages and file chunks directly between users. In SkipCloud, this means the server helps the browsers connect, but after that, the actual data moves peer-to-peer."

---

## 16. Easy Summary for the End

You can end with these points:

- WebRTC is the direct communication technology
- Firestore is used here only for signaling
- DataChannel carries messages and file chunks
- SkipCloud uses one-to-one peer communication
- current main improvement area is adding a TURN server and persistent message storage

---

## 17. Likely Questions and Short Answers

### Q: Why do we need Firebase if WebRTC is peer-to-peer?

Because browsers still need a way to exchange connection setup information before the direct connection is ready.

### Q: Why can messages fail even if the code looks correct?

Because peer-to-peer networking can fail on strict networks, especially without a TURN server.

### Q: Is chat history stored permanently?

Not in the current WebRTC session flow. Right now, the live session state is in memory.

### Q: Can we support group chat with this?

Not with the current one-to-one design. That would need a more advanced architecture.

### Q: Why must both users open the same conversation?

Because the peer session is tied to the active selected user pair.

---

## 18. References in This Project

Use these files while presenting:

- `src/webrtc/peerConnection.ts`
- `src/hooks/usePeerSession.ts`
- `src/firebase/signaling.ts`
- `src/firebase/firestore.ts`
- `src/webrtc/dataChannel.ts`
- `src/webrtc/fileTransfer.ts`
- `src/types/index.ts`
- `src/app/chat/page.tsx`

---

## 19. Final One-Line Takeaway

SkipCloud uses Firebase to set up WebRTC connections and then uses WebRTC DataChannel to send chat messages and files directly between two browsers.