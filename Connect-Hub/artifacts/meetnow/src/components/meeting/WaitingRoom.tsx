import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface WaitingRoomProps {
  meetingTitle: string;
  hostName: string;
  defaultDisplayName: string;
  requiresPasscode?: boolean;
  waitingRoomEnabled?: boolean;
  onJoin: (displayName: string, passcode?: string) => void;
  stream: MediaStream | null;
  isMicOn: boolean;
  isCameraOn: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
}

export function WaitingRoom({
  meetingTitle,
  hostName,
  defaultDisplayName,
  requiresPasscode,
  waitingRoomEnabled,
  onJoin,
  stream,
  isMicOn,
  isCameraOn,
  onToggleMic,
  onToggleCamera,
}: WaitingRoomProps) {
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [passcode, setPasscode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleJoin = () => {
    if (!displayName.trim()) return;
    setIsJoining(true);
    onJoin(displayName.trim(), requiresPasscode ? passcode : undefined);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
      >
        {/* Camera preview */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#1a1a2e]">
          {isCameraOn && stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
                {displayName[0]?.toUpperCase() ?? "?"}
              </div>
            </div>
          )}
          {/* Mic/Camera toggles on preview */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            <button
              onClick={onToggleMic}
              data-testid="btn-waiting-toggle-mic"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isMicOn ? "bg-white/20 hover:bg-white/30 text-white" : "bg-red-600 hover:bg-red-500 text-white"
              }`}
            >
              {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              onClick={onToggleCamera}
              data-testid="btn-waiting-toggle-camera"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isCameraOn ? "bg-white/20 hover:bg-white/30 text-white" : "bg-red-600 hover:bg-red-500 text-white"
              }`}
            >
              {isCameraOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
          </div>
        </div>

        {/* Join form */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">{meetingTitle}</h1>
            <p className="text-white/50 text-sm">Hosted by {hostName}</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Your name</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                data-testid="input-display-name"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-blue-500 transition-colors"
                onKeyDown={e => e.key === "Enter" && handleJoin()}
              />
            </div>

            {requiresPasscode && (
              <div>
                <label className="block text-white/70 text-sm mb-1.5">Meeting passcode</label>
                <input
                  type="password"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  data-testid="input-passcode"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleJoin}
              disabled={!displayName.trim() || isJoining}
              data-testid="btn-join-meeting"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {isJoining
                ? waitingRoomEnabled
                  ? "Asking to join..."
                  : "Joining..."
                : waitingRoomEnabled
                ? "Ask to join"
                : "Join now"
              }
            </motion.button>
          </div>

          <p className="text-white/30 text-xs text-center">
            Your audio and video settings will be applied when you join
          </p>
        </div>
      </motion.div>
    </div>
  );
}
