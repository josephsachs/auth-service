import { 
  CognitoIdentityProviderClient,
  AdminRespondToAuthChallengeCommand,
  AdminRespondToAuthChallengeCommandInput,
  ChallengeNameType
} from "@aws-sdk/client-cognito-identity-provider";
import { 
  AuthResult, 
  ChallengeResponse, 
  NewPasswordChallengeParams
} from './types';
import { authService } from './authService';

// Initialize client
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

/**
 * Handle the NEW_PASSWORD_REQUIRED challenge
 */
async function handleNewPasswordChallenge(params: NewPasswordChallengeParams): Promise<ChallengeResponse> {
  try {
    const { username, session, newPassword } = params;
    
    const clientId = process.env.COGNITO_CLIENT_ID;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    
    if (!clientId || !userPoolId) {
      throw new Error("Missing Cognito configuration");
    }
    
    const clientSecret = await authService.getClientSecret();
    const secretHash = authService.calculateSecretHash(username, clientId, clientSecret);
    
    const challengeParams: AdminRespondToAuthChallengeCommandInput = {
      UserPoolId: userPoolId,
      ClientId: clientId,
      ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: newPassword,
        SECRET_HASH: secretHash
      },
      Session: session
    };
    
    const command = new AdminRespondToAuthChallengeCommand(challengeParams);
    const response = await cognitoClient.send(command);
    
    if (!response.AuthenticationResult) {
      return {
        success: false,
        error: "Challenge response failed"
      };
    }
    
    const authResult: AuthResult = {
      userId: username,
      accessToken: response.AuthenticationResult.AccessToken,
      idToken: response.AuthenticationResult.IdToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      expiresIn: response.AuthenticationResult.ExpiresIn || 3600
    };
    
    return {
      success: true,
      authResult
    };
  } catch (error) {
    console.error("New password challenge error:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Generic function to handle any authentication challenge
 */
async function respondToChallenge(
  challengeName: string, 
  params: Record<string, any>
): Promise<ChallengeResponse> {
  // Map to appropriate challenge handler
  switch (challengeName) {
    case 'NEW_PASSWORD_REQUIRED':
      return handleNewPasswordChallenge(params as NewPasswordChallengeParams);
    
    // Add more challenge handlers as needed
    // case 'SMS_MFA':
    //   return handleSmsMfaChallenge(params);
    
    default:
      return {
        success: false,
        error: `Unsupported challenge type: ${challengeName}`
      };
  }
}

/**
 * Create a session from a successful challenge response
 */
function createSessionFromChallenge(
  username: string, 
  authResult: AuthResult
) {
  return authService.createSession({
    userId: username,
    email: username, // Using username as email placeholder
    tokens: {
      accessToken: authResult.accessToken || '',
      idToken: authResult.idToken || '',
      refreshToken: authResult.refreshToken || ''
    },
    expiresIn: authResult.expiresIn || 3600
  });
}

export const challengeService = {
  respondToChallenge,
  handleNewPasswordChallenge,
  createSessionFromChallenge
};