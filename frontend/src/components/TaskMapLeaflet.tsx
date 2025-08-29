import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Task } from '../lib/supabase';
import { createTaskMarker } from './TaskMarkers';
import { MapPin, DollarSign, Clock, User } from 'lucide-react';
import '../utils/leafletFix'; 
import 'leaflet/dist/leaflet.css';

interface TaskMapProps {
  tasks: Task[];
  onTaskSelect?: (task: Task) => void;
  onAcceptTask?: (taskId: string) => void;
  userWallet?: string;
}

function MapEvents() {
  const map = useMap();

  useEffect(() => {
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.setView([position.coords.latitude, position.coords.longitude], 13);
        },
        () => {
         
          map.setView([40.7128, -74.0060], 10);
        }
      );
    }
  }, [map]);

  return null;
}

export const TaskMapLeaflet: React.FC<TaskMapProps> = ({
  tasks,
  onTaskSelect,
  onAcceptTask,
  userWallet
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  
  const tasksWithCoordinates = tasks.filter(task => 
    task.latitude !== null && task.longitude !== null
  );

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

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[40.7128, -74.0060]} 
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapEvents />

       
        {tasksWithCoordinates.map((task) => (
          <Marker
            key={task.id}
            position={[task.latitude!, task.longitude!]}
            icon={createTaskMarker(task.status)}
            eventHandlers={{
              click: () => handleMarkerClick(task),
            }}
          >
            <Popup className="custom-popup" closeButton={true}>
              <div className="p-4 max-w-sm">
                
                {task.image_url && (
                  <img
                    src={task.image_url}
                    alt={task.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}

               
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                    {task.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-blue-600">
                      {task.reward} SOL
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                      ${task.status === 'open' ? 'bg-green-100 text-green-800' : 
                        task.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

               
                <div className="text-sm text-gray-600 mb-3 space-y-1">
                  <p className="line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center space-x-3 text-xs">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDate(task.created_at)}</span>
                    </div>
                    
                    {task.location && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">{task.location}</span>
                      </div>
                    )}
                  </div>

                  {task.worker_wallet && (
                    <div className="flex items-center text-xs bg-gray-50 rounded p-2 mt-2">
                      <User className="w-3 h-3 mr-1" />
                      <span>Worker: {task.worker_wallet.slice(0, 8)}...</span>
                    </div>
                  )}
                </div>

               
                <div className="space-y-2">
                  {canAcceptTask(task) && (
                    <button
                      onClick={() => handleAcceptClick(task.id)}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Accept Task
                    </button>
                  )}
                  
                  <button
                    onClick={() => onTaskSelect?.(task)}
                    className="w-full border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

     
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