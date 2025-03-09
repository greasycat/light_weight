
import { IndexDBRepository } from './base'
import { Record } from '../../models/record';
import { RecordRepository } from '../interfaces/repository';
import { ExerciseType } from '../../models/exercise';

export default class RecordIndexDBRepository extends IndexDBRepository<Record> implements RecordRepository {
    constructor(dbName: string, storeName: string) {
        super(dbName, storeName, (db: IDBDatabase) => {
            if (!db.objectStoreNames.contains('records')) {
                const store = db.createObjectStore('records', { keyPath: 'id' , autoIncrement: true});
                store.createIndex('exerciseNameIndex', 'exerciseName', { unique: false });
                store.createIndex('exerciseTypeIndex', 'exerciseType', { unique: false });
                store.createIndex('exerciseMuscleGroupIndex', 'exerciseMuscleGroup', { unique: false });
                store.createIndex('exerciseNameIndex', 'exerciseName', { unique: false });
                store.createIndex('timestampIndex', 'timestamp', { unique: false });
            }
        });
    }

    async getAll(): Promise<Record[]> {
        return super.getAll("key");
    }

    async getByExerciseId(exerciseId: string): Promise<Record[]> {
        return super.getRange(exerciseId, "exerciseNameIndex");
    }

    async getByExerciseType(exerciseType: ExerciseType): Promise<Record[]> {
        return super.getRange(exerciseType, "exerciseTypeIndex");
    }

    async getByExerciseMuscleGroup(muscleGroups: string[]): Promise<Record[]> {
        return super.getAnyMatchedMultiEntries(muscleGroups, "exerciseMuscleGroupIndex");
    }

    async getByExerciseName(name: string): Promise<Record[]> {
        return super.getRange(name, "exerciseNameIndex");
    }

    async getByTimeRange(start: Date, end: Date): Promise<Record[]> {
        // check if start is before end
        if (start > end || isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error("Invalid date range");
        }

        const range = IDBKeyRange.bound(start, end);

        return super.getRange(range, "timestampIndex");
    }
}