// client/src/components/PasswordResetRequestForm.tsx
import React, { useState } from 'react';
import Spinner from './Spinner';
import { apiConfig } from '../config/api';

interface PasswordResetRequestFormProps {
  onSubmit: (email: string) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
}

const PasswordResetRequestForm: React.FC<PasswordResetRequestFormProps> = ({ 
  onSubmit,
  onCancel,
  isLoading 
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError('');
    setFormLoading(true);
    
    // Client-side validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setFormLoading(false);
      return;
    }
    
    try {
      // Use the parent-provided onSubmit function
      const success = await onSubmit(email);
      
      if (!success) {
        setError('Failed to send password reset email. Please try again.');
      }
      
      setFormLoading(false);
      return success;
    } catch (error) {
      console.error('Password reset request error:', error);
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
      
      <div className="mb-6">
        <p className="mb-4 text-gray-700">
          Enter your email address and we'll send you a code to reset your password.
        </p>
        
        <label htmlFor="reset-email" className="block mb-2 text-gray-700">
          Email Address
        </label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

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
              <span className="ml-2">Sending...</span>
            </>
          ) : (
            "Send Reset Code"
          )}
        </button>
      </div>
    </form>
  );
};

export default PasswordResetRequestForm;