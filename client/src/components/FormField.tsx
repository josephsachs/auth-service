// src/components/FormField.tsx
import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  helperText?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  minLength,
  helperText,
}) => {
  const showError = touched && error;
  
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-2 text-gray-700">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          showError ? 'border-red-500' : 'border-gray-300'
        }`}
        required={required}
        disabled={disabled}
        minLength={minLength}
      />
      {showError && (
        <div className="mt-1 text-sm text-red-600">{error}</div>
      )}
      {helperText && !showError && (
        <p className="mt-1 text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
};

export default FormField;