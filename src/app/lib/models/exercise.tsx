import { IDItem } from "../repositories/interfaces/repository";

export enum ExerciseType {
    Weight = 'weight',
    Timed = 'timed',
    Count = 'count'
}

export enum Unit {
    Metric = 'kg',
    Imperial = 'lbs'
}

export interface Exercise extends IDItem {
    id: number;
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

