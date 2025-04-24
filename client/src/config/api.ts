export const apiConfig = {
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  endpoints: {
    login: '/api/login',
    logout: '/api/logout',
    verify: '/api/verify',
    challenge: '/api/challenge'
  }
};