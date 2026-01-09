import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Poll, VoteResult, DetailedVote } from '../types';
import toast from 'react-hot-toast';

interface PollContextType {
  currentPoll: Poll | null;
  results: VoteResult[];
  detailedVotes: DetailedVote[];
  totalVotes: number;
  remainingSeconds: number;
  isLoading: boolean;
  createPoll: (question: string, options: string[], duration: number) => void;
  endPoll: () => void;
  refreshPoll: () => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [detailedVotes, setDetailedVotes] = useState<DetailedVote[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { emit, on, off } = useSocket();

  useEffect(() => {
    // Listen for poll events
    const handlePollCreated = (poll: Poll) => {
      console.log('🔵 Poll created event received:', poll);
      setCurrentPoll(poll);
      setResults([]);
      setDetailedVotes([]);
      setTotalVotes(0);
      setRemainingSeconds(poll.duration);
      toast.success('Poll created!');
    };

    const handlePollEnded = (poll: Poll) => {
      console.log('🔴 Poll ended event received:', poll);
      setCurrentPoll(poll);
      toast.success('Poll ended!');
    };

    const handlePollExpired = (poll: Poll) => {
      console.log('⏰ Poll expired event received:', poll);
      setCurrentPoll(poll);
      toast('Poll expired!', { icon: '⏰' });
    };

    const handleTimerTick = (data: { pollId: string; remaining: number }) => {
      setRemainingSeconds(data.remaining);
    };

    const handleVoteUpdateTeacher = (data: {
      results: VoteResult[];
      detailedVotes: DetailedVote[];
      totalVotes: number;
    }) => {
      setResults(data.results);
      setDetailedVotes(data.detailedVotes);
      setTotalVotes(data.totalVotes);
    };

    const handleVoteUpdateStudent = (data: {
      results: VoteResult[];
      totalVotes: number;
    }) => {
      setResults(data.results);
      setTotalVotes(data.totalVotes);
    };

    on('poll:created', handlePollCreated);
    on('poll:ended', handlePollEnded);
    on('poll:expired', handlePollExpired);
    on('timer:tick', handleTimerTick);
    on('vote:update:teacher', handleVoteUpdateTeacher);
    on('vote:update:student', handleVoteUpdateStudent);

    return () => {
      off('poll:created', handlePollCreated);
      off('poll:ended', handlePollEnded);
      off('poll:expired', handlePollExpired);
      off('timer:tick', handleTimerTick);
      off('vote:update:teacher', handleVoteUpdateTeacher);
      off('vote:update:student', handleVoteUpdateStudent);
    };
  }, [on, off]);

  const createPoll = (
    question: string,
    options: string[],
    duration: number
  ) => {
    setIsLoading(true);

    // Emit with error callback
    emit('poll:create', { question, options, duration }, (error: any) => {
      setIsLoading(false);

      if (error) {
        console.error('Poll creation error:', error);

        // Handle specific error messages
        if (error.message === 'ACTIVE_POLL_EXISTS') {
          toast.error(
            'A poll is already active. End it before creating a new one.'
          );
        } else {
          toast.error(
            'Failed to create poll: ' + (error.message || 'Unknown error')
          );
        }
      }
    });
  };

  const endPoll = () => {
    if (currentPoll) {
      emit('poll:end', { pollId: currentPoll._id });
    }
  };

  const refreshPoll = async () => {
    // Implemented via API call if needed
  };

  return (
    <PollContext.Provider
      value={{
        currentPoll,
        results,
        detailedVotes,
        totalVotes,
        remainingSeconds,
        isLoading,
        createPoll,
        endPoll,
        refreshPoll,
      }}
    >
      {children}
    </PollContext.Provider>
  );
};

export const usePoll = () => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error('usePoll must be used within PollProvider');
  }
  return context;
};
