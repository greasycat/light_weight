import React, { useState, useEffect, useRef } from 'react';
import { filterExercises, SearchInput } from '../lib/search_utils';
import { renderTypeBadge, renderTypeCount } from '../lib/exercise_utils';
import ExerciseForm from './exercise_form'
import { Exercise, WeightedExercise, TimedExercise, CountedExercise } from '../lib/models/exercise';
import { ExerciseRepository } from '../lib/repositories/interfaces/repository';
import RepositoryFactory from '../lib/repositories/factory';
import LongPressable from './common/long_pressable';

interface ExerciseListProps {
  onSelectExercise?: (exercise: Exercise) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const exerciseRepositoryRef = useRef<ExerciseRepository>(RepositoryFactory.getExerciseRepository('indexdb'));

  const loadExercises = async () => {
    try {
      const data = await exerciseRepositoryRef.current.getAll();
      setExercises(data);
      setFilteredExercises(data);
    } catch (err) {
      setError('Failed to load exercises');
      console.error('Error loading exercises:', err);
    }
  };

  // Load exercises on component mount
  useEffect(() => {
    loadExercises();
  }, []);


  // Filter exercises when search term changes
  useEffect(() => {
    setFilteredExercises(filterExercises(exercises, searchTerm));
  }, [searchTerm, exercises]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Render count based on exercise type

  const handleExerciseComplete = async () => {
    await loadExercises() // Refresh the list
    setShowForm(false)
    setEditingExercise(null)
  }

  const handleExerciseDelete = async () => {
    await loadExercises() // Refresh the list
    setShowForm(false)
    setEditingExercise(null)
  }

  const handleAddClick = () => {
    setEditingExercise(null)
    setShowForm(true)
  }


  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Exercises</h2>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Exercise
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <p className="mt-2 text-sm text-gray-500">Long-press an exercise to edit</p>
      </div>

      {/* Exercise List */}
      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No exercises match your search' : 'No exercises found. Add some exercises to get started!'}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-3">
          {filteredExercises.map((exercise) => (
            <div 
              key={exercise.name}
              className="rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50 relative"
            >
              <LongPressable onTrigger={() => {
                setEditingExercise(exercise)
                setShowForm(true)
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 select-none">{exercise.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 select-none">{exercise.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {renderTypeBadge(exercise)}
                  {renderTypeCount(exercise)}
                </div>
                </div>
              </LongPressable>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ExerciseForm
          exercise={editingExercise || undefined}
          onComplete={handleExerciseComplete}
          onCancel={() => setShowForm(false)}
          onDelete={handleExerciseDelete}
        />
      )}
    </div>
  );
};

export default ExerciseList;