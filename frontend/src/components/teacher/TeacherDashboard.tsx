import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../../contexts/PollContext';
import { BrandBadge } from '../ui/BrandBadge.tsx';
import { ChatButton, ChatPopup } from '../ui/Chat.tsx';
import toast from 'react-hot-toast';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentPoll,
    results,
    detailedVotes,
    totalVotes,
    remainingSeconds,
    createPoll,
    endPoll,
  } = usePoll();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);
  const [chatOpen, setChatOpen] = useState(false);
  const [showDurationMenu, setShowDurationMenu] = useState(false);

  const durationOptions = [
    { value: 30, label: '30 seconds' },
    { value: 60, label: '60 seconds' },
    { value: 90, label: '90 seconds' },
    { value: 120, label: '2 minutes' },
    { value: 180, label: '3 minutes' },
    { value: 300, label: '5 minutes' },
  ];

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    createPoll(question, validOptions, duration);

    setQuestion('');
    setOptions(['', '']);
    setDuration(60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Create Poll Screen (Figma Match)
  if (!currentPoll || currentPoll.status !== 'active') {
    return (
      <div className="min-h-screen bg-white p-8">
        <BrandBadge className="mb-8" />

        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Let's Get Started
          </h2>

          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            you'll have the ability to create and manage polls, ask questions,
            and monitor your students' responses in real-time.
          </p>

          <div
            className="bg-white rounded-2xl shadow-lg p-8 border"
            style={{
              borderColor: 'var(--color-border-primary)',
            }}
          >
            {/* Question Input */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label
                  className="block text-base font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Enter your question
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDurationMenu(!showDurationMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: 'var(--color-background-tertiary)',
                    }}
                  >
                    <span className="font-medium">
                      {durationOptions.find((opt) => opt.value === duration)?.label ||
                        `${duration} seconds`}
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
                            fontWeight: duration === option.value ? '600' : '400',
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
                className="w-full px-4 py-4 rounded-xl border text-base resize-none"
                style={{
                  borderColor: 'var(--color-border-primary)',
                  backgroundColor: 'var(--color-background-tertiary)',
                  outline: 'none',
                  minHeight: '120px',
                }}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Rahul Bajaj"
                maxLength={500}
              />
              <div className="text-right mt-2">
                <span
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {question.length}/100
                </span>
              </div>
            </div>

            {/* Options */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3
                  className="text-base font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Edit Options
                </h3>
                <h3
                  className="text-base font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Is it Correct?
                </h3>
              </div>

              {options.map((option, index) => (
                <div key={index} className="flex gap-4 mb-4 items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {index + 1}
                  </div>

                  <input
                    type="text"
                    className="flex-1 px-4 py-3 rounded-xl border"
                    style={{
                      borderColor: 'var(--color-border-primary)',
                      backgroundColor: 'var(--color-background-tertiary)',
                      outline: 'none',
                    }}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder="Rahul Bajaj"
                  />

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        className="w-5 h-5"
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        Yes
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        className="w-5 h-5"
                        defaultChecked
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        No
                      </span>
                    </label>
                  </div>
                </div>
              ))}

              {options.length < 10 && (
                <button
                  onClick={handleAddOption}
                  className="text-base font-medium mt-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  + Add More option
                </button>
              )}
            </div>

            {/* Ask Question Button */}
            <button
              onClick={handleCreatePoll}
              className="w-full py-4 rounded-full text-white font-semibold text-base transition-all"
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

  // Active Poll Results Screen (Figma Match)
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="flex justify-between items-center mb-8">
        <BrandBadge />

        <button
          onClick={() => navigate('/teacher/history')}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold transition-all"
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

      <div className="max-w-6xl mx-auto">
        <div
          className="bg-white rounded-2xl shadow-lg p-8 border"
          style={{
            borderColor: 'var(--color-border-primary)',
          }}
        >
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Question
          </h2>

          {/* Question Header */}
          <div
            className="rounded-xl p-4 mb-6"
            style={{
              backgroundColor: 'var(--color-gray-700)',
              color: 'white',
            }}
          >
            <h3 className="text-lg font-medium">{currentPoll.question}</h3>
          </div>

          {/* Results */}
          <div className="space-y-4 mb-8">
            {results.map((result, index) => (
              <div
                key={result.optionId}
                className="border rounded-xl p-4"
                style={{
                  borderColor: 'var(--color-border-primary)',
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
