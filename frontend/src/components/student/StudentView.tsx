import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePoll } from '../../contexts/PollContext';
import { useSocket } from '../../hooks/useSocket';
import { VoteAPI } from '../../services/pollService';
import toast from 'react-hot-toast';

export const StudentView: React.FC = () => {
  const { studentName, studentSessionId, isAuthenticated, login } = useAuth();
  const { currentPoll, results, totalVotes, remainingSeconds } = usePoll();
  const { emit } = useSocket();

  const [name, setName] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && currentPoll) {
      emit('join:student', {
        sessionId: studentSessionId,
        pollId: currentPoll._id,
        studentName,
      });
    }
  }, [isAuthenticated, currentPoll, emit, studentSessionId, studentName]);

  const handleLogin = () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    login(name.trim());
  };

  const handleVote = async (optionId: string) => {
    if (hasVoted || !currentPoll) return;

    // Optimistic UI update - show selected immediately
    setSelectedOption(optionId);
    const previousVotedState = hasVoted;

    try {
      await VoteAPI.submitVote(currentPoll._id, optionId, studentName!);

      emit('vote:submit', {
        pollId: currentPoll._id,
        optionId,
        studentSessionId,
        studentName,
      });

      setHasVoted(true);
      toast.success('Vote submitted!');
    } catch (error: any) {
      // Revert optimistic UI on error
      setSelectedOption(null);
      setHasVoted(previousVotedState);

      const errorMessage =
        error.response?.data?.error || 'Failed to submit vote';

      // Show specific error for duplicate votes
      if (error.response?.status === 409) {
        toast.error('Vote already submitted!');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Join Poll</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Enter your name
              </label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button onClick={handleLogin} className="btn-primary w-full">
              Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPoll || currentPoll.status !== 'active') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Waiting for Poll</h2>
          <p className="text-text-secondary">
            No active poll at the moment. Please wait for the teacher to start a
            poll.
          </p>
        </div>
      </div>
    );
  }

  if (hasVoted || currentPoll.status !== 'active') {
    return (
      <div className="min-h-screen bg-background-secondary p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">{currentPoll.question}</h2>

            {currentPoll.status === 'active' && (
              <p className="text-text-secondary mb-6">
                Thank you for voting! Results will be shown when the poll ends.
              </p>
            )}

            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.optionId}
                  className="bg-background-secondary rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium flex items-center gap-2">
                      {result.optionText}
                      {selectedOption === result.optionId && (
                        <span className="text-primary text-sm">
                          (Your vote)
                        </span>
                      )}
                    </span>
                    <span className="text-text-secondary">
                      {result.count} ({result.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-border-primary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${result.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-text-secondary">
              Total votes: {totalVotes}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="card">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{currentPoll.question}</h2>
              <div className="text-xl font-semibold text-primary">
                {formatTime(remainingSeconds)}
              </div>
            </div>
            <p className="text-text-secondary">Select one option</p>
          </div>

          <div className="space-y-3">
            {currentPoll.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                className="w-full text-left p-6 bg-background border-2 border-border-primary rounded-lg hover:border-primary hover:bg-primary-light transition-all duration-200 text-lg font-medium"
                style={{ minHeight: '56px' }}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
