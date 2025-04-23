import { 
  CognitoIdentityProviderClient, 
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput
} from "@aws-sdk/client-cognito-identity-provider";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import crypto from 'crypto';

const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

async function getClientSecret() {
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

function calculateSecretHash(username: string, clientId: string, clientSecret: string) {
  const message = username + clientId;
  const hmac = crypto.createHmac('sha256', clientSecret);
  return hmac.update(message).digest('base64');
}

export async function authenticateUser(username: string, password: string) {
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
    
    if (!response.AuthenticationResult) {
      throw new Error("Authentication failed");
    }
    
    return {
      userId: username,
      accessToken: response.AuthenticationResult.AccessToken,
      idToken: response.AuthenticationResult.IdToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      expiresIn: response.AuthenticationResult.ExpiresIn || 3600
    };
  } catch (error) {
    console.error("Cognito authentication error:", error);
    throw error;
  }
}