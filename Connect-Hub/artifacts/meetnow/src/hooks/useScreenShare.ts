import { useState, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";

interface UseScreenShareReturn {
  isSharing: boolean;
  startScreenShare: () => Promise<MediaStreamTrack | null>;
  stopScreenShare: () => void;
  screenStream: MediaStream | null;
}

export function useScreenShare(
  socket: Socket | null,
  roomId: string,
  replaceTrack: (track: MediaStreamTrack, kind: "video" | "audio") => void,
  localStream: MediaStream | null
): UseScreenShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    // Restore original video track
    const originalTrack = originalVideoTrackRef.current;
    if (originalTrack) {
      replaceTrack(originalTrack, "video");
      if (localStream) {
        const oldVideoTrack = localStream.getVideoTracks()[0];
        if (oldVideoTrack && oldVideoTrack !== originalTrack) {
          localStream.removeTrack(oldVideoTrack);
        }
        localStream.addTrack(originalTrack);
      }
      originalVideoTrackRef.current = null;
    }
    setIsSharing(false);
    setScreenStream(null);
    if (socket) socket.emit("screen-share-stopped", { roomId });
  }, [socket, roomId, replaceTrack, localStream]);

  const startScreenShare = useCallback(async (): Promise<MediaStreamTrack | null> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as MediaTrackConstraints,
        audio: true,
      });
      screenStreamRef.current = stream;
      setScreenStream(stream);

      const screenVideoTrack = stream.getVideoTracks()[0];

      // Save original video track
      originalVideoTrackRef.current = localStream?.getVideoTracks()[0] ?? null;

      // Replace in all peer connections
      replaceTrack(screenVideoTrack, "video");

      // When user stops via browser button
      screenVideoTrack.onended = () => {
        stopScreenShare();
      };

      setIsSharing(true);
      if (socket) socket.emit("screen-share-started", { roomId });

      return screenVideoTrack;
    } catch (err) {
      if (err instanceof Error && err.name !== "NotAllowedError") {
        console.error("Screen share error:", err);
      }
      return null;
    }
  }, [socket, roomId, replaceTrack, localStream, stopScreenShare]);

  return { isSharing, startScreenShare, stopScreenShare, screenStream };
}
