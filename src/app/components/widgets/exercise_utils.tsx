import React from 'react';
import { CountedExercise, Exercise, TimedExercise, WeightedExercise, ExerciseType, Unit } from '../../lib/models/exercise';
import { Record, WeightRecord, TimedRecord, CountRecord } from '../../lib/models/record';
import { ExerciseRepository } from '@/app/lib/repositories/interfaces/repository';

export function renderExerciseTypeBadge(exercise: Exercise) {
  return renderTypeBadge(exercise.type)
}

export function renderTypeBadge(type: ExerciseType) {
  if (type === ExerciseType.Weight) {
    return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded select-none">Weight</span>
  }
  else if (type === ExerciseType.Timed) {
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded select-none">Timed</span>
  }
  else if (type === ExerciseType.Count) {
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded select-none">Count</span>
  }
  else {
    return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded select-none">Unknown</span>
  }
}

export function renderTypeCount(exercise: Exercise | Record) {
  if (exercise.type === ExerciseType.Weight) {
    const weightedExercise = exercise as WeightedExercise;
    return (
      <div className="flex flex-col items-end text-sm">
        <span className=" text-gray-900 select-none">{weightedExercise.sets} sets</span>
        <span className="text-gray-900 select-none">{weightedExercise.reps} reps</span>
      </div>
    )
  }
  else if (exercise.type === ExerciseType.Timed) {
    const timedExercise = exercise as TimedExercise;
    const seconds = timedExercise.time;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return (
      <div className="flex flex-col items-end text-sm">
        <span className="text-gray-900 select-none">
          {minutes > 0 ? `${minutes} min` : ''}
          {remainingSeconds > 0 ? `${remainingSeconds} sec` : minutes === 0 ? '0 sec' : ''}
        </span>
      </div>
    );
  }
  else if (exercise.type === ExerciseType.Count) {
    const countedExercise = exercise as CountedExercise;
    return (
      <div className="flex flex-col items-end text-sm">
        <span className="text-gray-900 select-none">{countedExercise.count} reps</span>
      </div>
    );
  }
  else {
    return (<div>Unknown exercise type</div>);
  }
}

export function renderWeightRecordProperties(record: Record) {
  if (record.type === ExerciseType.Weight) {
    const weightRecord = record as WeightRecord;
    return (
      <>
      <div className="flex flex-col items-end text-sm space-y-1">
        <span className="text-black font-medium select-none">{weightRecord.weight} {weightRecord.unit.toString()}</span>
        <span className="text-gray-500 select-none">{weightRecord.reps} reps</span>
        <span className="text-gray-500 select-none">{weightRecord.rpe} RPE</span>
      </div>
      
      </>
    )

  }
  else if (record.type === ExerciseType.Timed) {
    const timedRecord = record as TimedRecord;
    return (
      <>
      <div className="flex flex-col items-end text-sm space-y-1">
        <span className="text-black font-medium select-none">{timedRecord.time} sec</span>
      </div>
      </>
    )
  }
  else if (record.type === ExerciseType.Count) {
    const countRecord = record as CountRecord;
    return (
      <>
      <div className="flex flex-col items-end text-sm space-y-1">
        <span className="text-black font-medium select-none">{countRecord.count} reps</span>
        <span className="text-gray-500 select-none">{countRecord.rpe} RPE</span>
      </div>
      </>
    )
  }
  else {
    return <span className="text-gray-500 select-none">Unknown record type</span>
  }
}

  export const getExerciseName = async (exerciseRepositoryRef: ExerciseRepository, record: Record) => {
    const exercise = await exerciseRepositoryRef.get(
      record.exerciseId,
    );
    if (exercise) {
      return exercise.name;
    }
    return "Unknown";
  };