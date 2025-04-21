import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string;
  isLoading: boolean;
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userEmail: '',
    isLoading: false
  });

  // Check for existing session on mount
  useEffect(() => {
    // We would check for an existing token/session here
    // For now, just use localStorage for demo purposes
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setAuthState({
        isAuthenticated: true,
        userEmail: savedEmail,
        isLoading: false
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update state
      setAuthState({
        isAuthenticated: true,
        userEmail: email,
        isLoading: false
      });
      
      // Save to localStorage for persistence
      localStorage.setItem('userEmail', email);
      
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    // Clear state
    setAuthState({
      isAuthenticated: false,
      userEmail: '',
      isLoading: false
    });
    
    // Clear localStorage
    localStorage.removeItem('userEmail');
  };

  return {
    ...authState,
    login,
    logout
  };
};

export default useAuth;