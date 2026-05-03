import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Reaction {
  id: string;
  socketId: string;
  displayName: string;
  emoji: string;
  timestamp: number;
}

interface ReactionsOverlayProps {
  reactions: Reaction[];
}

export function ReactionsOverlay({ reactions }: ReactionsOverlayProps) {
  const recent = reactions.filter(r => Date.now() - r.timestamp < 4000).slice(-5);

  return (
    <>
      {/* Floating reactions */}
      <AnimatePresence>
        {reactions.slice(-10).map(r => (
          <motion.div
            key={r.id}
            initial={{ opacity: 1, y: 0, x: Math.random() * 200 - 100, scale: 1 }}
            animate={{ opacity: 0, y: -120, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="fixed bottom-24 left-1/2 text-4xl pointer-events-none z-50 select-none"
            style={{ marginLeft: Math.random() * 200 - 100 }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Reaction log bar */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-40 pointer-events-none">
        <AnimatePresence>
          {recent.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-sm text-white"
            >
              <span>{r.emoji}</span>
              <span className="text-white/70 text-xs">{r.displayName}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

export function useReactions(socket: ReturnType<typeof import("socket.io-client")["io"]> | null) {
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ socketId, displayName, emoji }: { socketId: string; displayName: string; emoji: string }) => {
      const reaction: Reaction = {
        id: `${socketId}-${Date.now()}`,
        socketId,
        displayName,
        emoji,
        timestamp: Date.now(),
      };
      setReactions(prev => [...prev.slice(-20), reaction]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 5000);
    };
    socket.on("reaction-received", handler);
    return () => { socket.off("reaction-received", handler); };
  }, [socket]);

  return reactions;
}
