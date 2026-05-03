import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  MessageSquare, Users, PhoneOff, Hand, Circle,
  Copy, Check, MoreHorizontal, SmilePlus,
} from "lucide-react";

interface ControlsBarProps {
  roomId: string;
  participantCount: number;
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  isHandRaised: boolean;
  isRecording: boolean;
  isHost: boolean;
  unreadMessages: number;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleHand: () => void;
  onToggleRecording: () => void;
  onLeave: () => void;
  onEnd: () => void;
  onReaction: (emoji: string) => void;
}

const REACTIONS = ["👍", "❤️", "😂", "😮", "👏", "🎉"];

function CtrlBtn({
  onClick, active, danger, label, children, badge, testId
}: {
  onClick: () => void; active?: boolean; danger?: boolean; label?: string;
  children: React.ReactNode; badge?: number; testId?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      data-testid={testId}
      title={label}
      className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
        danger
          ? "bg-red-600 hover:bg-red-500 text-white"
          : active
          ? "bg-blue-600 hover:bg-blue-500 text-white"
          : "bg-white/10 hover:bg-white/20 text-white"
      }`}
    >
      {children}
      {badge && badge > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </motion.button>
  );
}

export function ControlsBar({
  roomId, participantCount, isMicOn, isCameraOn, isScreenSharing,
  isChatOpen, isParticipantsOpen, isHandRaised, isRecording, isHost, unreadMessages,
  onToggleMic, onToggleCamera, onToggleScreenShare, onToggleChat,
  onToggleParticipants, onToggleHand, onToggleRecording, onLeave, onEnd, onReaction,
}: ControlsBarProps) {
  const [copied, setCopied] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(false);

  const copyRoomCode = useCallback(() => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [roomId]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[72px] z-30" style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(16px)" }}>
      <div className="flex items-center justify-between h-full px-6 max-w-6xl mx-auto">
        {/* Left: room code */}
        <div className="flex items-center gap-3 w-48">
          <button
            onClick={copyRoomCode}
            data-testid="btn-copy-room-code"
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-mono bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg transition-colors"
            title="Copy room code"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            <span>{roomId}</span>
          </button>
          <span className="text-white/50 text-xs flex items-center gap-1">
            <Users size={12} />
            {participantCount}
          </span>
        </div>

        {/* Center: primary controls */}
        <div className="flex items-center gap-2">
          <CtrlBtn
            onClick={onToggleMic}
            active={!isMicOn}
            label={isMicOn ? "Mute (M)" : "Unmute (M)"}
            testId="btn-toggle-mic"
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </CtrlBtn>

          <CtrlBtn
            onClick={onToggleCamera}
            active={!isCameraOn}
            label={isCameraOn ? "Stop video (V)" : "Start video (V)"}
            testId="btn-toggle-camera"
          >
            {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </CtrlBtn>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleScreenShare}
            data-testid="btn-toggle-screenshare"
            className={`flex items-center gap-2 px-4 h-12 rounded-xl text-sm font-medium transition-colors ${
              isScreenSharing
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            {isScreenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
            <span>{isScreenSharing ? "Stop Share" : "Share Screen"}</span>
          </motion.button>

          {/* Reactions */}
          <div className="relative">
            <CtrlBtn onClick={() => setShowReactions(p => !p)} label="Reactions (E)" testId="btn-reactions">
              <SmilePlus size={20} />
            </CtrlBtn>
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#1a1a2e] border border-white/10 rounded-2xl p-2 flex gap-1 shadow-xl"
                >
                  {REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => { onReaction(emoji); setShowReactions(false); }}
                      data-testid={`btn-reaction-${emoji}`}
                      className="text-2xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-white/10"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <CtrlBtn onClick={onToggleHand} active={isHandRaised} label="Raise hand (H)" testId="btn-raise-hand">
            <Hand size={20} />
          </CtrlBtn>
        </div>

        {/* Right: secondary controls */}
        <div className="flex items-center gap-2 w-48 justify-end">
          <CtrlBtn onClick={onToggleChat} active={isChatOpen} badge={isChatOpen ? 0 : unreadMessages} label="Chat (C)" testId="btn-toggle-chat">
            <MessageSquare size={20} />
          </CtrlBtn>

          <CtrlBtn onClick={onToggleParticipants} active={isParticipantsOpen} label="Participants (P)" testId="btn-toggle-participants">
            <Users size={20} />
          </CtrlBtn>

          {isHost && (
            <CtrlBtn onClick={onToggleRecording} active={isRecording} label="Record (R)" testId="btn-toggle-recording">
              <Circle size={20} className={isRecording ? "fill-red-400 text-red-400 animate-rec-pulse" : ""} />
            </CtrlBtn>
          )}

          {/* Leave/End */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEndOptions(p => !p)}
              data-testid="btn-leave-meeting"
              className="flex items-center gap-1.5 px-3 h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
            >
              <PhoneOff size={18} />
              <span>{isHost ? "End" : "Leave"}</span>
            </motion.button>
            <AnimatePresence>
              {showEndOptions && isHost && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-14 right-0 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden shadow-xl min-w-44"
                >
                  <button
                    onClick={() => { onLeave(); setShowEndOptions(false); }}
                    data-testid="btn-leave-only"
                    className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    Leave meeting
                  </button>
                  <button
                    onClick={() => { onEnd(); setShowEndOptions(false); }}
                    data-testid="btn-end-for-all"
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    End for everyone
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
