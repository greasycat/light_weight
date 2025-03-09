import { ExerciseType, WeightExercise} from "../../models/exercise";
import { Exercise } from "../../models/exercise";
import { Record } from "../../models/record";
import { Plan } from "../../models/plan";
import { Workout } from "../../models/workout";

export interface IDItem {
    id: number | string | Date;
}

export interface Repository<T extends IDItem> {
    add(item: T): Promise<T>;
    update(item: T): Promise<T>;
    delete(item: T): Promise<void>;
}


export interface ExerciseRepository extends Repository<Exercise> {
    getAll(): Promise<Exercise[]>;
    getByType(type: ExerciseType): Promise<Exercise[]>;
    getByMuscleGroup(muscleGroups: string[]): Promise<WeightExercise[]>;
}

export interface RecordRepository extends Repository<Record> {
    getAll(): Promise<Record[]>;
    getByExerciseId(exerciseId: string): Promise<Record[]>;
    getByExerciseType(exerciseType: ExerciseType): Promise<Record[]>;
    getByExerciseMuscleGroup(muscleGroups: string[]): Promise<Record[]>;
    getByExerciseName(name: string): Promise<Record[]>;
    getByTimeRange(start: Date, end: Date): Promise<Record[]>;
}

export interface PlanRepository extends Repository<Plan> {
    getAll(): Promise<Plan[]>;
    getById(id: number): Promise<Plan>;
    getByName(name: string): Promise<Plan[]>;
    getByExercises(exerciseIds: number[]): Promise<Plan[]>;
}

export interface WorkoutRepository extends Repository<Workout> {
    getAll(): Promise<Workout[]>;
    getById(id: number): Promise<Workout>;
    getByPlanId(planId: number): Promise<Workout[]>;
    getByDateRange(start: Date, end: Date): Promise<Workout[]>;
    getLastestWorkout(): Promise<Workout | null>;
}

