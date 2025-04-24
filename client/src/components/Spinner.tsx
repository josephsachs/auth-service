import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'purple';
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'white' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const colorClasses = {
    white: 'border-white border-t-transparent',
    purple: 'border-purple-700 border-t-transparent'
  };
  
  return (
    <div 
      className={`inline-block animate-spin rounded-full border-2 border-solid ${sizeClasses[size]} ${colorClasses[color]}`} 
      role="status" 
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;