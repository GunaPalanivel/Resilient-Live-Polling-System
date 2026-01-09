import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../../contexts/PollContext';
import { BrandBadge } from '../ui/BrandBadge.tsx';
import { ChatButton, ChatPopup } from '../ui/Chat.tsx';
import toast from 'react-hot-toast';

// Back button component for consistent styling
const BackButton: React.FC<{ onClick: () => void }> = React.memo(
  ({ onClick }) => (
    <button
      onClick={onClick}
      title="Go back"
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
  )
);

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentPoll, results, detailedVotes, createPoll, endPoll } =
    usePoll();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);
  const [chatOpen, setChatOpen] = useState(false);
  const [showDurationMenu, setShowDurationMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const durationOptions = useMemo(
    () => [
      { value: 30, label: '30 seconds' },
      { value: 60, label: '60 seconds' },
      { value: 90, label: '90 seconds' },
      { value: 120, label: '2 minutes' },
      { value: 180, label: '3 minutes' },
      { value: 300, label: '5 minutes' },
    ],
    []
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDurationMenu(false);
      }
    };

    if (showDurationMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDurationMenu]);

  const handleAddOption = useCallback(() => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  }, [options]);

  const handleOptionChange = useCallback((index: number, value: string) => {
    setOptions((prev) => {
      const newOptions = [...prev];
      newOptions[index] = value;
      return newOptions;
    });
  }, []);

  const handleCreatePoll = useCallback(() => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const validOptions = options
      .filter((opt) => opt.trim())
      .map((opt) => opt.trim());
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    console.log('🎯 Creating poll with duration:', duration, 'seconds');
    createPoll(question.trim(), validOptions, duration);

    setQuestion('');
    setOptions(['', '']);
    setDuration(60);
  }, [question, options, duration, createPoll]);

  // Create Poll Screen (Figma Match + Responsive)
  if (!currentPoll || currentPoll.status !== 'active') {
    return (
      <div className="min-h-screen bg-white p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-4">
          <BackButton onClick={() => navigate('/')} />
          <BrandBadge />
        </div>

        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Let's Get Started
          </h2>

          <p
            className="mb-6 md:mb-8 text-sm sm:text-base"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            you'll have the ability to create and manage polls, ask questions,
            and monitor your students' responses in real-time.
          </p>

          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border"
            style={{
              borderColor: 'var(--color-border-primary)',
            }}
          >
            {/* Question Input */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                <label
                  className="block text-sm sm:text-base font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Enter your question
                </label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDurationMenu(!showDurationMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: 'var(--color-background-tertiary)',
                    }}
                  >
                    <span className="font-medium">
                      {durationOptions.find((opt) => opt.value === duration)
                        ?.label || `${duration} seconds`}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                      style={{
                        transform: showDurationMenu
                          ? 'rotate(180deg)'
                          : 'rotate(0)',
                        transition: 'transform 0.2s',
                      }}
                    >
                      <path d="M6 8L2 4h8l-4 4z" />
                    </svg>
                  </button>

                  {showDurationMenu && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10"
                      style={{ borderColor: 'var(--color-border-primary)' }}
                    >
                      {durationOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setDuration(option.value);
                            setShowDurationMenu(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          style={{
                            backgroundColor:
                              duration === option.value
                                ? 'var(--color-primary-light)'
                                : 'transparent',
                            color:
                              duration === option.value
                                ? 'var(--color-primary)'
                                : 'var(--color-text-primary)',
                            fontWeight:
                              duration === option.value ? '600' : '400',
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <textarea
                className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base resize-none"
                style={{
                  borderColor: 'var(--color-border-primary)',
                  backgroundColor: 'var(--color-background-tertiary)',
                  outline: 'none',
                  minHeight: '100px',
                }}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question here..."
                maxLength={500}
              />
              <div className="text-right mt-2">
                <span
                  className="text-xs sm:text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {question.length}/100
                </span>
              </div>
            </div>

            {/* Options */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3
                  className="text-sm sm:text-base font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Edit Options
                </h3>
                <h3
                  className="text-sm sm:text-base font-medium hidden sm:block"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Is it Correct?
                </h3>
              </div>

              {options.map((option, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3 sm:mb-4"
                >
                  <div className="flex gap-2 sm:gap-4 items-center flex-1">
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm sm:text-base"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {index + 1}
                    </div>

                    <input
                      type="text"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border text-sm sm:text-base"
                      style={{
                        borderColor: 'var(--color-border-primary)',
                        backgroundColor: 'var(--color-background-tertiary)',
                        outline: 'none',
                      }}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder="Enter option..."
                    />
                  </div>

                  <div className="flex gap-3 sm:gap-4 pl-10 sm:pl-0">
                    <label className="flex items-center gap-1 sm:gap-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span
                        className="text-sm sm:text-base"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        Yes
                      </span>
                    </label>
                    <label className="flex items-center gap-1 sm:gap-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        defaultChecked
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span
                        className="text-sm sm:text-base"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        No
                      </span>
                    </label>
                  </div>
                </div>
              ))}

              {options.length < 10 && (
                <button
                  onClick={handleAddOption}
                  className="text-sm sm:text-base font-medium mt-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  + Add More option
                </button>
              )}
            </div>

            {/* Ask Question Button */}
            <button
              onClick={handleCreatePoll}
              className="w-full py-3 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-base transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #7765DA 0%, #5767D0 100%)',
                boxShadow: '0 4px 12px rgba(119, 101, 218, 0.3)',
              }}
            >
              Ask Question
            </button>
          </div>
        </div>

        <ChatButton onClick={() => setChatOpen(!chatOpen)} />
        <ChatPopup isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    );
  }

  // Active Poll Results Screen (Figma Match + Responsive)
  return (
    <div className="min-h-screen bg-white p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-2 sm:gap-4">
          <BackButton onClick={() => navigate('/')} />
          <BrandBadge />
        </div>

        <button
          onClick={() => navigate('/teacher/history')}
          className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-white font-semibold text-sm sm:text-base transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #7765DA 0%, #5767D0 100%)',
            boxShadow: '0 4px 12px rgba(119, 101, 218, 0.3)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3C6 3 3 6 3 10s3 7 7 7 7-3 7-7-3-7-7-7zm0 1.5c3 0 5.5 2.5 5.5 5.5s-2.5 5.5-5.5 5.5S4.5 13 4.5 10 7 4.5 10 4.5z" />
            <path d="M9.5 7h1v3.5l3 1.5-.5 1-3.5-2V7z" />
          </svg>
          View Poll history
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4">
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
            className="rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6"
            style={{
              backgroundColor: 'var(--color-gray-900)',
            }}
          >
            <h3 className="text-base sm:text-lg font-medium text-white">
              {currentPoll.question}
            </h3>
          </div>

          {/* Results */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {results.map((result, index) => (
              <div
                key={result.optionId}
                className="border rounded-lg sm:rounded-xl p-3 sm:p-4"
                style={{
                  borderColor: 'var(--color-border-primary)',
                }}
              >
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {index + 1}
                    </div>
                    <span
                      className="font-medium text-sm sm:text-base md:text-lg"
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

          {/* Ask New Question Button */}
          <button
            onClick={endPoll}
            className="w-full py-4 rounded-full text-white font-semibold text-base transition-all mb-4"
            style={{
              background: 'linear-gradient(135deg, #7765DA 0%, #5767D0 100%)',
              boxShadow: '0 4px 12px rgba(119, 101, 218, 0.3)',
            }}
          >
            + Ask a new question
          </button>

          {/* Detailed Votes Table */}
          {detailedVotes.length > 0 && (
            <div
              className="mt-8 pt-8 border-t"
              style={{ borderColor: 'var(--color-border-primary)' }}
            >
              <h3
                className="text-xl font-bold mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Detailed Votes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className="border-b"
                      style={{ borderColor: 'var(--color-border-primary)' }}
                    >
                      <th
                        className="text-left py-3 px-4 font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        Student Name
                      </th>
                      <th
                        className="text-left py-3 px-4 font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        Vote
                      </th>
                      <th
                        className="text-left py-3 px-4 font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedVotes.map((vote, index) => (
                      <tr
                        key={index}
                        className="border-b"
                        style={{ borderColor: 'var(--color-border-primary)' }}
                      >
                        <td
                          className="py-3 px-4"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {vote.studentName}
                        </td>
                        <td
                          className="py-3 px-4"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {vote.optionText}
                        </td>
                        <td
                          className="py-3 px-4"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {new Date(vote.votedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatButton onClick={() => setChatOpen(!chatOpen)} />
      <ChatPopup isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};
