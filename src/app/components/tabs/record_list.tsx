"use client";

import { useCallback, useState, useEffect, useRef, Suspense } from "react";
import {
  format,
  addDays,
  subDays,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import RecordForm from "@/app/components/modals/record_form";
import DateSelector from "@/app/components/common/date_selector";
import { Record } from "@/app/lib/models/record";
import LongPressable from "../common/long_pressable";
import RepositoryFactory from "@/app/lib/repositories/factory";
import { renderTypeCount } from "../widgets/exercise_utils";

export default function RecordList() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const recordRepositoryRef = useRef(
    RepositoryFactory.getRecordRepository("indexdb")
  );
  const exerciseRepositoryRef = useRef(
    RepositoryFactory.getExerciseRepository("indexdb")
  );
  
  const getExerciseName = async (record: Record) => {
    const exercise = await exerciseRepositoryRef.current.get(record.exerciseId, "key");
    if (exercise) {
      return exercise.name;
    }
    return "Unknown";
  }

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);

      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);

      const records = await recordRepositoryRef.current.getByTimeRange(
        start,
        end
      );
      const sortedRecords = records.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      setRecords(sortedRecords);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching records:", error);
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = parseISO(e.target.value);
    setSelectedDate(newDate);
  };

  const handlePreviousDay = () => {
    const prevDate = subDays(selectedDate, 1);
    setSelectedDate(prevDate);
  };

  const handleNextDay = () => {
    const nextDate = addDays(selectedDate, 1);
    setSelectedDate(nextDate);
  };

  const handleRecordComplete = async () => {
    await loadRecords();
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleRecordDelete = async () => {
    await loadRecords();
    setEditingRecord(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex justify-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <DateSelector
          selectedDate={selectedDate}
          handlePreviousDay={handlePreviousDay}
          handleNextDay={handleNextDay}
          handleDateChange={handleDateChange}
        />
        <button
          onClick={() => {
            setEditingRecord(null);
            setShowForm(true);
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Record
        </button>
        {showForm && (
          <RecordForm
            onComplete={handleRecordComplete}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>

      {records.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No workouts recorded {`on ${format(selectedDate, "MMM d, yyyy")}`}
        </div>
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          <div className="space-y-2">
            {records.map((record) => (
              <div
                key={record.id.toString()}
                className="rounded-lg shadow p-4 bg-white hover:bg-gray-50 relative"
              >
                <LongPressable
                  onTrigger={() => {
                    setEditingRecord(record);
                    setShowForm(true);
                  }}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 select-none">
                      {format(new Date(record.timestamp), "hh:mm a")}
                    </span>
                      <span className="font-medium select-none pr-2">
                        {getExerciseName(record)}
                      </span>
                      <span className="text-gray-500 select-none">
                        {renderTypeCount(record)}
                      </span>
                    </div>
                  </div>
                </LongPressable>
              </div>
            ))}
          </div>
        </Suspense>
      )}

      {editingRecord && (
        <RecordForm
          record={editingRecord}
          onComplete={handleRecordComplete}
          onCancel={() => setEditingRecord(null)}
          onDelete={handleRecordDelete}
        />
      )}
    </div>
  );
}
