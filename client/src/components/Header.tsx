import React, { useState, useEffect } from 'react';
import UserButton from './UserButton';
import UserDropdown from './UserDropdown';
import LoginForm from './LoginForm';
import Modal from './Modal';
import useAuth from '../hooks/useAuth';

const Header: React.FC = () => {
  const { isAuthenticated, userEmail, login, logout, isLoading, fetchCsrfToken, csrfToken } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Handle button click based on auth state
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      // Open login modal 
      setIsLoginModalOpen(true);
      // Fetch CSRF token when opening the login modal
      fetchCsrfToken();
    }
  };

  // Close login modal with fade animation
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  // Handle login form submission
  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      // Modal will close automatically when auth state changes
    }
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
  
  // Close modal after successful login
  useEffect(() => {
    if (isAuthenticated && isLoginModalOpen) {
      closeLoginModal();
    }
  }, [isAuthenticated, isLoginModalOpen]);

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

      {/* Login Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        title="Sign In"
      >
        <LoginForm 
          onSubmit={handleLogin}
          isLoading={isLoading}
          hasCsrfToken={!!csrfToken}
        />
      </Modal>
    </header>
  );
};

export default Header;