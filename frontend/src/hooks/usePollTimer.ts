import { useEffect, useState } from 'react';

export const usePollTimer = (
  initialDuration: number,
  startedAt: string,
  status: string,
  onTimerEnd?: () => void
) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (status !== 'active') return 0;
    
    const elapsed = Date.now() - new Date(startedAt).getTime();
    const remaining = initialDuration - Math.floor(elapsed / 1000);
    return Math.max(0, remaining);
  });

  useEffect(() => {
    if (status !== 'active' || remainingSeconds === 0) {
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;
        
        if (newValue <= 0) {
          clearInterval(interval);
          onTimerEnd?.();
          return 0;
        }
        
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, remainingSeconds, onTimerEnd]);

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
