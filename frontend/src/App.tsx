import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PollProvider } from './contexts/PollContext';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentView } from './components/student/StudentView';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PollHistory } from './components/teacher/PollHistory';
import { useSocket } from './hooks/useSocket';
import { useAuth } from './contexts/AuthContext';
import { usePoll } from './contexts/PollContext';
import './styles/index.css';

/**
 * StateRecoveryComponent wraps app content to handle state recovery on mount
 */
function StateRecoveryWrapper({ children }: { children: React.ReactNode }) {
  const { socket } = useSocket();
  const { studentSessionId } = useAuth();

  useEffect(() => {
    if (!socket) return;

    // Request state recovery on component mount
    const recoverState = () => {
      const sessionId = sessionStorage.getItem('studentSessionId');

      if (sessionId) {
        socket.emit(
          'state:request',
          { role: 'student', sessionId },
          (state: any) => {
            if (state && !state.error) {
              console.log('[StateRecovery] State recovered:', state);
              // State will be handled by PollContext and AuthContext listeners
            }
          }
        );
      }
    };

    // Initial recovery
    recoverState();

    // Also recover on reconnect
    socket.on('connect', recoverState);

    return () => {
      socket.off('connect', recoverState);
    };
  }, [socket]);

  return <>{children}</>;
}

function AppContent() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <PollProvider>
          <StateRecoveryWrapper>
            <div className="App">
              <Routes>
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/teacher/history" element={<PollHistory />} />
                <Route path="/student" element={<StudentView />} />
                <Route
                  path="/removed"
                  element={
                    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                      <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium mb-8"
                        style={{
                          background:
                            'linear-gradient(135deg, #7765DA 0%, #5767D0 100%)',
                          boxShadow: '0 4px 12px rgba(119, 101, 218, 0.3)',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M8 1L10.5 6L16 7L12 11L13 16L8 13.5L3 16L4 11L0 7L5.5 6L8 1Z"
                            fill="white"
                          />
                        </svg>
                        <span>Intervue Poll</span>
                      </div>
                      <div className="max-w-md text-center">
                        <h2
                          className="text-4xl font-bold mb-4"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          You've been Kicked out !
                        </h2>
                        <p
                          className="text-lg"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          Looks like the teacher had removed you from the poll
                          system .Please Try again sometime.
                        </p>
                      </div>
                    </div>
                  }
                />
              </Routes>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                }}
              />
            </div>
          </StateRecoveryWrapper>
        </PollProvider>
      </AuthProvider>
    </Router>
  );
}

function App() {
  return <AppContent />;
}

export default App;
