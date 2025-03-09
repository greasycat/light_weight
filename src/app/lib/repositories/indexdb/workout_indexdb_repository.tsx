import { Workout } from "../../models/workout";
import { IndexDBRepository } from "./base";
import { WorkoutRepository } from "../interfaces/repository";

export default class WorkoutIndexDBRepository extends IndexDBRepository<Workout> implements WorkoutRepository {
    constructor(dbName: string, storeName: string) {
        super(dbName, storeName, (db: IDBDatabase) => {
            if (!db.objectStoreNames.contains('workouts')) {
                const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' , autoIncrement: true});
                workoutStore.createIndex('planIdIndex', 'planId', { unique: false });
                workoutStore.createIndex('updatedAtIndex', 'updatedAt', { unique: false });
            }
        });
    }

    async getAll(): Promise<Workout[]> {
        return super.getAll("key");
    }

    async getById(id: number): Promise<Workout> {
        return super.get(id, "key");
    }

    async getByPlanId(planId: number): Promise<Workout[]> {
        return super.getRange(planId, "planIdIndex");
    }

    async getByDateRange(start: Date, end: Date): Promise<Workout[]> {
        return super.getRange(start, "createdAtIndex");
    }

    async getLastestWorkout(): Promise<Workout | null> {
        return super.getLast("updatedAtIndex");
    }
}    
    
    
    
