'use client'

import React, { useState, useEffect } from 'react';
import { filterExercises, SearchInput } from '../lib/search_utils';
import { renderTypeBadge } from '../lib/exercise_utils';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    TouchSensor
} from '@dnd-kit/core';

import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import {NumberInputOneLine} from './number_input';
import { isNumber } from '../lib/input_utils';
interface PlanFormProps {
    plan?: Plan;
    onComplete: () => void;
    onCancel: () => void;
    onDelete?: () => void;
}


interface SortableExerciseItemProps {
    exercise: PlanExercise;
    onRemove: (id: number) => void;
    onCountChange: (id: number, count: string) => void;
}

const parseWeightCount = (count: string) => {
    // regrex match for "10s5r"
    const match = count.match(/(\d+)s(\d+)r/);
    if (match) {
        return { sets: match[1], reps: match[2] };
    }

    // regrex match for "10r"
    const match2 = count.match(/(\d+)r/);
    if (match2) {
        return { sets: "", reps: match2[1] };
    }

    const match3 = count.match(/(\d+)s/);
    if (match3) {
        return { sets: match3[1], reps: "" };
    }

    return { sets: "", reps: "" };
}

const parseTimedCount = (count: string) => {
    if (!isNumber(count)) {
        return "";
    }
    return count;
}

const parseCount = (count: string) => {
    if (!isNumber(count)) {
        return "";
    }
    return count;
}

const updateSets = (count: string, sets: string) => {
    return `${sets}s${parseWeightCount(count).reps}r`;
}

const updateReps = (count: string, reps: number) => {
    return `${parseWeightCount(count).sets}s${reps}r`;
}

const incrementWeightSets = (count: string, num: number) => {
    const { sets, reps } = parseWeightCount(count);
    let newSets = parseInt(sets || "0") + num;
    if (newSets < 1) newSets = 1;
    return `${newSets}s${reps}r`;
}

const incrementWeightReps = (count: string, num: number) => {
    const { sets, reps } = parseWeightCount(count);
    let newReps = parseInt(reps || "0") + num;
    if (newReps < 1) newReps = 1;
    return `${sets}s${newReps}r`;
}

const incrementCountReps = (count: string, num: number) => {
    let newReps = parseInt(parseCount(count) || "0") + num;
    if (newReps < 1) newReps = 1;
    return newReps.toString();
}

const incrementTimedCount = (count: string, num: number) => {
    let newSeconds = parseInt(parseTimedCount(count) || "0") + num;
    if (newSeconds < 15) newSeconds = 15;
    return newSeconds.toString();
}





const borderColorByType = (type: string) => {
    if (type === 'weight') return 'border-l-sky-500';
    if (type === 'count') return 'border-yellow-500';
    if (type === 'timed') return 'border-green-500';
    return 'border-gray-500';
}

