// Cognito configuration
export const cognitoConfig = {
  region: 'us-east-2', // The AWS region where your Cognito User Pool is deployed
  userPoolId: 'us-east-2_uZZ6syK5O', // Your User Pool ID
  userPoolWebClientId: 'j0u5epojj5e6dbop4758nn0hn', // Your Client ID
  oauth: {
    domain: 'wilderness-auth.auth.us-east-2.amazoncognito.com',
    redirectSignIn: 'http://localhost:3000/callback',
    redirectSignOut: 'http://localhost:3000',
    responseType: 'code' // 'code' for Authorization Code Grant, 'token' for Implicit Grant
  }
};