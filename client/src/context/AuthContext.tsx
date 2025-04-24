import React, { createContext, useContext, ReactNode } from 'react';
import useAuth from '../hooks/useAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  const value: AuthContextType = {
    isAuthenticated: auth.isAuthenticated,
    userEmail: auth.userEmail,
    isLoading: auth.isLoading,
    login: auth.login,
    logout: auth.logout,
    verifySession: auth.verifySession
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}