import React, { useState, useEffect, CSSProperties } from 'react';
import { Exercise, ExerciseRecord, ExerciseDB } from '../lib/indexdb_handler';
import { filterExercises, SearchInput } from '../lib/search_utils';

interface AddRecordProps {
  onRecordAdded?: (record: ExerciseRecord) => void;
  className?: string;
  style?: CSSProperties;
  buttonText?: string;
}

const RecordAdd: React.FC<AddRecordProps> = ({ 
  onRecordAdded,
  className = "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500",
  style,
  buttonText = "Add Workout Record"
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [count, setCount] = useState<string>('');
  const [rpe, setRpe] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadExercises();
    }
  }, [isOpen]);

  useEffect(() => {
    setFilteredExercises(filterExercises(exercises, searchTerm));
  }, [searchTerm, exercises]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await ExerciseDB.getAllExercises();
      setExercises(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading exercises:', err);
      setLoading(false);
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    
    // Set default count based on exercise type
    if (exercise.type === 'strength') {
      const match = exercise.defaultCount.match(/(\d+)s(\d+)r/);
      if (match) {
        const [, sets, reps] = match;
        setCount(`${parseInt(reps)}`);
      } else {
        setCount('');
      }
    } else if (exercise.type === 'cardio' || exercise.type === 'core') {
      setCount(exercise.defaultCount);
    } else {
      setCount('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExercise) return;
    
    try {
      const countValue = parseInt(count);
      const rpeValue = rpe ? parseFloat(rpe) : null;
      
      const recordId = await ExerciseDB.addRecord({
        exerciseName: selectedExercise.name,
        count: countValue,
        rpe: rpeValue,
        note,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0]
      });
      
      const newRecord = {
        id: recordId,
        exerciseName: selectedExercise.name,
        count: countValue,
        rpe: rpeValue,
        note,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0]
      };
      
      if (onRecordAdded) {
        onRecordAdded(newRecord);
      }
      
      // Reset form
      setSelectedExercise(null);
      setCount('');
      setRpe('');
      setNote('');
      setIsOpen(false);
      
    } catch (err) {
      console.error('Error adding record:', err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={className}
        style={style}
      >
        {buttonText}
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-neutral-200/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add Workout Record</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Exercise Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Choose Exercise
                  </label>
                  {loading ? (
                    <div className="py-2 px-3 border rounded-md text-center text-gray-500">
                      Loading exercises...
                    </div>
                  ) : (
                    <>
                      <div className="mb-2">
                        <SearchInput
                          value={searchTerm}
                          onChange={handleSearchChange}
                          placeholder="Search exercises..."
                        />
                      </div>
                      {selectedExercise ? (
                        <div className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <p className="font-medium">{selectedExercise.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              selectedExercise.type === 'strength' ? 'bg-blue-100 text-blue-800' :
                              selectedExercise.type === 'cardio' ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {selectedExercise.type}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedExercise(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto p-2 rounded-md">
                          {filteredExercises.map((exercise) => (
                            <div
                              key={exercise.name}
                              onClick={() => handleExerciseSelect(exercise)}
                              className="rounded-lg shadow p-4 cursor-pointer hover:bg-gray-100"
                            >
                              <p className="font-medium">{exercise.name}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                exercise.type === 'strength' ? 'bg-blue-100 text-blue-800' :
                                exercise.type === 'cardio' ? 'bg-red-100 text-red-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {exercise.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {selectedExercise && (
                  <>
                    {/* Count Input */}
                    <div className="mb-4">
                      <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
                        {selectedExercise.type === 'strength' ? 'Total Reps' : 
                          selectedExercise.type === 'cardio' ? 'Duration (seconds)' : 
                          'Duration (seconds)'}
                      </label>
                      <input
                        type="number"
                        id="count"
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    {/* RPE Input (optional) */}
                    <div className="mb-4">
                      <label htmlFor="rpe" className="block text-sm font-medium text-gray-700 mb-1">
                        RPE (Rate of Perceived Exertion) 1-10 (optional)
                      </label>
                      <input
                        type="number"
                        id="rpe"
                        min="1"
                        max="10"
                        step="0.5"
                        value={rpe}
                        onChange={(e) => setRpe(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        1 = Very Easy, 10 = Maximum Effort
                      </p>
                    </div>
                    
                    {/* Notes Input */}
                    <div className="mb-4">
                      <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (optional)
                      </label>
                      <textarea
                        id="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedExercise || !count}
                    className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !selectedExercise || !count
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecordAdd;