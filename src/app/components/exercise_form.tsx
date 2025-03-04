'use client'

import { useState } from 'react'
import { Exercise, ExerciseDB } from '../lib/indexdb_handler'
import { getDefaultCountPlaceholder, renderTypeBadge } from '../lib/exercise_utils'

interface ExerciseFormProps {
  exercise?: Exercise
  onComplete: () => void
  onCancel: () => void
  onDelete?: () => void
}

export default function ExerciseForm({ exercise, onComplete, onCancel, onDelete }: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name || '')
  const [type, setType] = useState<'weight' | 'timed' | 'count'>(exercise?.type || 'weight')
  const [defaultCount, setDefaultCount] = useState(exercise?.defaultCount || '')
  const [instruction, setInstruction] = useState(exercise?.instruction || '')
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const typeOptions: Array<'weight' | 'timed' | 'count'> = ['weight', 'timed', 'count']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !type || !defaultCount) {
      setError('Please fill in all required fields')
      return
    }

    if (type === 'weight' && !defaultCount.match(/^\d+s\d+r$/)) {
      setError('Invalid weight format. Please enter a valid number of sets and reps (e.g., 3s12r)')
      return
    }

    if (type === 'timed' && !defaultCount.match(/^\d+$/)) {
      setError('Invalid timed format. Please enter a valid number of seconds (e.g., 60)')
      return
    }

    if (type === 'count' && !defaultCount.match(/^\d+$/)) {
      setError('Invalid count format. Please enter a valid number of reps (e.g., 10)')
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

  const handleSetType = (type: Exercise['type']) => {
    setType(type)
    setDefaultCount("")
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
                  onClick={() => handleSetType(option)}
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
            {type === 'weight' ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label htmlFor="sets" className="block text-sm text-gray-600 mb-1">Sets</label>
                    <input
                      type="number"
                      id="sets"
                      value={defaultCount.split('s')[0] || ''}
                      onChange={(e) => {
                        const reps = defaultCount.split('s')[1]?.split('r')[0] || '';
                        setDefaultCount(`${e.target.value}s${reps}r`);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 3"
                      min="1"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="reps" className="block text-sm text-gray-600 mb-1">Reps</label>
                    <input
                      type="number"
                      id="reps"
                      value={defaultCount.split('s')[1]?.split('r')[0] || ''}
                      onChange={(e) => {
                        const sets = defaultCount.split('s')[0] || '';
                        setDefaultCount(`${sets}s${e.target.value}r`);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 12"
                      min="1"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">Enter the default number of sets and reps</p>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={defaultCount}
                  onChange={(e) => setDefaultCount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={type === 'timed' ? 'e.g., 60' : 'Number of reps'}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {type === 'timed' ? 'Time in seconds' : 'Number of reps'}
                </p>
              </>
            )}
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