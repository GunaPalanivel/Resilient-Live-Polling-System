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
    <Router>
      <AuthProvider>
        <PollProvider>
          <StateRecoveryWrapper>
            <div className="App">
              <Routes>
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/student" element={<StudentView />} />
                <Route path="/" element={<Navigate to="/student" replace />} />
                <Route
                  path="/removed"
                  element={
                    <div className="min-h-screen bg-background flex items-center justify-center">
                      <div className="card max-w-md text-center">
                        <h2 className="text-2xl font-bold text-error mb-4">
                          Removed from Poll
                        </h2>
                        <p className="text-text-secondary">
                          You have been removed from this poll by the teacher.
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
