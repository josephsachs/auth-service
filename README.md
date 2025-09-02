# AuthService

## Secure authentication with AWS

### Author's Note
This is a demo project which uses React, Node.js/Express and Amazon Web Services. I wanted to create a microservice representing a vertical slice of a feature, with a complete infrastructure.

The React client is served from a static webhost, the Node.js API from an EC2 instance. Both are secured using CloudFront.

### Areas for improvement
For convenience's sake, the API utilizes SQLite database for session storage; a more sophisticated approach might use memory-based storage or RDS. The React client can stand to be organized better. It has many long functions and mixed abstraction. Further features expected in a production system include refresh flow, roles and permissions, deployment pipeline, a more scalable data store, and logging and alerting.

### Infrastructure 
CloudFormation at [www.github.com/josephsachs/aws-infra](https://github.com/josephsachs/aws-infra).

### Local development
1. Clone down the repo and `npm install` for both `server` and `client`
2. Create the AWS Cognito resources, including the local developer IAM roles
3. On your local host, use your preferred means to provide AWS credentials to the SDK
4. For `server`, plug the expected Cognito user pool and client values into `.env`
5. then `npm run clean && npm run build && npm run start`
6. For `client`, update the baseUrl `/config/api.ts` to `http://localhost:3001`
7. then `npm run start`
8. Application should be available at `http://localhost:3000`

### Deployment
To do

