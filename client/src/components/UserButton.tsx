import React from 'react';

interface UserButtonProps {
  isAuthenticated: boolean;
  userEmail: string;
  onClick: () => void;
}

const UserButton: React.FC<UserButtonProps> = ({ 
  isAuthenticated, 
  userEmail, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
      aria-label={isAuthenticated ? "Open user menu" : "Sign in"}
    >
      {isAuthenticated ? (
        userEmail.charAt(0).toUpperCase()
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )}
    </button>
  );
};

export default UserButton;