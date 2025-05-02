import { 
  CognitoIdentityProviderClient, 
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AuthenticationResultType,
  ChallengeNameType,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import crypto from 'crypto';
import { AuthResult, ChallengeResult, SessionParams } from './types';
import { createUserSession } from '@/services/session/sessionFunctions';

import { defaultProvider } from "@aws-sdk/credential-provider-node";

const secretsClient = new SecretsManagerClient({ 
  region: process.env.AWS_REGION,
  credentials: defaultProvider()
});

const cognitoClient = new CognitoIdentityProviderClient({ 
  region: process.env.AWS_REGION,
  credentials: defaultProvider()
});

async function getClientSecret(): Promise<string> {
  const secretName = process.env.COGNITO_CLIENT_SECRET_NAME;
  if (!secretName) {
    throw new Error("Missing COGNITO_CLIENT_SECRET_NAME environment variable");
  }
  
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await secretsClient.send(command);
  
  if (!response.SecretString) {
    throw new Error("Failed to retrieve client secret");
  }
  
  try {
    const secretData = JSON.parse(response.SecretString);

    return secretData.clientSecret;
  } catch {
    throw new Error("Invalid secret format");
  }
}

function calculateSecretHash(username: string, clientId: string, clientSecret: string): string {
  const message = username + clientId;
  const hmac = crypto.createHmac('sha256', clientSecret);
  return hmac.update(message).digest('base64');
}

function createSession(params: SessionParams) {
  return createUserSession(
    params.userId,
    params.email,
    params.tokens,
    params.expiresIn
  );
}

function mapAuthResult(userId: string, authResult: AuthenticationResultType): AuthResult {
  return {
    userId,
    accessToken: authResult.AccessToken,
    idToken: authResult.IdToken,
    refreshToken: authResult.RefreshToken,
    expiresIn: authResult.ExpiresIn || 3600
  };
}

function mapChallengeResult(
  userId: string, 
  challengeName: ChallengeNameType, 
  session: string, 
  params: Record<string, string>
): ChallengeResult {
  return {
    challengeName,
    session,
    challengeParams: params,
    userId
  };
}

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
    console.error("Error:", error);
    throw error;
  }
}

async function registerUser(username: string, password: string, email: string): Promise<{ userSub: string }> {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  
  if (!clientId || !userPoolId) {
    throw new Error("Missing Cognito configuration");
  }
  
  try {
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: username,
      MessageAction: "SUPPRESS",
      TemporaryPassword: crypto.randomBytes(16).toString('hex'),
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        },
        {
          Name: 'email_verified',
          Value: 'true'
        }
      ]
    });
    
    const createUserResponse = await cognitoClient.send(createUserCommand);
    
    if (!createUserResponse.User || !createUserResponse.User.Username) {
      throw new Error("Failed to create user");
    }
    
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: username,
      Password: password,
      Permanent: true
    });
    
    await cognitoClient.send(setPasswordCommand);
    
    return {
      userSub: createUserResponse.User.Username
    };
  } catch (error) {
    // Preserve the original error type and message
    console.error("Registration error:", error);
    
    // Make sure the error maintains its type for proper handling up the chain
    if ((error as any).name) {
      const cognitoError = new Error((error as Error).message);
      (cognitoError as any).name = (error as any).name;
      throw cognitoError;
    }
    
    throw error;
  }
}

async function logoutUser(username: string): Promise<boolean> {
  console.log(`Logging out user: ${username}`);
  return true;
}

export const authService = {
  authenticateUser,
  registerUser,
  logoutUser,
  getClientSecret,
  calculateSecretHash,
  createSession
};