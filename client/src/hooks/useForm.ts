// src/hooks/useForm.ts
import { useState, useCallback } from 'react';
import { FormConfig, FormState, UseFormReturn } from '../types/form';

export function useForm<T extends Record<string, any>>(config: FormConfig<T>): UseFormReturn<T> {
  // Initialize form values from config
  const initialValues = Object.keys(config).reduce((acc, key) => {
    acc[key as keyof T] = config[key as keyof T].initialValue;
    return acc;
  }, {} as T);

  // Initialize form state
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: false,
    isSubmitting: false,
  });

  // Validate a single field
  const validateField = useCallback((fieldName: keyof T, value: T[keyof T], allValues: T): string | null => {
    const fieldConfig = config[fieldName];
    
    if (!fieldConfig.validationRules) {
      return null;
    }

    for (const rule of fieldConfig.validationRules) {
      if (!rule.validate(value as any, allValues)) {
        return rule.errorMessage;
      }
    }

    return null;
  }, [config]);

  // Validate the entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isFormValid = true;

    for (const fieldName of Object.keys(config) as Array<keyof T>) {
      const error = validateField(fieldName, formState.values[fieldName], formState.values);
      if (error) {
        newErrors[fieldName] = error;
        isFormValid = false;
      }
    }

    setFormState(prev => ({
      ...prev,
      errors: newErrors,
      isValid: isFormValid,
    }));

    return isFormValid;
  }, [config, formState.values, validateField]);

  // Handle field change
  const handleChange = useCallback((fieldName: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setFormState(prev => {
      const newValues = {
        ...prev.values,
        [fieldName]: value,
      };
      
      const error = validateField(fieldName, value as T[keyof T], newValues);
      
      return {
        ...prev,
        values: newValues,
        touched: {
          ...prev.touched,
          [fieldName]: true,
        },
        errors: {
          ...prev.errors,
          [fieldName]: error || undefined,
        },
      };
    });
  }, [validateField]);

  // Handle field blur
  const handleBlur = useCallback((fieldName: keyof T) => () => {
    const value = formState.values[fieldName];
    const error = validateField(fieldName, value, formState.values);
    
    setFormState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [fieldName]: true,
      },
      errors: {
        ...prev.errors,
        [fieldName]: error || undefined,
      },
    }));
  }, [formState.values, validateField]);

  // Set field value programmatically
  const setFieldValue = useCallback((fieldName: keyof T, value: T[keyof T]) => {
    setFormState(prev => {
      const newValues = {
        ...prev.values,
        [fieldName]: value,
      };
      
      const error = validateField(fieldName, value, newValues);
      
      return {
        ...prev,
        values: newValues,
        errors: {
          ...prev.errors,
          [fieldName]: error || undefined,
        },
      };
    });
  }, [validateField]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: false,
      isSubmitting: false,
    });
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit: (values: T) => Promise<any>) => async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validateForm();
    
    if (!isValid) {
      return;
    }
    
    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
    }));
    
    try {
      await onSubmit(formState.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  }, [formState.values, validateForm]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    resetForm,
    validateForm,
    handleSubmit,
  };
}