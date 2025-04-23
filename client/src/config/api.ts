// API configuration
export const apiConfig = {
  // Use environment variable if available, otherwise use localhost:3001 for development
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  endpoints: {
    login: '/api/login',
    logout: '/api/logout',
    verify: '/api/verify',
  }
};

// For debugging in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', apiConfig);
}