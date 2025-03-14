import { ExerciseRepository, PlanRepository, RecordRepository, WorkoutRepository } from "./interfaces/repository";
import ExerciseSamples from "../models/sample/exercises_samples";
import { WeightedExercise, TimedExercise, CountedExercise } from "../models/exercise";

import RecordSamples from "../models/sample/records_samples";
import { WeightRecord, TimedRecord, CountRecord } from "../models/record";
import PlanSamples from "../models/sample/plan_samples";

class SampleFactory {
    static async generateExercises(repository: ExerciseRepository): Promise<void> {
        let failed_to_add = [];
        for (const exercise of ExerciseSamples.weightedExercises) {
            try {
                await repository.add(exercise as WeightedExercise);
            } catch (error) {
                console.log("Error adding exercise: ", exercise.name);
                failed_to_add.push(exercise.name);
            }
        }

        for (const exercise of ExerciseSamples.timedExercises) {
            try {
                await repository.add(exercise as TimedExercise);
            } catch (error) {
                console.log("Error adding exercise: ", exercise.name);
                failed_to_add.push(exercise.name);
            }
        }

        for (const exercise of ExerciseSamples.countedExercises) {
            try {
                await repository.add(exercise as CountedExercise);
            } catch (error) {
                console.log("Error adding exercise: ", exercise.name);
                failed_to_add.push(exercise.name);
            }
        }

        if (failed_to_add.length > 0) {
            throw new Error("Failed to add exercises: " + failed_to_add.join(", "));
        }
    }

    static async generateRecords(repository: RecordRepository): Promise<void> {
        let failed_to_add = [];
        for (const record of RecordSamples.weightRecords) {
            try {
                await repository.add(record as WeightRecord);
            } catch (error) {
                console.log("Error adding record: ", record.id);
                failed_to_add.push(record.id);
            }
        }

        for (const record of RecordSamples.timedRecords) {
            try {
                await repository.add(record as TimedRecord);
            } catch (error) {
                console.log("Error adding record: ", record.id);
                failed_to_add.push(record.id);
            }
        }

        for (const record of RecordSamples.countRecords) {
            try {
                await repository.add(record as CountRecord);
            } catch (error) {
                console.log("Error adding record: ", record.id);
                failed_to_add.push(record.id);
            }
        }

        if (failed_to_add.length > 0) {
            throw new Error("Failed to add records: " + failed_to_add.join(", "));
        }
    }

    static async generatePlans(repository: PlanRepository): Promise<void> {
        let failed_to_add = [];
        for (const plan of PlanSamples) {
            try {
                await repository.add(plan);
            } catch (error) {
                console.log("Error adding plan: ", plan.id);
                failed_to_add.push(plan.id);
            }
        }

        if (failed_to_add.length > 0) {
            throw new Error("Failed to add plans: " + failed_to_add.join(", "));
        }
    }
    
}

export default SampleFactory;