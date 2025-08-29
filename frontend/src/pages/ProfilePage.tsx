import React, { useState, useEffect } from 'react';
import { TaskCard } from '../components/TaskCard';
import { TaskService, Task } from '../lib/supabase';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { User, Wallet, History, Settings } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { publicKey, balance, isConnected } = useSolanaWallet();
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [acceptedTasks, setAcceptedTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'posted' | 'accepted'>('posted');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && publicKey) {
      loadUserTasks();
    }
  }, [isConnected, publicKey]);

  const loadUserTasks = async () => {
    if (!publicKey) return;

    setIsLoading(true);
    try {
      const walletAddress = publicKey.toBase58();
      
      // Get tasks posted by user
      const posted = await TaskService.getTasks({ poster_wallet: walletAddress });
      setPostedTasks(posted);

      // Get tasks accepted by user
      const accepted = await TaskService.getTasks({ worker_wallet: walletAddress });
      setAcceptedTasks(accepted);
    } catch (error) {
      console.error('Error loading user tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Please connect your wallet to view your profile and task history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-600 font-mono text-sm">
              {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {balance?.toFixed(4)} SOL
            </div>
            <p className="text-sm text-gray-500">Available Balance</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">{postedTasks.length}</div>
          <div className="text-sm text-gray-500">Tasks Posted</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">{acceptedTasks.length}</div>
          <div className="text-sm text-gray-500">Tasks Accepted</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {postedTasks.filter(t => t.status === 'paid').length + acceptedTasks.filter(t => t.status === 'paid').length}
          </div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {(postedTasks.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.reward, 0) + 
              acceptedTasks.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.reward, 0)).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">Total SOL Earned</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posted')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'posted'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Posted Tasks ({postedTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'accepted'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Accepted Tasks ({acceptedTasks.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading tasks...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === 'posted' && (
                <>
                  {postedTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No posted tasks</h3>
                      <p className="text-gray-600">You haven't posted any tasks yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {postedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          showActions={false}
                          isPoster={true}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'accepted' && (
                <>
                  {acceptedTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No accepted tasks</h3>
                      <p className="text-gray-600">You haven't accepted any tasks yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {acceptedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          showActions={false}
                          isWorker={true}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};