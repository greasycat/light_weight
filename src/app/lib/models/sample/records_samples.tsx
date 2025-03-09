// Sample WeightRecord data
const weightRecords = [
    {
      id: 101,
      exerciseId: 1, // Referencing Barbell Bench Press
      type: "weight",
      timestamp: new Date("2025-02-10T09:15:00Z"),
      weight: 85,
      unit: "metric",
      reps: 6,
      sets: 4
    },
    {
      id: 102,
      exerciseId: 2, // Referencing Deadlift
      type: "weight",
      timestamp: new Date("2025-02-12T10:30:00Z"),
      weight: 130,
      unit: "metric",
      reps: 4,
      sets: 3
    },
    {
      id: 103,
      exerciseId: 3, // Referencing Dumbbell Shoulder Press
      type: "weight",
      timestamp: new Date("2025-02-14T16:45:00Z"),
      weight: 30,
      unit: "imperial",
      reps: 8,
      sets: 3
    },
    {
      id: 104,
      exerciseId: 4, // Referencing Barbell Squat
      type: "weight",
      timestamp: new Date("2025-02-15T08:20:00Z"),
      weight: 110,
      unit: "metric",
      reps: 5,
      sets: 4
    },
    {
      id: 105,
      exerciseId: 5, // Referencing Lat Pulldown
      type: "weight",
      timestamp: new Date("2025-02-18T14:10:00Z"),
      weight: 160,
      unit: "imperial",
      reps: 10,
      sets: 3
    }
  ];
  
  // Sample TimedRecord data
  const timedRecords = [
    {
      id: 201,
      exerciseId: 6, // Referencing Plank
      type: "timed",
      timestamp: new Date("2025-02-11T11:20:00Z"),
      time: 75 // seconds
    },
    {
      id: 202,
      exerciseId: 7, // Referencing Wall Sit
      type: "timed",
      timestamp: new Date("2025-02-13T15:40:00Z"),
      time: 60 // seconds
    },
    {
      id: 203,
      exerciseId: 8, // Referencing Rowing Machine
      type: "timed",
      timestamp: new Date("2025-02-15T07:30:00Z"),
      time: 1350 // seconds (22.5 minutes)
    },
    {
      id: 204,
      exerciseId: 9, // Referencing HIIT Circuit
      type: "timed",
      timestamp: new Date("2025-02-17T12:15:00Z"),
      time: 1080 // seconds (18 minutes)
    },
    {
      id: 205,
      exerciseId: 10, // Referencing Static Stretch
      type: "timed",
      timestamp: new Date("2025-02-19T18:05:00Z"),
      time: 360 // seconds (6 minutes)
    }
  ];
  
  // Sample CountRecord data
  const countRecords = [
    {
      id: 301,
      exerciseId: 11, // Referencing Push-ups
      type: "count",
      timestamp: new Date("2025-02-10T17:25:00Z"),
      count: 35
    },
    {
      id: 302,
      exerciseId: 12, // Referencing Pull-ups
      type: "count",
      timestamp: new Date("2025-02-12T18:30:00Z"),
      count: 15
    },
    {
      id: 303,
      exerciseId: 13, // Referencing Jumping Jacks
      type: "count",
      timestamp: new Date("2025-02-14T07:45:00Z"),
      count: 60
    },
    {
      id: 304,
      exerciseId: 14, // Referencing Burpees
      type: "count",
      timestamp: new Date("2025-02-16T16:40:00Z"),
      count: 25
    },
    {
      id: 305,
      exerciseId: 15, // Referencing Crunches
      type: "count",
      timestamp: new Date("2025-02-18T10:50:00Z"),
      count: 45
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