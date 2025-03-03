'use client'

import { useState } from 'react'
import { Exercise, ExerciseDB } from '../lib/indexdb_handler'
import { renderTypeBadge } from '../lib/exercise_utils'

interface ExerciseFormProps {
  exercise?: Exercise
  onComplete: () => void
  onCancel: () => void
  onDelete?: () => void
}

export default function ExerciseForm({ exercise, onComplete, onCancel, onDelete }: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name || '')
  const [type, setType] = useState<'strength' | 'cardio' | 'core'>(exercise?.type || 'strength')
  const [defaultCount, setDefaultCount] = useState(exercise?.defaultCount || '')
  const [instruction, setInstruction] = useState(exercise?.instruction || '')
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const typeOptions: Array<'strength' | 'cardio' | 'core'> = ['strength', 'cardio', 'core']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !type || !defaultCount) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const exerciseData: Exercise = {
        name,
        type,
        defaultCount,
        instruction
      }

      let success: boolean;
      if (exercise) {
        success = await ExerciseDB.updateExercise(exercise.name, exerciseData);
      } else {
        success = await ExerciseDB.addExercise(exerciseData);
      }

      if (!success) {
        setError('Failed to save exercise');
        return;
      }

      onComplete();
    } catch (err) {
      setError('Failed to save exercise');
      console.error('Error saving exercise:', err);
    }
  }

  const handleDelete = async () => {
    if (!exercise) return

    try {
      setIsDeleting(true)
      await ExerciseDB.deleteExercise(exercise.name)
      onDelete?.()
    } catch (err) {
      setError('Failed to delete exercise')
      console.error('Error deleting exercise:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this exercise? This cannot be undone.')) {
      handleDelete()
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {exercise ? 'Edit Exercise' : 'Add New Exercise'}
          </h2>
          {exercise && (
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md 
                hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exercise Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Push-ups"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex gap-2">
              {typeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(option)}
                  className={`flex-1 p-2 rounded-md border transition-colors ${
                    type === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {renderTypeBadge(option)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Count
            </label>
            <input
              type="text"
              value={defaultCount}
              onChange={(e) => setDefaultCount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={type === 'strength' ? 'e.g., 3s12r' : 'e.g., 60'}
            />
            <p className="mt-1 text-sm text-gray-500">
              {type === 'strength' ? 'Format: [sets]s[reps]r (e.g., 3s12r)' : 
               type === 'cardio' ? 'Time in seconds' : 
               'Duration in seconds'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions (optional)
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter exercise instructions..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {exercise ? 'Save Changes' : 'Add Exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 