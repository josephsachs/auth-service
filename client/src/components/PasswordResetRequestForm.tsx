import React, { useState } from 'react';
import Spinner from './Spinner';
import FormField from './FormField';
import FormError from './FormError';
import { useForm } from '../hooks/useForm';
import { required, isEmail } from '../utils/validators';

interface PasswordResetRequestFormProps {
  onSubmit: (email: string) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
}

interface PasswordResetRequestFormValues {
  email: string;
}

const PasswordResetRequestForm: React.FC<PasswordResetRequestFormProps> = ({ 
  onSubmit,
  onCancel,
  isLoading 
}) => {
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm<PasswordResetRequestFormValues>({
    email: {
      initialValue: '',
      validationRules: [required(), isEmail()]
    }
  });
  
  const handleSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    
    try {
      const success = await onSubmit(values.email);
      
      if (!success) {
        setFormError('Failed to send password reset email. Please try again.');
      }
      
      return success;
    } catch (error) {
      console.error('Password reset request error:', error);
      setFormError('An error occurred. Please try again.');
      return false;
    }
  });
  
  return (
    <form onSubmit={handleSubmit}>
      <FormError error={formError} />
      
      <div className="mb-6">
        <p className="mb-4 text-gray-700">
          Enter your email address and we'll send you a code to reset your password.
        </p>
        
        <FormField
          id="reset-email"
          label="Email Address"
          type="email"
          value={form.values.email}
          onChange={form.handleChange('email')}
          onBlur={form.handleBlur('email')}
          error={form.errors.email}
          touched={form.touched.email}
          required
          disabled={form.isSubmitting || isLoading}
        />
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          disabled={form.isSubmitting || isLoading}
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isLoading || form.isSubmitting}
          className="flex items-center px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-purple-400"
        >
          {isLoading || form.isSubmitting ? (
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