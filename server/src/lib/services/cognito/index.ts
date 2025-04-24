// Main export file for Cognito service

import { authService } from './authService';
import { challengeService } from './challengeService';

// Export all services as a single module
export const cognitoService = {
  ...authService,
  ...challengeService
};

// Also export individual services for more granular imports
export { authService, challengeService };

// Re-export types for convenience
export * from './types';