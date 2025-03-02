// Define interfaces for our data structures
interface Exercise {
    name: string;
    type: 'strength' | 'cardio' | 'core';
    defaultCount: string;
    instruction: string;
}

interface ExerciseRecord {
    id?: number;
    exerciseName: string;
    date: string;
    time: string;
    count: number;
    rpe: number | null;
    note: string;
}

interface PlanExercise {
    name: string;
    count: number; // -1 means use default
}

interface Plan {
    id?: number;
    name: string;
    exercises: PlanExercise[];
    schedule: string; // e.g., "0101010" for Monday, Wednesday, Friday
    createdAt: string;
    updatedAt?: string;
}

interface stats {
    totalWorkouts: number;
    averageCount: number;
    maxCount: number;
    minCount: number;
    lastWorkout: ExerciseRecord;
    firstWorkout: ExerciseRecord;
    improvement: number | string;
    averageRPE?: number;
}

interface ExerciseStats {
    exerciseName: string;
    stats: stats | null;
}

interface ExerciseWithStats extends Exercise {
    stats: ExerciseStats['stats'];
}

const ExerciseDB = {
    // Database configuration
    dbName: 'exerciseDB',
    dbVersion: 1,
    exerciseStore: 'exercises',
    recordStore: 'records',
    planStore: 'plans',

    // Core Database Functions
    // -----------------------

    // Open connection to database
    open(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.exerciseStore)) {
                    db.createObjectStore(this.exerciseStore, { keyPath: 'name' });
                }
                if (!db.objectStoreNames.contains(this.recordStore)) {
                    const recordStore = db.createObjectStore(this.recordStore, { keyPath: 'id', autoIncrement: true });
                    recordStore.createIndex('exerciseNameIndex', 'exerciseName', { unique: false });
                    recordStore.createIndex('dateIndex', 'date', { unique: false });
                }
                if (!db.objectStoreNames.contains(this.planStore)) {
                    const planStore = db.createObjectStore(this.planStore, { keyPath: 'id', autoIncrement: true });
                    planStore.createIndex('nameIndex', 'name', { unique: true });
                }
            };

            request.onsuccess = (event: Event) => resolve((event.target as IDBOpenDBRequest).result);
            request.onerror = (event: Event) => reject((event.target as IDBOpenDBRequest).error);
        });
    },

    // Check if table exists and create if not
    async initializeDB(): Promise<boolean> {
        try {
            const db = await this.open();
            db.close();
            return true;
        } catch (error) {
            console.error('Failed to initialize database:', error);
            return false;
        }
    },

    // Exercise Functions
    // -----------------

    // Add a single exercise
    async addExercise(exercise: Exercise): Promise<boolean> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.exerciseStore], 'readwrite');
            const store = transaction.objectStore(this.exerciseStore);
            const request = store.put(exercise);

            request.onsuccess = () => resolve(true);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Get a single exercise by name
    async getExercise(exerciseName: string): Promise<Exercise | undefined> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.exerciseStore], 'readonly');
            const store = transaction.objectStore(this.exerciseStore);
            const request = store.get(exerciseName);

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Get all exercises
    async getAllExercises(): Promise<Exercise[]> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.exerciseStore], 'readonly');
            const store = transaction.objectStore(this.exerciseStore);
            const request = store.getAll();

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Delete an exercise and all its associated records
    async deleteExercise(exerciseName: string): Promise<boolean> {
        const db = await this.open();

        try {
            // First get all records for this exercise
            const records: ExerciseRecord[] = await this.getRecordsByExercise(exerciseName);

            // Delete each record
            const recordTransaction = db.transaction([this.recordStore], 'readwrite');
            const recordStore = recordTransaction.objectStore(this.recordStore);

            for (const record of records) {
                if (record.id) {
                    recordStore.delete(record.id);
                }
            }

            // Now delete the exercise itself
            const exerciseTransaction = db.transaction([this.exerciseStore], 'readwrite');
            const exerciseStore = exerciseTransaction.objectStore(this.exerciseStore);
            exerciseStore.delete(exerciseName);

            return true;
        } catch (error) {
            console.error('Error deleting exercise:', error);
            return false;
        } finally {
            db.close();
        }
    },

    // Add multiple exercises at once
    async populateSampleExercises(): Promise<boolean> {
        const sampleExercises: Exercise[] = [
            { name: 'Push-ups', type: 'strength', defaultCount: '3s10r', instruction: 'Keep your back straight and lower your chest to the ground' },
            { name: 'Squats', type: 'strength', defaultCount: '3s15r', instruction: 'Keep your knees aligned with your toes' },
            { name: 'Plank', type: 'core', defaultCount: '30s', instruction: 'Hold position with straight back and tight core' },
            { name: 'Jumping Jacks', type: 'cardio', defaultCount: '45', instruction: 'Jump with hands above head and feet apart' },
            { name: 'Lunges', type: 'strength', defaultCount: '2s12r', instruction: 'Step forward and lower knee until both knees form 90-degree angles' }
        ];

        const db = await this.open();
        const transaction = db.transaction([this.exerciseStore], 'readwrite');
        const store = transaction.objectStore(this.exerciseStore);

        return new Promise((resolve, reject) => {
            let successCount = 0;

            sampleExercises.forEach(exercise => {
                const request = store.put(exercise);
                request.onsuccess = () => {
                    successCount++;
                    if (successCount === sampleExercises.length) {
                        resolve(true);
                    }
                };
                request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            });

            transaction.oncomplete = () => db.close();
        });
    },

    // Record Functions
    // ---------------

    // Add an exercise record
    async addRecord(record: Omit<ExerciseRecord, 'id'>): Promise<number> {
        if (typeof record.count !== 'number') {
            record.count = parseInt(record.count as unknown as string, 10);
        }

        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.recordStore], 'readwrite');
            const store = transaction.objectStore(this.recordStore);
            const request = store.add({
                exerciseName: record.exerciseName,
                date: record.date || new Date().toISOString().split('T')[0],
                time: record.time || new Date().toTimeString().split(' ')[0],
                count: record.count,
                rpe: record.rpe || null,
                note: record.note || ''
            });

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result as number);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Get records for a specific exercise
    async getRecordsByExercise(exerciseName: string): Promise<ExerciseRecord[]> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.recordStore], 'readonly');
            const store = transaction.objectStore(this.recordStore);
            const index = store.index('exerciseNameIndex');
            const request = index.getAll(exerciseName);

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Get records by date range
    async getRecordsByDateRange(startDate: string, endDate: string): Promise<ExerciseRecord[]> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.recordStore], 'readonly');
            const store = transaction.objectStore(this.recordStore);
            const index = store.index('dateIndex');
            const range = IDBKeyRange.bound(startDate, endDate);
            const request = index.getAll(range);

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Get all records
    async getAllRecords(): Promise<ExerciseRecord[]> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.recordStore], 'readonly');
            const store = transaction.objectStore(this.recordStore);
            const request = store.getAll();

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Delete a record by ID
    async deleteRecord(recordId: number): Promise<boolean> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.recordStore], 'readwrite');
            const store = transaction.objectStore(this.recordStore);
            const request = store.delete(recordId);

            request.onsuccess = () => resolve(true);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Plan Functions
    // -------------

    // Create a new workout plan
    async addPlan(plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.planStore], 'readwrite');
            const store = transaction.objectStore(this.planStore);

            // Ensure required structure
            if (!plan.name) {
                reject(new Error('Plan must have a name'));
                return;
            }

            if (!Array.isArray(plan.exercises) || plan.exercises.length === 0) {
                reject(new Error('Plan must contain exercises'));
                return;
            }

            // Validate exercises structure
            for (const exercise of plan.exercises) {
                if (!exercise.name || !('count' in exercise)) {
                    reject(new Error('Each exercise must have a name and count'));
                    return;
                }
            }

            // Validate schedule format (e.g., "0100101")
            if (!/^[01]{7}$/.test(plan.schedule)) {
                reject(new Error('Schedule must be a 7-character string of 0s and 1s'));
                return;
            }

            const request = store.add({
                name: plan.name,
                exercises: plan.exercises,
                schedule: plan.schedule,
                createdAt: new Date().toISOString()
            });

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result as number);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Get all workout plans
    async getAllPlans(): Promise<Plan[]> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.planStore], 'readonly');
            const store = transaction.objectStore(this.planStore);
            const request = store.getAll();

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Get plan by ID
    async getPlan(planId: number): Promise<Plan | undefined> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.planStore], 'readonly');
            const store = transaction.objectStore(this.planStore);
            const request = store.get(planId);

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Get plan by name
    async getPlanByName(planName: string): Promise<Plan | undefined> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.planStore], 'readonly');
            const store = transaction.objectStore(this.planStore);
            const index = store.index('nameIndex');
            const request = index.get(planName);

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Update an existing plan
    async updatePlan(planId: number, updatedPlan: Partial<Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
        const db = await this.open();
        return new Promise(async (resolve, reject) => {
            try {
                // Get the current plan
                const transaction = db.transaction([this.planStore], 'readwrite');
                const store = transaction.objectStore(this.planStore);
                const getCurrentPlan = store.get(planId);

                getCurrentPlan.onsuccess = (event: Event) => {
                    const currentPlan = (event.target as IDBRequest).result as Plan;

                    if (!currentPlan) {
                        reject(new Error(`Plan with ID ${planId} not found`));
                        return;
                    }

                    // Update fields
                    const plan: Plan = {
                        ...currentPlan,
                        name: updatedPlan.name || currentPlan.name,
                        exercises: updatedPlan.exercises || currentPlan.exercises,
                        schedule: updatedPlan.schedule || currentPlan.schedule,
                        updatedAt: new Date().toISOString()
                    };

                    // Validate schedule format (e.g., "0100101")
                    if (!/^[01]{7}$/.test(plan.schedule)) {
                        reject(new Error('Schedule must be a 7-character string of 0s and 1s'));
                        return;
                    }

                    // Save updated plan
                    const updateRequest = store.put(plan);

                    updateRequest.onsuccess = () => resolve(true);
                    updateRequest.onerror = (event: Event) => reject((event.target as IDBRequest).error);
                };

                getCurrentPlan.onerror = (event: Event) => reject((event.target as IDBRequest).error);
                transaction.oncomplete = () => db.close();
            } catch (error) {
                db.close();
                reject(error);
            }
        });
    },

    // Delete a plan
    async deletePlan(planId: number): Promise<boolean> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.planStore], 'readwrite');
            const store = transaction.objectStore(this.planStore);
            const request = store.delete(planId);

            request.onsuccess = () => resolve(true);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Get plan for today
    async getTodayPlans(): Promise<Plan[]> {
        const plans = await this.getAllPlans();
        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Filter plans that are scheduled for today
        return plans.filter(plan => {
            const scheduleArray = plan.schedule.split('');
            // Adjust for Sunday being 0 in JS but 6 in our schedule string
            const dayIndex = today === 0 ? 6 : today - 1;
            return scheduleArray[dayIndex] === '1';
        });
    },

    // Statistics and Analysis Functions
    // --------------------------------

    // Get statistics for an exercise
    async getExerciseStats(exerciseName: string): Promise<ExerciseStats> {
        const records = await this.getRecordsByExercise(exerciseName);

        if (records.length === 0) {
            return {
                exerciseName,
                stats: null
            };
        }

        // Get all count values
        const counts = records.map(record => record.count);

        // Calculate basic statistics
        const stats = {
            totalWorkouts: records.length,
            averageCount: counts.reduce((sum, count) => sum + count, 0) / counts.length,
            maxCount: Math.max(...counts),
            minCount: Math.min(...counts),
            lastWorkout: records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0],
            firstWorkout: records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0],
            improvement: 0,
            averageRPE: 0
        };

        // Calculate improvement from first to best
        if (stats.firstWorkout && stats.maxCount > stats.firstWorkout.count) {
            stats.improvement = Number(((stats.maxCount - stats.firstWorkout.count) / stats.firstWorkout.count * 100).toFixed(1));
        }

        // Get average RPE if available
        const rpeCounts = records.filter(r => r.rpe !== null && r.rpe !== undefined).map(r => r.rpe as number);
        if (rpeCounts.length > 0) {
            stats.averageRPE = rpeCounts.reduce((sum, rpe) => sum + rpe, 0) / rpeCounts.length;
        }

        return {
            exerciseName,
            stats
        };
    },

    // Get all exercises with statistics
    async getExercisesWithStats(): Promise<ExerciseWithStats[]> {
        const exercises = await this.getAllExercises();
        const result: ExerciseWithStats[] = [];

        for (const exercise of exercises) {
            const stats = await this.getExerciseStats(exercise.name);
            result.push({
                ...exercise,
                stats: stats.stats
            });
        }

        return result;
    },

    // Sample Data Functions
    // --------------------

    // Populate sample exercises and plans
    async populateSampleData(): Promise<boolean> {
        // First add sample exercises
        await this.populateSampleExercises();

        // Then add some sample plans
        const basicPlan = {
            name: 'Basic Fitness',
            exercises: [
                { name: 'Push-ups', count: -1 },
                { name: 'Jumping Jacks', count: 50 },
                { name: 'Squats', count: -1 }
            ],
            schedule: '1010100' // Monday, Wednesday, Friday
        };

        const cardioFocus = {
            name: 'Cardio Focus',
            exercises: [
                { name: 'Jumping Jacks', count: 100 },
                { name: 'Plank', count: 30 }
            ],
            schedule: '0101010' // Tuesday, Thursday, Saturday
        };

        const weekendWarrior = {
            name: 'Weekend Warrior',
            exercises: [
                { name: 'Push-ups', count: 20 },
                { name: 'Squats', count: 25 },
                { name: 'Plank', count: 60 },
                { name: 'Lunges', count: 30 }
            ],
            schedule: '0000011' // Saturday, Sunday
        };

        try {
            await this.addPlan(basicPlan);
            await this.addPlan(cardioFocus);
            await this.addPlan(weekendWarrior);
            return true;
        } catch (error) {
            console.error('Error adding sample plans:', error);
            return false;
        }
    },
};

// Helper Functions
// ---------------

// Initialize database and check for existing data
async function initializeExerciseDatabase(): Promise<{
    exercises: Exercise[];
    records: ExerciseRecord[];
    plans: Plan[];
}> {
    await ExerciseDB.initializeDB();
    const existingExercises = await ExerciseDB.getAllExercises();
    const existingPlans = await ExerciseDB.getAllPlans();

    if (existingExercises.length === 0) {
        // If no exercises exist, populate with sample data
        await ExerciseDB.populateSampleData();
        console.log('Sample exercises and plans added to database');
    } else if (existingPlans.length === 0 && existingExercises.length > 0) {
        // If exercises exist but no plans, just add sample plans
        await ExerciseDB.populateSampleData();
        console.log('Sample plans added to database');
    } else {
        console.log('Database already contains exercises and plans');
    }

    return {
        exercises: await ExerciseDB.getAllExercises(),
        records: await ExerciseDB.getAllRecords(),
        plans: await ExerciseDB.getAllPlans()
    };
}

// Add a new exercise record
async function addExerciseRecord(
    exerciseName: string,
    count: number,
    rpe: number | null,
    note: string,
    date?: string,
    time?: string
): Promise<number> {
    const record = {
        exerciseName,
        count,
        rpe,
        note,
        date: date || new Date().toISOString().split('T')[0],
        time: time || new Date().toTimeString().split(' ')[0]
    };

    const recordId = await ExerciseDB.addRecord(record);
    console.log(`Record added with ID: ${recordId}`);
    return recordId;
}

// Delete an exercise and its records
async function deleteExerciseAndRecords(exerciseName: string): Promise<boolean> {
    const success = await ExerciseDB.deleteExercise(exerciseName);
    if (success) {
        console.log(`Exercise '${exerciseName}' and all its records have been deleted`);
    } else {
        console.error(`Failed to delete exercise '${exerciseName}'`);
    }
    return success;
}

// Create a workout plan
async function createWorkoutPlan(
    name: string,
    exercises: PlanExercise[],
    schedule: string
): Promise<number | null> {
    try {
        const planId = await ExerciseDB.addPlan({
            name,
            exercises,
            schedule
        });
        console.log(`Workout plan '${name}' created with ID: ${planId}`);
        return planId;
    } catch (error) {
        console.error('Failed to create workout plan:', error);
        return null;
    }
}

// Create a sample plan
async function createSamplePlan(): Promise<number | null> {
    const exercises: PlanExercise[] = [
        { name: 'Push-ups', count: -1 }, // Use default count
        { name: 'Squats', count: 20 },   // Override default count
        { name: 'Plank', count: 45 }     // Override default count
    ];

    // Schedule for Monday, Wednesday, Friday (0101010)
    return await createWorkoutPlan('Beginner Strength', exercises, '0101010');
}

interface PlanWithDefaultCounts extends Plan {
    exercises: (PlanExercise & { defaultCount?: string })[];
}

