import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MicOff, Monitor, Pin, UserX, VolumeX } from "lucide-react";

interface VideoTileProps {
  stream: MediaStream | null;
  displayName: string;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isScreenSharing?: boolean;
  isHandRaised?: boolean;
  isActiveSpeaker?: boolean;
  isSelf?: boolean;
  isPinned?: boolean;
  isHost?: boolean;
  socketId?: string;
  onPin?: () => void;
  onMute?: () => void;
  onRemove?: () => void;
  showHostControls?: boolean;
  className?: string;
}

const AVATAR_COLORS = [
  "bg-blue-600", "bg-purple-600", "bg-emerald-600",
  "bg-orange-600", "bg-pink-600", "bg-cyan-600", "bg-indigo-600", "bg-rose-600",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

export function VideoTile({
  stream,
  displayName,
  isMuted,
  isCameraOff,
  isScreenSharing,
  isHandRaised,
  isActiveSpeaker,
  isSelf,
  isPinned,
  isHost,
  onPin,
  onMute,
  onRemove,
  showHostControls,
  className = "",
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const avatarColor = getAvatarColor(displayName);
  const initials = getInitials(displayName);

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-xl overflow-hidden bg-[#1a1a2e] group ${
        isActiveSpeaker ? "animate-pulse-ring ring-2 ring-green-500" : ""
      } ${isPinned ? "ring-2 ring-blue-500" : ""} ${className}`}
      data-testid={`video-tile-${displayName}`}
    >
      {/* Video */}
      {!isCameraOff && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isSelf}
          className={`w-full h-full object-cover ${isSelf ? "scale-x-[-1]" : ""}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e]">
          <div className={`w-16 h-16 rounded-full ${avatarColor} flex items-center justify-center text-white text-2xl font-semibold shadow-lg`}>
            {initials}
          </div>
        </div>
      )}

      {/* Hand raised */}
      {isHandRaised && (
        <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium animate-bounce">
          Hand raised
        </div>
      )}

      {/* Screen share badge */}
      {isScreenSharing && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <Monitor size={10} />
          Screen
        </div>
      )}

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isMuted && <MicOff size={12} className="text-red-400" />}
          <span className="text-white text-xs font-medium truncate max-w-[120px]">
            {displayName}{isSelf ? " (You)" : ""}
          </span>
          {isHost && (
            <span className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded text-[10px]">Host</span>
          )}
        </div>
      </div>

      {/* Hover controls */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-start justify-end p-2 gap-1.5">
        {onPin && (
          <button
            onClick={onPin}
            data-testid="btn-pin-tile"
            className="bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5 transition-colors"
            title={isPinned ? "Unpin" : "Pin"}
          >
            <Pin size={14} />
          </button>
        )}
        {showHostControls && !isSelf && (
          <>
            {onMute && (
              <button
                onClick={onMute}
                data-testid="btn-mute-tile"
                className="bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5 transition-colors"
                title="Mute"
              >
                <VolumeX size={14} />
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                data-testid="btn-remove-tile"
                className="bg-red-600/80 hover:bg-red-600 text-white rounded-lg p-1.5 transition-colors"
                title="Remove"
              >
                <UserX size={14} />
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
