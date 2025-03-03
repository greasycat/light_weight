import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseDB } from '../lib/indexdb_handler';

interface EditExerciseProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
  onExerciseUpdated?: (exercise: Exercise) => void;
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

const EditExercise: React.FC<EditExerciseProps> = ({ 
  exercise, 
  isOpen, 
  onClose,
  onExerciseUpdated 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(() => {
    // Initialize form data based on exercise type and defaultCount
    const baseData = {
      name: exercise.name,
      type: exercise.type,
      instruction: exercise.instruction
    };

    // Parse defaultCount based on type
    if (exercise.type === 'strength') {
      const match = exercise.defaultCount.match(/(\d+)s(\d+)r/);
      if (match) {
        const [, sets, reps] = match;
        return {
          ...baseData,
          sets: parseInt(sets),
          reps: parseInt(reps)
        };
      }
    } else if (exercise.type === 'cardio' || exercise.type === 'core') {
      const seconds = parseInt(exercise.defaultCount);
      if (!isNaN(seconds)) {
        return {
          ...baseData,
          minutes: Math.floor(seconds / 60),
          seconds: seconds % 60
        };
      }
    }

    return baseData;
  });

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
        return `${formData.seconds}`;
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

    if (!formData.instruction.trim()) {
      setError('Instructions are required');
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
      
      const updatedExercise: Exercise = {
        name: formData.name,
        type: formData.type,
        defaultCount: formatDefaultCount(),
        instruction: formData.instruction
      };
      
      await ExerciseDB.updateExercise(exercise.name, updatedExercise);
      
      if (onExerciseUpdated) {
        onExerciseUpdated(updatedExercise);
      }
      
      onClose();
    } catch (err) {
      console.error('Failed to update exercise:', err);
      if (err instanceof DOMException) {
        setError('Exercise name already exists');
      } else {
        setError('Failed to update exercise. Please try again.');
      }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-200/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="rounded-lg bg-white shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Edit Exercise</h3>
          <button 
            onClick={onClose}
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
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
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
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExercise; 