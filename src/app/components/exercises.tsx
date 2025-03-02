import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseDB } from '../lib/indexdb_handler'; // Import from your helper file

interface ExerciseListProps {
  onAddExercise?: () => void;
  onSelectExercise?: (exercise: Exercise) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
  onAddExercise, 
  onSelectExercise 
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load exercises on component mount
  useEffect(() => {
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

    loadExercises();
  }, []);

  // Filter exercises when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredExercises(exercises);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = exercises.filter(exercise => 
        exercise.name.toLowerCase().includes(lowercaseSearch) || 
        exercise.type.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredExercises(filtered);
    }
  }, [searchTerm, exercises]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleExerciseClick = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    }
  };

  // Render badge for exercise type
  const renderTypeBadge = (type: string) => {
    let badgeClass = '';
    
    switch (type) {
      case 'strength':
        badgeClass = 'bg-blue-100 text-blue-800';
        break;
      case 'cardio':
        badgeClass = 'bg-red-100 text-red-800';
        break;
      case 'core':
        badgeClass = 'bg-green-100 text-green-800';
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${badgeClass}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Exercises</h2>
        
        {/* Add Exercise Button (placeholder) */}
        <button 
          onClick={onAddExercise}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Exercise
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
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
        <ul className="bg-white rounded-lg shadow overflow-hidden">
          {filteredExercises.map((exercise, index) => (
            <li 
              key={exercise.name}
              className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${
                index !== filteredExercises.length - 1 ? 'border-b border-gray-200' : ''
              }`}
              onClick={() => handleExerciseClick(exercise)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{exercise.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{exercise.instruction}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {renderTypeBadge(exercise.type)}
                  <span className="text-sm font-medium text-gray-700">
                    {exercise.defaultCount}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExerciseList;