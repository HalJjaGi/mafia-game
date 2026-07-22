import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // 배포 환경에서는 같은 도메인, 개발 중에는 별도 포트
    const url = typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin)
      : "";

    socket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      path: "/api/socket.io/",
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
