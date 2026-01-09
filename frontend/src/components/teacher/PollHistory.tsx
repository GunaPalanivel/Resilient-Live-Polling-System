import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandBadge } from '../ui/BrandBadge.tsx';
import { PollAPI } from '../../services/pollService';
import { Poll } from '../../types';
import toast from 'react-hot-toast';

// Back button component for consistent styling
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
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
);

export const PollHistory: React.FC = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPollHistory();
  }, []);

  const loadPollHistory = async () => {
    try {
      const history = await PollAPI.getPollHistory();
      setPolls(history);
    } catch (error) {
      toast.error('Failed to load poll history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4"
            style={{
              border: '4px solid var(--color-primary-light)',
              borderTopColor: 'var(--color-primary)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Loading history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <BackButton onClick={() => navigate('/teacher')} />
          <BrandBadge />
        </div>

        <h1
          className="text-4xl font-bold mb-12"
          style={{ color: 'var(--color-text-primary)' }}
        >
          View Poll History
        </h1>

        {polls.length === 0 ? (
          <div className="text-center py-12">
            <p
              className="text-xl"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              No poll history available yet
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {polls.map((poll, pollIndex) => (
              <div
                key={poll._id}
                className="bg-white rounded-2xl shadow-lg p-8 border"
                style={{
                  borderColor: 'var(--color-border-primary)',
                }}
              >
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Question {pollIndex + 1}
                </h2>

                {/* Question Header */}
                <div
                  className="rounded-xl p-4 mb-6"
                  style={{
                    backgroundColor: 'var(--color-gray-900)',
                  }}
                >
                  <h3 className="text-lg font-medium text-white">
                    {poll.question}
                  </h3>
                </div>

                {/* Results with actual vote counts */}
                <div className="space-y-4">
                  {poll.options.map((option, index) => {
                    const totalVotes = poll.totalVotes ?? 0;
                    const optionVotes = option.voteCount ?? 0;
                    const percentage =
                      totalVotes > 0
                        ? Math.round((optionVotes / totalVotes) * 100)
                        : 0;

                    return (
                      <div
                        key={option.id}
                        className="border rounded-xl p-4"
                        style={{
                          borderColor: 'var(--color-border-primary)',
                        }}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                              style={{
                                backgroundColor: 'var(--color-primary)',
                              }}
                            >
                              {index + 1}
                            </div>
                            <span
                              className="font-medium text-lg"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {option.text}
                            </span>
                          </div>
                          <div className="text-right">
                            <span
                              className="text-lg font-semibold block"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {percentage}%
                            </span>
                            <span
                              className="text-sm"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              {optionVotes} votes
                            </span>
                          </div>
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
                              width: `${percentage}%`,
                              background:
                                'linear-gradient(90deg, #7765DA 0%, #5767D0 100%)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
