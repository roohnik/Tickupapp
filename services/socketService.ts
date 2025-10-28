import { io } from "socket.io-client";

// In a real app, this URL might come from an environment variable.
// const URL = window.location.origin;
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket'], // Prefer WebSocket for performance
    withCredentials: true
});

socket.on('connect', () => {
    console.log('Socket.IO connected successfully.');
});

socket.on('disconnect', () => {
    console.log('Socket.IO disconnected.');
});

socket.on('connect_error', (err) => {
    console.error('Socket.IO connection error:', err.message);
});
