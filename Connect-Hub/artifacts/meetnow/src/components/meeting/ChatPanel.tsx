import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { Socket } from "socket.io-client";

interface Message {
  id?: number;
  roomId: string;
  senderId?: number | null;
  senderName: string;
  message: string;
  type: string;
  timestamp: string;
}

interface ChatPanelProps {
  socket: Socket | null;
  roomId: string;
  displayName: string;
  userId?: number;
  messages: Message[];
  onClose: () => void;
}

interface TypingUser {
  socketId: string;
  displayName: string;
}

export function ChatPanel({ socket, roomId, displayName, userId, messages, onClose }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [newMessageBadge, setNewMessageBadge] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrolledToBottom = useRef(true);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (isScrolledToBottom.current && el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ socketId, displayName: dn }: { socketId: string; displayName: string }) => {
      setTypingUsers(prev => {
        if (prev.find(u => u.socketId === socketId)) return prev;
        return [...prev, { socketId, displayName: dn }];
      });
    };

    const handleStopTyping = ({ socketId }: { socketId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.socketId !== socketId));
    };

    socket.on("peer-typing", handleTyping);
    socket.on("peer-stopped-typing", handleStopTyping);
    return () => {
      socket.off("peer-typing", handleTyping);
      socket.off("peer-stopped-typing", handleStopTyping);
    };
  }, [socket]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    isScrolledToBottom.current = atBottom;
    if (atBottom) setNewMessageBadge(null);
  }, []);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !socket) return;
    socket.emit("send-message", { roomId, message: input.trim(), senderId: userId, senderName: displayName });
    socket.emit("typing-stop", { roomId });
    setInput("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isScrolledToBottom.current = true;
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 50);
  }, [input, socket, roomId, userId, displayName]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit("typing-start", { roomId, displayName });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-stop", { roomId });
    }, 2000);
  }, [socket, roomId, displayName]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
        <h2 className="text-white font-semibold text-sm">Chat</h2>
        <button
          onClick={onClose}
          data-testid="btn-close-chat"
          className="text-white/60 hover:text-white transition-colors p-1 rounded"
        >
          <X size={16} />
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-2"
      >
        {messages.map((msg, i) => {
          if (msg.type === "system") {
            return (
              <div key={i} className="text-center text-xs text-white/40 py-1">
                {msg.message}
              </div>
            );
          }
          const isOwn = msg.senderName === displayName;
          return (
            <div key={i} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
              {!isOwn && (
                <span className="text-xs text-white/50 mb-0.5 px-1">{msg.senderName}</span>
              )}
              <div className={`max-w-[90%] px-3 py-2 rounded-2xl text-sm break-words ${
                isOwn
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white/10 text-white/90 rounded-bl-sm"
              }`}>
                {msg.message}
              </div>
              <span className="text-[10px] text-white/30 px-1 mt-0.5">{formatTime(msg.timestamp)}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="px-4 py-1.5 text-xs text-white/50">
          {typingUsers.map(u => u.displayName).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}

      {newMessageBadge && (
        <button
          onClick={() => {
            isScrolledToBottom.current = true;
            scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: "smooth" });
            setNewMessageBadge(null);
          }}
          className="mx-3 mb-1 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full text-center hover:bg-blue-500 transition-colors"
        >
          New message from {newMessageBadge}
        </button>
      )}

      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2 items-end bg-white/10 rounded-xl px-3 py-2">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            data-testid="input-chat-message"
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none resize-none max-h-24"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            data-testid="btn-send-chat"
            className="text-blue-400 hover:text-blue-300 disabled:opacity-40 transition-colors pb-0.5"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-white/30 mt-1 px-1">Enter to send, Shift+Enter for new line</p>
      </div>
    </motion.div>
  );
}
