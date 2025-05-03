import React, { useState } from 'react';
import Spinner from './Spinner';

interface RegisterFormProps {
  onSubmit: (email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setFormLoading(true);
    
    // Client-side validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setFormLoading(false);
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setFormLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setFormLoading(false);
      return;
    }
    
    try {
      // Use the parent-provided onSubmit function
      const success = await onSubmit(email, password);
      
      if (!success) {
        setError('Registration failed. Please try again.');
      }
      
      setFormLoading(false);
      return success;
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration. Please try again.');
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
        <label htmlFor="register-email" className="block mb-2 text-gray-700">
          Email Address
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="register-password" className="block mb-2 text-gray-700">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
          minLength={20}
        />
        <p className="mt-1 text-sm text-gray-600">
          Password must be at least 20 characters with uppercase and lowercase letters
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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || formLoading}
          className="flex items-center px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-purple-400"
        >
          {isLoading || formLoading ? (
            <>
              <Spinner size="sm" />
              <span className="ml-2">Creating Account...</span>
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;