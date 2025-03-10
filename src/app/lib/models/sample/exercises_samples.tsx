import { ExerciseType } from "../exercise";

import { Unit } from "../exercise";

// WeightedExercise samples
const weightedExercises = [
    {
      id: -1,
      name: "Barbell Bench Press",
      description: "Compound chest exercise performed on a flat bench",
      type: ExerciseType.Weight,
      createdAt: new Date("2024-12-05T08:30:00Z"),
      updatedAt: new Date("2025-01-15T14:22:00Z"),
      weight: 80,
      unit: Unit.Metric,
      reps: 8,
      sets: 4,
      muscleGroups: ["chest", "triceps", "shoulders"]
    },
    {
      id: 100,
      name: "Deadlift",
      description: "Compound exercise that works multiple muscle groups",
      type: ExerciseType.Weight,
      createdAt: new Date("2024-11-18T09:45:00Z"),
      updatedAt: new Date("2025-02-03T11:10:00Z"),
      weight: 120,
      unit: Unit.Metric,
      reps: 5,
      sets: 3,
      muscleGroups: ["lower back", "hamstrings", "glutes", "traps"]
    },
    {
      id: 3,
      name: "Dumbbell Shoulder Press",
      description: "Overhead pressing movement for shoulder development",
      type: ExerciseType.Weight,
      createdAt: new Date("2025-01-07T16:20:00Z"),
      updatedAt: new Date("2025-02-20T17:35:00Z"),
      weight: 25,
      unit: Unit.Imperial,
      reps: 10,
      sets: 3,
      muscleGroups: ["shoulders", "triceps"]
    },
    {
      id: 4,
      name: "Barbell Squat",
      description: "Lower body compound movement focusing on quadriceps",
      type: ExerciseType.Weight,
      createdAt: new Date("2024-10-30T13:15:00Z"),
      updatedAt: new Date("2025-01-25T10:05:00Z"),
      weight: 100,
      unit: Unit.Metric,
      reps: 6,
      sets: 5,
      muscleGroups: ["quadriceps", "glutes", "hamstrings", "core"]
    },
    {
      id: 5,
      name: "Lat Pulldown",
      description: "Machine exercise targeting the latissimus dorsi",
      type: ExerciseType.Weight,
      createdAt: new Date("2025-01-12T11:40:00Z"),
      updatedAt: new Date("2025-02-18T14:50:00Z"),
      weight: 150,
      unit: Unit.Imperial,
      reps: 12,
      sets: 3,
      muscleGroups: ["lats", "biceps", "rhomboids"]
    }
  ];
  
  // TimedExercise samples
  const timedExercises = [
    {
      id: 6,
      name: "Plank",
      description: "Static core exercise holding a push-up position",
      type: ExerciseType.Timed,
      createdAt: new Date("2024-11-05T10:20:00Z"),
      updatedAt: new Date("2025-01-10T13:45:00Z"),
      time: 60 // seconds
    },
    {
      id: 7,
      name: "Wall Sit",
      description: "Isometric leg exercise performed against a wall",
      type: ExerciseType.Timed,
      createdAt: new Date("2024-12-15T15:30:00Z"),
      updatedAt: new Date("2025-02-05T08:25:00Z"),
      time: 45 // seconds
    },
    {
      id: 8,
      name: "Rowing Machine",
      description: "Cardio exercise that works the entire body",
      type: ExerciseType.Timed,
      createdAt: new Date("2024-10-20T07:15:00Z"),
      updatedAt: new Date("2025-01-22T16:40:00Z"),
      time: 1200 // seconds (20 minutes)
    },
    {
      id: 9,
      name: "HIIT Circuit",
      description: "High-intensity interval training circuit",
      type: ExerciseType.Timed,
      createdAt: new Date("2025-01-03T12:10:00Z"),
      updatedAt: new Date("2025-02-15T11:05:00Z"),
      time: 900 // seconds (15 minutes)
    },
    {
      id: 10,
      name: "Static Stretch",
      description: "Full body static stretching routine",
      type: ExerciseType.Timed,
      createdAt: new Date("2024-11-25T18:20:00Z"),
      updatedAt: new Date("2025-01-18T19:30:00Z"),
      time: 300 // seconds (5 minutes)
    }
  ];
  
  // CountedExercise samples
  const countedExercises = [
    {
      id: 11,
      name: "Push-ups",
      description: "Bodyweight exercise for chest, shoulders, and triceps",
      type: ExerciseType.Count,
      createdAt: new Date("2024-12-28T09:00:00Z"),
      updatedAt: new Date("2025-02-10T13:20:00Z"),
      count: 30
    },
    {
      id: 12,
      name: "Pull-ups",
      description: "Upper body compound movement using body weight",
      type: ExerciseType.Count,
      createdAt: new Date("2024-11-10T14:25:00Z"),
      updatedAt: new Date("2025-01-05T16:30:00Z"),
      count: 12
    },
    {
      id: 13,
      name: "Jumping Jacks",
      description: "Full body cardiovascular exercise",
      type: ExerciseType.Count,
      createdAt: new Date("2025-01-15T07:40:00Z"),
      updatedAt: new Date("2025-02-25T08:15:00Z"),
      count: 50
    },
    {
      id: 14,
      name: "Burpees",
      description: "Intense full body exercise combining multiple movements",
      type: ExerciseType.Count,
      createdAt: new Date("2024-10-15T17:10:00Z"),
      updatedAt: new Date("2025-01-28T15:55:00Z"),
      count: 20
    },
    {
      id: 15,
      name: "Crunches",
      description: "Abdominal exercise that primarily works the rectus abdominis",
      type: ExerciseType.Count,
      createdAt: new Date("2024-12-01T10:35:00Z"),
      updatedAt: new Date("2025-02-12T11:45:00Z"),
      count: 40
    }
  ];
  
  // Combined sample data
  const ExerciseSamples = {
    weightedExercises,
    timedExercises,
    countedExercises
  };
  
  // Export for use
  export default ExerciseSamples;