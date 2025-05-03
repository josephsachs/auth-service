// client/src/components/PasswordResetConfirmationForm.tsx
import React, { useState } from 'react';
import Spinner from './Spinner';

interface PasswordResetConfirmationFormProps {
  email: string;
  onSubmit: (email: string, code: string, newPassword: string) => Promise<boolean>;
  onCancel: () => void;
  onRequestNewCode: () => void;
  isLoading: boolean;
}

const PasswordResetConfirmationForm: React.FC<PasswordResetConfirmationFormProps> = ({ 
  email,
  onSubmit,
  onCancel,
  onRequestNewCode,
  isLoading 
}) => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError('');
    setFormLoading(true);
    
    // Client-side validation
    if (code.length < 6) {
      setError('Please enter the verification code from your email');
      setFormLoading(false);
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setFormLoading(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setFormLoading(false);
      return;
    }
    
    try {
      // Use the parent-provided onSubmit function
      const success = await onSubmit(email, code, newPassword);
      
      if (!success) {
        setError('Failed to reset password. Please check your code and try again.');
      }
      
      setFormLoading(false);
      return success;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      setError('An error occurred. Please try again.');
      setFormLoading(false);
      return false;
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="p-2 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <p className="mb-4 text-gray-700">
          We've sent a verification code to <strong>{email}</strong>.<br />
          Enter the code and your new password below.
        </p>
        
        <label htmlFor="verification-code" className="block mb-2 text-gray-700">
          Verification Code
        </label>
        <input
          id="verification-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div className="mb-4">
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
        <p className="mt-1 text-sm text-gray-600">
          Password must be at least 8 characters with uppercase and lowercase letters
        </p>
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

      <div className="flex flex-col space-y-4">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading || formLoading}
            className="flex items-center px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-purple-400"
          >
            {isLoading || formLoading ? (
              <>
                <Spinner size="sm" />
                <span className="ml-2">Resetting Password...</span>
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </div>
        
        <button
          type="button"
          onClick={onRequestNewCode}
          className="text-sm text-purple-600 hover:text-purple-800 focus:outline-none"
        >
          Didn't receive a code? Send again
        </button>
      </div>
    </form>
  );
};

export default PasswordResetConfirmationForm;