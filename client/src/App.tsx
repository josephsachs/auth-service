import React from 'react';
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-200">
        <Header />
        <main className="container px-4 py-8 mx-auto">
          <h1 className="mb-6 text-2xl font-bold">Secure Authentication with AWS Cognito</h1>
          
          <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">About This Demo</h2>
            <p className="mb-4">
              This application demonstrates a secure authentication flow using:
            </p>
            <ul className="pl-5 space-y-2 list-disc">
              <li>Express service & React client</li>
              <li>See <code>aws-infra/authservice.yaml</code> for AWS configuration</li>
            </ul>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;