import { Suspense, useEffect, useRef } from "react";
import { useState } from "react";
import SampleFactory from "../lib/repositories/sample_factory";
import { Exercise } from "../lib/models/exercise";
import RepositoryFactory from "../lib/repositories/factory";
import { Plan } from "../lib/models/plan";
import { Record } from "../lib/models/record";

export default function BackendTest() {
    const [allExercises, setAllExercises] = useState<Exercise[]>([]);
    const [allRecords, setAllRecords] = useState<Record[]>([]);
    const [allPlans, setAllPlans] = useState<Plan[]>([]);
    const [error, setError] = useState<string | null>(null);

    const exerciseRepositoryRef = useRef(RepositoryFactory.getExerciseRepository('indexdb'));
    const recordRepositoryRef = useRef(RepositoryFactory.getRecordRepository('indexdb'));

    useEffect(() => {
        exerciseRepositoryRef.current.getAll().then((exercises) => {
            setAllExercises(exercises);
        });
        recordRepositoryRef.current.getAll().then((records) => {
            setAllRecords(records);
        });
    }, []);

    const generateSampleExercises = async () => {
        try {
            await SampleFactory.generateExercises(exerciseRepositoryRef.current);
        } catch (error) {
            const failed_exercises = (error as Error).message
            setError(failed_exercises);
        }
        const exercises = await exerciseRepositoryRef.current.getAll();
        setAllExercises(exercises);
    }

    const generateSampleRecords = async () => {
        try {
            await SampleFactory.generateRecords(recordRepositoryRef.current);
        } catch (error) {
            const failed_records = (error as Error).message
            setError(failed_records);
        }
        try {
            const records = await recordRepositoryRef.current.getAll();
            setAllRecords(records);
        } catch (error) {
            setError((error as Error).message);
        }
    }

    const clearAllData = async () => {
        setAllRecords([]);
        setAllExercises([]);
        exerciseRepositoryRef.current.deleteDatabase();
        recordRepositoryRef.current.deleteDatabase();
    }

    const getExerciseName = async (record: Record) => {
        const exercise = await exerciseRepositoryRef.current.get(record.exerciseId, "key");
        if (exercise) {
            return exercise.name;
        }
        return "Unknown";
    }

    return (
        <div>
            <p className="text-red-500">{error}</p>
            <button className="border border-gray-300 rounded-md px-4 py-2" onClick={generateSampleExercises}>Generate Sample Exercises</button>
            <button className="border border-gray-300 rounded-md px-4 py-2" onClick={generateSampleRecords}>Generate Sample Records</button>
            <button className="border border-gray-300 rounded-md px-4 py-2" onClick={clearAllData}>Clear All Data</button>
            <div>
                <h2>All Exercises</h2>
                <ul> {allExercises.map((exercise) => (
                        <li className="text-sm border border-gray-300 rounded-md px-4 py-2" key={exercise.id.toString()}>{JSON.stringify(exercise)}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>All Records</h2>
                <Suspense fallback={<div>Loading...</div>}>
                <ul> {allRecords.map((record) => (
                        <li className="text-sm border border-gray-300 rounded-md px-4 py-2" key={record.id.toString()}>{JSON.stringify(record)} {getExerciseName(record)}</li>
                    ))}
                </ul>
                </Suspense>
            </div>
        </div>
    )
}

