# AuthService

## Secure authentication with AWS

### Author's Note
This is a demo project which uses React, Node.js/Express and Amazon Web Services. I wanted to create a microservice representing a vertical slice of a feature, with a complete infrastructure.

The React client is served from a static webhost, the Node.js API from an EC2 instance. Both are secured using CloudFront. For convenience, the API utilizes SQLite database for session storage; a more sophisticated approach might use in-memory storage or RDS. 

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

### Future development
There are some obvious avenues for improvement from here.
1. Refresh flow
2. Roles and permissions
3. Deployment pipeline
4. Upgrade to a more scalable data store
5. Integrate logging and alerting with AWS
