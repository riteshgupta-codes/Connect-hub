import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useGetMeeting, getGetMeetingQueryKey, useGetMeetingMessages, getGetMeetingMessagesQueryKey } from "@workspace/api-client-react";
import { useMediaStream } from "@/hooks/useMediaStream";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useScreenShare } from "@/hooks/useScreenShare";
import { useRecording } from "@/hooks/useRecording";
import { useActiveSpeaker } from "@/hooks/useActiveSpeaker";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { getSocket, disconnectSocket, reconnectSocket } from "@/lib/socket";
import { WaitingRoom } from "@/components/meeting/WaitingRoom";
import { VideoGrid } from "@/components/meeting/VideoGrid";
import { ControlsBar } from "@/components/meeting/ControlsBar";
import { ChatPanel } from "@/components/meeting/ChatPanel";
import { ParticipantPanel } from "@/components/meeting/ParticipantPanel";
import { MeetingTopBar } from "@/components/meeting/MeetingTopBar";
import { ReactionsOverlay, useReactions } from "@/components/meeting/ReactionsOverlay";
import { useToast } from "@/hooks/use-toast";
import { Socket } from "socket.io-client";

type Phase = "loading" | "waiting" | "in-meeting" | "ended";

interface Message {
  id?: number;
  roomId: string;
  senderId?: number | null;
  senderName: string;
  message: string;
  type: string;
  timestamp: string;
}

interface KnockingUser {
  socketId: string;
  displayName: string;
}

