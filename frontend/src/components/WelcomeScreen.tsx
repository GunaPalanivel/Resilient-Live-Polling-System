import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandBadge } from './ui/BrandBadge.tsx';
import '../styles/tokens.css';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<
    'student' | 'teacher' | null
  >(null);

  const handleContinue = () => {
    if (selectedRole === 'student') {
      navigate('/student');
    } else if (selectedRole === 'teacher') {
      navigate('/teacher');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center">
        <BrandBadge className="mx-auto mb-8" />

        <h1
          className="text-4xl font-bold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Welcome to the Live Polling System
        </h1>

        <p
          className="text-lg mb-12"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Please select the role that best describes you to begin using the live
          polling system
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Student Card */}
          <button
            onClick={() => setSelectedRole('student')}
            className="p-8 rounded-2xl border-2 transition-all duration-200 text-left"
            style={{
              borderColor:
                selectedRole === 'student'
                  ? 'var(--color-primary)'
                  : 'var(--color-border-primary)',
              backgroundColor:
                selectedRole === 'student'
                  ? 'var(--color-primary-light)'
                  : 'white',
              boxShadow:
                selectedRole === 'student'
                  ? '0 4px 12px rgba(119, 101, 218, 0.2)'
                  : 'none',
            }}
          >
            <h3
              className="text-2xl font-bold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              I'm a Student
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry
            </p>
          </button>

          {/* Teacher Card */}
          <button
            onClick={() => setSelectedRole('teacher')}
            className="p-8 rounded-2xl border-2 transition-all duration-200 text-left"
            style={{
              borderColor:
                selectedRole === 'teacher'
                  ? 'var(--color-primary)'
                  : 'var(--color-border-primary)',
              backgroundColor:
                selectedRole === 'teacher'
                  ? 'var(--color-primary-light)'
                  : 'white',
              boxShadow:
                selectedRole === 'teacher'
                  ? '0 4px 12px rgba(119, 101, 218, 0.2)'
                  : 'none',
            }}
          >
            <h3
              className="text-2xl font-bold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              I'm a Teacher
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Submit answers and view live poll results in real-time.
            </p>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="px-12 py-4 rounded-full text-white font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: selectedRole
              ? 'linear-gradient(135deg, #7765DA 0%, #5767D0 100%)'
              : '#BDBDBD',
            boxShadow: selectedRole
              ? '0 4px 12px rgba(119, 101, 218, 0.3)'
              : 'none',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
