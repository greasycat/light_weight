"use client";

import React, { useState, useEffect } from "react";
import { Plan, ExerciseDB, ExerciseRecord } from "../lib/indexdb_handler";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import { NumberInputOneLine, NumberInputRep, NumberInputWeight } from "./number_input";

interface WorkoutBuilderProps {
  onClose: () => void;
}

const WorkoutBuilder = ({ onClose }: WorkoutBuilderProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutRecords, setWorkoutRecords] = useState<Record<number, ExerciseRecord[]>>({});
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(120); // 2 minutes in seconds
  const [currentRestTime, setCurrentRestTime] = useState(120);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [restTimerId, setRestTimerId] = useState<NodeJS.Timeout | null>(null);
  const [exerciseTimerId, setExerciseTimerId] = useState<NodeJS.Timeout | null>(
    null
  );
  const [currentExerciseTime, setCurrentExerciseTime] = useState(0);
  const [isExerciseTimerRunning, setIsExerciseTimerRunning] = useState(false);
  const [weight, setWeight] = useState("0");
  const [unit, setUnit] = useState<"kg" | "lbs">("lbs");
  const [reps, setReps] = useState("0");
  const [rpe, setRpe] = useState("0");
  const [note, setNote] = useState("");

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (isRestTimerRunning) {
      const timer = setInterval(() => {
        setCurrentRestTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRestTimerRunning(false);
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setRestTimerId(timer);
    }

    return () => {
      if (restTimerId) {
        clearInterval(restTimerId);
      }
    };
  }, [isRestTimerRunning, restTimerId]);

  useEffect(() => {
    if (isExerciseTimerRunning) {
      const timer = setInterval(() => {
        setCurrentExerciseTime((prev) => prev + 1);
      }, 1000);
      setExerciseTimerId(timer);
    }

    return () => {
      if (exerciseTimerId) {
        clearInterval(exerciseTimerId);
      }
    };
  }, [exerciseTimerId, isExerciseTimerRunning]);

  const loadPlans = async () => {
    try {
      const allPlans = await ExerciseDB.getAllPlans();
      setPlans(allPlans);
      setLoading(false);
    } catch (error) {
      console.error("Error loading plans:", error);
      setLoading(false);
    }
  };

  const handleStart = () => {
    setIsStarted(true);
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setIsResting(false);
      setCurrentRestTime(restTime);
      setIsRestTimerRunning(false);
      resetExerciseState();
    }
  };

  const handleNextExercise = () => {
    if (isResting) {
      setIsResting(false);
      setCurrentRestTime(restTime);
      setIsRestTimerRunning(false);
      return;
    }

    if (
      selectedPlan &&
      currentExerciseIndex < selectedPlan.exercises.length - 1
    ) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setIsResting(true);
      setCurrentRestTime(restTime);
      setIsRestTimerRunning(false);
      resetExerciseState();
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleRestStart = () => {
    setIsRestTimerRunning(true);
  };

  const handleRestPause = () => {
    setIsRestTimerRunning(false);
    if (restTimerId) {
      clearInterval(restTimerId);
    }
  };

  const handleRestReset = () => {
    setIsRestTimerRunning(false);
    setCurrentRestTime(restTime);
    if (restTimerId) {
      clearInterval(restTimerId);
    }
  };

  const handleRestTimeAdjust = (seconds: number) => {
    const newTime = Math.max(0, restTime + seconds);
    setRestTime(newTime);
    if (!isRestTimerRunning) {
      setCurrentRestTime(newTime);
    }
  };

  const handleExerciseStart = () => {
    setIsExerciseTimerRunning(true);
  };

  const handleExercisePause = () => {
    setIsExerciseTimerRunning(false);
    if (exerciseTimerId) {
      clearInterval(exerciseTimerId);
    }
  };

  const handleExerciseReset = () => {
    setIsExerciseTimerRunning(false);
    setCurrentExerciseTime(0);
    if (exerciseTimerId) {
      clearInterval(exerciseTimerId);
    }
  };

  const handleSaveRecord = async () => {
    if (!selectedPlan) return;

    const currentExercise = selectedPlan.exercises[currentExerciseIndex];
    const recordData: Omit<ExerciseRecord, 'id'> = {
      exerciseName: currentExercise.name,
      dateTime: new Date().toISOString(),
      count:
        currentExercise.type === "timed" ? currentExerciseTime : parseInt(reps),
      rpe: rpe ? parseFloat(rpe) : null,
      note,
      weight:
        currentExercise.type === "weight" ? parseFloat(weight) : undefined,
      unit: currentExercise.type === "weight" ? unit : undefined,
    };

    try {
      const recordId = await ExerciseDB.addRecord(recordData);
      // Update workoutRecords state with the new record
      setWorkoutRecords(prev => ({
        ...prev,
        [currentExerciseIndex]: [
          ...(prev[currentExerciseIndex] || []),
          { ...recordData, id: recordId }
        ]
      }));
      resetExerciseState();
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  const resetExerciseState = () => {
    setWeight("0");
    setUnit("lbs");
    setReps("0");
    setRpe("0");
    setNote("");
    setCurrentExerciseTime(0);
    setIsExerciseTimerRunning(false);
    if (exerciseTimerId) {
      clearInterval(exerciseTimerId);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="text-center">Loading plans...</div>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="fixed inset-0 bg-gray-600/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Choose a Workout Plan</h2>
          <div className="space-y-2">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePlanSelect(plan)}
                className={`w-full p-4 text-left rounded-lg border ${
                  selectedPlan?.id === plan.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <h3 className="font-medium">{plan.name}</h3>
                <p className="text-sm text-gray-500">
                  {plan.exercises.length} exercises
                </p>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              disabled={!selectedPlan}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isResting) {
    return (
      <div className="fixed inset-0 bg-gray-600/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full h-full">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handlePreviousExercise}
              disabled={currentExerciseIndex === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-center">Rest Time</h2>
            <button
              onClick={handleNextExercise}
              disabled={
                !selectedPlan ||
                currentExerciseIndex === selectedPlan.exercises.length - 1
              }
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <div className="text-6xl font-bold text-blue-600">
              {formatTime(currentRestTime)}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleRestTimeAdjust(-15)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <MinusIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleRestTimeAdjust(15)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex space-x-4">
              {!isRestTimerRunning ? (
                <button
                  onClick={handleRestStart}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Start Rest
                </button>
              ) : (
                <button
                  onClick={handleRestPause}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Pause
                </button>
              )}
              <button
                onClick={handleRestReset}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              End Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentExercise = selectedPlan?.exercises[currentExerciseIndex];

    const divClasses = "flex flex-row items-center justify-center";
    const inputClasses = "w-10 remove-arrow text-center font-bold";
    const iconClasses = "p-2 text-black";
    const textClasses = "text-neutral-700 text-md font-semibold select-none";

  return (
    <div className="fixed inset-0 bg-gray-600/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full h-full">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold text-center">
            {currentExercise?.name}
          </h2>
          <button
            onClick={handleNextExercise}
            disabled={
              !selectedPlan ||
              currentExerciseIndex === selectedPlan.exercises.length - 1
            }
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>

        <p>Workout Records</p>
        <div className="flex flex-col space-y-1">
        {workoutRecords[currentExerciseIndex]?.map((record, index) => (
          <div key={index} className="flex justify-between items-center p-2 border-b">
            <span className="text-gray-800">{record.exerciseName}</span>
            <span className="text-gray-600">{record.count}</span>
            <span className="text-gray-600">{record.rpe}</span>
            <span className="text-gray-600">{record.note}</span>
          </div>
        ))}
        </div>

        <div className="flex flex-col items-center space-y-6">
          {currentExercise?.type === "weight" && (
            <>
              <NumberInputWeight 
                value={parseFloat(weight) || 0}
                onChange={(val) => setWeight(val.toString())}
                textColor="text-gray-700"
                text="Weight"
                placeholder={unit}
                className="w-full max-w-xs"
                unit={unit}
                onUnitChange={setUnit}
              />

              <div className="flex flex-row items-center justify-center space-x-2">
              {/* <NumberInputOneLine
                value={parseInt(reps) || 0}
                onChange={(val) => setReps(val.toString())}
                onIncrement={() => setReps(Math.max(0, parseInt(reps) + 1).toString())}
                onDecrement={() => setReps(Math.max(0, parseInt(reps) - 1).toString())}
                text="Reps"
                divClassName={divClasses}
                inputClassName={inputClasses}
                iconClassName={iconClasses}
                textClassName={textClasses}
              /> */}

              <NumberInputOneLine
                value={rpe}
                onChange={(val) => {
                  setRpe(val.target.value);
                }}
                onIncrement={() => setRpe(Math.max(0, (parseInt(rpe) || 0) + 1).toString())}
                onDecrement={() => setRpe(Math.max(0, (parseInt(rpe) || 0) - 1).toString())}
                text="RPE"
                divClassName={divClasses}
                inputClassName={inputClasses}
                iconClassName={iconClasses}
                textClassName={textClasses}
              />
              </div>
            </>
          )}

          {currentExercise?.type === "timed" && (
            <>
              <div className="text-6xl font-bold text-blue-600">
                {formatTime(currentExerciseTime)}
              </div>
              <div className="flex space-x-4">
                {!isExerciseTimerRunning ? (
                  <button
                    onClick={handleExerciseStart}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Start
                  </button>
                ) : (
                  <button
                    onClick={handleExercisePause}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Pause
                  </button>
                )}
                <button
                  onClick={handleExerciseReset}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Reset
                </button>
              </div>
            </>
          )}

          <div className="flex flex-col space-y-4 w-full max-w-xs">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Notes (optional)"
              rows={2}
            />
            <button
              onClick={handleSaveRecord}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              type="button"
            >
              Add Set
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            End Workout
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutBuilder;
