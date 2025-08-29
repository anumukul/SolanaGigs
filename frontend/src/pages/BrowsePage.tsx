import React, { useState, useEffect } from 'react';
import { TaskCard } from '../components/TaskCard';
import { TaskService, Task } from '../lib/supabase';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { Filter, Search, Grid, Loader } from 'lucide-react';

export const BrowsePage: React.FC = () => {
  const { publicKey } = useSolanaWallet();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchQuery]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError('');
      const allTasks = await TaskService.getTasks();
      setTasks(allTasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = tasks;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(filtered);
  };

  const handleAcceptTask = async (taskId: string) => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await TaskService.acceptTask(taskId, publicKey.toBase58());
      await loadTasks();
      alert('Task accepted successfully!');
    } catch (err) {
      console.error('Error accepting task:', err);
      alert('Failed to accept task. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={loadTasks}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Tasks</h1>
        <p className="text-gray-600">
          Find tasks that match your skills and get paid in SOL
        </p>
      </div>

     
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

     
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search terms' : 'No tasks have been posted yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onAccept={handleAcceptTask}
              showActions={true}
              isPoster={publicKey?.toBase58() === task.poster_wallet}
            />
          ))}
        </div>
      )}
    </div>
  );
};