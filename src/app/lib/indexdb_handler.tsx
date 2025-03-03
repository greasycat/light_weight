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
    weight?: number;
    unit?: 'kg' | 'lbs';
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

    // Clear all exercises and their records
    async clearAllExercises(): Promise<boolean> {
        const db = await this.open();
        try {
            const recordTransaction = db.transaction([this.recordStore], 'readwrite');
            const recordStore = recordTransaction.objectStore(this.recordStore);
            recordStore.clear();

            // Delete all exercises
            const exerciseTransaction = db.transaction([this.exerciseStore], 'readwrite');
            const exerciseStore = exerciseTransaction.objectStore(this.exerciseStore);
            exerciseStore.clear();

            return true;
        } catch (error) {
            console.error('Error clearing exercises:', error);
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
            { name: 'Plank', type: 'core', defaultCount: '30', instruction: 'Hold position with straight back and tight core' },
            { name: 'Jumping Jacks', type: 'cardio', defaultCount: '45', instruction: 'Jump with hands above head and feet apart' },
            { name: 'Lunges', type: 'strength', defaultCount: '2s12r', instruction: 'Step forward and lower knee until both knees form 90-degree angles' },
            { name: 'Pull-ups', type: 'strength', defaultCount: '3s8r', instruction: 'Pull chin above bar with controlled movement' },
            { name: 'Mountain Climbers', type: 'cardio', defaultCount: '60', instruction: 'Alternate bringing knees to chest while in plank position' },
            { name: 'Bicep Curls', type: 'strength', defaultCount: '3s12r', instruction: 'Keep elbows fixed and curl weights toward shoulders' },
            { name: 'Burpees', type: 'cardio', defaultCount: '20', instruction: 'Drop to push-up, jump back up and reach overhead' },
            { name: 'Russian Twists', type: 'core', defaultCount: '3', instruction: 'Rotate torso side to side while seated with feet elevated' },
            { name: 'Deadlifts', type: 'strength', defaultCount: '3s10r', instruction: 'Keep back straight and push through heels when lifting' },
            { name: 'High Knees', type: 'cardio', defaultCount: '45', instruction: 'Run in place bringing knees to hip height' },
            { name: 'Dips', type: 'strength', defaultCount: '3s12r', instruction: 'Lower body between parallel bars until elbows reach 90 degrees' },
            { name: 'Side Planks', type: 'core', defaultCount: '30', instruction: 'Stack feet and raise hip off ground with straight body line' },
            { name: 'Bench Press', type: 'strength', defaultCount: '3s8r', instruction: 'Lower bar to chest and press upward with controlled movement' },
            { name: 'Jump Rope', type: 'cardio', defaultCount: '2m', instruction: 'Maintain small jumps with wrists doing most of the work' },
            { name: 'Leg Raises', type: 'core', defaultCount: '3s15r', instruction: 'Keep lower back pressed to floor while raising legs' },
            { name: 'Shoulder Press', type: 'strength', defaultCount: '3s10r', instruction: 'Press weights overhead without arching lower back' },
            { name: 'Box Jumps', type: 'cardio', defaultCount: '3', instruction: 'Jump onto box with soft landing, step back down' },
            { name: 'Superman', type: 'core', defaultCount: '3', instruction: 'Lift arms and legs off ground simultaneously while lying on stomach' }
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
                note: record.note || '',
                weight: record.weight || null,
                unit: record.unit || 'lbs'
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
            const request = index.getAll(range)
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
    async deleteRecord(recordId: number | undefined): Promise<boolean> {
        if (!recordId) {
            throw new Error('Record ID is required');
        }
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

    // Get all plans
    async getAllPlans(): Promise<Plan[]> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.planStore, 'readonly');
            const store = transaction.objectStore(this.planStore);
            const request = store.getAll();

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Add a new plan
    async addPlan(plan: Omit<Plan, 'id'>): Promise<number> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.planStore, 'readwrite');
            const store = transaction.objectStore(this.planStore);
            const request = store.add({
                ...plan,
                createdAt: new Date().toISOString(),
            });

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result as number);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Update an existing plan
    async updatePlan(id: number, plan: Plan): Promise<boolean> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.planStore, 'readwrite');
            const store = transaction.objectStore(this.planStore);
            const request = store.get(id);

            request.onsuccess = (event: Event) => {
                const existingPlan = (event.target as IDBRequest).result as Plan;
                if (!existingPlan) {
                    reject(new Error('Plan not found'));
                    return;
                }

                const updatedPlan = { ...existingPlan, ...plan };
                const updateRequest = store.put(updatedPlan);

                updateRequest.onsuccess = () => resolve(true);
                updateRequest.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            };

            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();

        });
    },
    // Delete a plan
    async deletePlan(id: number): Promise<void> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.planStore, 'readwrite');
            const store = transaction.objectStore(this.planStore);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Populate sample plans
    async populateSamplePlans(): Promise<boolean> {
        const samplePlans: Omit<Plan, 'id'>[] = [
            {
                name: 'Strength Training',
                exercises: [
                    { name: 'Push-ups', count: -1 },
                    { name: 'Pull-ups', count: -1 },
                    { name: 'Squats', count: -1 },
                ],
                schedule: '1010100', // Mon, Wed, Fri
                createdAt: new Date().toISOString(),
            },
            {
                name: 'Cardio Days',
                exercises: [
                    { name: 'Running', count: 1800 }, // 30 minutes
                    { name: 'Jumping Jacks', count: 100 },
                ],
                schedule: '0101010', // Tue, Thu, Sat
                createdAt: new Date().toISOString(),
            },
            {
                name: 'Core Workout',
                exercises: [
                    { name: 'Planks', count: 60 },
                    { name: 'Crunches', count: 50 },
                    { name: 'Russian Twists', count: 30 },
                ],
                schedule: '1111100', // Mon-Fri
                createdAt: new Date().toISOString(),
            },
        ]

        try {
            for (const plan of samplePlans) {
                await this.addPlan(plan)
            }
            return true
        } catch (error) {
            console.error('Error populating sample plans:', error)
            return false
        }
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
            await this.addPlan({
                ...basicPlan,
                createdAt: new Date().toISOString(),
            });
            await this.addPlan({
                ...cardioFocus,
                createdAt: new Date().toISOString(),
            });
            await this.addPlan({
                ...weekendWarrior,
                createdAt: new Date().toISOString(),
            });
            return true;
        } catch (error) {
            console.error('Error adding sample plans:', error);
            return false;
        }
    },

    // Update an exercise
    async updateExercise(oldName: string, updatedExercise: Exercise): Promise<boolean> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.exerciseStore], 'readwrite');
            const store = transaction.objectStore(this.exerciseStore);

            // First delete the old exercise
            const deleteRequest = store.delete(oldName);

            deleteRequest.onsuccess = () => {
                // Then add the updated exercise
                const addRequest = store.add(updatedExercise);
                addRequest.onsuccess = () => resolve(true);
                addRequest.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            };

            deleteRequest.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    async updateRecord(id: number | undefined, record: ExerciseRecord): Promise<boolean> {
        if (!id) {
            throw new Error('Record ID is required');
        }
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.recordStore], 'readwrite');
            const store = transaction.objectStore(this.recordStore);
            const request = store.get(id);

            request.onsuccess = (event: Event) => {
                const existingRecord = (event.target as IDBRequest).result as ExerciseRecord;
                if (!existingRecord) {
                    reject(new Error('Record not found'));
                    return;
                }

                const updatedRecord = { ...existingRecord, ...record };
                const updateRequest = store.put(updatedRecord);

                updateRequest.onsuccess = () => resolve(true);
                updateRequest.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            };

            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },
    // Clear all record
    async clearAllRecords(): Promise<boolean> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.recordStore], 'readwrite');
            const store = transaction.objectStore(this.recordStore);
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
            transaction.oncomplete = () => db.close();
        });
    },

    // Populate sample records
    async populateSampleRecords(): Promise<boolean> {
        try {
            // Create dates for the last 3 days
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const twoDaysAgo = new Date(today);
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            const sampleRecords: ExerciseRecord[] = [
                // Today's records
                {
                    exerciseName: 'Push-ups',
                    count: 20,
                    rpe: 7,
                    note: 'Morning session',
                    date: today.toISOString().split('T')[0],
                    time: '07:30:00',
                    weight: undefined,
                    unit: 'lbs'
                },
                {
                    exerciseName: 'Running',
                    count: 1800,
                    rpe: 6,
                    note: 'Easy morning jog',
                    date: today.toISOString().split('T')[0],
                    time: '08:15:00',
                    weight: undefined,
                    unit: 'lbs'
                },
                {
                    exerciseName: 'Bench Press',
                    count: 8,
                    rpe: 8,
                    note: 'PR attempt',
                    date: today.toISOString().split('T')[0],
                    time: '16:45:00',
                    weight: 185,
                    unit: 'lbs'
                },
                {
                    exerciseName: 'Squats',
                    count: 12,
                    rpe: 7,
                    note: 'Evening workout',
                    date: today.toISOString().split('T')[0],
                    time: '17:30:00',
                    weight: 225,
                    unit: 'lbs'
                },
                {
                    exerciseName: 'Planks',
                    count: 60,
                    rpe: 6,
                    note: 'Core finisher',
                    date: today.toISOString().split('T')[0],
                    time: '18:00:00',
                    weight: undefined,
                    unit: 'lbs'
                },

                // Yesterday's records
                {
                    exerciseName: 'Pull-ups',
                    count: 10,
                    rpe: 8,
                    note: 'Morning workout',
                    date: yesterday.toISOString().split('T')[0],
                    time: '08:00:00',
                    weight: undefined,
                    unit: 'lbs'
                },
                {
                    exerciseName: 'Deadlift',
                    count: 5,
                    rpe: 9,
                    note: 'Heavy singles',
                    date: yesterday.toISOString().split('T')[0],
                    time: '17:00:00',
                    weight: 315,
                    unit: 'lbs'
                },

                // Two days ago records
                {
                    exerciseName: 'Running',
                    count: 2400,
                    rpe: 7,
                    note: 'Long distance run',
                    date: twoDaysAgo.toISOString().split('T')[0],
                    time: '07:00:00',
                    weight: undefined,
                    unit: 'lbs'
                },
                {
                    exerciseName: 'Push-ups',
                    count: 15,
                    rpe: 6,
                    note: 'Evening session',
                    date: twoDaysAgo.toISOString().split('T')[0],
                    time: '19:30:00',
                    weight: undefined,
                    unit: 'lbs'
                }
            ];

            for (const record of sampleRecords) {
                await this.addRecord(record);
            }

            return true;
        } catch (error) {
            console.error('Error populating sample records:', error);
            return false;
        }
    },

    // Clear all plans
    async clearAllPlans(): Promise<boolean> {
        const db = await this.open()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.planStore, 'readwrite')
            const store = transaction.objectStore(this.planStore)
            const request = store.clear()

            request.onsuccess = () => resolve(true)
            request.onerror = (event: Event) => reject((event.target as IDBRequest).error)
            transaction.oncomplete = () => db.close()
        })
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
    getExerciseProgress,
};

export type { Exercise, ExerciseRecord, Plan, stats, ExerciseStats, ExerciseWithStats };