import React, { useState } from 'react';
import Spinner from './Spinner';

interface NewPasswordFormProps {
  onSubmit: (newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const NewPasswordForm: React.FC<NewPasswordFormProps> = ({ onSubmit, isLoading }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError('');
    
    // Validate passwords
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Submit new password
    await onSubmit(newPassword);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <p className="mb-4 text-gray-700">
          You need to set a new password to continue.
        </p>
        
        {error && (
          <div className="p-2 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        
        <label htmlFor="new-password" className="block mb-2 text-gray-700">
          New Password
        </label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
          minLength={8}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="confirm-password" className="block mb-2 text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-purple-400"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" />
              <span className="ml-2">Setting Password...</span>
            </>
          ) : (
            "Set New Password"
          )}
        </button>
      </div>
    </form>
  );
};

export default NewPasswordForm;