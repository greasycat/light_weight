'use client'

import { useState, useRef } from 'react'
import { renderTypeBadge } from '../widgets/exercise_utils'
import { CountedExercise, Exercise, ExerciseType, TimedExercise, Unit, WeightedExercise } from '@/app/lib/models/exercise'
import { ExerciseRepository } from '@/app/lib/repositories/interfaces/repository'
import RepositoryFactory from '@/app/lib/repositories/factory'
import { SimpleNumberInput, WeightNumberInput, ComplexNumberInput } from '../widgets/number_input'

interface ExerciseFormProps {
  exercise?: Exercise
  onComplete: () => void
  onCancel: () => void
  onDelete?: () => void
}

export default function ExerciseForm({ exercise, onComplete, onCancel, onDelete }: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name || '')
  const [type, setType] = useState<ExerciseType>(exercise?.type || ExerciseType.Weight)
  const [description, setDescription] = useState(exercise?.description || '')

  const [weight, setWeight] = useState((exercise as WeightedExercise)?.weight?.toString() || '0')
  const [unit, setUnit] = useState((exercise as WeightedExercise)?.unit || Unit.Metric)
  const [reps, setReps] = useState((exercise as WeightedExercise)?.reps?.toString() || '0')
  const [sets, setSets] = useState((exercise as WeightedExercise)?.sets?.toString() || '0')
  const [time, setTime] = useState((exercise as TimedExercise)?.time?.toString() || '0')
  const [count, setCount] = useState((exercise as CountedExercise)?.count?.toString() || '0')

  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const exerciseRepositoryRef = useRef<ExerciseRepository>(RepositoryFactory.getExerciseRepository('indexdb'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !type ) {
      setError('Please fill in all required fields')
      return
    }

    if (!unit) {
      setError('Please select a unit')
      return
    }

    if (type === ExerciseType.Weight) {
      if (!sets || !reps) {
        setError('Please fill in all required fields')
        return
      }
    }

    if (type === ExerciseType.Timed) {
      if (!time) {
        setError('Please fill in all required fields')
        return
      }
    }

    if (type === ExerciseType.Count) {
      if (!count) {
        setError('Please fill in all required fields')
        return
      }
    }

    const parsedWeight = parseFloat(weight)
    if (isNaN(parsedWeight) || parsedWeight < 0) {
      setError('Weight must be a number greater than 0')
      return
    }

    const parsedReps = parseInt(reps)
    if (isNaN(parsedReps) || parsedReps < 0) {
      setError('Reps must be a number greater than 0')
      return
    }

    const parsedSets = parseInt(sets)
    if (isNaN(parsedSets) || parsedSets < 0) {
      setError('Sets must be a number greater than 0')
      return
    }

    const parsedTime = parseInt(time)
    if (isNaN(parsedTime) || parsedTime < 0) {
      setError('Time must be a number greater than 0')
      return
    }

    const parsedCount = parseInt(count)
    if (isNaN(parsedCount) || parsedCount < 0) {
      setError('Count must be a number greater than 0')
      return
    }

    
    
      let exerciseData: Exercise = {
        name,
        type,
        description: description,
        updatedAt: new Date(),
        id: exercise?.id || -1,
        createdAt: exercise?.createdAt || new Date()
      }

      if (type === ExerciseType.Weight) {
        let weightedExerciseData: WeightedExercise = {
          ...exerciseData,
          weight: parsedWeight,
          unit: unit,
          reps: parsedReps,
          sets: parsedSets,
          muscleGroups: []
        }
        exerciseData = weightedExerciseData
      }

      if (type === ExerciseType.Timed) {
        let timedExerciseData: TimedExercise = {
          ...exerciseData,
          time: parsedTime
        }
        exerciseData = timedExerciseData
      }

      if (type === ExerciseType.Count) {
        let countedExerciseData: CountedExercise = {
          ...exerciseData,
          count: parsedCount
        }
        exerciseData = countedExerciseData
      }
      try {
        if (exercise) {
          await exerciseRepositoryRef.current.update(exerciseData)
        } else {
          await exerciseRepositoryRef.current.add(exerciseData)
        }

        onComplete()
      } catch (err) {
        setError('Failed to save exercise')
        console.error('Error saving exercise:', err)
      }
  }

  const handleDelete = async () => {
    if (!exercise) return

    try {
      setIsDeleting(true)
      await exerciseRepositoryRef.current.delete(exercise)
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

  const handleSetType = (type: ExerciseType) => {
    setType(type)
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
              {Object.values(ExerciseType).map((option) => (
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
            {type === ExerciseType.Weight && (
              <>
                <WeightNumberInput
                  text="Default Weight"
                  weight={weight}
                  onWeightChange={setWeight}
                  unit={unit}
                  onUnitChange={setUnit}
              />
                <SimpleNumberInput
                  text="Default Reps"
                  value={reps}
                  onChange={setReps}
                />
              </>
            )}
            {type === ExerciseType.Timed && (
              <>
                <ComplexNumberInput
                  text="Default Time (s)"
                  value={time}
                  onChange={setTime}
                />
              </>
            )}
            {type === ExerciseType.Count && (
              <>
                <ComplexNumberInput
                  text="Default Count"
                  value={count}
                  onChange={setCount}
                  incrementValues={[-20, -10, 10, 20]}
                />
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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