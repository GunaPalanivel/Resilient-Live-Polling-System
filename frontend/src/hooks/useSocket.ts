import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SessionService } from '../utils/session';
import toast from 'react-hot-toast';

const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a singleton socket instance outside of React
let globalSocket: Socket | null = null;
let connectionCount = 0;

const getSocket = () => {
  if (!globalSocket || globalSocket.disconnected) {
    const sessionId = SessionService.getSessionId();
    console.log('🔗 Creating Socket.io connection to:', WS_URL);

    globalSocket = io(WS_URL, {
      query: { sessionId },
      transports: ['polling', 'websocket'], // Start with polling, upgrade to websocket
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 20000,
      autoConnect: true,
    });
  }
  return globalSocket;
};

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const errorHandlerRef = useRef<((error: any) => void) | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Get the singleton socket
    const socket = getSocket();
    socketRef.current = socket;
    connectionCount++;

    console.log(`🔌 useSocket hook mounted (count: ${connectionCount})`);

    const handleConnect = () => {
      console.log('✅ Socket connected successfully:', socket.id);
      setIsConnected(true);
      toast.success('Connected to server', { duration: 2000 });
    };

    const handleDisconnect = (reason: string) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      if (reason !== 'io client namespace disconnect') {
        toast.error(`Disconnected: ${reason}`, { duration: 3000 });
      }
    };

    const handleConnectError = (error: any) => {
      console.error('Socket connection error:', error.message || error);
      toast.error('Connection error: ' + (error.message || 'Unknown error'), {
        duration: 3000,
      });
    };

    const handleError = (error: any) => {
      console.error('Socket error:', error);
      if (errorHandlerRef.current) {
        errorHandlerRef.current(error);
      } else {
        toast.error('Error: ' + (error.message || JSON.stringify(error)), {
          duration: 3000,
        });
      }
    };

    // Attach event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('error', handleError);

    // If already connected, update state
    if (socket.connected) {
      setIsConnected(true);
    } else {
      // Connect if not connected
      socket.connect();
    }

    return () => {
      connectionCount--;
      console.log(
        `🔌 useSocket hook unmounting (remaining: ${connectionCount})`
      );

      // Remove event listeners but DON'T disconnect the socket
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('error', handleError);

      // Only disconnect if no more components are using the socket
      if (connectionCount <= 0) {
        console.log('🔌 All components unmounted, closing socket');
        socket.disconnect();
        globalSocket = null;
        connectionCount = 0;
      }
    };
  }, []);

  const emit = (
    event: string,
    data?: any,
    callback?: (error: Error | null, response?: any) => void
  ) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.emit(event, data, callback);
      } else {
        socketRef.current.emit(event, data);
      }
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const setErrorHandler = (handler: (error: any) => void) => {
    errorHandlerRef.current = handler;
  };

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
    setErrorHandler,
  };
};
