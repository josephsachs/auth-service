import { useState, useEffect } from 'react';
import { apiConfig } from '../config/api';

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string;
  isLoading: boolean;
  token: string | null;
  csrfToken: string | null;
}

if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration in useAuth:', apiConfig);
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userEmail: '',
    isLoading: false,
    token: null,
    csrfToken: null
  });

  useEffect(() => {
    // This would be where we'd check for an existing session token
    // For now, we're just initializing with no authentication
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
      
      setAuthState(prev => ({ ...prev, csrfToken: data.csrfToken }));
      return true;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      return false;
    }
  };

  const performLogin = async (email: string, password: string): Promise<{ success: boolean, session?: string }> => {
    if (!authState.csrfToken) {
      console.error('No CSRF token available for login');
      return { success: false };
    }

    try {
      console.log('Submitting login request to:', `${apiConfig.baseUrl}${apiConfig.endpoints.login}`);
      console.log('With payload:', { username: email, password: '***REDACTED***', csrfToken: authState.csrfToken });
      
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({
          username: email,
          password: password,
          csrfToken: authState.csrfToken
        }),
        credentials: 'include', // Needed for cookies
        mode: 'cors'
      });
      
      console.log('Response status:', response.status);
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('Response headers:', responseHeaders);
      
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
      
      console.log('Login successful, session data:', data);
      return { 
        success: true,
        session: data.session
      };
    } catch (error) {
      console.error('Error during login request:', error);
      return { success: false };
    }
  };

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const loginResult = await performLogin(email, password);
      
      if (!loginResult.success) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      
      setAuthState({
        isAuthenticated: true,
        userEmail: email,
        isLoading: false,
        token: loginResult.session || null,
        csrfToken: null // Clear the CSRF token after successful login
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    // For now, just reset the auth state
    // Later we could call the logout endpoint
    console.log('Logging out...');
    
    setAuthState({
      isAuthenticated: false,
      userEmail: '',
      isLoading: false,
      token: null,
      csrfToken: null
    });
  };

  return {
    ...authState,
    login,
    logout,
    fetchCsrfToken
  };
};

export default useAuth;