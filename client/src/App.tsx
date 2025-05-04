import React from 'react';
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-200">
        <Header />
        <main className="container px-4 py-8 mx-auto">
          <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">About This Demo</h2>
            <p className="mb-4">
              This application demonstrates a secure authentication flow using AWS Cognito
            </p>
            <p>
              Source code <a className="text-gray-700 transition border-b border-gray-300 hover:border-gray-700" href="https://github.com/josephsachs/auth-service" target="_blank" rel="noopener noreferrer">here</a>. Infrastructure <a className="text-gray-700 transition border-b border-gray-300 hover:border-gray-700" href="https://github.com/josephsachs/aws-infra" target="_blank" rel="noopener noreferrer">here</a>.
            </p>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;