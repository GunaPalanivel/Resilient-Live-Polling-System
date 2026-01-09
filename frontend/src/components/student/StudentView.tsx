import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePoll } from '../../contexts/PollContext';
import { useSocket } from '../../hooks/useSocket';
import { VoteAPI } from '../../services/pollService';
import { BrandBadge } from '../ui/BrandBadge.tsx';
import { ChatButton, ChatPopup } from '../ui/Chat.tsx';
import toast from 'react-hot-toast';

// Memoized Back button component for consistent styling
const BackButton = React.memo<{ onClick: () => void }>(({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-gray-100"
    style={{ color: 'var(--color-text-secondary)' }}
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
    <span className="font-medium">Back</span>
  </button>
));
BackButton.displayName = 'BackButton';

export const StudentView: React.FC = () => {
  const navigate = useNavigate();
  const { studentName, studentSessionId, isAuthenticated, login } = useAuth();
  const { currentPoll, results, remainingSeconds } = usePoll();
  const { emit } = useSocket();

  const [name, setName] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Check for recovered vote status on poll change
  useEffect(() => {
    if (currentPoll) {
      const savedVoted = sessionStorage.getItem('hasVoted_' + currentPoll._id);
      const savedOption = sessionStorage.getItem(
        'votedOption_' + currentPoll._id
      );
      if (savedVoted === 'true') {
        setHasVoted(true);
        if (savedOption) {
          setSelectedOption(savedOption);
        }
        console.log('[StudentView] Restored vote status from recovery');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPoll?._id]);

  // Join student room as soon as authenticated (don't wait for poll)
  useEffect(() => {
    if (isAuthenticated) {
      emit('join:student', {
        sessionId: studentSessionId,
        pollId: currentPoll?._id, // Optional - backend will fetch active poll
        studentName,
      });
    }
  }, [isAuthenticated, emit, studentSessionId, studentName, currentPoll?._id]);

  const handleLogin = () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    login(name.trim());
  };

  const handleVote = async (optionId: string) => {
    if (hasVoted || !currentPoll) return;

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
      // Persist vote status for recovery
      sessionStorage.setItem('hasVoted_' + currentPoll._id, 'true');
      sessionStorage.setItem('votedOption_' + currentPoll._id, optionId);
      toast.success('Vote submitted!');
    } catch (error: unknown) {
      setSelectedOption(null);
      setHasVoted(previousVotedState);

      const axiosError = error as {
        response?: { data?: { error?: string }; status?: number };
      };
      const errorMessage =
        axiosError.response?.data?.error || 'Failed to submit vote';
      if (axiosError.response?.status === 409) {
        toast.error('Vote already submitted!');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Login Screen (Figma Match + Responsive)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-3 sm:p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 md:mb-8">
          <BackButton onClick={() => navigate('/')} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4">
          <BrandBadge className="mb-6 md:mb-8" />

          <div className="w-full max-w-md">
            <h2
              className="text-2xl sm:text-3xl font-bold text-center mb-2 sm:mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Let's Get Started
            </h2>

            <p
              className="text-center mb-6 md:mb-8 text-sm sm:text-base"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              If you're a student, you'll be able to{' '}
              <strong>submit your answers</strong>, participate in live polls,
              and see how your responses compare with your classmates
            </p>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm sm:text-base font-medium mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Enter your Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border text-sm sm:text-base"
                  style={{
                    borderColor: 'var(--color-border-primary)',
                    backgroundColor: 'var(--color-background-tertiary)',
                    outline: 'none',
                  }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Bajaj"
                  maxLength={100}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <button
                onClick={handleLogin}
                className="w-full py-3 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-base transition-all active:scale-[0.98]"
                style={{
                  background:
                    'linear-gradient(135deg, #7765DA 0%, #5767D0 100%)',
                  boxShadow: '0 4px 12px rgba(119, 101, 218, 0.3)',
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Waiting Screen (Figma Match + Responsive)
  if (!currentPoll || currentPoll.status !== 'active') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-3 sm:p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 md:mb-8">
          <BackButton onClick={() => navigate('/')} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <BrandBadge className="mb-6 md:mb-8" />

          <div
            className="flex flex-col items-center justify-center"
            style={{ minHeight: '300px' }}
          >
            {/* Animated Loading Spinner */}
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-4 sm:mb-6"
              style={{
                border: '4px solid var(--color-primary-light)',
                borderTopColor: 'var(--color-primary)',
                animation: 'spin 1s linear infinite',
              }}
            />

            <h2
              className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-center"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Wait for the teacher to ask questions..
            </h2>
          </div>
        </div>

        <ChatButton onClick={() => setChatOpen(!chatOpen)} />
        <ChatPopup isOpen={chatOpen} onClose={() => setChatOpen(false)} />

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Results Screen (Figma Match + Responsive)
  if (hasVoted || currentPoll.status !== 'active') {
    return (
      <div className="min-h-screen bg-white p-3 sm:p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <BackButton onClick={() => navigate('/')} />
        </div>

        <BrandBadge className="mx-auto mb-6 md:mb-8" />

        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border"
            style={{
              borderColor: 'var(--color-border-primary)',
            }}
          >
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Question
            </h2>

            {/* Question Header */}
            <div
              className="rounded-t-xl p-4 mb-6"
              style={{
                backgroundColor: 'var(--color-gray-900)',
                color: 'white',
              }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{currentPoll.question}</h3>
                {currentPoll.status === 'active' && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="7"
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 4v4l3 2"
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span style={{ color: '#FF5757' }}>
                      {formatTime(remainingSeconds)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4 mb-6">
              {results.map((result, index) => (
                <div
                  key={result.optionId}
                  className="border rounded-xl p-4"
                  style={{
                    borderColor: 'var(--color-border-primary)',
                    backgroundColor:
                      selectedOption === result.optionId
                        ? 'var(--color-primary-light)'
                        : 'white',
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        {index + 1}
                      </div>
                      <span
                        className="font-medium text-lg"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {result.optionText}
                      </span>
                    </div>
                    <span
                      className="text-lg font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {result.percentage.toFixed(0)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className="w-full h-3 rounded-full overflow-hidden"
                    style={{
                      backgroundColor: 'var(--color-background-tertiary)',
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${result.percentage}%`,
                        background:
                          'linear-gradient(90deg, #7765DA 0%, #5767D0 100%)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {currentPoll.status !== 'active' && (
              <div className="text-center">
                <p
                  className="text-lg mb-4"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Wait for the teacher to ask a new question..
                </p>
              </div>
            )}
          </div>
        </div>

        <ChatButton onClick={() => setChatOpen(!chatOpen)} />
        <ChatPopup isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    );
  }

  // Question/Voting Screen (Figma Match + Responsive)
  return (
    <div className="min-h-screen bg-white flex flex-col p-3 sm:p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <BackButton onClick={() => navigate('/')} />
      </div>

      <div className="flex-1 flex flex-col items-center px-2 sm:px-4">
        <BrandBadge className="mb-6 md:mb-8" />

        <div className="w-full max-w-2xl mx-auto flex-1 flex items-center">
          <div
            className="w-full bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border"
            style={{
              borderColor: 'var(--color-border-primary)',
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4 sm:mb-6 md:mb-8">
              <h2
                className="text-lg sm:text-xl md:text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Question 1
              </h2>
              <div
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full"
                style={{
                  backgroundColor: 'var(--color-background-tertiary)',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="sm:w-4 sm:h-4"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 4v4l3 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className="font-semibold text-sm sm:text-base"
                  style={{ color: '#FF5757' }}
                >
                  {formatTime(remainingSeconds)}
                </span>
              </div>
            </div>

            {/* Question */}
            <div
              className="rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6"
              style={{
                backgroundColor: 'var(--color-gray-900)',
              }}
            >
              <h3 className="text-base sm:text-lg font-medium text-white">
                {currentPoll.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              {currentPoll.options.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  className="w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 hover:scale-[1.01] sm:hover:scale-[1.02] active:scale-[0.99]"
                  style={{
                    borderColor:
                      selectedOption === option.id
                        ? 'var(--color-primary)'
                        : 'var(--color-border-primary)',
                    backgroundColor:
                      selectedOption === option.id
                        ? 'var(--color-primary-light)'
                        : 'white',
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm sm:text-base"
                      style={{
                        backgroundColor:
                          selectedOption === option.id
                            ? 'var(--color-primary)'
                            : 'var(--color-gray-600)',
                      }}
                    >
                      {index + 1}
                    </div>
                    <span
                      className="font-medium text-sm sm:text-base md:text-lg"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {option.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={() => selectedOption && handleVote(selectedOption)}
              disabled={!selectedOption}
              className="w-full py-3 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-base transition-all disabled:opacity-50 active:scale-[0.98]"
              style={{
                background: selectedOption
                  ? 'linear-gradient(135deg, #7765DA 0%, #5767D0 100%)'
                  : '#BDBDBD',
                boxShadow: selectedOption
                  ? '0 4px 12px rgba(119, 101, 218, 0.3)'
                  : 'none',
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      <ChatButton onClick={() => setChatOpen(!chatOpen)} />
      <ChatPopup isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};
