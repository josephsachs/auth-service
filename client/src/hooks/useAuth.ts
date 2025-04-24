import { useState, useEffect } from 'react';
import { apiConfig } from '../config/api';

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
    setAuthState({ status: 'authenticating' });
    
    try {
      const result = await performLogin(username, password);
      
      if (!result.success) {
        setAuthState({ status: 'unauthenticated', isLoading: false });
        return false;
      }
      
      if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
        console.log('New password required for user');
        setAuthState({ 
          status: 'newPasswordRequired', 
          username, 
          session: result.session 
        });
        return true; // Return true since auth flow is proceeding as expected
      }
      
      setAuthState({
        status: 'authenticated',
        userEmail: username
      });
      
      if (result.session) {
        localStorage.setItem('session_token', result.session);
      }
      
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
    if (authState.status !== 'newPasswordRequired') {
      console.error('Cannot submit new password: not in newPasswordRequired state');
      return false;
    }

    try {
      console.log('Submitting new password');
      
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.challenge}`, {
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
        setAuthState({
          status: 'authenticated',
          userEmail: authState.username
        });
        
        if (data.session) {
          localStorage.setItem('session_token', data.session);
        }
        
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

  /**
   * Log the user out
   */
  const logout = async (): Promise<void> => {
    console.log('Logging out...');
    const sessionToken = localStorage.getItem('session_token');
    
    if (sessionToken) {
      try {
        await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.logout}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin,
          },
          body: JSON.stringify({
            session: sessionToken
          }),
          credentials: 'include',
          mode: 'cors'
        });
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
    
    localStorage.removeItem('session_token');
    
    setAuthState(initialState);
    setCsrfToken(null);
  };

  /**
   * Verify the current session
   */
  const verifySession = async (): Promise<boolean> => {
    try {
      const storedToken = localStorage.getItem('session_token');

      if (!storedToken) {
        setAuthState({ status: 'unauthenticated', isLoading: false });
        return false;
      }

      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.verify}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({
          session: storedToken
        }),
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        console.error('Session verification failed');
        setAuthState({ status: 'unauthenticated', isLoading: false });
        localStorage.removeItem('session_token');
        return false;
      }

      const data = await response.json();

      if (!data.valid) {
        console.error('Invalid session:', data.error);
        setAuthState({ status: 'unauthenticated', isLoading: false });
        localStorage.removeItem('session_token');
        return false;
      }

      setAuthState({
        status: 'authenticated',
        userEmail: data.user.email
      });

      return true;
    } catch (error) {
      console.error('Error verifying session:', error);
      setAuthState({ status: 'unauthenticated', isLoading: false });
      localStorage.removeItem('session_token');
      return false;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('session_token');
      if (token) {
        await verifySession();
      }
    };
    
    checkSession();
    
    const intervalId = setInterval(() => {
      checkSession();
    }, 5 * 60 * 1000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  const isAuthenticated = authState.status === 'authenticated';
  const userEmail = authState.status === 'authenticated' ? authState.userEmail : '';
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
    verifySession,
    fetchCsrfToken
  };
};

export default useAuth;