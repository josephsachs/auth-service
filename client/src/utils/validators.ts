// src/utils/validators.ts
import { ValidationRule } from '../types/form';

export const required = (message = 'This field is required'): ValidationRule => ({
  validate: (value) => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },
  errorMessage: message,
});

export const minLength = (length: number, message = `Must be at least ${length} characters`): ValidationRule => ({
  validate: (value) => {
    if (typeof value === 'string') {
      return value.length >= length;
    }
    return false;
  },
  errorMessage: message,
});

export const hasUppercase = (message = 'Must contain at least one uppercase letter'): ValidationRule => ({
  validate: (value) => {
    if (typeof value === 'string') {
      return /[A-Z]/.test(value);
    }
    return false;
  },
  errorMessage: message,
});

export const hasLowercase = (message = 'Must contain at least one lowercase letter'): ValidationRule => ({
  validate: (value) => {
    if (typeof value === 'string') {
      return /[a-z]/.test(value);
    }
    return false;
  },
  errorMessage: message,
});

export const isEmail = (message = 'Please enter a valid email address'): ValidationRule => ({
  validate: (value) => {
    if (typeof value === 'string') {
      return /\S+@\S+\.\S+/.test(value);
    }
    return false;
  },
  errorMessage: message,
});

export const matches = (
  otherField: string,
  message = 'Fields do not match'
): ValidationRule => ({
  validate: (value, formValues) => {
    if (!formValues) return false;
    return value === formValues[otherField];
  },
  errorMessage: message,
});

export const composeValidators = (...validators: ValidationRule[]): ValidationRule => ({
  validate: (value, formValues) => {
    for (const validator of validators) {
      if (!validator.validate(value, formValues)) {
        return false;
      }
    }
    return true;
  },
  errorMessage: '', // This will be overridden by the first failing validator
});

export const createCognitoPasswordValidator = (): ValidationRule => 
  composeValidators(
    minLength(20, 'Password must be at least 20 characters long'),
    hasUppercase('Password must contain uppercase letters'),
    hasLowercase('Password must contain lowercase letters')
  );