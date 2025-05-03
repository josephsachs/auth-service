import { authService } from './authService';
import { challengeService } from './challengeService';
import { passwordResetService } from './passwordResetService';

export const cognitoService = {
  ...authService,
  ...challengeService,
  ...passwordResetService
};

export { authService, challengeService, passwordResetService };

export * from './types';