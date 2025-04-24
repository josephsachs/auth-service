import React, { useState, useEffect } from 'react';
import UserButton from './UserButton';
import UserDropdown from './UserDropdown';
import LoginForm from './LoginForm';
import NewPasswordForm from './NewPasswordForm';
import Modal from './Modal';
import useAuth from '../hooks/useAuth';

const Header: React.FC = () => {
  const { 
    authState, 
    isAuthenticated, 
    userEmail, 
    isLoading, 
    csrfToken, 
    login, 
    logout, 
    submitNewPassword,
    fetchCsrfToken 
  } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle button click based on auth state
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      // Open modal
      setIsModalOpen(true);
      // Fetch CSRF token when opening the login modal
      fetchCsrfToken();
    }
  };

  // Close modal with fade animation
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle login form submission
  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    // Modal will stay open if we transition to newPasswordRequired state
  };

  // Handle new password submission
  const handleNewPasswordSubmit = async (newPassword: string): Promise<boolean> => {
    const success = await submitNewPassword(newPassword);
    if (success) {
      // Modal will close automatically when auth state changes to authenticated
    }
    return success;
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      // Close dropdown when clicking outside
      setIsDropdownOpen(false);
    };
    
    // Add event listener with a slight delay to avoid immediate trigger
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  // Close modal after successful authentication
  useEffect(() => {
    if (isAuthenticated && isModalOpen) {
      closeModal();
    }
  }, [isAuthenticated, isModalOpen]);

  // Determine modal title based on auth state
  const getModalTitle = () => {
    switch (authState.status) {
      case 'newPasswordRequired':
        return 'Set New Password';
      default:
        return 'Sign In';
    }
  };

  // Render the appropriate form based on auth state
  const renderAuthForm = () => {
    switch (authState.status) {
      case 'newPasswordRequired':
        return (
          <NewPasswordForm 
            onSubmit={handleNewPasswordSubmit}
            isLoading={isLoading}
          />
        );
      default:
        return (
          <LoginForm 
            onSubmit={handleLogin}
            isLoading={isLoading}
            hasCsrfToken={!!csrfToken}
          />
        );
    }
  };

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
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Auth Modal - Shows login or new password form depending on state */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={getModalTitle()}
      >
        {renderAuthForm()}
      </Modal>
    </header>
  );
};

export default Header;