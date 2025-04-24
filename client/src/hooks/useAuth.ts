import { useState, useEffect } from 'react';
import { apiConfig } from '../config/api';

// Define all possible auth states with discriminated union
type AuthState = 
  | { status: 'unauthenticated', isLoading: boolean }
  | { status: 'authenticating' }
  | { status: 'newPasswordRequired', session: string, username: string }
  | { status: 'authenticated', userEmail: string };

const initialState: AuthState = {
  status: 'unauthenticated',
  isLoading: false
};

if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration in useAuth:', apiConfig);
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // This would be where we'd check for an existing session token
    console.log('useAuth: initializing auth state');
  }, []);

  const fetchCsrfToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.login}`, {
        method: 'GET',
        credentials: 'include', // Needed for cookies
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        console.error('Failed to get CSRF token. Status:', response.status);
        console.error('Response:', await response.text());
        return false;
      }
      
      const data = await response.json();
      console.log('Got CSRF token:', data.csrfToken);
      
      setCsrfToken(data.csrfToken);
      return true;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      return false;
    }
  };

  const performLogin = async (username: string, password: string): Promise<any> => {
    if (!csrfToken) {
      console.error('No CSRF token available for login');
      return { success: false };
    }

    try {
      console.log('Submitting login request to:', `${apiConfig.baseUrl}${apiConfig.endpoints.login}`);
      
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({
          username,
          password,
          csrfToken
        }),
        credentials: 'include', // Needed for cookies
        mode: 'cors'
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Response is not valid JSON:', responseText);
        return { success: false };
      }
      
      if (!response.ok) {
        console.error('Login failed:', data);
        return { success: false };
      }
      
      console.log('Login response:', data);
      return data;
    } catch (error) {
      console.error('Error during login request:', error);
      return { success: false };
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    // Update state to indicate we're in the authenticating process
    setAuthState({ status: 'authenticating' });
    
    try {
      const result = await performLogin(username, password);
      
      if (!result.success) {
        setAuthState({ status: 'unauthenticated', isLoading: false });
        return false;
      }
      
      // Handle NEW_PASSWORD_REQUIRED challenge
      if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
        console.log('New password required for user');
        setAuthState({ 
          status: 'newPasswordRequired', 
          username, 
          session: result.session 
        });
        return true; // Return true since auth flow is proceeding as expected
      }
      
      // If no challenge, assume successful authentication
      setAuthState({
        status: 'authenticated',
        userEmail: username
      });
      
      // Clear CSRF token after successful authentication
      setCsrfToken(null);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState({ status: 'unauthenticated', isLoading: false });
      return false;
    }
  };

  const submitNewPassword = async (newPassword: string): Promise<boolean> => {
    // Ensure we're in the correct state
    if (authState.status !== 'newPasswordRequired') {
      console.error('Cannot submit new password: not in newPasswordRequired state');
      return false;
    }

    try {
      console.log('Submitting new password');
      
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.respondToChallenge}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({
          challengeName: 'NEW_PASSWORD_REQUIRED',
          username: authState.username,
          session: authState.session,
          newPassword
        }),
        credentials: 'include',
        mode: 'cors'
      });
      
      if (!response.ok) {
        console.error('Failed to submit new password. Status:', response.status);
        console.error('Response:', await response.text());
        setAuthState({ status: 'unauthenticated', isLoading: false });
        return false;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update auth state to authenticated
        setAuthState({
          status: 'authenticated',
          userEmail: authState.username
        });
        return true;
      } else {
        console.error('New password submission failed:', data);
        setAuthState({ status: 'unauthenticated', isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('Error submitting new password:', error);
      setAuthState({ status: 'unauthenticated', isLoading: false });
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out...');
    
    // Reset to initial state
    setAuthState(initialState);
    setCsrfToken(null);
    
    // Could call logout endpoint here if needed
  };

  // Check if user is authenticated (convenience function)
  const isAuthenticated = authState.status === 'authenticated';
  
  // Get user email if authenticated
  const userEmail = authState.status === 'authenticated' ? authState.userEmail : '';
  
  // Check if we're in loading state
  const isLoading = 
    authState.status === 'authenticating' || 
    (authState.status === 'unauthenticated' && authState.isLoading);

  // Return both state and actions
  return {
    authState,
    isAuthenticated,
    userEmail,
    isLoading,
    csrfToken,
    login,
    logout,
    submitNewPassword,
    fetchCsrfToken
  };
};

export default useAuth;