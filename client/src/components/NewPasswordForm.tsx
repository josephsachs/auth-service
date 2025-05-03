import React, { useState } from 'react';
import Spinner from './Spinner';
import FormField from './FormField';
import FormError from './FormError';
import { useForm } from '../hooks/useForm';
import { required, matches, createCognitoPasswordValidator } from '../utils/validators';

interface NewPasswordFormProps {
  onSubmit: (newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

interface NewPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

const NewPasswordForm: React.FC<NewPasswordFormProps> = ({ onSubmit, isLoading }) => {
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm<NewPasswordFormValues>({
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
      const success = await onSubmit(values.newPassword);
      
      if (!success) {
        setFormError('Failed to set new password. Please try again.');
      }
      
      return success;
    } catch (error) {
      console.error('Error setting new password:', error);
      setFormError('An error occurred while setting your new password. Please try again.');
      return false;
    }
  });
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <p className="mb-4 text-gray-700">
          You need to set a new password to continue.
        </p>
        
        <FormError error={formError} />
        
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
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || form.isSubmitting}
          className="flex items-center px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-purple-400"
        >
          {isLoading || form.isSubmitting ? (
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