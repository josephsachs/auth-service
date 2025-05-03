import React, { useState } from 'react';
import Spinner from './Spinner';
import FormField from './FormField';
import FormError from './FormError';
import { useForm } from '../hooks/useForm';
import { required, isEmail, matches, createCognitoPasswordValidator } from '../utils/validators';

interface RegisterFormProps {
  onSubmit: (email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm<RegisterFormValues>({
    email: {
      initialValue: '',
      validationRules: [required(), isEmail()]
    },
    password: {
      initialValue: '',
      validationRules: [createCognitoPasswordValidator()]
    },
    confirmPassword: {
      initialValue: '',
      validationRules: [required(), matches('password', 'Passwords do not match')]
    }
  });
  
  const handleSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    
    try {
      const success = await onSubmit(values.email, values.password);
      
      if (!success) {
        setFormError('Registration failed. Please try again.');
      }
      
      return success;
    } catch (error) {
      console.error('Registration error:', error);
      setFormError('An error occurred during registration. Please try again.');
      return false;
    }
  });
  
  return (
    <form onSubmit={handleSubmit}>
      <FormError error={formError} />
      
      <FormField
        id="register-email"
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

      <FormField
        id="register-password"
        label="Password"
        type="password"
        value={form.values.password}
        onChange={form.handleChange('password')}
        onBlur={form.handleBlur('password')}
        error={form.errors.password}
        touched={form.touched.password}
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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || form.isSubmitting}
          className="flex items-center px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-purple-400"
        >
          {isLoading || form.isSubmitting ? (
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