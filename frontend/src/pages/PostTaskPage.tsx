import React from 'react';
import { TaskForm } from '../components/TaskForm';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { Plus, Wallet } from 'lucide-react';

export const PostTaskPage: React.FC = () => {
  const { isConnected } = useSolanaWallet();

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to post tasks and manage payments securely.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Plus className="w-8 h-8 mr-3 text-primary-600" />
          Post a New Task
        </h1>
        <p className="text-gray-600">
          Create a task and get help from skilled professionals in the community.
        </p>
      </div>

      <TaskForm />
    </div>
  );
};