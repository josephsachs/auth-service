// src/services/cognito/passwordResetService.ts
import { 
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { authService } from './authService';

// Initialize client
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

/**
 * Initiate password reset by sending a verification code to the user's email
 */
async function initiatePasswordReset(username: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const clientId = process.env.COGNITO_CLIENT_ID;
    
    if (!clientId) {
      throw new Error("Missing Cognito configuration");
    }
    
    const clientSecret = await authService.getClientSecret();
    const secretHash = authService.calculateSecretHash(username, clientId, clientSecret);
    
    const command = new ForgotPasswordCommand({
      ClientId: clientId,
      Username: username,
      SecretHash: secretHash
    });
    
    await cognitoClient.send(command);
    
    return {
      success: true,
      message: "Password reset code has been sent to your email"
    };
  } catch (error: any) {
    console.error("Password reset initiation error:", error);
    
    // Handle different error types
    const errorName = error.name || (error.__type ? error.__type.split('#').pop() : '');
    
    if (errorName === 'UserNotFoundException') {
      // For security reasons, still indicate success even if user not found
      return {
        success: true,
        message: "If the account exists, a password reset code has been sent"
      };
    }
    
    if (errorName === 'LimitExceededException') {
      return {
        success: false,
        error: "Too many requests. Please try again later."
      };
    }
    
    // Generic error
    return {
      success: false,
      error: "Failed to initiate password reset. Please try again."
    };
  }
}

/**
 * Confirm password reset with verification code and new password
 */
async function confirmPasswordReset(
  username: string, 
  confirmationCode: string, 
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const clientId = process.env.COGNITO_CLIENT_ID;
    
    if (!clientId) {
      throw new Error("Missing Cognito configuration");
    }
    
    const clientSecret = await authService.getClientSecret();
    const secretHash = authService.calculateSecretHash(username, clientId, clientSecret);
    
    const command = new ConfirmForgotPasswordCommand({
      ClientId: clientId,
      Username: username,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
      SecretHash: secretHash
    });
    
    await cognitoClient.send(command);
    
    return {
      success: true,
      message: "Password has been reset successfully"
    };
  } catch (error: any) {
    console.error("Password reset confirmation error:", error);
    
    // Handle different error types
    const errorName = error.name || (error.__type ? error.__type.split('#').pop() : '');
    
    if (errorName === 'CodeMismatchException') {
      return {
        success: false,
        error: "Invalid verification code. Please try again."
      };
    }
    
    if (errorName === 'ExpiredCodeException') {
      return {
        success: false,
        error: "Verification code has expired. Please request a new code."
      };
    }
    
    if (errorName === 'InvalidPasswordException') {
      return {
        success: false,
        error: "Password does not meet requirements. Please choose a stronger password."
      };
    }
    
    // Generic error
    return {
      success: false,
      error: "Failed to reset password. Please try again."
    };
  }
}

export const passwordResetService = {
  initiatePasswordReset,
  confirmPasswordReset
};