import React, { createContext, useContext, useState, useEffect } from 'react';
import { SessionService } from '../utils/session';

interface AuthContextType {
  studentName: string | null;
  studentSessionId: string;
  isAuthenticated: boolean;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentName, setStudentName] = useState<string | null>(null);
  const [studentSessionId] = useState<string>(() => SessionService.getSessionId());

  useEffect(() => {
    const savedName = sessionStorage.getItem('studentName');
    if (savedName) {
      setStudentName(savedName);
    }
  }, []);

  const login = (name: string) => {
    setStudentName(name);
    sessionStorage.setItem('studentName', name);
  };

  const logout = () => {
    setStudentName(null);
    sessionStorage.removeItem('studentName');
    SessionService.clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        studentName,
        studentSessionId,
        isAuthenticated: !!studentName,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
