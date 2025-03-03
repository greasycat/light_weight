'use client'

import React, { useState, useEffect } from 'react'
import { Exercise, ExerciseRecord, ExerciseDB } from '../lib/indexdb_handler'
import { filterExercises, SearchInput } from '../lib/search_utils'
import { renderTypeBadge, formatDefaultCount } from '../lib/exercise_utils'

interface RecordFormProps {
  record?: ExerciseRecord
  onComplete: () => void
  onCancel: () => void
  onDelete?: () => void
}

export default function RecordForm({ 
  record,
  onComplete,
  onCancel,
  onDelete
}: RecordFormProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [count, setCount] = useState('')
  const [rpe, setRpe] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState<'kg' | 'lbs'>('lbs')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  // Load exercises and set initial values if editing
  useEffect(() => {
    loadExercises()
    if (record) {
      setCount(record.count.toString())
      setRpe(record.rpe?.toString() || '')
      setNote(record.note || '')
      setWeight(record.weight?.toString() || '')
      setUnit(record.unit || 'lbs')
    }
  }, [record])

  // Find and set the selected exercise when editing
  useEffect(() => {
    if (record && exercises.length > 0) {
      const exercise = exercises.find(e => e.name === record.exerciseName)
      if (exercise) {
        setSelectedExercise(exercise)
        setError('')
      } else {
        setError(`Exercise "${record.exerciseName}" not found. It may have been deleted.`)
      }
    }
  }, [record, exercises])

  useEffect(() => {
    setFilteredExercises(filterExercises(exercises, searchTerm))
  }, [searchTerm, exercises])

  const loadExercises = async () => {
    try {
      setLoading(true)
      const data = await ExerciseDB.getAllExercises()
      setExercises(data)
      setLoading(false)
    } catch (err) {
      console.error('Error loading exercises:', err)
      setLoading(false)
    }
  }

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    
    if (exercise.type !== 'strength') {
      setWeight('')
    }
    
    if (!record) { // Only set default count for new records
      if (exercise.type === 'strength') {
        const match = exercise.defaultCount.match(/(\d+)s(\d+)r/)
        if (match) {
          const [, , reps] = match
          setCount(reps)
        } else {
          setCount('')
        }
      } else {
        setCount(exercise.defaultCount)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedExercise) return
    
    try {
      const countValue = parseInt(count)
      const rpeValue = rpe ? parseFloat(rpe) : null
      const weightValue = weight ? parseFloat(weight) : undefined

      const recordData: ExerciseRecord = {
        exerciseName: selectedExercise.name,
        count: countValue,
        rpe: rpeValue,
        note,
        date: record?.date || new Date().toISOString().split('T')[0],
        time: record?.time || new Date().toTimeString().split(' ')[0],
        weight: weightValue,
        unit: unit
      }

      let success: boolean;

      if (record) {
        success = await ExerciseDB.updateRecord(record.id, recordData)
      } else {
        const recordId = await ExerciseDB.addRecord(recordData)
        recordData.id = recordId
        success = true

      }

      if (!success) {
        setError('Failed to save record');
        return;
      }

      onComplete()
      resetForm()
    } catch (err) {
      setError('Failed to save record');
      console.error('Error saving record:', err);
    }
  }

  const handleDelete = async () => {
    if (!record) return

    try {
      setIsDeleting(true)
      await ExerciseDB.deleteRecord(record.id)
      onDelete?.()
    } catch (err) {
      console.error('Error deleting record:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this record? This cannot be undone.')) {
      handleDelete()
    }
  }

  const resetForm = () => {
    setSelectedExercise(null)
    setCount('')
    setRpe('')
    setNote('')
    setWeight('')
    setUnit('lbs')
  }

  return (
    <>
        <div className="fixed inset-0 bg-gray-600/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {record ? 'Edit Record' : 'Add Record'}
              </h2>
              {record && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="px-3 py-1 text-sm font-medium text-pink-50 bg-red-500 rounded-md 
                    hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
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
                    {!selectedExercise && (
                      <div className="mb-2">
                        <SearchInput
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search exercises..."
                        />
                      </div>
                    )}
                    {selectedExercise ? (
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <p className="font-medium">{selectedExercise.name}</p>
                        {renderTypeBadge(selectedExercise.type)}
                        {!record && (
                          <button
                            type="button"
                            onClick={() => setSelectedExercise(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Change
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto p-2 rounded-md">
                        {filteredExercises.map((exercise) => (
                          <div
                            key={exercise.name}
                            onClick={() => handleExerciseSelect(exercise)}
                            className="rounded-lg shadow p-4 cursor-pointer hover:bg-gray-100"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{exercise.name}</p>
                              {renderTypeBadge(exercise.type)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {selectedExercise && (
                <>
                  {selectedExercise.type === 'strength' && (
                    <div className="mb-4">
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                        Weight
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          id="weight"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter weight"
                          step="5"
                        />
                        <select
                          value={unit}
                          onChange={(e) => setUnit(e.target.value as 'kg' | 'lbs')}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="lbs">lbs</option>
                          <option value="kg">kg</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
                      {selectedExercise.type === 'strength' ? 'Total Reps' : 'Duration (seconds)'}
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
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    onCancel()
                  }}
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
                  {record ? 'Save Changes' : 'Save Record'}
                </button>
              </div>
            </form>
            {!record && selectedExercise && (
              <div className="text-sm text-gray-500 mt-1">
                Default: {formatDefaultCount(selectedExercise.type, selectedExercise.defaultCount)}
              </div>
            )}
          </div>
        </div>
    </>
  )
} 