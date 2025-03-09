import { Plan } from "../../models/plan";
import { PlanRepository } from "../interfaces/repository";
import { IndexDBRepository } from "./base";

export default class PlanIndexDBRepository extends IndexDBRepository<Plan> implements PlanRepository {
    constructor(dbName: string, storeName: string) {
        super(dbName, storeName, (db: IDBDatabase) => {
            if (!db.objectStoreNames.contains('plans')) {
                const planStore = db.createObjectStore('plans', { keyPath: 'id' , autoIncrement: true});
                planStore.createIndex('nameIndex', 'name', { unique: true });
                planStore.createIndex('exercisesIndex', 'exerciseIds', { unique: false , multiEntry: true});
                planStore.createIndex('createdAtIndex', 'createdAt', { unique: false });
                planStore.createIndex('updatedAtIndex', 'updatedAt', { unique: false });
            }
        });
    }

    async getAll(): Promise<Plan[]> {
        return super.getAll("key");
    }

    async getById(id: number): Promise<Plan> {
        return super.get(id, "key");
    }

    async getByName(name: string): Promise<Plan[]> {
        return super.getRange(name, "nameIndex");
    }

    async getByExercises(exerciseIds: number[]): Promise<Plan[]> {
        return super.getAnyMatchedMultiEntries(exerciseIds, "exercisesIndex");
    }
}
