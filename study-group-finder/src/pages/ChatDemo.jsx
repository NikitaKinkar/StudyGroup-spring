import React, { useState } from 'react';
import ChatWidget from '../components/ChatWidget';

const ChatDemo = () => {
  const [user] = useState({
    email: 'demo@example.com',
    fullName: 'Demo User',
    name: 'Demo User'
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chat Widget Demo</h1>
        <p className="text-gray-600 mb-8">
          This page demonstrates the chat widget functionality. The chat widget appears in the bottom-right corner.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Real-time messaging using WebSockets</li>
            <li>Minimize/maximize functionality</li>
            <li>Unread message count</li>
            <li>Connection status indicator</li>
            <li>Responsive design</li>
          </ul>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Usage</h2>
          <p className="text-gray-700 mb-4">
            To use the ChatWidget in your components:
          </p>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`<ChatWidget 
  groupId={1} 
  userEmail="user@example.com" 
  userName="User Name"
/>`}
          </pre>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget 
        groupId={1} 
        userEmail={user.email} 
        userName={user.fullName}
      />
    </div>
  );
};

export default ChatDemo;
