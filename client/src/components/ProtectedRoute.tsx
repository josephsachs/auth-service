import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import Spinner from './Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  fallback = <div className="flex items-center justify-center min-h-screen">
    <p className="text-lg text-gray-600">Please sign in to access this page</p>
  </div>
}) => {
  const { isAuthenticated, isLoading, verifySession } = useAuthContext();
  const [isVerifying, setIsVerifying] = useState(true);
  
  useEffect(() => {
    const verify = async () => {
      setIsVerifying(true);
      await verifySession();
      setIsVerifying(false);
    };
    
    verify();
  }, [verifySession]);
  
  if (isVerifying || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="purple" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;