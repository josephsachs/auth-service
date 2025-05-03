// src/services/cognito/errorHandling.ts
export interface ErrorResponse {
  success: boolean;
  error: string;
  statusCode: number;
}

/**
 * Extract the error name from AWS Cognito error format
 */
export function extractCognitoErrorName(error: any): string {
  return error.name || (error.__type ? error.__type.split('#').pop() : '');
}

/**
 * Map Cognito errors to user-friendly messages for authentication
 */
export function getAuthErrorMessage(errorName: string): string {
  switch (errorName) {
    case 'NotAuthorizedException':
      return 'Incorrect username or password. Please try again.';
      
    case 'UserNotFoundException':
      // For security, don't reveal that the user doesn't exist
      return 'Incorrect username or password. Please try again.';
      
    case 'UserNotConfirmedException':
      return 'Account not verified. Please check your email for verification instructions.';
      
    case 'PasswordResetRequiredException':
      return 'Password reset required. Please use the "Forgot password?" option.';
      
    case 'TooManyRequestsException':
      return 'Too many attempts. Please try again later.';
      
    case 'InvalidParameterException':
      return 'Invalid login parameters. Please check your input and try again.';
      
    case 'InvalidPasswordException':
      return 'Password does not meet requirements. Please use a password with at least 20 characters, including uppercase and lowercase letters.';
      
    case 'UsernameExistsException':
      return 'An account with this email already exists.';
      
    default:
      return 'Authentication failed. Please try again or contact support.';
  }
}

/**
 * Get appropriate HTTP status code for Cognito errors
 */
export function getErrorStatusCode(errorName: string): number {
  switch (errorName) {
    case 'NotAuthorizedException':
    case 'UserNotFoundException':
    case 'UserNotConfirmedException':
    case 'PasswordResetRequiredException':
      return 401; // Unauthorized
      
    case 'TooManyRequestsException':
      return 429; // Too Many Requests
      
    case 'InvalidParameterException':
    case 'InvalidPasswordException':
      return 400; // Bad Request
      
    case 'UsernameExistsException':
      return 409; // Conflict
      
    default:
      return 500; // Internal Server Error
  }
}