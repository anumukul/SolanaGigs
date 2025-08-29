import React, { useState, useEffect } from 'react';
import { TaskMapLeaflet } from '../components/TaskMapLeaflet';
import { TaskCard } from '../components/TaskCard';
import { TaskService, Task } from '../lib/supabase';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { MapPin, Grid, Filter, Search, Loader } from 'lucide-react';

export const MapPage: React.FC = () => {
  const { publicKey } = useSolanaWallet();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'map' | 'split'>('split');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError('');
      
     
      const allTasks = await TaskService.getTasks();
      
     
      const tasksWithLocation = allTasks.filter(task => 
        task.latitude !== null && task.longitude !== null
      );
      
      setTasks(tasksWithLocation);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
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
      setSelectedTask(null);
    } catch (err) {
      console.error('Error accepting task:', err);
      alert('Failed to accept task. Please try again.');
    }
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
  };

  const filteredTasks = tasks.filter(task => {
   
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        (task.location && task.location.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }

   
    if (showOpenOnly && task.status !== 'open') {
      return false;
    }

    return true;
  });

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
     
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <MapPin className="w-8 h-8 mr-3 text-primary-600" />
          Task Map
        </h1>
        <p className="text-gray-600">
          Discover tasks near you or explore opportunities around the world
        </p>
      </div>

    
      <div className="mb-6 space-y-4">
      
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
         
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks by location, title, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

        
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOpenOnly}
                onChange={(e) => setShowOpenOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Open tasks only</span>
            </label>

           
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapPin className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'split'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

       
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{filteredTasks.length} tasks with locations</span>
          <span>{tasks.filter(t => t.status === 'open').length} open tasks</span>
        </div>
      </div>

      
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading task locations...</p>
          </div>
        </div>
      )}

      
      {!isLoading && (
        <>
          {viewMode === 'map' ? (
            
            <div className="h-[600px]">
              <TaskMapLeaflet
                tasks={filteredTasks}
                onTaskSelect={handleTaskSelect}
                onAcceptTask={handleAcceptTask}
                userWallet={publicKey?.toBase58()}
              />
            </div>
          ) : (
           
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
            
              <div className="h-full">
                <TaskMapLeaflet
                  tasks={filteredTasks}
                  onTaskSelect={handleTaskSelect}
                  onAcceptTask={handleAcceptTask}
                  userWallet={publicKey?.toBase58()}
                />
              </div>

             
              <div className="h-full overflow-y-auto">
                {selectedTask ? (
                  <div className="sticky top-0">
                    <TaskCard
                      task={selectedTask}
                      onAccept={handleAcceptTask}
                      showActions={true}
                      isPoster={publicKey?.toBase58() === selectedTask.poster_wallet}
                      isWorker={publicKey?.toBase58() === selectedTask.worker_wallet}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select a task from the map
                      </h3>
                      <p className="text-gray-600">
                        Click on any marker to view task details and accept tasks
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

         
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || !showOpenOnly
                  ? 'Try adjusting your search or filters'
                  : 'No tasks with location data have been posted yet'}
              </p>
              {(searchQuery || !showOpenOnly) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowOpenOnly(true);
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </>
      )}

     
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Map Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Finding Local Tasks</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Green markers = Open tasks</li>
              <li>• Blue markers = In progress</li>
              <li>• Gray markers = Completed</li>
              <li>• Click markers for task details</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Location Benefits</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Find tasks near you</li>
              <li>• Support local businesses</li>
              <li>• Build community connections</li>
              <li>• Reduce travel time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};