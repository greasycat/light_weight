import { ExerciseType, Unit } from "./exercise";
import { IDItem } from "../repositories/interfaces/repository";

export interface Record extends IDItem {
    exerciseId: number;
    type: ExerciseType;
    timestamp: Date;
    notes: string;
}

export interface WeightRecord extends Record {
    type: ExerciseType.Weight;
    weight: number;
    unit: Unit;
    reps: number;
    rpe: number;
}


export interface TimedRecord extends Record {
    type: ExerciseType.Timed;
    time: number;
}

export interface CountRecord extends Record {
    type: ExerciseType.Count;
    count: number;
    rpe: number;
}


