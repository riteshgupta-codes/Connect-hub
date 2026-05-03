import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { VideoTile } from "./VideoTile";
import { RemotePeer } from "@/hooks/useWebRTC";

interface Participant {
  socketId: string;
  stream: MediaStream | null;
  displayName: string;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isScreenSharing?: boolean;
  isHandRaised?: boolean;
  isHost?: boolean;
}

interface VideoGridProps {
  localStream: MediaStream | null;
  localDisplayName: string;
  localMuted?: boolean;
  localCameraOff?: boolean;
  remoteStreams: Map<string, RemotePeer>;
  activeSpeaker: string | null;
  isLocalHost: boolean;
  onMutePeer?: (socketId: string) => void;
  onRemovePeer?: (socketId: string) => void;
}

function getGridClass(count: number): string {
  if (count === 1) return "flex items-center justify-center";
  if (count === 2) return "grid grid-cols-2";
  if (count === 3) return "grid grid-cols-2";
  if (count === 4) return "grid grid-cols-2";
  if (count <= 6) return "grid grid-cols-3";
  if (count <= 9) return "grid grid-cols-3";
  return "grid grid-cols-4";
}

function getTileSize(count: number): string {
  if (count === 1) return "w-full max-w-3xl aspect-video";
  return "aspect-video w-full";
}

export function VideoGrid({
  localStream,
  localDisplayName,
  localMuted,
  localCameraOff,
  remoteStreams,
  activeSpeaker,
  isLocalHost,
  onMutePeer,
  onRemovePeer,
}: VideoGridProps) {
  const [pinnedSocketId, setPinnedSocketId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 9;

  const togglePin = useCallback((socketId: string) => {
    setPinnedSocketId(prev => prev === socketId ? null : socketId);
  }, []);

  const remotePeers = Array.from(remoteStreams.entries());
  const totalCount = remotePeers.length + 1;

  if (pinnedSocketId) {
    const pinnedPeer = remoteStreams.get(pinnedSocketId);
    const others = remotePeers.filter(([sid]) => sid !== pinnedSocketId);
    return (
      <div className="flex gap-2 h-full p-2">
        <div className="flex-1 h-full">
          {pinnedPeer && (
            <VideoTile
              stream={pinnedPeer.stream}
              displayName={pinnedPeer.displayName}
              isMuted={pinnedPeer.isMuted}
              isCameraOff={pinnedPeer.isCameraOff}
              isScreenSharing={pinnedPeer.isScreenSharing}
              isHandRaised={pinnedPeer.isHandRaised}
              isActiveSpeaker={activeSpeaker === pinnedSocketId}
              isPinned
              socketId={pinnedSocketId}
              onPin={() => togglePin(pinnedSocketId)}
              showHostControls={isLocalHost}
              onMute={() => onMutePeer?.(pinnedSocketId)}
              onRemove={() => onRemovePeer?.(pinnedSocketId)}
              className="h-full"
            />
          )}
        </div>
        <div className="w-44 flex flex-col gap-2 overflow-y-auto">
          <VideoTile
            stream={localStream}
            displayName={localDisplayName}
            isMuted={localMuted}
            isCameraOff={localCameraOff}
            isSelf
            className="aspect-video w-full"
          />
          {others.map(([sid, peer]) => (
            <VideoTile
              key={sid}
              stream={peer.stream}
              displayName={peer.displayName}
              isMuted={peer.isMuted}
              isCameraOff={peer.isCameraOff}
              isActiveSpeaker={activeSpeaker === sid}
              socketId={sid}
              onPin={() => togglePin(sid)}
              showHostControls={isLocalHost}
              onMute={() => onMutePeer?.(sid)}
              onRemove={() => onRemovePeer?.(sid)}
              className="aspect-video w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  // Pagination for large meetings
  const paginatedPeers = remotePeers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
  const showPagination = totalCount > PAGE_SIZE;

  return (
    <div className="flex flex-col h-full p-2 gap-2">
      <div className={`${getGridClass(totalCount)} gap-2 flex-1 content-start`}>
        <AnimatePresence>
          <VideoTile
            key="self"
            stream={localStream}
            displayName={localDisplayName}
            isMuted={localMuted}
            isCameraOff={localCameraOff}
            isSelf
            isHost={isLocalHost}
            className={getTileSize(totalCount)}
          />
          {paginatedPeers.map(([sid, peer]) => (
            <VideoTile
              key={sid}
              stream={peer.stream}
              displayName={peer.displayName}
              isMuted={peer.isMuted}
              isCameraOff={peer.isCameraOff}
              isScreenSharing={peer.isScreenSharing}
              isHandRaised={peer.isHandRaised}
              isActiveSpeaker={activeSpeaker === sid}
              socketId={sid}
              onPin={() => togglePin(sid)}
              showHostControls={isLocalHost}
              onMute={() => onMutePeer?.(sid)}
              onRemove={() => onRemovePeer?.(sid)}
              className={getTileSize(totalCount)}
            />
          ))}
        </AnimatePresence>
      </div>

      {showPagination && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
          >
            Previous
          </button>
          <span className="text-white/60 text-sm self-center">
            Page {page + 1} of {Math.ceil(totalCount / PAGE_SIZE)}
          </span>
          <button
            onClick={() => setPage(p => Math.min(Math.ceil(totalCount / PAGE_SIZE) - 1, p + 1))}
            disabled={(page + 1) * PAGE_SIZE >= totalCount}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
