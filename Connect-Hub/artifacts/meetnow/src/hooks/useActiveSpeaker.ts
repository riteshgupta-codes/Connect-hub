import { useState, useEffect, useRef } from "react";

interface StreamEntry {
  socketId: string;
  stream: MediaStream;
}

export function useActiveSpeaker(streams: StreamEntry[], interval = 500): string | null {
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const analyserMap = useRef<Map<string, AnalyserNode>>(new Map());
  const audioCtx = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!window.AudioContext && !(window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext) return;

    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    const ctx = audioCtx.current;
    const newMap = new Map<string, AnalyserNode>();

    streams.forEach(({ socketId, stream }) => {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;
      try {
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        newMap.set(socketId, analyser);
      } catch { /* ignore */ }
    });

    analyserMap.current = newMap;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      let maxVolume = 0;
      let maxSocketId: string | null = null;
      const dataArray = new Uint8Array(128);

      analyserMap.current.forEach((analyser, socketId) => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        if (average > maxVolume) {
          maxVolume = average;
          maxSocketId = socketId;
        }
      });

      if (maxVolume > 10) {
        setActiveSpeaker(maxSocketId);
      } else {
        setActiveSpeaker(null);
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [streams, interval]);

  return activeSpeaker;
}
