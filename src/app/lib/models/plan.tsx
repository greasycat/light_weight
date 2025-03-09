import { IDItem } from "../repositories/interfaces/repository";

export interface Plan extends IDItem {
    name: string;
    description: string;
    exerciseIds: number[];
    updatedAt: Date;
    createdAt: Date;
}

