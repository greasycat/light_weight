import { IDItem } from "../repositories/interfaces/repository";
import { Record } from "./record";

export interface Workout extends IDItem {
    id: number;
    updatedAt: Date;
    planId: number;
    records: Record[];
}