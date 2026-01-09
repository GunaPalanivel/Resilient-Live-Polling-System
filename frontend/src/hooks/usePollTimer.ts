import { useEffect, useState, useRef } from 'react';
import { useSocket } from './useSocket';

export const usePollTimer = (
  initialDuration: number,
  startedAt: string,
  status: string,
  pollId?: string,
  onTimerEnd?: () => void
) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (status !== 'active') return 0;
    
    const elapsed = Date.now() - new Date(startedAt).getTime();
    const remaining = initialDuration - Math.floor(elapsed / 1000);
    return Math.max(0, remaining);
  });

  const { socket } = useSocket();
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Request server sync on mount (for late joiners)
  useEffect(() => {
    if (status !== 'active' || !socket || !pollId) {
      return;
    }

    // Request timer sync immediately
    socket.emit('poll:sync', { pollId }, (timerState: any) => {
      if (timerState && typeof timerState.remaining === 'number') {
        // Use server's remaining time for accuracy
        setRemainingSeconds(Math.max(0, timerState.remaining));
      }
    });
  }, [status, socket, pollId]);

  // Listen for timer sync events (every 5 seconds from server)
  useEffect(() => {
    if (!socket) return;

    socket.on('timer:sync', (timerState: any) => {
      if (timerState && timerState.pollId === pollId) {
        setRemainingSeconds((localRemaining) => {
          // Drift correction: if drift > 2 seconds, use server value
          const drift = Math.abs(localRemaining - timerState.remaining);
          
          if (drift > 2) {
            console.log(`[Timer] Drift corrected: local=${localRemaining}, server=${timerState.remaining}`);
            return timerState.remaining;
          }
          
          // Otherwise keep local timer (smoother UX)
          return localRemaining;
        });
      }
    });

    return () => {
      socket.off('timer:sync');
    };
  }, [socket, pollId]);

  // Listen for timer ticks
  useEffect(() => {
    if (!socket) return;

    socket.on('timer:tick', (data: any) => {
      if (data && data.pollId === pollId) {
        // Just for reference, local countdown is more important
      }
    });

    return () => {
      socket.off('timer:tick');
    };
  }, [socket, pollId]);

  // Main countdown timer
  useEffect(() => {
    if (status !== 'active' || remainingSeconds === 0) {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      return;
    }

    countdownTimerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = Math.max(0, prev - 1);
        
        if (newValue === 0) {
          onTimerEnd?.();
        }
        
        return newValue;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [status, onTimerEnd]);

  // Sync timer - request server time every 5 seconds
  useEffect(() => {
    if (status !== 'active' || !socket || !pollId) {
      return;
    }

    syncTimerRef.current = setInterval(() => {
      socket.emit('poll:sync', { pollId }, (timerState: any) => {
        if (timerState && typeof timerState.remaining === 'number') {
          const drift = Math.abs(remainingSeconds - timerState.remaining);
          
          if (drift > 2) {
            setRemainingSeconds(Math.max(0, timerState.remaining));
          }
        }
      });
    }, 5000);

    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [status, socket, pollId, remainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    remainingSeconds,
    minutes,
    seconds,
    formatted,
    isExpired: remainingSeconds === 0,
  };
};
