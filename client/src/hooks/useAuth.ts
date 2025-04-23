import { useState, useEffect } from 'react';
import { 
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import { cognitoConfig } from '../config/cognito';

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string;
  isLoading: boolean;
  token: string | null;
}

// Initialize the Cognito User Pool
const userPool = new CognitoUserPool({
  UserPoolId: cognitoConfig.userPoolId,
  ClientId: cognitoConfig.userPoolWebClientId,
});

// For debugging in development
if (process.env.NODE_ENV === 'development') {
  console.log('Cognito Configuration:', {
    UserPoolId: cognitoConfig.userPoolId,
    ClientId: cognitoConfig.userPoolWebClientId,
  });
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userEmail: '',
    isLoading: false,
    token: null
  });

  // Check for existing session on mount
  useEffect(() => {
    const currentUser = userPool.getCurrentUser();
    
    if (currentUser) {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          console.error('Error getting session:', err);
          setAuthState({
            isAuthenticated: false,
            userEmail: '',
            isLoading: false,
            token: null
          });
          return;
        }
        
        if (session && session.isValid()) {
          // Get user attributes to retrieve email
          currentUser.getUserAttributes((err, attributes) => {
            if (err) {
              console.error('Error getting user attributes:', err);
              return;
            }
            
            // Find the email attribute
            const emailAttribute = attributes?.find(attr => attr.getName() === 'email');
            const email = emailAttribute ? emailAttribute.getValue() : '';
            
            setAuthState({
              isAuthenticated: true,
              userEmail: email,
              isLoading: false,
              token: session.getIdToken().getJwtToken()
            });
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            userEmail: '',
            isLoading: false,
            token: null
          });
        }
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    return new Promise<boolean>((resolve) => {
      // Use the default authentication flow (SRP) by not specifying AuthFlow
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });
      
      const userData = {
        Username: email,
        Pool: userPool
      };
      
      const cognitoUser = new CognitoUser(userData);
      
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          const token = session.getIdToken().getJwtToken();
          
          setAuthState({
            isAuthenticated: true,
            userEmail: email,
            isLoading: false,
            token
          });
          
          resolve(true);
        },
        onFailure: (err) => {
          console.error('Authentication failed:', err);
          
          setAuthState(prev => ({ 
            ...prev, 
            isLoading: false
          }));
          
          resolve(false);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password required challenge
          console.log('New password required');
          
          // For this demo, we'll just fail the login and inform the user
          setAuthState(prev => ({ 
            ...prev, 
            isLoading: false
          }));
          
          resolve(false);
        }
      });
    });
  };

  const logout = () => {
    const currentUser = userPool.getCurrentUser();
    
    if (currentUser) {
      currentUser.signOut();
    }
    
    setAuthState({
      isAuthenticated: false,
      userEmail: '',
      isLoading: false,
      token: null
    });
  };

  return {
    ...authState,
    login,
    logout
  };
};

export default useAuth;