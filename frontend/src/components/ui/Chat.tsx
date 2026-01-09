import React, { useState } from 'react';
import '../../styles/tokens.css';

interface ChatButtonProps {
  onClick?: () => void;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      title="Open chat"
      className="fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 z-50"
      style={{
        background: 'linear-gradient(135deg, #7765DA 0%, #5767D0 100%)',
        boxShadow: '0 4px 16px rgba(119, 101, 218, 0.4)',
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
};

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPopup: React.FC<ChatPopupProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  // Chat messages would be displayed here in future implementation
  const initialMessages = [
    { user: 'User 1', text: 'Hey There, how can I help?', time: '10:30 AM' },
    { user: 'User 2', text: 'Nothing bro..just chill!!', time: '10:31 AM' },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-24 right-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50"
      style={{
        border: '1px solid var(--color-border-primary)',
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b flex justify-between items-center"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <div className="flex gap-4">
          <button
            className="text-base font-semibold"
            style={{
              color: 'var(--color-primary)',
              borderBottom: '2px solid var(--color-primary)',
              paddingBottom: '4px',
            }}
          >
            Chat
          </button>
          <button
            className="text-base"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Participants
          </button>
        </div>
        <button
          onClick={onClose}
          title="Close chat"
          className="text-gray-500 hover:text-gray-700"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M6 6L14 14M14 6L6 14"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {initialMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${index % 2 === 0 ? 'items-start' : 'items-end'}`}
          >
            <span
              className="text-xs mb-1"
              style={{
                color: index % 2 === 0 ? 'var(--color-primary)' : '#9B8EE3',
              }}
            >
              {msg.user}
            </span>
            <div
              className="px-4 py-2 rounded-2xl max-w-[70%]"
              style={{
                backgroundColor:
                  index % 2 === 0 ? '#373737' : 'var(--color-primary)',
                color: 'white',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        className="p-4 border-t"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border"
            style={{
              borderColor: 'var(--color-border-primary)',
              outline: 'none',
            }}
          />
          <button
            title="Send message"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #7765DA 0%, #5767D0 100%)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10l16-8-8 16-2-6-6-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
