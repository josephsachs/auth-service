import React from 'react';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">AWS Cognito Authentication Demo</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">About This Demo</h2>
          <p className="mb-4">
            This application demonstrates a secure authentication flow using:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>React client for the frontend</li>
            <li>AWS Cognito for authentication</li>
            <li>Next.js server for token validation and session management</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default App;