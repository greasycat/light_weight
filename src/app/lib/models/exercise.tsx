import { IDItem } from "../repositories/interfaces/repository";

export enum ExerciseType {
    Weight = 'weight',
    Timed = 'timed',
    Count = 'count'
}

export type Unit = 'metric' | 'imperial';

export interface Exercise {
    id: number;
    name: string;
    note: string;
}

export interface WeightExercise extends Exercise {
    type: ExerciseType.Weight;
    weight: number;
    unit: Unit;
}

export interface TimedExercise extends Exercise {
    type: ExerciseType.Timed;
    timed: number;
}

export interface CountExercise extends Exercise {
    type: ExerciseType.Count;
    count: number;
}


export interface Exercise extends IDItem {
    name: string;
    description: string;
    type: ExerciseType;
    createdAt: Date;
    updatedAt: Date;
}

export interface WeightedExercise extends Exercise {
    weight: number;
    unit: Unit;
    reps: number;
    sets: number;
    muscleGroups: string[];
}

export interface TimedExercise extends Exercise {
    time: number;
}

export interface CountedExercise extends Exercise {
    count: number;
}

