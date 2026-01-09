import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Simple TimerDisplay component for testing
const TimerDisplay: React.FC<{ remaining: number }> = ({ remaining }) => {
  const getColor = () => {
    if (remaining > 10) return '#10b981'; // green
    if (remaining > 5) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="timer-display"
      style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: getColor(),
        backgroundColor: `${getColor()}10`,
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
      }}
      data-testid="timer-display"
    >
      {formatTime(remaining)}
    </div>
  );
};

describe('TimerDisplay', () => {
  describe('Countdown Display', () => {
    it('should display time in MM:SS format', () => {
      render(<TimerDisplay remaining={125} />);
      const timer = screen.getByTestId('timer-display');
      expect(timer.textContent).toBe('2:05');
    });

    it('should display single digit seconds with leading zero', () => {
      render(<TimerDisplay remaining={65} />);
      const timer = screen.getByTestId('timer-display');
      expect(timer.textContent).toBe('1:05');
    });

    it('should handle zero seconds', () => {
      render(<TimerDisplay remaining={0} />);
      const timer = screen.getByTestId('timer-display');
      expect(timer.textContent).toBe('0:00');
    });
  });

  describe('Color Changes', () => {
    it('should display green color when remaining > 10s', () => {
      render(<TimerDisplay remaining={15} />);
      const timer = screen.getByTestId('timer-display');
      expect(timer).toHaveStyle('color: #10b981');
    });

    it('should display yellow color when remaining 5-10s', () => {
      render(<TimerDisplay remaining={7} />);
      const timer = screen.getByTestId('timer-display');
      expect(timer).toHaveStyle('color: #f59e0b');
    });

    it('should display red color when remaining < 5s', () => {
      render(<TimerDisplay remaining={3} />);
      const timer = screen.getByTestId('timer-display');
      expect(timer).toHaveStyle('color: #ef4444');
    });

    it('should display red color at exactly 5 seconds', () => {
      render(<TimerDisplay remaining={5} />);
      const timer = screen.getByTestId('timer-display');
      expect(timer).toHaveStyle('color: #ef4444');
    });

    it('should display yellow at exactly 10 seconds', () => {
      render(<TimerDisplay remaining={10} />);
      const timer = screen.getByTestId('timer-display');
      expect(timer).toHaveStyle('color: #f59e0b');
    });
  });

  describe('Large Time Displays', () => {
    it('should handle 60 second display', () => {
      render(<TimerDisplay remaining={60} />);
      const timer = screen.getByTestId('timer-display');
      expect(timer.textContent).toBe('1:00');
    });

    it('should handle 5 minute (300s) display', () => {
      render(<TimerDisplay remaining={300} />);
      const timer = screen.getByTestId('timer-display');
      expect(timer.textContent).toBe('5:00');
    });

    it('should handle edge case: 1 second', () => {
      render(<TimerDisplay remaining={1} />);
      const timer = screen.getByTestId('timer-display');
      expect(timer.textContent).toBe('0:01');
    });
  });
});
