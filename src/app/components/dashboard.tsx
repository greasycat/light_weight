'use client'

import { useState } from 'react'
import AddWorkout from './add_workout'
import ConfigPanel from './config_panel'

export default function Dashboard() {
  const [isAddWorkoutVisible, setAddWorkoutVisible] = useState(false)

  const toggleAddWorkout = () => {
    setAddWorkoutVisible(prev => !prev)
  }

  return (
    <div>
      <ConfigPanel />
      <button onClick={toggleAddWorkout}>
        {isAddWorkoutVisible ? 'Hide Add Workout' : 'Show Add Workout'}
      </button>

      {isAddWorkoutVisible && <AddWorkout />}
      
    </div>
  )
}