const SortableExerciseItem = ({ exercise: planExercise, onRemove, onCountChange }: SortableExerciseItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: planExercise.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
    };

    const divClasses = "flex flex-row items-center justify-center";
    const inputClasses = "w-10 remove-arrow text-center font-bold";
    const iconClasses = "p-1 text-gray-700  mx-1 my-1 rounded-sm";
    const textClasses = "text-black text-md font-semibold select-none";

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center shadow-sm p-2 mb-2 rounded-sm border-2 ${borderColorByType(planExercise.type)} border-r-0 border-t-0 border-b-0 ${isDragging ? 'shadow-lg' : ''}`}
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
                <div className="select-none break-words overflow-wrap-normal text-md md:text-base font-semibold">{planExercise.name}</div>
            </div>
            {planExercise.type === 'weight' ? (
                <div className="flex flex-col md:flex-row items-center">
                    <NumberInputOneLine
                        value={parseWeightCount(planExercise.count).sets}
                        onChange={(e) => onCountChange(planExercise.id, updateSets(planExercise.count, e.target.value))}
                        onIncrement={() => onCountChange(planExercise.id, incrementWeightSets(planExercise.count, 1))}
                        onDecrement={() => onCountChange(planExercise.id, incrementWeightSets(planExercise.count, -1))}
                        text="Set"
                        placeholder="Sets"
                        divClassName={divClasses}
                        inputClassName={inputClasses}
                        iconClassName={iconClasses}
                        textClassName={textClasses}
                    />
                    <NumberInputOneLine
                        value={parseWeightCount(planExercise.count).reps.toString()}
                        onChange={(e) => {
                            if (e.target.value === "") {
                                onCountChange(planExercise.id, updateReps(planExercise.count, 1));
                            } else {
                                onCountChange(planExercise.id, updateReps(planExercise.count, parseInt(e.target.value)));
                            }
                        }}
                        onIncrement={() => onCountChange(planExercise.id, incrementWeightReps(planExercise.count, 1))}
                        onDecrement={() => onCountChange(planExercise.id, incrementWeightReps(planExercise.count, -1))}
                        text="Rep"
                        placeholder="Reps"
                        divClassName={divClasses}
                        inputClassName={inputClasses}
                        iconClassName={iconClasses}
                        textClassName={textClasses}
                    />
                </div>
            ) : planExercise.type === 'count' ? (

                <div className='rounded-md sm:pl-8 cursor-pointer flex items-center'>
                <NumberInputOneLine
                    value={parseCount(planExercise.count)}
                    onChange={(e) => onCountChange(planExercise.id, e.target.value)}
                    onIncrement={() => onCountChange(planExercise.id, incrementCountReps(planExercise.count, 1))}
                    onDecrement={() => onCountChange(planExercise.id, incrementCountReps(planExercise.count, -1))}
                    text="Rep"
                    placeholder="Reps"
                    divClassName={divClasses}
                    inputClassName={inputClasses}
                    iconClassName={iconClasses}
                    textClassName={textClasses}
                />
                </div>
            ) : planExercise.type === 'timed' ? (
                <div className="flex items-center">
                    <NumberInputOneLine
                        value={parseTimedCount(planExercise.count)}
                        onChange={(e) => onCountChange(planExercise.id, e.target.value)}
                        onIncrement={() => onCountChange(planExercise.id, incrementTimedCount(planExercise.count, 15))}
                        onDecrement={() => onCountChange(planExercise.id, incrementTimedCount(planExercise.count, -15))}
                        text="Sec"
                        placeholder="Seconds"
                        divClassName={divClasses}
                        inputClassName={inputClasses}
                        iconClassName={iconClasses}
                        textClassName={textClasses}
                    />
                </div>
            ) : null}
            <button
                type="button"
                onClick={() => onRemove(planExercise.id)}
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

const PlanForm: React.FC<PlanFormProps> = ({
    plan,
    onComplete,
    onCancel,
    onDelete
}) => {
    const [name, setName] = useState(plan?.name || '');
    const [schedule, setSchedule] = useState(plan?.schedule || '0000000');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExercises, setSelectedExercises] = useState<PlanExercise[]>(plan?.exercises || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExercisesCollapsed, setIsExercisesCollapsed] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 100,
            },
        })
    );

    useEffect(() => {
        loadExercises();
    }, []);

    useEffect(() => {
        setFilteredExercises(filterExercises(exercises, searchTerm));
    }, [searchTerm, exercises]);

    const loadExercises = async () => {
        try {
            setLoading(true);
            const data = await ExerciseDB.getAllExercises();
            setExercises(data);
            setFilteredExercises(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load exercises');
            setLoading(false);
            console.error('Error loading exercises:', err);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleScheduleChange = (dayIndex: number) => {
        const newSchedule = schedule.split('');
        newSchedule[dayIndex] = newSchedule[dayIndex] === '1' ? '0' : '1';
        setSchedule(newSchedule.join(''));
    };

    const handleExerciseSelect = (exercise: Exercise) => {
        const newEntry: PlanExercise = {
            id: selectedExercises.length,
            name: exercise.name,
            type: exercise.type,
            count: exercise.defaultCount
        };
        setSelectedExercises([...selectedExercises, newEntry]);
    };

    const handleExerciseRemove = (id: number) => {
        setSelectedExercises(selectedExercises.filter(e => e.id !== id).map((e, index) => ({ ...e, id: index })));
    };

    const handleCountChange = (id: number, count: string) => {
        setSelectedExercises(selectedExercises.map(e =>
            e.id === id ? { ...e, count } : e
        ));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSelectedExercises((exercises) => {
                const oldIndex = exercises.findIndex((e) => e.id === active.id);
                const newIndex = exercises.findIndex((e) => e.id === over.id);

                return arrayMove(exercises, oldIndex, newIndex);
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedExercises.length === 0) {
            setError('Please select at least one exercise');
            return;
        }

        try {
            if (plan?.id) {
                await ExerciseDB.updatePlan(plan.id, {
                    ...plan,
                    name,
                    exercises: selectedExercises,
                    schedule,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await ExerciseDB.addPlan({
                    name,
                    exercises: selectedExercises,
                    schedule,
                    createdAt: new Date().toISOString()
                });
            }
            onComplete();
        } catch (err) {
            setError('Failed to save plan, possible duplicate name');
            console.error('Error saving plan:', err);
        }
    };

    const handleDelete = async () => {
        if (!plan?.id) return;

        if (window.confirm('Are you sure you want to delete this plan? This cannot be undone.')) {
            try {
                await ExerciseDB.deletePlan(plan.id);
                onDelete?.();
            } catch (err) {
                setError('Failed to delete plan');
                console.error('Error deleting plan:', err);
            }
        }
    };

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="fixed inset-0 bg-neutral-200/80 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl my-4">
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                            {plan ? 'Edit Plan' : 'Create New Plan'}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-gray-500 hover:text-gray-700 p-1"
                            aria-label="Close"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Plan Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Plan Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                                required
                            />
                        </div>

                        {/* Schedule - Responsive Layout */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Schedule
                            </label>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                                {days.map((day, index) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => handleScheduleChange(index)}
                                        className={`select-none min-w-12 px-2 py-2 rounded-md text-sm font-medium touch-manipulation ${schedule[index] === '1'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Exercise Selection */}
                        <div className="mb-4">
                            {/* Selected Exercises with drag and drop */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium text-gray-700">
                                        Selected Exercises ({selectedExercises.length})
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsExercisesCollapsed(!isExercisesCollapsed)}
                                        className="p-1 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                                        aria-label={isExercisesCollapsed ? "Expand exercises" : "Collapse exercises"}
                                    >
                                        <svg
                                            className={`w-5 h-5 transform transition-transform ${isExercisesCollapsed ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                <div className={`transition-all duration-300 ${isExercisesCollapsed ? 'h-0 overflow-hidden' : ''}`}>
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={selectedExercises.map(e => e.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {selectedExercises.map(exercise => (
                                                <SortableExerciseItem
                                                    key={exercise.id}
                                                    exercise={exercise}
                                                    onRemove={handleExerciseRemove}
                                                    onCountChange={handleCountChange}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>

                            {/* Exercise List */}
                            {loading ? (
                                <div className="text-center py-4 text-gray-500">Loading exercises...</div>
                            ) : (
                                <>
                                    <div className="mb-2">
                                        <SearchInput
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            placeholder="Search exercises to add..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 sm:max-h-48 overflow-y-auto">

                                        {filteredExercises.map((exercise) => (
                                            <div
                                                key={exercise.name}
                                                onClick={() => handleExerciseSelect(exercise)}
                                                className="flex items-center justify-between p-3 rounded-md hover:bg-gray-100 cursor-pointer active:bg-gray-200 select-none border-2 border-gray-100"
                                            >
                                                <div className="font-medium truncate mr-2">{exercise.name}</div>
                                                {renderTypeBadge(exercise.type)}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-2 text-red-700 bg-red-100 rounded-md">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons - Full width on mobile */}
                        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-6">
                            {plan && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="w-full sm:w-auto px-4 py-3 sm:py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 text-base"
                                >
                                    Delete
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onCancel}
                                className="w-full sm:w-auto px-4 py-3 sm:py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-base"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-4 py-3 sm:py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 text-base"
                            >
                                {plan ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PlanForm;