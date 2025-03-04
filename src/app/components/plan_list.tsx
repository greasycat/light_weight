'use client'

import { useState, useEffect } from 'react'
import { Plan, ExerciseDB } from '../lib/indexdb_handler'
import PlanForm from './plan_form'

export default function PlanList() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [pressedPlan, setPressedPlan] = useState<Plan | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const loadPlans = async () => {
    try {
      setLoading(true)
      const data = await ExerciseDB.getAllPlans()
      setPlans(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load plans')
      setLoading(false)
      console.error('Error loading plans:', err)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  // Clean up long press timer
  useEffect(() => {
    if (pressedPlan) {
      setIsLongPressing(true)
      setLoadingProgress(0)
      
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            setEditingPlan(pressedPlan)
            setShowForm(true)
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 50)
      
      return () => clearInterval(interval)
    } else {
      setIsLongPressing(false)
      setLoadingProgress(0)
    }
  }, [pressedPlan])

  const loadingBarStyle = (plan: Plan): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${pressedPlan?.id === plan.id ? loadingProgress : 0}%`,
    backgroundColor: 'rgba(133, 133, 133, 0.25)',
    transition: 'width 0.05s linear',
    zIndex: 0,
  })
  
  const handleMouseDown = (plan: Plan) => {
    setPressedPlan(plan)
  }
  
  const handleMouseUp = () => {
    setPressedPlan(null)
  }

  const handlePlanComplete = async () => {
    await loadPlans()
    setEditingPlan(null)
    setShowForm(false)
  }

  const handlePlanDelete = async () => {
    await loadPlans()
    setEditingPlan(null)
    setShowForm(false)
  }

  const formatSchedule = (schedule: string): string => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return schedule
      .split('')
      .map((day, index) => day === '1' ? days[index] : null)
      .filter(Boolean)
      .join(', ')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Workout Plans</h2>
        <button
          onClick={() => {
            setEditingPlan(null)
            setShowForm(true)
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Plan
        </button>
      </div>

      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No workout plans found. Add some plans to get started!
        </div>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className="rounded-lg shadow p-4 bg-white hover:bg-gray-50 relative"
              onMouseDown={() => handleMouseDown(plan)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={() => handleMouseDown(plan)}
              onTouchEnd={handleMouseUp}
            >
              <div style={loadingBarStyle(plan)}></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                  <span className="text-sm text-gray-500">{formatSchedule(plan.schedule)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {Array.from(new Set(plan.exercises.map(exercise => exercise.name))).map((exerciseName, index) => {
                    const exercise = plan.exercises.find(ex => ex.name === exerciseName);
                    return (
                      <span key={exerciseName} className="inline-block">
                        {exerciseName}
                        {exercise?.count && exercise.count > 0 && ` (${exercise.count})`}
                        {index < plan.exercises.length - 1 ? ', ' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PlanForm
          plan={editingPlan || undefined}
          onComplete={handlePlanComplete}
          onCancel={() => {
            setShowForm(false)
            setEditingPlan(null)
          }}
          onDelete={handlePlanDelete}
        />
      )}
    </div>
  )
} 