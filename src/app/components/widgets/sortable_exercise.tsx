'use client'

import { borderColorByType } from '@/app/components/widgets/exercise_utils';

import {
    useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import { Exercise } from '@/app/lib/models/exercise';

interface SortableExercise extends Exercise {
    sortableId: number;
}

interface SortableExerciseItemProps {
    exercise: SortableExercise;
    onRemove: (sortableId: number) => void;
}



export const SortableExerciseItem = ({ exercise, onRemove }: SortableExerciseItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: exercise.sortableId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center shadow-sm p-2 mb-2 rounded-sm border-2 ${borderColorByType(exercise.type)} border-r-0 border-t-0 border-b-0 ${isDragging ? 'shadow-lg' : ''}`}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded touch-none"
            >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                </svg>
            </div>
            <div className="flex-grow">
                <div className="select-none break-words overflow-wrap-normal text-md md:text-base font-semibold">
                    {exercise.name}
                </div>

            </div>
            {exercise.type === 'weight' ? (
                <div className="flex flex-col md:flex-row items-center">
                </div>
            ) : exercise.type === 'count' ? (

                <div className='rounded-md sm:pl-8 cursor-pointer flex items-center'>
                </div>
            ) : exercise.type === 'timed' ? (
                <div className="flex items-center">
                </div>
            ) : null}
            <button
                type="button"
                onClick={() => onRemove(exercise.sortableId)}
                className="p-2 text-red-400 hover:text-red-700"
                aria-label="Remove exercise"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M10 11v6M14 11v6" />
                </svg>

            </button>
        </div>
    );
};

export default SortableExerciseItem;