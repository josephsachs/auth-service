import { 
  CognitoIdentityProviderClient, 
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AuthenticationResultType,
  ChallengeNameType
} from "@aws-sdk/client-cognito-identity-provider";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import crypto from 'crypto';
import { AuthResult, ChallengeResult, SessionParams } from './types';
import { createUserSession } from '@/lib/services/session/sessionFunctions';

const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

/**
 * Get the Cognito client secret from AWS Secrets Manager
 */
async function getClientSecret(): Promise<string> {
  const secretName = process.env.COGNITO_CLIENT_SECRET_NAME;
  if (!secretName) {
    throw new Error("Missing COGNITO_CLIENT_SECRET_NAME environment variable");
  }
  
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await secretsClient.send(command);
  console.log(response);
  if (!response.SecretString) {
    throw new Error("Failed to retrieve client secret");
  }
  
  try {
    const secretData = JSON.parse(response.SecretString);
    return secretData.SecretHash;
  } catch {
    throw new Error("Invalid secret format");
  }
}

/**
 * Calculate the secret hash required for Cognito authentication
 */
function calculateSecretHash(username: string, clientId: string, clientSecret: string): string {
  const message = username + clientId;
  const hmac = crypto.createHmac('sha256', clientSecret);
  return hmac.update(message).digest('base64');
}

/**
 * Create a session from authentication result
 */
function createSession(params: SessionParams) {
  return createUserSession(
    params.userId,
    params.email,
    params.tokens,
    params.expiresIn
  );
}

/**
 * Map authentication result to a standard format
 */
function mapAuthResult(userId: string, authResult: AuthenticationResultType): AuthResult {
  return {
    userId,
    accessToken: authResult.AccessToken,
    idToken: authResult.IdToken,
    refreshToken: authResult.RefreshToken,
    expiresIn: authResult.ExpiresIn || 3600
  };
}

/**
 * Map challenge result to a standard format
 */
function mapChallengeResult(userId: string, challengeName: ChallengeNameType, session: string, params: Record<string, string>): ChallengeResult {
  return {
    challengeName,
    session,
    challengeParams: params,
    userId
  };
}

/**
 * Authenticate a user with Cognito
 */
async function authenticateUser(username: string, password: string): Promise<AuthResult | ChallengeResult> {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  
  if (!clientId || !userPoolId) {
    throw new Error("Missing Cognito configuration");
  }
  
  try {
    const clientSecret = await getClientSecret();
    const secretHash = calculateSecretHash(username, clientId, clientSecret);
    
    const authParams: AdminInitiateAuthCommandInput = {
      UserPoolId: userPoolId,
      ClientId: clientId,
      AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash
      }
    };
    
    const command = new AdminInitiateAuthCommand(authParams);
    const response = await cognitoClient.send(command);
    
    if (response.ChallengeName) {
      console.log(`User challenge required: ${response.ChallengeName}`);
      return mapChallengeResult(
        username, 
        response.ChallengeName, 
        response.Session || '', 
        response.ChallengeParameters || {}
      );
    }
    
    if (!response.AuthenticationResult) {
      throw new Error("Authentication failed");
    }
    
    return mapAuthResult(username, response.AuthenticationResult);
  } catch (error) {
    console.error("Cognito authentication error:", error);
    throw error;
  }
}

/**
 * Log the user out
 */
async function logoutUser(username: string) {
  // Implement Cognito logout if needed
  console.log(`Logging out user: ${username}`);
  return true;
}

export const authService = {
  authenticateUser,
  logoutUser,
  getClientSecret,
  calculateSecretHash,
  createSession
};