export default function MeetingRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("loading");
  const [displayName, setDisplayName] = useState(user?.displayName ?? user?.name ?? "");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [knockingUsers, setKnockingUsers] = useState<KnockingUser[]>([]);
  const [socketInst, setSocketInst] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const { data: meetingData } = useGetMeeting(roomId ?? "", {
    query: { queryKey: getGetMeetingQueryKey(roomId ?? ""), enabled: !!roomId }
  });
  const meeting = meetingData as {
    title?: string; hostId?: number; status?: string;
    settings?: { waitingRoomEnabled?: boolean; passcodeRequired?: boolean; allowParticipantScreenShare?: boolean };
  } | null | undefined;

  const { data: initialMessages } = useGetMeetingMessages(roomId ?? "", {}, {
    query: { queryKey: getGetMeetingMessagesQueryKey(roomId ?? "", {}), enabled: !!roomId && phase === "in-meeting" }
  });

  useEffect(() => {
    if (initialMessages && Array.isArray(initialMessages) && phase === "in-meeting") {
      setMessages(initialMessages as Message[]);
    }
  }, [initialMessages, phase]);

  const { localStream, isMicOn, isCameraOn, toggleMic, toggleCamera, stopAll } = useMediaStream();

  const { remoteStreams, replaceTrack, cleanup: cleanupWebRTC } = useWebRTC(
    socketInst,
    localStream,
    roomId ?? ""
  );

  const { isSharing, startScreenShare, stopScreenShare } = useScreenShare(
    socketInst,
    roomId ?? "",
    replaceTrack,
    localStream
  );

  const { isRecording, startRecording, stopRecording } = useRecording(socketInst, roomId ?? "");

  const remoteEntries = Array.from(remoteStreams.entries()).map(([sid, peer]) => ({
    socketId: sid,
    stream: peer.stream,
  }));
  const activeSpeaker = useActiveSpeaker(remoteEntries);
  const reactions = useReactions(socketInst);

  const isLocalHost = !!(user && meeting && (meeting as { hostId?: number }).hostId === user.id);

  // Socket setup
  const setupSocket = useCallback((name: string) => {
    const s = reconnectSocket({ displayName: name });
    socketRef.current = s;
    setSocketInst(s);
    return s;
  }, []);

  useEffect(() => {
    if (phase !== "loading" && !meetingData) return;
    if (meetingData) {
      if ((meetingData as { status?: string }).status === "ended") {
        setPhase("ended");
      } else {
        setPhase("waiting");
      }
    }
  }, [meetingData, phase]);

  const joinMeeting = useCallback(async (name: string, passcode?: string) => {
    if (!roomId) return;
    setDisplayName(name);

    const s = setupSocket(name);

    // Set up socket listeners
    s.on("new-message", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      if (!isChatOpen) setUnreadMessages(prev => prev + 1);
    });

    s.on("meeting-ended", () => {
      setPhase("ended");
      toast({ title: "Meeting ended by host" });
    });

    s.on("you-were-kicked", () => {
      setPhase("ended");
      toast({ title: "You were removed from the meeting" });
    });

    s.on("you-were-admitted", () => {
      // Already in meeting after waiting room
    });

    s.on("you-were-denied", () => {
      setPhase("waiting");
      toast({ title: "Your request to join was denied" });
    });

    s.on("user-knocked", ({ socketId, displayName: dn }: { socketId: string; displayName: string }) => {
      setKnockingUsers(prev => [...prev, { socketId, displayName: dn }]);
      toast({ title: `${dn} is waiting to join` });
    });

    // Join the room
    s.emit("join-room", {
      roomId,
      userId: user?.id,
      displayName: name,
      isHost: isLocalHost,
    });

    setPhase("in-meeting");
  }, [roomId, user, isLocalHost, isChatOpen, setupSocket, toast]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToggleMic: toggleMic,
    onToggleCamera: toggleCamera,
    onToggleScreenShare: () => isSharing ? stopScreenShare() : startScreenShare(),
    onToggleChat: () => {
      setIsChatOpen(p => { if (!p) setUnreadMessages(0); return !p; });
      setIsParticipantsOpen(false);
    },
    onToggleParticipants: () => {
      setIsParticipantsOpen(p => !p);
      setIsChatOpen(false);
    },
    onToggleHand: () => {
      if (!socketInst || !roomId) return;
      if (isHandRaised) {
        socketInst.emit("lower-hand", { roomId });
        setIsHandRaised(false);
      } else {
        socketInst.emit("raise-hand", { roomId });
        setIsHandRaised(true);
      }
    },
    onToggleRecording: () => {
      if (isRecording) stopRecording();
      else if (localStream) startRecording(localStream);
    },
    onEscape: () => { setIsChatOpen(false); setIsParticipantsOpen(false); },
  }, phase === "in-meeting");

  // Emit media status changes
  useEffect(() => {
    if (!socketInst || !roomId || phase !== "in-meeting") return;
    socketInst.emit("media-status", { isMuted: !isMicOn, isCameraOff: !isCameraOn });
  }, [isMicOn, isCameraOn, socketInst, roomId, phase]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAll();
      cleanupWebRTC();
      disconnectSocket();
    };
  }, []);

  const handleLeave = useCallback(() => {
    if (socketInst && roomId) {
      socketInst.emit("leave-room", { roomId });
    }
    stopAll();
    cleanupWebRTC();
    disconnectSocket();
    setLocation("/dashboard");
  }, [socketInst, roomId, stopAll, cleanupWebRTC, setLocation]);

  const handleEnd = useCallback(() => {
    if (socketInst && roomId) {
      socketInst.emit("end-meeting", { roomId });
    }
    stopAll();
    cleanupWebRTC();
    disconnectSocket();
    setLocation("/dashboard");
  }, [socketInst, roomId, stopAll, cleanupWebRTC, setLocation]);

  const handleReaction = useCallback((emoji: string) => {
    if (!socketInst || !roomId) return;
    socketInst.emit("reaction", { roomId, emoji, displayName });
  }, [socketInst, roomId, displayName]);

  const handleMutePeer = useCallback((socketId: string) => {
    socketInst?.emit("mute-user", { roomId, targetSocketId: socketId });
  }, [socketInst, roomId]);

  const handleRemovePeer = useCallback((socketId: string) => {
    socketInst?.emit("kick-user", { roomId, targetSocketId: socketId });
  }, [socketInst, roomId]);

  const handleAdmit = useCallback((socketId: string) => {
    socketInst?.emit("admit-user", { roomId, targetSocketId: socketId });
    setKnockingUsers(prev => prev.filter(u => u.socketId !== socketId));
  }, [socketInst, roomId]);

  const handleDeny = useCallback((socketId: string) => {
    socketInst?.emit("deny-user", { roomId, targetSocketId: socketId });
    setKnockingUsers(prev => prev.filter(u => u.socketId !== socketId));
  }, [socketInst, roomId]);

  if (phase === "loading" || phase === "waiting") {
    return (
      <WaitingRoom
        meetingTitle={(meeting as { title?: string })?.title ?? "Meeting"}
        hostName="Host"
        defaultDisplayName={displayName}
        requiresPasscode={(meeting as { settings?: { passcodeRequired?: boolean } })?.settings?.passcodeRequired}
        waitingRoomEnabled={(meeting as { settings?: { waitingRoomEnabled?: boolean } })?.settings?.waitingRoomEnabled}
        onJoin={joinMeeting}
        stream={localStream}
        isMicOn={isMicOn}
        isCameraOn={isCameraOn}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
      />
    );
  }

  if (phase === "ended") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <span className="text-white text-3xl">M</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Meeting ended</h2>
          <p className="text-white/50 mb-6">The meeting has ended. Thank you for joining.</p>
          <button
            onClick={() => setLocation("/dashboard")}
            data-testid="btn-return-dashboard"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
          >
            Return to dashboard
          </button>
        </div>
      </div>
    );
  }

  // In-meeting UI
  const panelOffset = isChatOpen || isParticipantsOpen ? "mr-80" : "";

  return (
    <div className="meeting-room fixed inset-0 flex flex-col" style={{ background: "#0a0a0f" }}>
      <MeetingTopBar
        title={(meeting as { title?: string })?.title ?? "Meeting"}
        isHost={isLocalHost}
        isRecording={isRecording}
        onTitleChange={(newTitle) => {
          socketInst?.emit("settings-updated", { roomId, settings: { title: newTitle } });
        }}
      />

      {/* Video grid */}
      <div className={`flex-1 overflow-hidden pt-14 pb-[72px] transition-all duration-300 ${panelOffset}`}>
        <VideoGrid
          localStream={localStream}
          localDisplayName={displayName}
          localMuted={!isMicOn}
          localCameraOff={!isCameraOn}
          remoteStreams={remoteStreams}
          activeSpeaker={activeSpeaker}
          isLocalHost={isLocalHost}
          onMutePeer={handleMutePeer}
          onRemovePeer={handleRemovePeer}
        />
      </div>

      {/* Reactions overlay */}
      <ReactionsOverlay reactions={reactions} />

      {/* Controls bar */}
      <ControlsBar
        roomId={roomId ?? ""}
        participantCount={remoteStreams.size + 1}
        isMicOn={isMicOn}
        isCameraOn={isCameraOn}
        isScreenSharing={isSharing}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        isHandRaised={isHandRaised}
        isRecording={isRecording}
        isHost={isLocalHost}
        unreadMessages={unreadMessages}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={() => isSharing ? stopScreenShare() : startScreenShare()}
        onToggleChat={() => {
          setIsChatOpen(p => { if (!p) setUnreadMessages(0); return !p; });
          setIsParticipantsOpen(false);
        }}
        onToggleParticipants={() => {
          setIsParticipantsOpen(p => !p);
          setIsChatOpen(false);
        }}
        onToggleHand={() => {
          if (isHandRaised) {
            socketInst?.emit("lower-hand", { roomId });
            setIsHandRaised(false);
          } else {
            socketInst?.emit("raise-hand", { roomId });
            setIsHandRaised(true);
          }
        }}
        onToggleRecording={() => {
          if (isRecording) stopRecording();
          else if (localStream) startRecording(localStream);
        }}
        onLeave={handleLeave}
        onEnd={handleEnd}
        onReaction={handleReaction}
      />

      {/* Side panels */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatPanel
            socket={socketInst}
            roomId={roomId ?? ""}
            displayName={displayName}
            userId={user?.id}
            messages={messages}
            onClose={() => setIsChatOpen(false)}
          />
        )}
        {isParticipantsOpen && (
          <ParticipantPanel
            socket={socketInst}
            roomId={roomId ?? ""}
            localDisplayName={displayName}
            localMuted={!isMicOn}
            localCameraOff={!isCameraOn}
            remoteStreams={remoteStreams}
            isLocalHost={isLocalHost}
            knockingUsers={knockingUsers}
            onClose={() => setIsParticipantsOpen(false)}
            onAdmit={handleAdmit}
            onDeny={handleDeny}
            onMute={handleMutePeer}
            onRemove={handleRemovePeer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
