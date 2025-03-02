'use client'
import { useState } from 'react'
import AddWorkout from './add_workout'
import ConfigPanel from './config_panel'
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline'
import ExerciseList from './exercises'

export default function Dashboard() {
  const [isAddWorkoutVisible, setAddWorkoutVisible] = useState(false)
  const [isConfigPanelVisible, setConfigPanelVisible] = useState(false)
  const [isExerciseVisible, setExerciseVisible] = useState(false)
  
  const toggleAddWorkout = () => {
    setAddWorkoutVisible(prev => !prev)
  }

  const toggleExercise = () => {
    setExerciseVisible(prev => !prev)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Workout Tracker</h1>
      
      <button
        onClick={() => setConfigPanelVisible(prev => !prev)}
        className="absolute top-4 right-4 text-blue-500 text-sm flex items-center"
      >
        <WrenchScrewdriverIcon className="w-5 h-5 text-gray-500" />
      </button>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={toggleAddWorkout}
          className="bg-black text-white px-4 py-2 rounded"
        >
        Add Workout
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={toggleExercise}
          className="bg-black text-white px-4 py-2 rounded"
        >
        Add Exercise
        </button>
      </div>
      
      
      {isConfigPanelVisible && <ConfigPanel />}
      {isAddWorkoutVisible && (
          <AddWorkout />
      )}
      {isExerciseVisible && (
          <ExerciseList />
      )}
    </div>

  )
}