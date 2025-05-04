// client/src/config/api.ts
export const apiConfig = {
  // Change baseUrl to http://localhost:3001 for dev
  baseUrl: 'https://auth.jsachs.studio',
  endpoints: {
    login: '/api/login',
    logout: '/api/logout',
    verify: '/api/verify',
    challenge: '/api/challenge',
    register: '/api/register',
    passwordResetInitiate: '/api/password-reset/initiate',
    passwordResetConfirm: '/api/password-reset/confirm'
  }
};