import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SessionService } from '../utils/session';
import toast from 'react-hot-toast';

const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const errorHandlerRef = useRef<((error: any) => void) | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent double-initialization in React.StrictMode
    if (isInitializedRef.current) {
      return;
    }
    isInitializedRef.current = true;

    const sessionId = SessionService.getSessionId();

    socketRef.current = io(WS_URL, {
      query: { sessionId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      toast.success('Connected to server', { duration: 2000 });
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      if (reason !== 'io client namespace disconnect') {
        toast.error('Disconnected from server', { duration: 3000 });
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection error: ' + (error.message || 'Unknown error'), {
        duration: 3000,
      });
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
      // Delegate to custom error handlers if set
      if (errorHandlerRef.current) {
        errorHandlerRef.current(error);
      } else {
        toast.error('Error: ' + (error.message || JSON.stringify(error)), {
          duration: 3000,
        });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
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
