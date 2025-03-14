import { REPOSITORY_CONSTANTS } from '../constants';
import ExerciseIndexDBRepository from './indexdb/exercise_indexdb_repository';
import WorkoutIndexDBRepository from './indexdb/workout_indexdb_repository';
import PlanIndexDBRepository from './indexdb/plan_indexdb_repository';
import RecordIndexDBRepository from './indexdb/record_indexdb_repository';

type RepositoryBackend = 'indexdb' | 'postgres';

class RepositoryFactory {
    static getExerciseRepository(backend: RepositoryBackend) {
        switch (backend) {
            case 'indexdb':
            default:
                return new ExerciseIndexDBRepository(
                    REPOSITORY_CONSTANTS.INDEXDB.EXERCISE.DB_NAME,
                    REPOSITORY_CONSTANTS.INDEXDB.EXERCISE.STORE_NAME);
        }
    }

    static getWorkoutRepository(backend: RepositoryBackend) {
        switch (backend) {
            case 'indexdb':
            default:
                return new WorkoutIndexDBRepository(
                    REPOSITORY_CONSTANTS.INDEXDB.WORKOUT.DB_NAME,
                    REPOSITORY_CONSTANTS.INDEXDB.WORKOUT.STORE_NAME);
        }
    }

    static getPlanRepository(backend: RepositoryBackend) {
        switch (backend) {
            case 'indexdb':
            default:
                return new PlanIndexDBRepository(
                    REPOSITORY_CONSTANTS.INDEXDB.PLAN.DB_NAME,
                    REPOSITORY_CONSTANTS.INDEXDB.PLAN.STORE_NAME);
        }
    }

    static getRecordRepository(backend: RepositoryBackend) {
        switch (backend) {
            case 'indexdb':
            default:
                return new RecordIndexDBRepository(
                    REPOSITORY_CONSTANTS.INDEXDB.RECORD.DB_NAME,
                    REPOSITORY_CONSTANTS.INDEXDB.RECORD.STORE_NAME);

        }
    }

}
    
    

export default RepositoryFactory;