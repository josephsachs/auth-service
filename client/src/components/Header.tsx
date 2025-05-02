import React, { useState, useEffect } from 'react';
import UserButton from './UserButton';
import UserDropdown from './UserDropdown';
import LoginForm from './LoginForm';
import NewPasswordForm from './NewPasswordForm';
import RegisterForm from './RegisterForm';
import Modal from './Modal';
import { useAuthContext } from '../context/AuthContext';
import { apiConfig } from '../config/api';

const Header: React.FC = () => {
  const { isAuthenticated, userEmail, isLoading, verifySession } = useAuthContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authState, setAuthState] = useState<'login' | 'newPassword' | 'register'>('login');
  const [session, setSession] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [hasCsrfToken, setHasCsrfToken] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const { logout } = useAuthContext();

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.login}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        console.error('Failed to get CSRF token');
        return false;
      }
      
      const data = await response.json();
      setCsrfToken(data.csrfToken);
      setHasCsrfToken(true);
      return true;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      return false;
    }
  };

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      setIsModalOpen(true);
      setAuthState('login');
      fetchCsrfToken();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: email, 
          password: password,
          csrfToken: csrfToken
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.challengeName === 'NEW_PASSWORD_REQUIRED') {
        setAuthState('newPassword');
        setSession(data.session);
        setUsername(email);
        return true;
      }
      
      if (data.success && data.session) {
        localStorage.setItem('session_token', data.session);
        
        const verifySuccess = await verifySession();
        
        if (verifySuccess) {
          closeModal();
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleNewPasswordSubmit = async (newPassword: string) => {
    if (!session || !username) {
      console.error('Missing session or username for password change');
      return false;
    }
    
    try {
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.challenge}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeName: 'NEW_PASSWORD_REQUIRED',
          username,
          session,
          newPassword
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.session) {
          localStorage.setItem('session_token', data.session);
          
          await verifySession();
        }
        
        window.location.reload();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error submitting new password:', error);
      return false;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.register}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          email,
          password
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Registration failed:', data.error);
        return false;
      }
      
      return await handleLogin(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  useEffect(() => {
    if (!isDropdownOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      setIsDropdownOpen(false);
    };
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  useEffect(() => {
    if (isAuthenticated && isModalOpen && authState === 'login') {
      closeModal();
    }
  }, [isAuthenticated, isModalOpen, authState]);

  return (
    <header className="text-white bg-purple-900 shadow-md">
      <div className="container flex items-center justify-between px-4 py-3 mx-auto">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Cognito Auth Demo</h1>
        </div>

        <div className="flex items-center space-x-3">
          {!isAuthenticated && (
            <button
              onClick={() => {
                setIsModalOpen(true);
                setAuthState('register');
                fetchCsrfToken();
              }}
              className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-500"
            >
              Sign Up
            </button>
          )}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <UserButton 
              isAuthenticated={isAuthenticated}
              userEmail={userEmail}
              onClick={handleUserButtonClick}
            />
            
            <UserDropdown 
              email={userEmail}
              isOpen={isAuthenticated && isDropdownOpen}
              onLogout={logout}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          authState === 'login' 
            ? "Sign In" 
            : authState === 'newPassword' 
              ? "Set New Password" 
              : "Create Account"
        }
      >
        {authState === 'login' ? (
          <div>
            <LoginForm 
              onSubmit={handleLogin}
              isLoading={isLoading}
              hasCsrfToken={hasCsrfToken}
            />
            <div className="pt-4 mt-4 text-center border-t">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button 
                  onClick={() => setAuthState('register')}
                  className="text-purple-600 hover:text-purple-800 focus:outline-none"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        ) : authState === 'newPassword' ? (
          <NewPasswordForm 
            onSubmit={handleNewPasswordSubmit}
            isLoading={isLoading}
          />
        ) : (
          <div>
            <RegisterForm 
              onSubmit={handleRegister}
              isLoading={isLoading}
            />
            <div className="pt-4 mt-4 text-center border-t">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button 
                  onClick={() => setAuthState('login')}
                  className="text-purple-600 hover:text-purple-800 focus:outline-none"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        )}
      </Modal>
    </header>
  );
};

export default Header;