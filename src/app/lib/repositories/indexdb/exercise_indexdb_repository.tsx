import { Exercise, ExerciseType, WeightedExercise } from '../../models/exercise';
import { IndexDBRepository } from './base';
import { ExerciseRepository } from '../interfaces/repository';

export default class ExerciseIndexDBRepository extends IndexDBRepository<Exercise> implements ExerciseRepository {
    constructor(dbName: string, storeName: string) {
        super(dbName, storeName, (db: IDBDatabase) => {
            if (!db.objectStoreNames.contains('exercises')) {
                const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id' , autoIncrement: true});
                exerciseStore.createIndex('nameIndex', 'name', { unique: true });
                
                // Add support for searching by type
                exerciseStore.createIndex('typeIndex', 'type', { unique: false });

                // Add support for searching by muscle groups
                exerciseStore.createIndex('muscleGroupsIndex', 'muscleGroups', { unique: false });
            }
        });
    }


    async getAll(): Promise<Exercise[]> {
        return super.getAll("key");
    }

    async getByType(type: ExerciseType): Promise<Exercise[]> {
        return super.getRange(type, "typeIndex");
    }

    async getByMuscleGroup(muscleGroups: string[]): Promise<WeightedExercise[]> {
        return super.getAnyMatchedMultiEntries(muscleGroups, "muscleGroupsIndex") as Promise<WeightedExercise[]>;
    }

    async getByName(name: string): Promise<Exercise> {
        return super.get(name, "nameIndex");
    }
    
    
}
