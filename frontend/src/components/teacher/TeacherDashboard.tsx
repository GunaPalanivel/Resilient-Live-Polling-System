import React, { useState } from 'react';
import { usePoll } from '../../contexts/PollContext';
import toast from 'react-hot-toast';

export const TeacherDashboard: React.FC = () => {
  const { currentPoll, results, detailedVotes, totalVotes, remainingSeconds, createPoll, endPoll } = usePoll();
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);

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
    
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setDuration(60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-8">Teacher Dashboard</h1>

        {!currentPoll || currentPoll.status !== 'active' ? (
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6">Create New Poll</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Question
                </label>
                <input
                  type="text"
                  className="input"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your poll question"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Options
                </label>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      className="input flex-1"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="px-4 py-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {options.length < 10 && (
                  <button
                    onClick={handleAddOption}
                    className="btn-secondary mt-2"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  className="input w-48"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={10}
                  max={600}
                />
              </div>

              <button
                onClick={handleCreatePoll}
                className="btn-primary w-full"
              >
                Create Poll
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{currentPoll.question}</h2>
                  <p className="text-text-secondary">
                    Time Remaining: <span className="font-semibold text-primary">{formatTime(remainingSeconds)}</span>
                  </p>
                </div>
                <button
                  onClick={endPoll}
                  className="px-6 py-3 bg-error text-white rounded-full hover:bg-error/90 transition-colors"
                >
                  End Poll
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Results ({totalVotes} votes)</h3>
                <div className="space-y-3">
                  {results.map((result) => (
                    <div key={result.optionId} className="bg-background-secondary rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{result.optionText}</span>
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
              </div>

              {detailedVotes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detailed Votes</h3>
                  <div className="bg-background-secondary rounded-lg p-4 max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-border-primary">
                          <th className="pb-2">Student Name</th>
                          <th className="pb-2">Vote</th>
                          <th className="pb-2">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedVotes.map((vote, index) => (
                          <tr key={index} className="border-b border-border-primary/50">
                            <td className="py-2">{vote.studentName}</td>
                            <td className="py-2">{vote.optionText}</td>
                            <td className="py-2 text-text-secondary text-sm">
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
        )}
      </div>
    </div>
  );
};
