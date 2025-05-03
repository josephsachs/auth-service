import React, { useState } from 'react';
import Spinner from './Spinner';
import FormField from './FormField';
import FormError from './FormError';
import { useForm } from '../hooks/useForm';
import { required, matches, minLength, createCognitoPasswordValidator } from '../utils/validators';

interface PasswordResetConfirmationFormProps {
  email: string;
  onSubmit: (email: string, code: string, newPassword: string) => Promise<boolean>;
  onCancel: () => void;
  onRequestNewCode: () => void;
  isLoading: boolean;
}

interface PasswordResetConfirmationFormValues {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordResetConfirmationForm: React.FC<PasswordResetConfirmationFormProps> = ({ 
  email,
  onSubmit,
  onCancel,
  onRequestNewCode,
  isLoading 
}) => {
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm<PasswordResetConfirmationFormValues>({
    code: {
      initialValue: '',
      validationRules: [required('Please enter the verification code from your email'), minLength(6, 'Verification code must be at least 6 characters')]
    },
    newPassword: {
      initialValue: '',
      validationRules: [createCognitoPasswordValidator()]
    },
    confirmPassword: {
      initialValue: '',
      validationRules: [required(), matches('newPassword', 'Passwords do not match')]
    }
  });
  
  const handleSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    
    try {
      const success = await onSubmit(email, values.code, values.newPassword);
      
      if (!success) {
        setFormError('Failed to reset password. Please check your code and try again.');
      }
      
      return success;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      setFormError('An error occurred. Please try again.');
      return false;
    }
  });
  
  return (
    <form onSubmit={handleSubmit}>
      <FormError error={formError} />
      
      <div className="mb-4">
        <p className="mb-4 text-gray-700">
          We've sent a verification code to <strong>{email}</strong>.<br />
          Enter the code and your new password below.
        </p>
        
        <FormField
          id="verification-code"
          label="Verification Code"
          type="text"
          value={form.values.code}
          onChange={form.handleChange('code')}
          onBlur={form.handleBlur('code')}
          error={form.errors.code}
          touched={form.touched.code}
          required
          disabled={form.isSubmitting || isLoading}
        />
      </div>

      <FormField
        id="new-password"
        label="New Password"
        type="password"
        value={form.values.newPassword}
        onChange={form.handleChange('newPassword')}
        onBlur={form.handleBlur('newPassword')}
        error={form.errors.newPassword}
        touched={form.touched.newPassword}
        required
        minLength={20}
        disabled={form.isSubmitting || isLoading}
        helperText="Password must be at least 20 characters with uppercase and lowercase letters"
      />

      <FormField
        id="confirm-password"
        label="Confirm Password"
        type="password"
        value={form.values.confirmPassword}
        onChange={form.handleChange('confirmPassword')}
        onBlur={form.handleBlur('confirmPassword')}
        error={form.errors.confirmPassword}
        touched={form.touched.confirmPassword}
        required
        disabled={form.isSubmitting || isLoading}
      />

      <div className="flex flex-col space-y-4">
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
          disabled={form.isSubmitting || isLoading}
        >
          Didn't receive a code? Send again
        </button>
      </div>
    </form>
  );
};

export default PasswordResetConfirmationForm;