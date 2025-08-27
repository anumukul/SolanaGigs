import React, { useState, useEffect } from 'react';
import { TaskService } from '../lib/supabase';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { useWeb3Auth } from '@web3auth/modal/react';
import { 
  Upload, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  Tag,
  Mail,
  Loader
} from 'lucide-react';

const TASK_CATEGORIES = [
  'Development',
  'Design',
  'Writing',
  'Marketing',
  'Data Entry',
  'Translation',
  'Consulting',
  'Physical Tasks',
  'Other'
];

interface TaskFormProps {
  onTaskCreated?: (taskId: string) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const { user } = useWeb3Auth();
  const { publicKey } = useSolanaWallet();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    category: '',
    location: '',
    deadline: '',
    contact_info: '',
  });

  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.reward || parseFloat(formData.reward) <= 0) {
      newErrors.reward = 'Reward must be greater than 0';
    }
    if (!formData.category) newErrors.category = 'Category is required';
    if (!publicKey) newErrors.general = 'Wallet must be connected';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let imageUrl = '';
      
      // Upload image if selected
      if (selectedImage) {
        imageUrl = await TaskService.uploadImage(selectedImage);
      }

      // Create task
      const task = await TaskService.createTask({
        title: formData.title,
        description: formData.description,
        reward: parseFloat(formData.reward),
        category: formData.category,
        location: formData.location || undefined,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
        deadline: formData.deadline || undefined,
        contact_info: formData.contact_info || undefined,
        image_url: imageUrl || undefined,
        poster_wallet: publicKey!.toBase58(),
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
      setSelectedImage(null);
      setImagePreview('');
      
      onTaskCreated?.(task.id);

    } catch (error) {
      console.error('Error creating task:', error);
      setErrors({ general: 'Failed to create task. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Post a New Task</h2>
        <p className="text-gray-600">
          Create a task and get help from skilled professionals in the community.
        </p>
      </div>

      {errors.general && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Fix responsive design bug on mobile"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Provide detailed information about what needs to be done..."
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Reward and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-2">
              Reward (SOL) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="number"
                id="reward"
                name="reward"
                step="0.001"
                min="0"
                value={formData.reward}
                onChange={handleInputChange}
                placeholder="0.1"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.reward ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.reward && <p className="mt-1 text-sm text-red-600">{errors.reward}</p>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {TASK_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location (Optional)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, State or 'Remote'"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Deadline and Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
              Deadline (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Info (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="contact_info"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleInputChange}
                placeholder="Email, Discord, etc."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Image (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {imagePreview ? (
              <div className="text-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto h-32 w-32 object-cover rounded-lg mb-4"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <label htmlFor="image" className="cursor-pointer">
                  <span className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Upload an image
                  </span>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Creating Task...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>Create Task</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};