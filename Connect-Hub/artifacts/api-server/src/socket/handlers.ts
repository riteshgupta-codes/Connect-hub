import { Server, Socket } from "socket.io";
import { db, meetingsTable, messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

interface RoomUser {
  socketId: string;
  userId?: number;
  displayName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isHost: boolean;
}

const roomUsers = new Map<string, Map<string, RoomUser>>();

export function setupSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    const auth = socket.handshake.auth;
    const displayName: string = auth.displayName || "Guest";
    let currentRoom: string | null = null;
    let currentUserId: number | undefined = undefined;

    logger.info({ socketId: socket.id, displayName }, "Socket connected");

    // Join room
    socket.on("join-room", async ({ roomId, userId, displayName: dn, isHost }: { roomId: string; userId?: number; displayName?: string; isHost?: boolean }) => {
      try {
        currentRoom = roomId;
        currentUserId = userId;
        const name = dn || displayName;

        if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
        const users = roomUsers.get(roomId)!;

        const user: RoomUser = {
          socketId: socket.id,
          userId,
          displayName: name,
          isMuted: false,
          isCameraOff: false,
          isScreenSharing: false,
          isHandRaised: false,
          isHost: !!isHost,
        };
        users.set(socket.id, user);

        await socket.join(roomId);

        // Notify others
        socket.to(roomId).emit("user-joined", { socketId: socket.id, displayName: name, userId, isHost: !!isHost });

        // Send current room users to joiner
        const roomUsersList = Array.from(users.entries()).map(([sid, u]) => ({ socketId: sid, ...u }));
        socket.emit("room-users", roomUsersList);

        // Update participant count
        await db.update(meetingsTable).set({ participantCount: users.size }).where(eq(meetingsTable.roomId, roomId)).catch(() => {});

        // System message
        const [msg] = await db.insert(messagesTable).values({
          roomId,
          senderId: userId ?? null,
          senderName: "System",
          message: `${name} joined the meeting`,
          type: "system",
          timestamp: new Date(),
        }).returning().catch(() => []);

        if (msg) {
          io.to(roomId).emit("new-message", {
            id: msg.id, roomId: msg.roomId, senderId: msg.senderId, senderName: msg.senderName,
            message: msg.message, type: msg.type, timestamp: msg.timestamp.toISOString(),
          });
        }
      } catch (err) {
        logger.error({ err }, "Error joining room");
      }
    });

    // WebRTC Signaling
    socket.on("send-offer", ({ targetSocketId, offer }: { targetSocketId: string; offer: RTCSessionDescriptionInit }) => {
      io.to(targetSocketId).emit("receive-offer", { fromSocketId: socket.id, offer });
    });

    socket.on("send-answer", ({ targetSocketId, answer }: { targetSocketId: string; answer: RTCSessionDescriptionInit }) => {
      io.to(targetSocketId).emit("receive-answer", { fromSocketId: socket.id, answer });
    });

    socket.on("ice-candidate", ({ targetSocketId, candidate }: { targetSocketId: string; candidate: RTCIceCandidateInit }) => {
      io.to(targetSocketId).emit("receive-ice", { fromSocketId: socket.id, candidate });
    });

    // Media state
    socket.on("media-status", ({ isMuted, isCameraOff, isScreenSharing }: { isMuted?: boolean; isCameraOff?: boolean; isScreenSharing?: boolean }) => {
      if (!currentRoom) return;
      const users = roomUsers.get(currentRoom);
      if (!users) return;
      const user = users.get(socket.id);
      if (!user) return;
      if (isMuted !== undefined) user.isMuted = isMuted;
      if (isCameraOff !== undefined) user.isCameraOff = isCameraOff;
      if (isScreenSharing !== undefined) user.isScreenSharing = isScreenSharing;
      socket.to(currentRoom).emit("peer-media-status", { socketId: socket.id, isMuted: user.isMuted, isCameraOff: user.isCameraOff, isScreenSharing: user.isScreenSharing });
    });

    // Screen share
    socket.on("screen-share-started", ({ roomId }: { roomId: string }) => {
      socket.to(roomId).emit("screen-share-started", { socketId: socket.id });
    });

    socket.on("screen-share-stopped", ({ roomId }: { roomId: string }) => {
      socket.to(roomId).emit("screen-share-stopped", { socketId: socket.id });
    });

    // Chat
    socket.on("send-message", async ({ roomId, message, senderId, senderName }: { roomId: string; message: string; senderId?: number; senderName: string }) => {
      try {
        const [msg] = await db.insert(messagesTable).values({
          roomId,
          senderId: senderId ?? null,
          senderName,
          message,
          type: "text",
          timestamp: new Date(),
        }).returning();
        io.to(roomId).emit("new-message", {
          id: msg.id, roomId: msg.roomId, senderId: msg.senderId, senderName: msg.senderName,
          message: msg.message, type: msg.type, timestamp: msg.timestamp.toISOString(),
        });
      } catch (err) {
        logger.error({ err }, "Error saving message");
      }
    });

    socket.on("typing-start", ({ roomId, displayName: dn }: { roomId: string; displayName: string }) => {
      socket.to(roomId).emit("peer-typing", { socketId: socket.id, displayName: dn });
    });

    socket.on("typing-stop", ({ roomId }: { roomId: string }) => {
      socket.to(roomId).emit("peer-stopped-typing", { socketId: socket.id });
    });

    // Reactions
    socket.on("reaction", ({ roomId, emoji, displayName: dn }: { roomId: string; emoji: string; displayName: string }) => {
      io.to(roomId).emit("reaction-received", { socketId: socket.id, displayName: dn, emoji });
    });

    // Hand raise
    socket.on("raise-hand", ({ roomId }: { roomId: string }) => {
      const users = roomUsers.get(roomId);
      if (users?.has(socket.id)) users.get(socket.id)!.isHandRaised = true;
      socket.to(roomId).emit("hand-raised", { socketId: socket.id, displayName: roomUsers.get(roomId)?.get(socket.id)?.displayName });
    });

    socket.on("lower-hand", ({ roomId }: { roomId: string }) => {
      const users = roomUsers.get(roomId);
      if (users?.has(socket.id)) users.get(socket.id)!.isHandRaised = false;
      socket.to(roomId).emit("hand-lowered", { socketId: socket.id });
    });

    // Knock (waiting room)
    socket.on("knock", ({ roomId, userId: uid, displayName: dn }: { roomId: string; userId?: number; displayName: string }) => {
      socket.to(roomId).emit("user-knocked", { socketId: socket.id, displayName: dn, userId: uid });
    });

    socket.on("admit-user", ({ roomId, targetSocketId }: { roomId: string; targetSocketId: string }) => {
      io.to(targetSocketId).emit("you-were-admitted");
    });

    socket.on("deny-user", ({ roomId, targetSocketId }: { roomId: string; targetSocketId: string }) => {
      io.to(targetSocketId).emit("you-were-denied");
    });

    // Host controls
    socket.on("mute-user", ({ roomId, targetSocketId }: { roomId: string; targetSocketId: string }) => {
      io.to(targetSocketId).emit("you-were-muted");
    });

    socket.on("ask-unmute", ({ roomId, targetSocketId }: { roomId: string; targetSocketId: string }) => {
      io.to(targetSocketId).emit("asked-to-unmute");
    });

    socket.on("kick-user", ({ roomId, targetSocketId }: { roomId: string; targetSocketId: string }) => {
      io.to(targetSocketId).emit("you-were-kicked");
    });

    socket.on("mute-all", ({ roomId }: { roomId: string }) => {
      socket.to(roomId).emit("you-were-muted");
    });

    socket.on("lock-room", async ({ roomId, locked }: { roomId: string; locked: boolean }) => {
      await db.update(meetingsTable).set({ isLocked: locked }).where(eq(meetingsTable.roomId, roomId)).catch(() => {});
      io.to(roomId).emit("room-lock-status", { locked });
    });

    socket.on("settings-updated", ({ roomId, settings }: { roomId: string; settings: Record<string, unknown> }) => {
      socket.to(roomId).emit("meeting-settings-updated", { settings });
    });

    // End meeting
    socket.on("end-meeting", async ({ roomId }: { roomId: string }) => {
      io.to(roomId).emit("meeting-ended");
      await db.update(meetingsTable).set({ status: "ended", endedAt: new Date() }).where(eq(meetingsTable.roomId, roomId)).catch(() => {});
      roomUsers.delete(roomId);
    });

    // Leave room
    socket.on("leave-room", async ({ roomId }: { roomId: string }) => {
      await handleLeave(socket, roomId, io);
    });

    // Disconnect
    socket.on("disconnect", async () => {
      logger.info({ socketId: socket.id }, "Socket disconnected");
      if (currentRoom) await handleLeave(socket, currentRoom, io);
    });
  });
}

async function handleLeave(socket: Socket, roomId: string, io: Server) {
  const users = roomUsers.get(roomId);
  if (!users) return;
  const user = users.get(socket.id);
  users.delete(socket.id);
  socket.leave(roomId);
  if (user) {
    socket.to(roomId).emit("user-left", { socketId: socket.id, displayName: user.displayName });
    // System message
    const [msg] = await db.insert(messagesTable).values({
      roomId,
      senderId: user.userId ?? null,
      senderName: "System",
      message: `${user.displayName} left the meeting`,
      type: "system",
      timestamp: new Date(),
    }).returning().catch(() => []);
    if (msg) {
      io.to(roomId).emit("new-message", {
        id: msg.id, roomId: msg.roomId, senderId: msg.senderId, senderName: msg.senderName,
        message: msg.message, type: msg.type, timestamp: msg.timestamp.toISOString(),
      });
    }
  }
  await db.update(meetingsTable).set({ participantCount: Math.max(0, users.size) }).where(eq(meetingsTable.roomId, roomId)).catch(() => {});
  if (users.size === 0) roomUsers.delete(roomId);
}
