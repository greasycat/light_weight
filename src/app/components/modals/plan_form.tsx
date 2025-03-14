'use client'

import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '@/app/components/common/search_bar';
import { renderExerciseTypeBadge, filterExercises } from '@/app/components/widgets/exercise_utils';
import  SortableExerciseItem  from '@/app/components/widgets/sortable_exercise';
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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Plan } from '@/app/lib/models/plan';
import { Exercise } from '@/app/lib/models/exercise';
import { ExerciseRepository, PlanRepository } from '@/app/lib/repositories/interfaces/repository';
import RepositoryFactory from '@/app/lib/repositories/factory';

interface PlanFormProps {
    plan: Plan | null;
    onComplete: () => void;
    onCancel: () => void;
    onDelete?: () => void;
}

interface SortableExercise extends Exercise {
    sortableId: number;
}

const PlanForm: React.FC<PlanFormProps> = ({
    plan,
    onComplete,
    onCancel,
    onDelete
}) => {


    const [name, setName] = useState(plan?.name || '');
    const [schedule, setSchedule] = useState(plan?.schedule || 0);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExercisesCollapsed, setIsExercisesCollapsed] = useState(false);

    const exerciseRepositoryRef = useRef<ExerciseRepository>(RepositoryFactory.getExerciseRepository("indexdb"));
    const planRepositoryRef = useRef<PlanRepository>(RepositoryFactory.getPlanRepository("indexdb"));

    
    const loadExercises = async () => {
        try {
            setLoading(true);
            const data = await exerciseRepositoryRef.current.getAll();
            setExercises(data);
            setFilteredExercises(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load exercises');
            setLoading(false);
            console.error('Error loading exercises:', err);
        }
    };

    useEffect(() => {
        loadExercises();
    }, []);
    
    const getExercises = async (exerciseIds: number[]) => {
        const validIds: number[] = []
        const data = await Promise.all(exerciseIds.map(async (id) => {
            const exercise = await exerciseRepositoryRef.current.get(id);
            if (exercise) {
                validIds.push(id);
            }
            return exercise;
        }));

        if (plan?.id) {
            planRepositoryRef.current.update({
                ...plan,
                exerciseIds: validIds
            });
        }

        setExercises(data.filter(e => e));
    }

    useEffect(() => {
        if (plan?.exerciseIds) {
            getExercises(plan.exerciseIds);
        }
    }, []);

    const [selectedExercises, setSelectedExercises] = useState<SortableExercise[]>([]);



    useEffect(() => {
        setFilteredExercises(filterExercises(exercises, searchTerm));
    }, [searchTerm, exercises]);


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleScheduleChange = (dayIndex: number) => {
        setSchedule(schedule ^ (1 << dayIndex));
    };

    const handleExerciseSelect = (exercise: Exercise) => {
        const newEntry: SortableExercise = {
            ...exercise,
            sortableId: selectedExercises.length
        };
        setSelectedExercises([...selectedExercises, newEntry]);
    };

    const handleExerciseRemove = (sortableId: number) => {
        console.log("handleExerciseRemove", sortableId);
        setSelectedExercises(selectedExercises.filter(e => e.sortableId !== sortableId).map((e, index) => ({ ...e, sortableId: index })));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSelectedExercises((exercises) => {
                const oldIndex = exercises.findIndex((e) => e.sortableId === active.id);
                const newIndex = exercises.findIndex((e) => e.sortableId === over.id);

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
        onComplete();
    };

    const handleDelete = async () => {
        if (!plan?.id) return;

        if (window.confirm('Are you sure you want to delete this plan? This cannot be undone.')) {
            try {
                await planRepositoryRef.current.delete(plan);
                onDelete?.();
            } catch (err) {
                setError('Failed to delete plan');
                console.error('Error deleting plan:', err);
            }
        }
    };

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
                                        className={`select-none min-w-12 px-2 py-2 rounded-md text-sm font-medium touch-manipulation ${schedule & (1 << index) ? 'bg-blue-600 text-white'
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
                                            items={selectedExercises.map(e => e.sortableId)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {selectedExercises.map(exercise => (
                                                <SortableExerciseItem
                                                    key={exercise.sortableId}
                                                    exercise={exercise}
                                                    onRemove={handleExerciseRemove}
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
                                        <SearchBar
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
                                                className="flex items-center justify-between p-3 shadow-sm rounded-md hover:bg-gray-100 cursor-pointer active:bg-gray-200 select-none "
                                            >
                                                <div className="font-medium truncate mr-2">{exercise.name}</div>
                                                {renderExerciseTypeBadge(exercise)}
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