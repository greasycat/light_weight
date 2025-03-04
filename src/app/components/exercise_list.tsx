import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseDB } from '../lib/indexdb_handler';
import { filterExercises, SearchInput } from '../lib/search_utils';
import { renderTypeBadge } from '../lib/exercise_utils';
import ExerciseForm from './exercise_form'

interface ExerciseListProps {
  onSelectExercise?: (exercise: Exercise) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [pressedExercise, setPressedExercise] = useState<Exercise | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [, setIsLongPressing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await ExerciseDB.getAllExercises();
      setExercises(data);
      setFilteredExercises(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load exercises');
      setLoading(false);
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

  // Clean up long press timer
  useEffect(() => {
    if (pressedExercise) {
      setIsLongPressing(true);
      setLoadingProgress(0);
      
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            setEditingExercise(pressedExercise);
            setShowForm(true);
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 50);
      
      return () => clearInterval(interval);
    } else {
      setIsLongPressing(false);
      setLoadingProgress(0);
    }
  }, [pressedExercise]);

  const loadingBarStyle = (exercise: Exercise): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${pressedExercise === exercise ? loadingProgress : 0}%`,
    backgroundColor: 'rgba(133, 133, 133, 0.25)',
    transition: 'width 0.05s linear',
    zIndex: 0,
  });
  
  
  const handleMouseDown = (exercise: Exercise) => {
    setPressedExercise(exercise);
  };
  
  const handleMouseUp = () => {
    setPressedExercise(null);
  };

  // Render count based on exercise type
  const renderTypeCount = (exercise: Exercise) => {
    const { type, defaultCount } = exercise;

    switch (type) {
      case 'weight': {
        const match = defaultCount.match(/(\d+)s(\d+)r/);
        if (match) {
          const [, sets, reps] = match;
          return (
            <div className="flex flex-col items-end text-sm">
              <span className="font-medium text-gray-900 select-none">{sets} sets</span>
              <span className="text-gray-600 select-none">{reps} reps</span>
            </div>
          );
        }
        return defaultCount;
      }
      case 'timed': {
        const seconds = parseInt(defaultCount);
        if (!isNaN(seconds)) {
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          return (
            <div className="flex flex-col items-end text-sm">
              <span className="font-medium text-gray-900 select-none">
                {minutes > 0 ? `${minutes} min` : ''} 
                {remainingSeconds > 0 ? `${remainingSeconds} sec` : minutes === 0 ? '0 sec' : ''}
              </span>
            </div>
          );
        }
        return defaultCount;
      }
      case 'count': {
        const seconds = parseInt(defaultCount);
        if (!isNaN(seconds)) {
          return (
            <div className="flex flex-col items-end text-sm">
              <span className="font-medium text-gray-900 select-none">{seconds} sec</span>
            </div>
          );
        }
        return defaultCount;
      }
      default:
        return defaultCount;
    }
  };

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
      {loading ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
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
              onMouseDown={() => handleMouseDown(exercise)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={() => handleMouseDown(exercise)}
              onTouchEnd={handleMouseUp}
            >
              <div className="flex items-center justify-between">
                <div style={loadingBarStyle(exercise)}></div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 select-none">{exercise.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 select-none">{exercise.instruction}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {renderTypeBadge(exercise.type)}
                  {renderTypeCount(exercise)}
                </div>
              </div>
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