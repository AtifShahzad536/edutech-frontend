import { useEffect, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const emit = useCallback((event: string, data: any) => {
    socket?.emit(event, data);
  }, [socket]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    socket?.on(event, callback);
  }, [socket]);

  const off = useCallback((event: string) => {
    socket?.off(event);
  }, [socket]);

  return useMemo(() => ({ socket, emit, on, off }), [socket, emit, on, off]);
};
