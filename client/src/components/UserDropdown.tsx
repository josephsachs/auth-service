import React from 'react';

interface UserDropdownProps {
  email: string;
  isOpen: boolean;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ 
  email, 
  isOpen, 
  onLogout 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 text-gray-800">
      <div className="px-4 py-2 text-sm border-b">
        Signed in as<br />
        <span className="font-medium">{email}</span>
      </div>
      <button
        onClick={onLogout}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Sign out
      </button>
    </div>
  );
};

export default UserDropdown;