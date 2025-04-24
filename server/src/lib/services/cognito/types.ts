// AWS SDK types
import { 
  ChallengeNameType 
} from "@aws-sdk/client-cognito-identity-provider";

// Basic authentication result
export interface AuthResult {
  userId: string;
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Challenge result from Cognito
export interface ChallengeResult {
  challengeName: ChallengeNameType;
  session: string;
  challengeParams: Record<string, string>;
  userId: string;
}

// Type guard for challenge result
export function isChallengeResult(result: AuthResult | ChallengeResult): result is ChallengeResult {
  return 'challengeName' in result && 'session' in result;
}

// NEW_PASSWORD_REQUIRED challenge parameters
export interface NewPasswordChallengeParams {
  username: string;
  session: string;
  newPassword: string;
}

// Response to any challenge
export interface ChallengeResponse {
  success: boolean;
  authResult?: AuthResult;
  error?: string;
}

// Session creation parameters
export interface SessionParams {
  userId: string;
  email: string;
  tokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  };
  expiresIn: number;
}

// Mapping of internal challenge names to AWS SDK challenge names
export const ChallengeTypeMap: Record<string, ChallengeNameType> = {
  NEW_PASSWORD_REQUIRED: ChallengeNameType.NEW_PASSWORD_REQUIRED,
  SMS_MFA: ChallengeNameType.SMS_MFA,
  SOFTWARE_TOKEN_MFA: ChallengeNameType.SOFTWARE_TOKEN_MFA,
  MFA_SETUP: ChallengeNameType.MFA_SETUP
};