import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import { Task } from '../lib/supabase';
import { MapPin, DollarSign, Clock, User } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface TaskMapProps {
  tasks: Task[];
  onTaskSelect?: (task: Task) => void;
  onAcceptTask?: (taskId: string) => void;
  userWallet?: string;
}

export const TaskMap: React.FC<TaskMapProps> = ({
  tasks,
  onTaskSelect,
  onAcceptTask,
  userWallet
}) => {
  const mapRef = useRef<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 12
  });

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewState(prev => ({
            ...prev,
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            zoom: 13
          }));
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Filter tasks that have coordinates
  const tasksWithCoordinates = tasks.filter(task => 
    task.latitude !== null && task.longitude !== null
  );

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'open': return '#10B981'; // green
      case 'accepted': return '#3B82F6'; // blue
      case 'funded': return '#8B5CF6'; // purple
      case 'submitted': return '#F59E0B'; // yellow
      case 'approved': return '#6366F1'; // indigo
      case 'paid': return '#6B7280'; // gray
      default: return '#6B7280';
    }
  };

  const handleMarkerClick = (task: Task) => {
    setSelectedTask(task);
    onTaskSelect?.(task);
  };

  const handleAcceptClick = (taskId: string) => {
    onAcceptTask?.(taskId);
    setSelectedTask(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const canAcceptTask = (task: Task) => {
    return task.status === 'open' && task.poster_wallet !== userWallet;
  };

  if (!mapboxToken) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Map unavailable - Mapbox token required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        className="w-full h-full"
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {/* Task Markers */}
        {tasksWithCoordinates.map((task) => (
          <Marker
            key={task.id}
            longitude={task.longitude!}
            latitude={task.latitude!}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(task);
            }}
          >
            <div className="relative cursor-pointer">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: getMarkerColor(task.status) }}
              >
                <MapPin className="w-4 h-4 text-white" />
              </div>
              {/* Status badge */}
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full border border-white"
                   style={{ backgroundColor: getMarkerColor(task.status) }}>
              </div>
            </div>
          </Marker>
        ))}

        {/* Task Popup */}
        {selectedTask && (
          <Popup
            longitude={selectedTask.longitude!}
            latitude={selectedTask.latitude!}
            anchor="bottom"
            onClose={() => setSelectedTask(null)}
            closeButton={true}
            closeOnClick={false}
            className="task-popup"
          >
            <div className="p-4 max-w-sm">
              {/* Task Image */}
              {selectedTask.image_url && (
                <img
                  src={selectedTask.image_url}
                  alt={selectedTask.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}

              {/* Task Header */}
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                  {selectedTask.title}
                </h3>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-primary-600">
                    {selectedTask.reward} SOL
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                    ${selectedTask.status === 'open' ? 'bg-green-100 text-green-800' : 
                      selectedTask.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {selectedTask.status}
                  </span>
                </div>
              </div>

              {/* Task Details */}
              <div className="text-sm text-gray-600 mb-3 space-y-1">
                <p className="line-clamp-2">{selectedTask.description}</p>
                
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{formatDate(selectedTask.created_at)}</span>
                  </div>
                  
                  {selectedTask.location && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{selectedTask.location}</span>
                    </div>
                  )}
                </div>

                {selectedTask.worker_wallet && (
                  <div className="flex items-center text-xs bg-gray-50 rounded p-2 mt-2">
                    <User className="w-3 h-3 mr-1" />
                    <span>Worker: {selectedTask.worker_wallet.slice(0, 8)}...</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {canAcceptTask(selectedTask) && (
                  <button
                    onClick={() => handleAcceptClick(selectedTask.id)}
                    className="w-full bg-primary-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Accept Task
                  </button>
                )}
                
                <button
                  onClick={() => onTaskSelect?.(selectedTask)}
                  className="w-full border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Task Status</h4>
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Open</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};