// Get today's workout plans
async function getTodaysWorkout(): Promise<PlanWithDefaultCounts[]> {
    const todayPlans = await ExerciseDB.getTodayPlans();

    if (todayPlans.length === 0) {
        console.log('No workouts scheduled for today');
        return [];
    }

    // Process plans to include default counts from exercise definitions
    for (const plan of todayPlans) {
        for (const exercise of plan.exercises) {
                if (exercise.count === -1) {
                    // Fetch the default count for this exercise
                    const exerciseData = await ExerciseDB.getExercise(exercise.name);
                    if (exerciseData) {
            try {
                        // check type of exerciseData
                        if (exerciseData.type === 'strength') {
                            // separate sets and reps with regex matching 3s4r
                            const setsAndReps = exerciseData.defaultCount.match(/(\d+)s(\d+)r/);
                            if (setsAndReps) {
                                exercise.count = parseInt(setsAndReps[1]);
                            }
                            else {
                                exercise.count = 0;
                            }
                        }
                        else if (exerciseData.type === 'cardio') {

                            exercise.count = parseInt(exerciseData.defaultCount);
                        }
                        else if (exerciseData.type === 'core') {
                            exercise.count = parseInt(exerciseData.defaultCount);
                        }
                    }
            catch (error) {
                console.error('Error fetching exercise data:', error);
                exercise.count = 0;
            }
        }
            }
        }
    }

    console.log(`Found ${todayPlans.length} workout(s) for today`);
    return todayPlans as PlanWithDefaultCounts[];
}

// Get exercise statistics
async function getExerciseProgress(exerciseName: string): Promise<ExerciseStats | null> {
    const stats = await ExerciseDB.getExerciseStats(exerciseName);

    if (stats.stats!.totalWorkouts === 0) {
        console.log(`No workout records found for ${exerciseName}`);
        return null;
    }

    console.log(`Stats for ${exerciseName}:`);
    console.log(`Total workouts: ${stats.stats!.totalWorkouts}`);
    console.log(`Average count: ${stats.stats!.averageCount.toFixed(1)}`);
    console.log(`Max count: ${stats.stats!.maxCount}`);
    console.log(`Improvement: ${stats.stats!.improvement}%`);

    if (stats.stats!.averageRPE !== undefined) {
        console.log(`Average RPE: ${stats.stats!.averageRPE.toFixed(1)}`);
    }

    return stats;
}

export {
    ExerciseDB,
    initializeExerciseDatabase,
    addExerciseRecord,
    deleteExerciseAndRecords,
    createWorkoutPlan,
    createSamplePlan,
    getTodaysWorkout,
    getExerciseProgress,
    // Type exports
};

export type { Exercise, ExerciseRecord, Plan, stats, ExerciseStats, ExerciseWithStats };