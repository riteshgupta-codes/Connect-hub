import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(options?: { displayName?: string }): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      path: "/api/socket.io",
      auth: {
        token: localStorage.getItem("meetnow_token"),
        displayName: options?.displayName ?? "Guest",
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function reconnectSocket(options?: { displayName?: string }) {
  disconnectSocket();
  return getSocket(options);
}
