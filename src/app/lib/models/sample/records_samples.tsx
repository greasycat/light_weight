import { subDays, subHours, subMinutes } from "date-fns";
import { Unit, ExerciseType } from "../exercise";
// Sample WeightRecord data
const weightRecords = [
    {
      id: 101,
      exerciseId: 1, // Referencing Barbell Bench Press
      type: ExerciseType.Weight,
      timestamp: new Date(),
      weight: 85,
      unit: Unit.Metric,
      reps: 6,
      sets: 4,
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    },
    {
      id: 102,
      exerciseId: 2, // Referencing Deadlift
      type: ExerciseType.Weight,
      timestamp: subHours(new Date(), 1),
      weight: 130,
      unit: Unit.Metric,
      reps: 4,
      sets: 3,
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    },
    {
      id: 103,
      exerciseId: 3, // Referencing Dumbbell Shoulder Press
      type: ExerciseType.Weight,
      timestamp: subHours(new Date(), 2),
      weight: 30,
      unit: Unit.Imperial,
      reps: 8,
      sets: 3,
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    },
    {
      id: 104,
      exerciseId: 4, // Referencing Barbell Squat
      type: ExerciseType.Weight,
      timestamp: subDays(new Date(), 1),
      weight: 110,
      unit: Unit.Metric,
      reps: 5,
      sets: 4,
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    },
    {
      id: 105,
      exerciseId: 5, // Referencing Lat Pulldown
      type: ExerciseType.Weight,
      timestamp: new Date("2025-02-18T14:10:00Z"),
      weight: 160,
      unit: Unit.Imperial,
      reps: 10,
      sets: 3,
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    }
  ];
  
  // Sample TimedRecord data
  const timedRecords = [
    {
      id: 201,
      exerciseId: 6, // Referencing Plank
      type: ExerciseType.Timed,
      timestamp: new Date("2025-02-11T11:20:00Z"),
      time: 75, // seconds
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    },
    {
      id: 202,
      exerciseId: 7, // Referencing Wall Sit
      type: ExerciseType.Timed,
      timestamp: new Date("2025-02-13T15:40:00Z"),
      time: 60, // seconds
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    },
    {
      id: 203,
      exerciseId: 8, // Referencing Rowing Machine
      type: ExerciseType.Timed,
      timestamp: new Date("2025-02-15T07:30:00Z"),
      time: 1350, // seconds (22.5 minutes)
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    },
    {
      id: 204,
      exerciseId: 9, // Referencing HIIT Circuit
      type: ExerciseType.Timed,
      timestamp: new Date("2025-02-17T12:15:00Z"),
      time: 1080, // seconds (18 minutes)
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    },
    {
      id: 205,
      exerciseId: 10, // Referencing Static Stretch
      type: ExerciseType.Timed,
      timestamp: new Date("2025-02-19T18:05:00Z"),
      time: 360, // seconds (6 minutes)
      rpe: 8
    }
  ];
  
  // Sample CountRecord data
  const countRecords = [
    {
      id: 301,
      exerciseId: 11, // Referencing Push-ups
      type: ExerciseType.Count,
      timestamp: new Date("2025-02-10T17:25:00Z"),
      count: 35,
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    },
    {
      id: 302,
      exerciseId: 12, // Referencing Pull-ups
      type: ExerciseType.Count,
      timestamp: new Date("2025-02-12T18:30:00Z"),
      count: 15,
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    },
    {
      id: 303,
      exerciseId: 13, // Referencing Jumping Jacks
      type: ExerciseType.Count,
      timestamp: new Date("2025-02-14T07:45:00Z"),
      count: 60,
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    },
    {
      id: 304,
      exerciseId: 14, // Referencing Burpees
      type: ExerciseType.Count,
      timestamp: new Date("2025-02-16T16:40:00Z"),
      count: 25,
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    },
    {
      id: 305,
      exerciseId: 15, // Referencing Crunches
      type: ExerciseType.Count,
      timestamp: new Date("2025-02-18T10:50:00Z"),
      count: 45,
      rpe: 8,
      notes: "Good form, slow down on the eccentric"
    }
  ];
  
  // Combined sample record data
  const RecordSamples = {
    weightRecords,
    timedRecords,
    countRecords
  };
  
  // Export for use
  export default RecordSamples;