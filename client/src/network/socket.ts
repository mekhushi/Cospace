import { io } from 'socket.io-client';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

export const socket = io(URL, {
  autoConnect: false,
});

// For debugging
socket.onAny((event, ...args) => {
  console.log(`Socket Event: ${event}`, args);
});
