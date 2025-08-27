import React from 'react';
import { Task } from '../lib/supabase';
import { 
  MapPin, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Tag
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onAccept?: (taskId: string) => void;
  onView?: (taskId: string) => void;
  showActions?: boolean;
  isWorker?: boolean;
  isPoster?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onAccept,
  onView,
  showActions = true,
  isWorker = false,
  isPoster = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'funded': return 'bg-purple-100 text-purple-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-indigo-100 text-indigo-800';
      case 'paid': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'accepted': return <User className="w-4 h-4" />;
      case 'funded': return <DollarSign className="w-4 h-4" />;
      case 'submitted': return <CheckCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canAcceptTask = () => {
    return task.status === 'open' && !isPoster && showActions;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Task Image */}
      {task.image_url && (
        <div className="aspect-video w-full rounded-t-xl overflow-hidden">
          <img
            src={task.image_url}
            alt={task.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {task.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                <span className="capitalize">{task.status}</span>
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span>{task.category}</span>
              </span>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-primary-600">
              {task.reward} SOL
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {task.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {task.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{task.location}</span>
            </div>
          )}
          
          {task.deadline && (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Due: {formatDate(task.deadline)}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            <span>Posted {formatDate(task.created_at)}</span>
          </div>
        </div>

        {/* Worker Info */}
        {task.worker_wallet && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span>Worker: {task.worker_wallet.slice(0, 8)}...{task.worker_wallet.slice(-8)}</span>
            </div>
          </div>
        )}

        {/* Submission Info */}
        {task.status === 'submitted' && task.submission_url && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="text-sm font-medium text-blue-900 mb-1">Work Submitted</div>
            <a
              href={task.submission_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
            >
              {task.submission_url}
            </a>
            {task.submission_notes && (
              <p className="text-sm text-gray-600 mt-2">{task.submission_notes}</p>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
            {canAcceptTask() && (
              <button
                onClick={() => onAccept?.(task.id)}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Accept Task
              </button>
            )}
            
            <button
              onClick={() => onView?.(task.id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              View Details
            </button>
          </div>
        )}

        {/* Task-specific actions for poster/worker */}
        {isPoster && task.status === 'submitted' && (
          <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
            <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Approve Work
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Request Changes
            </button>
          </div>
        )}

        {isWorker && task.status === 'accepted' && (
          <div className="pt-4 border-t border-gray-100">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Submit Work
            </button>
          </div>
        )}
      </div>
    </div>
  );
};