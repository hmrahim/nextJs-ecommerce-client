// 📁 lib/socket.js
// Socket.IO client singleton. Auto-attaches JWT from next-auth session.
'use client';

import { io } from 'socket.io-client';
import { getSession } from 'next-auth/react';

let socket = null;
let connecting = null;

function getApiBase() {
  return (
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000'
  );
}

export async function getSocket() {
  if (socket && socket.connected) return socket;
  if (connecting) return connecting;

  connecting = (async () => {
    const session = await getSession();
    const token = session?.accessToken || session?.user?.token;

    socket = io(getApiBase(), {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('🔌 socket connected:', socket.id);
    });
    socket.on('disconnect', (reason) => {
      // eslint-disable-next-line no-console
      console.log('🔌 socket disconnected:', reason);
    });
    socket.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.warn('socket connect_error:', err.message);
    });

    connecting = null;
    return socket;
  })();

  return connecting;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
