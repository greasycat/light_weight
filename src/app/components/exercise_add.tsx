import React, { useState } from 'react';
import { Exercise, ExerciseDB } from '../lib/indexdb_handler';

interface AddExerciseButtonProps {
  onExerciseAdded?: (exercise: Exercise) => void;
}

interface FormData {
  name: string;
  type: 'strength' | 'cardio' | 'core';
  sets?: number;
  reps?: number;
  minutes?: number;
  seconds?: number;
  instruction: string;
}

const AddExerciseButton: React.FC<AddExerciseButtonProps> = ({ onExerciseAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'strength',
    sets: 3,
    reps: 10,
    instruction: ''
  });
  const [error, setError] = useState<string | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      // Reset count-related fields when type changes
      const newFormData: FormData = {
        ...formData,
        type: value as 'strength' | 'cardio' | 'core'
      };

      // Set default values based on type
      if (value === 'strength') {
        newFormData.sets = 3;
        newFormData.reps = 10;
        delete newFormData.minutes;
        delete newFormData.seconds;
      } else if (value === 'cardio') {
        newFormData.minutes = 1;
        newFormData.seconds = 0;
        delete newFormData.sets;
        delete newFormData.reps;
      } else if (value === 'core') {
        newFormData.seconds = 30;
        delete newFormData.sets;
        delete newFormData.reps;
        delete newFormData.minutes;
      }

      setFormData(newFormData);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'sets' || name === 'reps' || name === 'minutes' || name === 'seconds' 
          ? parseInt(value) || 0 
          : value
      }));
    }
  };

  const formatDefaultCount = (): string => {
    switch (formData.type) {
      case 'strength':
        return `${formData.sets}s${formData.reps}r`;
      case 'cardio':
        const totalSeconds = (formData.minutes || 0) * 60 + (formData.seconds || 0);
        return totalSeconds.toString();
      case 'core':
        return `${formData.seconds}s`;
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form data
    if (!formData.name.trim()) {
      setError('Exercise name is required');
      return;
    }


    // Validate count fields based on type
    if (formData.type === 'strength') {
      if (!formData.sets || !formData.reps || formData.sets < 1 || formData.reps < 1) {
        setError('Sets and reps must be positive numbers');
        return;
      }
    } else if (formData.type === 'cardio') {
      if ((!formData.minutes && !formData.seconds) || 
          ((formData.minutes || 0) === 0 && (formData.seconds || 0) === 0)) {
        setError('Duration must be greater than 0');
        return;
      }
    } else if (formData.type === 'core') {
      if (!formData.seconds || formData.seconds < 1) {
        setError('Seconds must be a positive number');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      
      const newExercise: Exercise = {
        name: formData.name,
        type: formData.type,
        defaultCount: formatDefaultCount(),
        instruction: formData.instruction
      };
      
      await ExerciseDB.addExercise(newExercise);
      
      // Reset form and close modal
      setFormData({
        name: '',
        type: 'strength',
        sets: 3,
        reps: 10,
        instruction: ''
      });
      
      // Notify parent component
      if (onExerciseAdded) {
        onExerciseAdded(newExercise);
      }
      
      closeModal();
    } catch (err) {
      console.error('Failed to add exercise:', err);
      setError('Failed to add exercise. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCountInputs = () => {
    switch (formData.type) {
      case 'strength':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sets" className="block text-sm font-medium text-gray-700 mb-1">
                Sets
              </label>
              <input
                type="number"
                id="sets"
                name="sets"
                value={formData.sets}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="reps" className="block text-sm font-medium text-gray-700 mb-1">
                Reps
              </label>
              <input
                type="number"
                id="reps"
                name="reps"
                value={formData.reps}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        );
      case 'cardio':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="minutes" className="block text-sm font-medium text-gray-700 mb-1">
                Minutes
              </label>
              <input
                type="number"
                id="minutes"
                name="minutes"
                value={formData.minutes}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="seconds" className="block text-sm font-medium text-gray-700 mb-1">
                Seconds
              </label>
              <input
                type="number"
                id="seconds"
                name="seconds"
                value={formData.seconds}
                onChange={handleInputChange}
                min="0"
                max="59"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        );
      case 'core':
        return (
          <div>
            <label htmlFor="seconds" className="block text-sm font-medium text-gray-700 mb-1">
              Seconds
            </label>
            <input
              type="number"
              id="seconds"
              name="seconds"
              value={formData.seconds}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        );
    }
  };

  return (
    <>
      {/* Add Button */}
      <button 
        onClick={openModal}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Exercise
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-200/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-lg bg-white shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add New Exercise</h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Push-ups"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="core">Core</option>
                </select>
              </div>
              
              <div className="mb-4">
                {renderCountInputs()}
              </div>
              
              <div className="mb-6">
                <label htmlFor="instruction" className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  id="instruction"
                  name="instruction"
                  value={formData.instruction}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Keep your back straight and lower your chest to the ground"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Add Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddExerciseButton;