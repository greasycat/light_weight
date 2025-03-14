"use client";

import React, { useState, useEffect, useRef } from "react";
import SearchBar from "@/app/components/common/search_bar";
import { filterExercises, renderExerciseTypeBadge } from "@/app/components/widgets/exercise_utils";
import {
  addDays,
  addHours,
  subDays,
  subHours,
  format,
  isSameDay,
  isBefore,
  set,
} from "date-fns";
import DateSelector from "@/app/components/common/date_selector";
import TimeSelector from "@/app/components/common/time_selector";
import {
  Exercise,
  ExerciseType,
  Unit,
  WeightedExercise,
  CountedExercise,
  TimedExercise,
} from "@/app/lib/models/exercise";
import {
  Record,
  WeightRecord,
  CountRecord,
  TimedRecord,
} from "@/app/lib/models/record";
import RepositoryFactory from "@/app/lib/repositories/factory";
import { SimpleNumberInput } from "../widgets/number_input";
import { WeightNumberInput } from "../widgets/number_input";

interface RecordFormProps {
  record?: Record;
  onComplete: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function RecordForm({
  record,
  onComplete,
  onCancel,
  onDelete,
}: RecordFormProps) {
  const [loading, setLoading] = useState(false);
  const [dateTime, setDateTime] = useState<Date>(new Date());

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  // Weight Specific
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<Unit>(Unit.Imperial);
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("10");

  // Count Specific
  const [count, setCount] = useState("");

  // Timed Specific
  const [time, setTime] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const exerciseRepositoryRef = useRef(
    RepositoryFactory.getExerciseRepository("indexdb")
  );
  const recordRepositoryRef = useRef(
    RepositoryFactory.getRecordRepository("indexdb")
  );

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await exerciseRepositoryRef.current.getAll();
      setExercises(data);
      setFilteredExercises(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading exercises:", err);
      setLoading(false);
    }
  };

  const setRecordData = async (record: Record) => {
    const exercise = await exerciseRepositoryRef.current.get(record.exerciseId);
    setSelectedExercise(exercise);
    setDateTime(record.timestamp);
    setNotes(record.notes);
    if (record.type === ExerciseType.Weight) {
      const weightRecord = record as WeightRecord;
      setWeight(weightRecord.weight.toString());
      setUnit(weightRecord.unit);
      setReps(weightRecord.reps.toString());
      setRpe(weightRecord.rpe.toString());
    } else if (record.type === ExerciseType.Count) {
      const countRecord = record as CountRecord;
      setCount(countRecord.count.toString());
      setRpe(countRecord.rpe.toString());
    } else if (record.type === ExerciseType.Timed) {
      const timedRecord = record as TimedRecord;
      setTime(timedRecord.time.toString());
    }
  };

  useEffect(() => {
    loadExercises();
    if (record) {
      setRecordData(record);
    }
  }, [record]);

  useEffect(() => {
    setFilteredExercises(filterExercises(exercises, searchTerm));
  }, [searchTerm]);

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);

    if (exercise.type !== ExerciseType.Weight) {
      setWeight("");
    }

    if (record) return;

    if (exercise.type === ExerciseType.Weight) {
      const weightExercise = exercise as WeightedExercise;
      setWeight(weightExercise.weight.toString());
    } else if (exercise.type === ExerciseType.Count) {
      const countedExercise = exercise as CountedExercise;
      setCount(countedExercise.count.toString());
    } else if (exercise.type === ExerciseType.Timed) {
      const timedExercise = exercise as TimedExercise;
      setTime(timedExercise.time.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form
    if (!selectedExercise) {
      setError("Please select an exercise");
      return;
    }

    let newRecord: Record = {
      id: record?.id ?? 0,
      exerciseId: selectedExercise.id as number,
      timestamp: dateTime,
      notes: notes,
      type: selectedExercise.type,
    };

    try {
      if (selectedExercise.type === ExerciseType.Weight) {
        const parsedWeight = parseFloat(weight);
        const parsedReps = parseInt(reps);
        const parsedRpe = parseInt(rpe);

        if (isNaN(parsedWeight)) {
          setError("Please enter a weight");
          return;
        }
        if (!unit) {
          setError("Please select a unit");
          return;
        }
        if (isNaN(parsedReps)) {
          setError("Please enter a number of reps");
          return;
        }
        if (isNaN(parsedRpe)) {
          setError("Please enter a RPE");
          return;
        }

        newRecord = {
          ...newRecord,
          weight: parsedWeight,
          unit: unit,
          reps: parsedReps,
          rpe: parsedRpe,
        } as WeightRecord;

      } else if (selectedExercise.type === ExerciseType.Count) {
        const parsedCount = parseInt(count);
        const parsedRpe = parseInt(rpe);

        if (isNaN(parsedCount)) {
          setError("Please enter a count");
          return;
        }
        if (isNaN(parsedRpe)) {
          setError("Please enter a RPE");
          return;
        }

        newRecord = {
          ...newRecord,
          count: parsedCount,
          rpe: parsedRpe,
        } as CountRecord;
      } else if (selectedExercise.type === ExerciseType.Timed) {
        const parsedTime = parseInt(time);

        if (isNaN(parsedTime)) {
          setError("Please enter a time");
          return;
        }

        newRecord = {
          ...newRecord,
          time: parsedTime,
        } as TimedRecord;
      }

      if (record) {
        await recordRepositoryRef.current.update(newRecord);
      } else {
        await recordRepositoryRef.current.add(newRecord);
      }

      onComplete();
      resetForm();
    } catch (err) {
      setError("Failed to save record");
      console.error("Error saving record:", err);
    }
  };

  const handleDelete = async () => {
    if (!record) return;

    try {
      setIsDeleting(true);
      await recordRepositoryRef.current.delete(record);
      onDelete?.();
    } catch (err) {
      console.error("Error deleting record:", err);
    } finally {
      setIsDeleting(false);
      onComplete();
      resetForm();
    }
  };

  const handleDeleteClick = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this record? This cannot be undone."
      )
    ) {
      handleDelete();
    }
  };

  const handlePreviousDay = () => {
    setDateTime(subDays(dateTime, 1));
  };

  const handleNextDay = () => {
    setDateTime(addDays(dateTime, 1));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // check if the date is empty after stripping whitespace
    if (e.target.value.trim() === "") {
      setDateTime(new Date());
    } else {
      console.log("date change", e.target.value);
      const [year, month, day] = e.target.value.split("-").map(Number);
      setDateTime(set(dateTime, { year, month: month - 1, date: day }));
      console.log("new date time", dateTime);
    }
  };

  const handlePreviousTime = () => {
    setDateTime(subHours(dateTime, 1));
  };

  const handleNextTime = () => {
    const newDateTime = addHours(dateTime, 1);
    // check if the new date time is tomorrow
    if (
      isSameDay(newDateTime, new Date()) ||
      isBefore(newDateTime, new Date())
    ) {
      setDateTime(newDateTime);
    } else {
      setDateTime(new Date());
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // check if the time is empty after stripping whitespace
    console.log("time change", e.target.value);
    if (e.target.value.trim() === "") {
      setDateTime(new Date());
    } else {
      const [hours, minutes] = e.target.value.split(":").map(Number);
      setDateTime(
        set(dateTime, { hours, minutes, seconds: 0, milliseconds: 0 })
      );
    }
  };

  const dateTimeToTimeString = (dateTime: Date) => {
    return format(dateTime, "HH:mm");
  };

  const resetForm = () => {
    setSelectedExercise(null);
    setCount("");
    setRpe("10");
    setNotes("");
    setWeight("");
    setUnit(Unit.Imperial);
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-600/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {record ? "Edit Record" : "Add Record"}
            </h2>
            {record && (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="px-3 py-1 text-sm font-medium text-pink-50 bg-red-500 rounded-md 
                    hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 
                    disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Exercise Selection */}
            <div className="mb-4 items-center">
              <div className="flex items-center">
                <div className="mb-2 flex flex-col items-center sm:flex-row">
                  <DateSelector
                    selectedDate={dateTime}
                    handlePreviousDay={handlePreviousDay}
                    handleNextDay={handleNextDay}
                    handleDateChange={handleDateChange}
                  />
                  <TimeSelector
                    selectedTime={dateTimeToTimeString(dateTime)}
                    handlePreviousTime={handlePreviousTime}
                    handleNextTime={handleNextTime}
                    handleTimeChange={handleTimeChange}
                  />
                </div>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose Exercise
              </label>
              {loading ? (
                <div className="py-2 px-3 border rounded-md text-center text-gray-500">
                  Loading exercises...
                </div>
              ) : (
                <>
                  {!selectedExercise && (
                    <div className="mb-2">
                      <SearchBar
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search exercises..."
                      />
                    </div>
                  )}
                  {selectedExercise ? (
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <p className="font-medium">{selectedExercise.name}</p>
                      <div className="flex items-center gap-2">
                        {renderExerciseTypeBadge(selectedExercise)}
                        {!record && (
                          <button
                            type="button"
                            onClick={() => setSelectedExercise(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Change
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto rounded-md">
                      {filteredExercises.map((exercise) => (
                        <div
                          key={exercise.name}
                          onClick={() => handleExerciseSelect(exercise)}
                          className="rounded-lg shadow p-4 cursor-pointer hover:bg-gray-100 items-center"
                        >
                          <div className="flex flex-col sm:flex-row items-center justify-between">
                            <p className="font-medium flex-1 text-center">{exercise.name}</p>
                            <div className="">
                              {renderExerciseTypeBadge(exercise)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedExercise && (
              <>
                {selectedExercise.type === "weight" && (
                  <>
                    <WeightNumberInput
                      text="Weight"
                      weight={weight}
                      onWeightChange={setWeight}
                      unit={unit}
                      onUnitChange={setUnit}
                    />
                    <SimpleNumberInput
                      text="Reps"
                      value={reps}
                      onChange={setReps}
                    />
                    <SimpleNumberInput
                      text="RPE"
                      value={rpe}
                      onChange={setRpe}
                    />
                  </>
                )}
                {selectedExercise.type === "count" && (
                  <>
                    <SimpleNumberInput
                      text="Count"
                      value={count}
                      onChange={setCount}
                    />
                    <SimpleNumberInput
                      text="RPE"
                      value={rpe}
                      onChange={setRpe}
                    />
                  </>
                )}
                {selectedExercise.type === "timed" && (
                  <>
                    <SimpleNumberInput
                      text="Time"
                      value={time}
                      onChange={setTime}
                    />
                  </>
                )}
                <div className="mb-4">
                  <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="note"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  onCancel();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-500
                `}
              >
                {record ? "Save Changes" : "Save Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
