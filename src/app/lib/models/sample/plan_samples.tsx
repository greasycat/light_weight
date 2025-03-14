import { Plan } from '../plan';

const PlanSamples: Plan[] = [
  {
    id: 1,
    name: "Full Body Strength",
    description: "Complete full body workout focusing on compound movements",
    exerciseIds: [1, 4, 7, 9, 12, 15],
    updatedAt: new Date("2025-03-01T14:30:00Z"),
    createdAt: new Date("2025-02-15T09:45:00Z"),
    schedule: 0b0101010 // Monday, Wednesday, Friday
  },
  {
    id: 2,
    name: "Upper Body Focus",
    description: "Build upper body strength with targeted exercises",
    exerciseIds: [2, 5, 8, 11, 14],
    updatedAt: new Date("2025-03-05T16:20:00Z"),
    createdAt: new Date("2025-01-10T11:30:00Z"),
    schedule: 0b0001100 // Tuesday, Wednesday
  },
  {
    id: 3,
    name: "Lower Body Power",
    description: "Develop leg strength and power with these exercises",
    exerciseIds: [3, 6, 9, 12, 18],
    updatedAt: new Date("2025-03-10T10:15:00Z"),
    createdAt: new Date("2025-02-28T08:00:00Z"),
    schedule: 0b0100001 // Monday, Saturday
  },
  {
    id: 4,
    name: "Weekend Warrior",
    description: "Intense full body workout for weekend athletes",
    exerciseIds: [1, 3, 5, 7, 9, 11, 13, 15],
    updatedAt: new Date("2025-03-12T18:45:00Z"),
    createdAt: new Date("2025-01-05T13:20:00Z"),
    schedule: 0b1000001 // Sunday, Saturday
  },
  {
    id: 5,
    name: "Daily Mobility",
    description: "Quick mobility routine to improve flexibility and reduce pain",
    exerciseIds: [20, 21, 22, 23, 24],
    updatedAt: new Date("2025-03-08T07:30:00Z"),
    createdAt: new Date("2025-02-01T06:15:00Z"),
    schedule: 0b1111111 // Every day
  },
  {
    id: 6,
    name: "Midweek Refresh",
    description: "Moderate intensity workout to energize your week",
    exerciseIds: [10, 13, 16, 19, 22],
    updatedAt: new Date("2025-03-11T12:00:00Z"),
    createdAt: new Date("2025-02-20T15:30:00Z"),
    schedule: 0b0010100 // Tuesday, Thursday
  },
  {
    id: 7,
    name: "Recovery Day",
    description: "Light exercises focused on recovery and rehabilitation",
    exerciseIds: [25, 26, 27, 28],
    updatedAt: new Date("2025-03-07T09:00:00Z"),
    createdAt: new Date("2025-01-25T10:45:00Z"),
    schedule: 0b1000000 // Sunday only
  },
  {
    id: 8,
    name: "Lunch Break Express",
    description: "Quick 30-minute workout for busy professionals",
    exerciseIds: [5, 10, 15, 20, 25],
    updatedAt: new Date("2025-03-09T13:15:00Z"),
    createdAt: new Date("2025-03-01T11:20:00Z"),
    schedule: 0b0111110 // Monday through Friday
  }
];

// // Helper function to get day names from schedule bitmask
// const getDaysFromSchedule = (schedule: number): string[] => {
//   const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//   return days.filter((_, index) => (schedule & (1 << (6 - index))) !== 0);
// };

export default PlanSamples;