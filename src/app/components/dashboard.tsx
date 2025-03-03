'use client'
import { useState } from 'react'
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline'

import AddWorkout from './quick_add'
import ConfigEdit from './config_edit'
import ExerciseList from './exercise_list'
import RecordAdd from './record_add'

export default function Dashboard() {
  const [isConfigEditVisible, setConfigEditVisible] = useState(false)
  const [isExerciseVisible, setExerciseVisible] = useState(false)
  

  const toggleExercise = () => {
    setExerciseVisible(prev => !prev)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Workout Tracker</h1>
      
      <button
        onClick={() => setConfigEditVisible(prev => !prev)}
        className="absolute top-4 right-4 text-blue-500 text-sm flex items-center"
      >
        <WrenchScrewdriverIcon className="w-5 h-5 text-gray-500" />
      </button>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={toggleExercise}
          className="bg-black text-white px-4 py-2 rounded"
        >
        Add Exercise
        </button>
      </div>

      <div className="flex justify-center mb-6">
            <RecordAdd buttonText="Add Workout Record" className="bg-black text-white px-4 py-2 rounded" />
      </div>
      
      
      {isConfigEditVisible && <ConfigEdit />}
      {isExerciseVisible && (
          <ExerciseList />
      )}
    </div>

  )
}