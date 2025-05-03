// client/src/components/LoginForm.tsx
import React, { useState } from 'react';
import Spinner from './Spinner';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  isLoading: boolean;
  hasCsrfToken: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, hasCsrfToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formSubmitting || isLoading || !hasCsrfToken) {
      return; // Prevent multiple submissions
    }
    
    setError(null);
    setFormSubmitting(true);
    
    try {
      const result = await onSubmit(email, password);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login form submission error:', err);
    } finally {
      setFormSubmitting(false);
    }
  };
  
  const isSubmitDisabled = formSubmitting || isLoading || !hasCsrfToken;
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="email" className="block mb-2 text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
          disabled={formSubmitting}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block mb-2 text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
          disabled={formSubmitting}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex items-center px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-purple-400"
        >
          {formSubmitting ? (
            <>
              <Spinner size="sm" />
              <span className="ml-2">Signing in...</span>
            </>
          ) : isLoading ? (
            <>
              <Spinner size="sm" />
              <span className="ml-2">Signing in...</span>
            </>
          ) : !hasCsrfToken ? (
            <>
              <Spinner size="sm" />
              <span className="ml-2">Preparing...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;