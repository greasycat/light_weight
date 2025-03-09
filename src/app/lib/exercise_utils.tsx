import React from 'react';
import { CountedExercise, Exercise, TimedExercise, WeightedExercise } from './models/exercise';

export function renderTypeBadge(exercise: Exercise) {
  if ('weight' in exercise) {
    return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Weight</span>
  }
  else if ('time' in exercise) {
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Timed</span>
  }
  else if ('count' in exercise) {
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Count</span>
  }
  else {
    return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Unknown</span>
  }
}

export function renderTypeCount(exercise: Exercise) {
  if ('weight' in exercise) {
    const weightedExercise = exercise as WeightedExercise;
    return (
      <div className="flex flex-col items-end text-sm">
        <span className="font-medium text-gray-900 select-none">{weightedExercise.sets} sets</span>
        <span className="text-gray-600 select-none">{weightedExercise.reps} reps</span>
      </div>
    )
  }
  else if ('time' in exercise) {
    const timedExercise = exercise as TimedExercise;
    const seconds = timedExercise.time;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return (
      <div className="flex flex-col items-end text-sm">
        <span className="font-medium text-gray-900 select-none">
          {minutes > 0 ? `${minutes} min` : ''}
          {remainingSeconds > 0 ? `${remainingSeconds} sec` : minutes === 0 ? '0 sec' : ''}
        </span>
      </div>
    );
  }
  else if ('count' in exercise) {
    const countedExercise = exercise as CountedExercise;
    return (
      <div className="flex flex-col items-end text-sm">
        <span className="font-medium text-gray-900 select-none">{countedExercise.count} reps</span>
      </div>
    );
  }
  else {
    return (<div>Unknown exercise type</div>);
  }
}