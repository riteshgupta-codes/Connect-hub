import { useState } from "react";
import { motion } from "framer-motion";
import { X, Mic, MicOff, UserX, Search, Pin } from "lucide-react";
import { Socket } from "socket.io-client";
import { RemotePeer } from "@/hooks/useWebRTC";

interface ParticipantPanelProps {
  socket: Socket | null;
  roomId: string;
  localDisplayName: string;
  localMuted?: boolean;
  localCameraOff?: boolean;
  remoteStreams: Map<string, RemotePeer>;
  isLocalHost: boolean;
  knockingUsers?: Array<{ socketId: string; displayName: string }>;
  onClose: () => void;
  onAdmit?: (socketId: string) => void;
  onDeny?: (socketId: string) => void;
  onMute?: (socketId: string) => void;
  onRemove?: (socketId: string) => void;
}

export function ParticipantPanel({
  socket,
  roomId,
  localDisplayName,
  localMuted,
  remoteStreams,
  isLocalHost,
  knockingUsers = [],
  onClose,
  onAdmit,
  onDeny,
  onMute,
  onRemove,
}: ParticipantPanelProps) {
  const [search, setSearch] = useState("");

  const allParticipants = [
    { socketId: "self", displayName: localDisplayName, isMuted: localMuted, isSelf: true, isHost: isLocalHost },
    ...Array.from(remoteStreams.entries()).map(([sid, peer]) => ({
      socketId: sid,
      displayName: peer.displayName,
      isMuted: peer.isMuted,
      isHandRaised: peer.isHandRaised,
      isSelf: false,
      isHost: false,
    })),
  ];

  const filtered = allParticipants.filter(p =>
    p.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const handleMuteAll = () => {
    socket?.emit("mute-all", { roomId });
  };

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed right-0 top-0 bottom-0 w-80 bg-[#111118] border-l border-white/10 flex flex-col z-40"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-white font-semibold text-sm">
          Participants ({allParticipants.length})
        </h2>
        <button
          onClick={onClose}
          data-testid="btn-close-participants"
          className="text-white/60 hover:text-white transition-colors p-1 rounded"
        >
          <X size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
          <Search size={13} className="text-white/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search participants..."
            data-testid="input-search-participants"
            className="bg-transparent text-white text-sm placeholder:text-white/40 outline-none flex-1"
          />
        </div>
      </div>

      {/* Knocking users */}
      {knockingUsers.length > 0 && (
        <div className="border-b border-white/10 p-3">
          <p className="text-xs text-amber-400 font-medium mb-2">Waiting to join</p>
          {knockingUsers.map(user => (
            <div key={user.socketId} className="flex items-center justify-between py-1.5">
              <span className="text-white text-sm truncate">{user.displayName}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onAdmit?.(user.socketId)}
                  data-testid={`btn-admit-${user.socketId}`}
                  className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded transition-colors"
                >
                  Admit
                </button>
                <button
                  onClick={() => onDeny?.(user.socketId)}
                  data-testid={`btn-deny-${user.socketId}`}
                  className="text-xs bg-red-600/80 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {filtered.map(p => (
          <div
            key={p.socketId}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 group"
            data-testid={`participant-item-${p.socketId}`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {p.displayName[0].toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white text-sm font-medium truncate">
                  {p.displayName}
                  {p.isSelf && <span className="text-white/50 text-xs ml-1">(You)</span>}
                </span>
                {p.isHost && <span className="text-blue-400 text-xs">Host</span>}
              </div>
              {(p as { isHandRaised?: boolean }).isHandRaised && (
                <span className="text-amber-400 text-xs">Hand raised</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {p.isMuted
                ? <MicOff size={14} className="text-red-400" />
                : <Mic size={14} className="text-green-400" />
              }
              {isLocalHost && !p.isSelf && (
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-1">
                  <button
                    onClick={() => onMute?.(p.socketId)}
                    data-testid={`btn-mute-participant-${p.socketId}`}
                    className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    title="Mute"
                  >
                    <MicOff size={13} />
                  </button>
                  <button
                    onClick={() => onRemove?.(p.socketId)}
                    data-testid={`btn-remove-participant-${p.socketId}`}
                    className="p-1 rounded hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <UserX size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isLocalHost && (
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleMuteAll}
            data-testid="btn-mute-all"
            className="w-full py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg transition-colors"
          >
            Mute All
          </button>
        </div>
      )}
    </motion.div>
  );
}
