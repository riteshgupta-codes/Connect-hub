import { useState, useEffect } from "react";
import { Wifi, WifiLow, WifiZero, Settings } from "lucide-react";

interface MeetingTopBarProps {
  title: string;
  isHost?: boolean;
  isRecording?: boolean;
  onTitleChange?: (title: string) => void;
  onSettings?: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type NetworkQuality = "good" | "poor" | "bad";

export function MeetingTopBar({ title, isHost, isRecording, onTitleChange, onSettings }: MeetingTopBarProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>("good");

  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkNetwork = () => {
      const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
      if (!conn) return;
      if (conn.effectiveType === "4g") setNetworkQuality("good");
      else if (conn.effectiveType === "3g") setNetworkQuality("poor");
      else setNetworkQuality("bad");
    };
    checkNetwork();
    const interval = setInterval(checkNetwork, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTitleSave = () => {
    setEditingTitle(false);
    if (editTitle.trim() && editTitle !== title) {
      onTitleChange?.(editTitle.trim());
    }
  };

  const NetworkIcon = networkQuality === "good" ? Wifi : networkQuality === "poor" ? WifiLow : WifiZero;
  const networkColor = networkQuality === "good" ? "text-green-400" : networkQuality === "poor" ? "text-amber-400" : "text-red-400";

  return (
    <div className="fixed top-0 left-0 right-0 h-14 z-30 flex items-center justify-between px-4" style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)" }}>
      {/* Left: title */}
      <div className="flex items-center gap-3 w-64">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">M</span>
        </div>
        {editingTitle && isHost ? (
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={e => e.key === "Enter" && handleTitleSave()}
            autoFocus
            data-testid="input-meeting-title"
            className="bg-white/10 text-white text-sm font-medium px-2 py-1 rounded-lg outline-none border border-blue-500 min-w-0 flex-1"
          />
        ) : (
          <span
            onClick={() => isHost && setEditingTitle(true)}
            className={`text-white text-sm font-medium truncate ${isHost ? "cursor-pointer hover:text-blue-300 transition-colors" : ""}`}
            title={isHost ? "Click to rename" : title}
          >
            {title}
          </span>
        )}
      </div>

      {/* Center: timer */}
      <div className="flex items-center gap-3">
        <span className="text-white/70 text-sm font-mono tabular-nums" data-testid="meeting-timer">
          {formatDuration(elapsedSeconds)}
        </span>
        {isRecording && (
          <div className="flex items-center gap-1.5 bg-red-600/20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-rec-pulse" />
            Recording
          </div>
        )}
      </div>

      {/* Right: network + settings */}
      <div className="flex items-center gap-2 w-64 justify-end">
        <div title={`Network: ${networkQuality}`}>
          <NetworkIcon size={16} className={networkColor} />
        </div>
        {onSettings && (
          <button
            onClick={onSettings}
            data-testid="btn-meeting-settings"
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Meeting settings"
          >
            <Settings size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
