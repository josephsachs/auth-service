// client/src/components/LoginForm.tsx
import React, { useState } from 'react';
import Spinner from './Spinner';
import FormField from './FormField';
import FormError from './FormError';
import { useForm } from '../hooks/useForm';
import { required, isEmail } from '../utils/validators';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  isLoading: boolean;
  hasCsrfToken: boolean;
}

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, hasCsrfToken }) => {
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    email: {
      initialValue: '',
      validationRules: [required(), isEmail()]
    },
    password: {
      initialValue: '',
      validationRules: [required()]
    }
  });
  
  const handleSubmit = form.handleSubmit(async (values) => {
    if (isLoading || !hasCsrfToken) {
      return;
    }
    
    setFormError(null);
    
    try {
      const result = await onSubmit(values.email, values.password);
      
      if (!result.success && result.error) {
        setFormError(result.error);
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error('Login form submission error:', err);
    }
  });
  
  const isSubmitDisabled = form.isSubmitting || isLoading || !hasCsrfToken;
  
  return (
    <form onSubmit={handleSubmit}>
      <FormError error={formError} />
      
      <FormField
        id="email"
        label="Email"
        type="email"
        value={form.values.email}
        onChange={form.handleChange('email')}
        onBlur={form.handleBlur('email')}
        error={form.errors.email}
        touched={form.touched.email}
        required
        disabled={form.isSubmitting}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        value={form.values.password}
        onChange={form.handleChange('password')}
        onBlur={form.handleBlur('password')}
        error={form.errors.password}
        touched={form.touched.password}
        required
        disabled={form.isSubmitting}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex items-center px-4 py-2 text-white bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-purple-400"
        >
          {form.isSubmitting ? (
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