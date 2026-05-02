import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  const token = localStorage.getItem("accessToken");

  if (!token) return null;

  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io("http://localhost:3000", {
    auth: {
      token,
    },
    transports: ["websocket"],
    withCredentials: true,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};
