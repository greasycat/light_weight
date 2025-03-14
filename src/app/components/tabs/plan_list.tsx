'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import PlanForm from '@/app/components/modals/plan_form'
import { Plan } from '@/app/lib/models/plan'
import RepositoryFactory from '@/app/lib/repositories/factory'
import LongPressable from '../common/long_pressable'
import { renderTypeCount } from '../widgets/exercise_utils'
import { Exercise } from '@/app/lib/models/exercise'

export default function PlanList() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null)

  const [plansExercises, setPlansExercises] = useState<Record<string, Exercise[]>>({})


  const planRepositoryRef = useRef(RepositoryFactory.getPlanRepository('indexdb'));
  const exerciseRepositoryRef = useRef(RepositoryFactory.getExerciseRepository('indexdb'));

  const loadPlans = async () => {
    try {
      setLoading(true)
      const data = await planRepositoryRef.current.getAll()
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
  },[])

  const fetchAllPlansExercises = async (plans: Plan[]) => {
  setLoading(true);
  try {
    // Process all plans in parallel
    const results = await Promise.all(plans.map(async (plan) => {
      const exerciseIds = Array.from(new Set(plan.exerciseIds));

      const validIds: number[] = []
      const exercises =  await Promise.all(
        exerciseIds.flatMap(async id => {
         let exercise = await exerciseRepositoryRef.current.get(id)
         if (!exercise) {
          setError(prev =>  `${prev} Exercise ${id} not found.`)
          console.log(`Exercise with id ${id} not found.`)
          return []
         }
         validIds.push(id)
         return [exercise]
        }
      ))

      planRepositoryRef.current.update({
        ...plan,
        exerciseIds: validIds
      })

      return { planId: plan.id, exercises };
    }));
    
    // Convert results to an object keyed by plan ID
    const exercisesByPlanId: Record<string, Exercise[]> = {};
    results.forEach(result => {
      exercisesByPlanId[result.planId.toString()] = result.exercises.flat();
    });
    
    setPlansExercises(exercisesByPlanId);
  } catch (error) {
    console.error("Error fetching exercises:", error);
  } finally {
    setLoading(false);
  }
};

// Step 3: Fetch data when plans change
useEffect(() => {
  if (plans.length > 0) {
    fetchAllPlansExercises(plans);
  }
}, [plans]);

// Step 4: Render function for a single plan's exercises
const renderPlanExercises = (plan: Plan) => {
  if (loading) return <span>Loading...</span>;
  
  const exercises: Exercise[] = plansExercises[plan.id.toString()] || [];
  const exercisesWithIds: {exercise: Exercise, id: number}[] = exercises.map(e => ({exercise: e, id: e.id}))

  if (exercisesWithIds.length === 0) {
    return <span className='text-gray-500'>No exercises</span>
  }


  return exercisesWithIds.map(({exercise, id}, index: number) => (
    <div key={id.toString()} className="flex items-center justify-between gap-2 mb-2 border-b border-gray-200 pb-2">
      <span className=''>{index + 1}. {exercise.name}</span>
      <span className='text-gray-500 px-2'>{renderTypeCount(exercise)}</span>
    </div>
  ));
};


  const formatSchedule = (schedule: number): string => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.filter((_, index) => (schedule & (1 << index)) !== 0).join(', ')
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
        <span className='text-red-400 text-sm' onClick={() => setError(null)}>{error}</span>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Workout Plans</h2>
        <button
          onClick={() => {
            setPlanToEdit(null)
            setShowForm(true)
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No workout plans found. Add some plans to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className="rounded-lg shadow-lg ring-1 ring-gray-200 p-4 bg-white hover:bg-gray-50 relative"
            >
              <Suspense fallback={<div>Loading...</div>}>
              <LongPressable
                onTrigger={() => {
                  setPlanToEdit(plan)
                  setShowForm(true)
                }}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                  <span className="text-sm text-gray-500">{formatSchedule(plan.schedule)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {renderPlanExercises(plan)}
                  </div>
                </div>
              </LongPressable>
              </Suspense>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PlanForm
          plan={planToEdit}
          onComplete={() => {
            setPlanToEdit(null)
            setShowForm(false)
            loadPlans()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
} 