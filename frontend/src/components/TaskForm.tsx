import React, { useState, useEffect } from 'react';
import { TaskService } from '../lib/supabase';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { useWeb3Auth } from '@web3auth/modal/react';
import { useNavigate } from 'react-router-dom';

export const TaskForm: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, user } = useWeb3Auth();
  const { accounts, publicKey, balance } = useSolanaWallet();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    category: '',
    location: '',
    deadline: '',
    contact_info: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('=== TASKFORM DEBUG ===');
    console.log('Web3Auth isConnected:', isConnected);
    console.log('Web3Auth user:', user);
    console.log('Solana accounts:', accounts);
    console.log('Solana publicKey:', publicKey);
    console.log('Solana balance:', balance);
    console.log('=====================');
  }, [isConnected, user, accounts, publicKey, balance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check connection using both methods
    if (!isConnected || !accounts || accounts.length === 0) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.title || !formData.description || !formData.reward || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Use accounts[0] as the wallet address
      const walletAddress = accounts[0];

      await TaskService.createTask({
        title: formData.title,
        description: formData.description,
        reward: parseFloat(formData.reward),
        category: formData.category,
        location: formData.location || undefined,
        deadline: formData.deadline || undefined,
        contact_info: formData.contact_info || undefined,
        poster_wallet: walletAddress, // Use accounts[0] instead of publicKey.toBase58()
        poster_email: user?.email,
        status: 'open'
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        reward: '',
        category: '',
        location: '',
        deadline: '',
        contact_info: '',
      });

      alert('Task created successfully!');
      navigate('/browse');

    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Post a New Task</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Build a React component"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe what needs to be done..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Reward and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-2">
              Reward (SOL) *
            </label>
            <input
              type="number"
              id="reward"
              name="reward"
              value={formData.reward}
              onChange={handleChange}
              required
              step="0.001"
              min="0"
              placeholder="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">Select a category</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Writing">Writing</option>
              <option value="Marketing">Marketing</option>
              <option value="Data Entry">Data Entry</option>
              <option value="Translation">Translation</option>
              <option value="Consulting">Consulting</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location (Optional)
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State or 'Remote'"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Deadline and Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
              Deadline (Optional)
            </label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Info (Optional)
            </label>
            <input
              type="text"
              id="contact_info"
              name="contact_info"
              value={formData.contact_info}
              onChange={handleChange}
              placeholder="Email, Discord, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Task...' : 'Create Task'}
        </button>
      </form>
      
      {/* Debug Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs">
        <p>Debug - Form Data: {JSON.stringify(formData)}</p>
        <p>Debug - Web3Auth Connected: {isConnected ? 'Yes' : 'No'}</p>
        <p>Debug - Solana Accounts: {accounts?.length || 0}</p>
        <p>Debug - First Account: {accounts?.[0] || 'None'}</p>
        <p>Debug - PublicKey: {publicKey ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};