import { useState, useRef, useCallback, useEffect } from "react";
import { Socket } from "socket.io-client";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export interface RemotePeer {
  stream: MediaStream;
  displayName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
}

interface ICEQueueEntry {
  candidate: RTCIceCandidateInit;
}

export function useWebRTC(socket: Socket | null, localStream: MediaStream | null, roomId: string) {
  const [remoteStreams, setRemoteStreams] = useState<Map<string, RemotePeer>>(new Map());
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const iceCandidateQueue = useRef<Map<string, ICEQueueEntry[]>>(new Map());
  const remoteDescSet = useRef<Set<string>>(new Set());

  const createPeerConnection = useCallback((socketId: string, displayName: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // ICE candidates
    pc.onicecandidate = ({ candidate }) => {
      if (candidate && socket) {
        socket.emit("ice-candidate", { targetSocketId: socketId, candidate });
      }
    };

    // Remote stream
    const remoteStream = new MediaStream();
    pc.ontrack = ({ track }) => {
      remoteStream.addTrack(track);
      setRemoteStreams(prev => {
        const next = new Map(prev);
        const existing = next.get(socketId);
        next.set(socketId, {
          stream: remoteStream,
          displayName: existing?.displayName ?? displayName,
          isMuted: existing?.isMuted ?? false,
          isCameraOff: existing?.isCameraOff ?? false,
          isScreenSharing: existing?.isScreenSharing ?? false,
          isHandRaised: existing?.isHandRaised ?? false,
        });
        return next;
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        cleanupPeer(socketId);
      }
    };

    peerConnections.current.set(socketId, pc);
    return pc;
  }, [localStream, socket]);

  const flushICEQueue = useCallback(async (socketId: string, pc: RTCPeerConnection) => {
    const queue = iceCandidateQueue.current.get(socketId) ?? [];
    for (const { candidate } of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch { /* ignore */ }
    }
    iceCandidateQueue.current.delete(socketId);
  }, []);

  const cleanupPeer = useCallback((socketId: string) => {
    const pc = peerConnections.current.get(socketId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(socketId);
    }
    iceCandidateQueue.current.delete(socketId);
    remoteDescSet.current.delete(socketId);
    setRemoteStreams(prev => {
      const next = new Map(prev);
      next.delete(socketId);
      return next;
    });
  }, []);

  const replaceTrack = useCallback((newTrack: MediaStreamTrack, kind: "video" | "audio") => {
    peerConnections.current.forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === kind);
      if (sender) sender.replaceTrack(newTrack).catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = async ({ socketId, displayName }: { socketId: string; displayName: string }) => {
      const pc = createPeerConnection(socketId, displayName);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("send-offer", { targetSocketId: socketId, offer });
      } catch (err) {
        console.error("Failed to create offer:", err);
      }
    };

    const handleReceiveOffer = async ({ fromSocketId, offer }: { fromSocketId: string; offer: RTCSessionDescriptionInit }) => {
      let pc = peerConnections.current.get(fromSocketId);
      if (!pc) {
        pc = createPeerConnection(fromSocketId, "Unknown");
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        remoteDescSet.current.add(fromSocketId);
        await flushICEQueue(fromSocketId, pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("send-answer", { targetSocketId: fromSocketId, answer });
      } catch (err) {
        console.error("Failed to handle offer:", err);
      }
    };

    const handleReceiveAnswer = async ({ fromSocketId, answer }: { fromSocketId: string; answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnections.current.get(fromSocketId);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescSet.current.add(fromSocketId);
        await flushICEQueue(fromSocketId, pc);
      } catch (err) {
        console.error("Failed to handle answer:", err);
      }
    };

    const handleReceiveICE = async ({ fromSocketId, candidate }: { fromSocketId: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnections.current.get(fromSocketId);
      if (pc && remoteDescSet.current.has(fromSocketId)) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch { /* ignore */ }
      } else {
        const queue = iceCandidateQueue.current.get(fromSocketId) ?? [];
        queue.push({ candidate });
        iceCandidateQueue.current.set(fromSocketId, queue);
      }
    };

    const handleUserLeft = ({ socketId }: { socketId: string }) => {
      cleanupPeer(socketId);
    };

    const handlePeerMediaStatus = ({ socketId, isMuted, isCameraOff, isScreenSharing }: {
      socketId: string; isMuted: boolean; isCameraOff: boolean; isScreenSharing: boolean;
    }) => {
      setRemoteStreams(prev => {
        const next = new Map(prev);
        const peer = next.get(socketId);
        if (peer) {
          next.set(socketId, { ...peer, isMuted, isCameraOff, isScreenSharing });
        }
        return next;
      });
    };

    const handleHandRaised = ({ socketId }: { socketId: string }) => {
      setRemoteStreams(prev => {
        const next = new Map(prev);
        const peer = next.get(socketId);
        if (peer) next.set(socketId, { ...peer, isHandRaised: true });
        return next;
      });
    };

    const handleHandLowered = ({ socketId }: { socketId: string }) => {
      setRemoteStreams(prev => {
        const next = new Map(prev);
        const peer = next.get(socketId);
        if (peer) next.set(socketId, { ...peer, isHandRaised: false });
        return next;
      });
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("receive-offer", handleReceiveOffer);
    socket.on("receive-answer", handleReceiveAnswer);
    socket.on("receive-ice", handleReceiveICE);
    socket.on("user-left", handleUserLeft);
    socket.on("peer-media-status", handlePeerMediaStatus);
    socket.on("hand-raised", handleHandRaised);
    socket.on("hand-lowered", handleHandLowered);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("receive-offer", handleReceiveOffer);
      socket.off("receive-answer", handleReceiveAnswer);
      socket.off("receive-ice", handleReceiveICE);
      socket.off("user-left", handleUserLeft);
      socket.off("peer-media-status", handlePeerMediaStatus);
      socket.off("hand-raised", handleHandRaised);
      socket.off("hand-lowered", handleHandLowered);
    };
  }, [socket, createPeerConnection, flushICEQueue, cleanupPeer]);

  const cleanup = useCallback(() => {
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    iceCandidateQueue.current.clear();
    remoteDescSet.current.clear();
    setRemoteStreams(new Map());
  }, []);

  return { remoteStreams, replaceTrack, cleanup };
}
