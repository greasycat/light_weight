import { IDItem } from "../repositories/interfaces/repository";
import { Exercise } from "./exercise";

export interface Plan extends IDItem {
    id: number;
    name: string;
    description: string;
    exerciseIds: number[];
    overrides: Record<number, Exercise>;
    updatedAt: Date;
    createdAt: Date;
    schedule: number; // bitmask of days of the week leftmost bit is sunday rightmost bit is saturday
}