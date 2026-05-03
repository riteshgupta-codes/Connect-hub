import { useEffect, useCallback } from "react";

interface ShortcutHandlers {
  onToggleMic?: () => void;
  onToggleCamera?: () => void;
  onToggleScreenShare?: () => void;
  onToggleChat?: () => void;
  onToggleParticipants?: () => void;
  onToggleRecording?: () => void;
  onToggleReactions?: () => void;
  onToggleHand?: () => void;
  onShowHelp?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled = true) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    // Don't fire on input/textarea
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true") return;

    switch (e.key.toLowerCase()) {
      case "m": handlers.onToggleMic?.(); break;
      case "v": handlers.onToggleCamera?.(); break;
      case "s": handlers.onToggleScreenShare?.(); break;
      case "c": handlers.onToggleChat?.(); break;
      case "p": handlers.onToggleParticipants?.(); break;
      case "r": handlers.onToggleRecording?.(); break;
      case "e": handlers.onToggleReactions?.(); break;
      case "h": handlers.onToggleHand?.(); break;
      case "?": handlers.onShowHelp?.(); break;
      case "escape": handlers.onEscape?.(); break;
    }
  }, [handlers, enabled]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export const SHORTCUT_LABELS = [
  { key: "M", description: "Toggle microphone" },
  { key: "V", description: "Toggle camera" },
  { key: "S", description: "Toggle screen share" },
  { key: "C", description: "Toggle chat" },
  { key: "P", description: "Toggle participants" },
  { key: "R", description: "Toggle recording (host)" },
  { key: "E", description: "Toggle reactions" },
  { key: "H", description: "Raise/lower hand" },
  { key: "?", description: "Show shortcuts" },
  { key: "Esc", description: "Close panel" },
];
