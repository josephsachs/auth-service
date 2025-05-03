// src/components/FormError.tsx
import React from 'react';

interface FormErrorProps {
  error: string | null;
}

const FormError: React.FC<FormErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
      {error}
    </div>
  );
};

export default FormError;