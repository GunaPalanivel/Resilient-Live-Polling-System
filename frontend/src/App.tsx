import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PollProvider } from './contexts/PollContext';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentView } from './components/student/StudentView';
import './styles/index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <PollProvider>
          <div className="App">
            <Routes>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/student" element={<StudentView />} />
              <Route path="/" element={<Navigate to="/student" replace />} />
              <Route path="/removed" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="card max-w-md text-center">
                    <h2 className="text-2xl font-bold text-error mb-4">Removed from Poll</h2>
                    <p className="text-text-secondary">
                      You have been removed from this poll by the teacher.
                    </p>
                  </div>
                </div>
              } />
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
        </PollProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
