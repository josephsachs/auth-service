import { authService } from './authService';
import { challengeService } from './challengeService';

export const cognitoService = {
  ...authService,
  ...challengeService
};

export { authService, challengeService };

export * from './types';