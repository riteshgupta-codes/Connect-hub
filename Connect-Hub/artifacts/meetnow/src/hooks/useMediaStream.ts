import { useState, useEffect, useRef, useCallback } from "react";

interface UseMediaStreamReturn {
  localStream: MediaStream | null;
  isMicOn: boolean;
  isCameraOn: boolean;
  isLoading: boolean;
  error: string | null;
  toggleMic: () => void;
  toggleCamera: () => void;
  listVideoDevices: () => Promise<MediaDeviceInfo[]>;
  listAudioDevices: () => Promise<MediaDeviceInfo[]>;
  switchVideoDevice: (deviceId: string) => Promise<void>;
  switchAudioDevice: (deviceId: string) => Promise<void>;
  stopAll: () => void;
}

export function useMediaStream(initialMicOn = true, initialCameraOn = true): UseMediaStreamReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(initialMicOn);
  const [isCameraOn, setIsCameraOn] = useState(initialCameraOn);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initStream = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: initialCameraOn,
        audio: initialMicOn,
      });
      streamRef.current = stream;
      // Apply initial state
      stream.getAudioTracks().forEach(t => { t.enabled = initialMicOn; });
      stream.getVideoTracks().forEach(t => { t.enabled = initialCameraOn; });
      setLocalStream(stream);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not access camera/microphone";
      setError(msg);
      // Try audio only if video fails
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = audioStream;
        setLocalStream(audioStream);
        setIsCameraOn(false);
      } catch {
        setError("Could not access microphone. Please check permissions.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initStream();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [initStream]);

  const toggleMic = useCallback(() => {
    setIsMicOn(prev => {
      const next = !prev;
      streamRef.current?.getAudioTracks().forEach(t => { t.enabled = next; });
      return next;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    setIsCameraOn(prev => {
      const next = !prev;
      streamRef.current?.getVideoTracks().forEach(t => { t.enabled = next; });
      return next;
    });
  }, []);

  const listVideoDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(d => d.kind === "videoinput");
  }, []);

  const listAudioDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(d => d.kind === "audioinput");
  }, []);

  const switchVideoDevice = useCallback(async (deviceId: string) => {
    if (!streamRef.current) return;
    const newStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId } });
    const newTrack = newStream.getVideoTracks()[0];
    const oldTrack = streamRef.current.getVideoTracks()[0];
    if (oldTrack) {
      streamRef.current.removeTrack(oldTrack);
      oldTrack.stop();
    }
    streamRef.current.addTrack(newTrack);
    setLocalStream(new MediaStream(streamRef.current.getTracks()));
  }, []);

  const switchAudioDevice = useCallback(async (deviceId: string) => {
    if (!streamRef.current) return;
    const newStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId } });
    const newTrack = newStream.getAudioTracks()[0];
    const oldTrack = streamRef.current.getAudioTracks()[0];
    if (oldTrack) {
      streamRef.current.removeTrack(oldTrack);
      oldTrack.stop();
    }
    streamRef.current.addTrack(newTrack);
    setLocalStream(new MediaStream(streamRef.current.getTracks()));
  }, []);

  const stopAll = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setLocalStream(null);
  }, []);

  return {
    localStream,
    isMicOn,
    isCameraOn,
    isLoading,
    error,
    toggleMic,
    toggleCamera,
    listVideoDevices,
    listAudioDevices,
    switchVideoDevice,
    switchAudioDevice,
    stopAll,
  };
}
