'use client'

import { useState } from 'react'

type WorkoutType = 'Strength' | 'Cardio' | 'Flexibility' | 'HIIT' | 'Recovery'

interface QuickWorkoutData {
  type: WorkoutType
  duration: number
  notes: string
}

export default function AddWorkout() {
  const [mode, setMode] = useState<'quick' | 'day'>('quick')
  const [quickWorkout, setQuickWorkout] = useState<QuickWorkoutData>({
    type: 'Strength',
    duration: 30,
    notes: ''
  })
  
  const handleQuickWorkoutChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setQuickWorkout(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }))
  }
  
  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting quick workout:', quickWorkout)
    // Here you would typically call an API or context function to save the workout
    
    // Reset form
    setQuickWorkout({
      type: 'Strength',
      duration: 30,
      notes: ''
    })
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-screen w-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Add Workout</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setMode('quick')} 
            className={`px-4 py-2 rounded ${mode === 'quick' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Quick Add
          </button>
          <button 
            onClick={() => setMode('day')} 
            className={`px-4 py-2 rounded ${mode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Add Day
          </button>
        </div>
      </div>
      
      {mode === 'quick' ? (
        <div className="bg-gray-50 p-5 rounded-lg flex-grow flex flex-col">
          <form onSubmit={handleQuickSubmit} className="flex-grow flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workout Type
                </label>
                <select
                  name="type"
                  value={quickWorkout.type}
                  onChange={handleQuickWorkoutChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Recovery">Recovery</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={quickWorkout.duration}
                  onChange={handleQuickWorkoutChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              
              <div className="md:row-span-2 md:flex md:items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md"
                >
                  Log Workout
                </button>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={quickWorkout.notes}
                  onChange={handleQuickWorkoutChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={2}
                  placeholder="How was your workout?"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <p className="text-sm text-blue-700">
                  <strong>Quick Add</strong> logs a workout with just the essentials. 
                  For detailed tracking, use <strong>Add Day</strong> to log individual exercises.
                </p>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-100 p-8 rounded-lg text-center flex-grow flex items-center justify-center">
          <p className="text-gray-500">Detailed workout tracking will be implemented soon!</p>
        </div>
      )}
    </div>
  )
}