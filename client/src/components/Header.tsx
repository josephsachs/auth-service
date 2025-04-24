import React, { useState, useEffect } from 'react';
import UserButton from './UserButton';
import UserDropdown from './UserDropdown';
import LoginForm from './LoginForm';
import NewPasswordForm from './NewPasswordForm';
import Modal from './Modal';
import { useAuthContext } from '../context/AuthContext';
import { apiConfig } from '../config/api';

const Header: React.FC = () => {
  const { isAuthenticated, userEmail, isLoading, login, logout } = useAuthContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authState, setAuthState] = useState<'login' | 'newPassword'>('login');
  const [session, setSession] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [hasCsrfToken, setHasCsrfToken] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

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
        return true; // Keep modal open
      }
      
      const success = await login(email, password);
      if (success) {
        closeModal();
      }
      return success;
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

      {/* Auth Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={authState === 'login' ? "Sign In" : "Set New Password"}
      >
        {authState === 'login' ? (
          <LoginForm 
            onSubmit={handleLogin}
            isLoading={isLoading}
            hasCsrfToken={hasCsrfToken}
          />
        ) : (
          <NewPasswordForm 
            onSubmit={handleNewPasswordSubmit}
            isLoading={isLoading}
          />
        )}
      </Modal>
    </header>
  );
};

export default Header;