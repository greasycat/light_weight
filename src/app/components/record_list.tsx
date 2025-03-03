'use client'

import { useState, useEffect } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { ExerciseDB, ExerciseRecord } from '../lib/indexdb_handler'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import RecordForm from './record_form'

interface RecordListProps {
  dash?: boolean;
}

export default function RecordList({ dash = false }: RecordListProps) {
  const [records, setRecords] = useState<ExerciseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ExerciseRecord | null>(null)
  const [pressedRecord, setPressedRecord] = useState<ExerciseRecord | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [, setIsLongPressing] = useState(false)

  useEffect(() => {
    loadRecords()
  }, [selectedDate])

  const loadRecords = async () => {
    try {
      setLoading(true)
      const records = await ExerciseDB.getRecordsByDateRange(selectedDate, selectedDate)
      const sortedRecords = records.sort((a, b) => 
        new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
      )
      setRecords(sortedRecords)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching records:', error)
      setLoading(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const handlePreviousDay = () => {
    const prevDate = subDays(parseDate(selectedDate), 1)
    setSelectedDate(format(prevDate, 'yyyy-MM-dd'))
  }

  const handleNextDay = () => {
    const nextDate = addDays(parseDate(selectedDate), 1)
    setSelectedDate(format(nextDate, 'yyyy-MM-dd'))
  }

  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date
  }

  const handleRecordComplete = async () => {
    await loadRecords()
    setEditingRecord(null)
    setShowForm(false)
  }

  const handleRecordDelete = async () => {
    await loadRecords()
    setEditingRecord(null)
    setShowForm(false)
  }

  // Clean up long press timer
  useEffect(() => {
    if (pressedRecord) {
      setIsLongPressing(true)
      setLoadingProgress(0)
      
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            setEditingRecord(pressedRecord)
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 50)
      
      return () => clearInterval(interval)
    } else {
      setIsLongPressing(false)
      setLoadingProgress(0)
    }
  }, [pressedRecord])

  const loadingBarStyle = (record: ExerciseRecord): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${pressedRecord?.id === record.id ? loadingProgress : 0}%`,
    backgroundColor: 'rgba(133, 133, 133, 0.25)',
    transition: 'width 0.05s linear',
    zIndex: 0,
  })
  
  const handleMouseDown = (record: ExerciseRecord) => {
    setPressedRecord(record)
  }
  
  const handleMouseUp = () => {
    setPressedRecord(null)
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    )
  }

  const displayRecords = dash ? records.slice(0, 5) : records

  const content = (
    <>
      {!dash && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousDay}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Previous day"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleNextDay}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={selectedDate >= format(new Date(), 'yyyy-MM-dd')}
                aria-label="Next day"
              >
                <ChevronRightIcon 
                  className={`h-5 w-5 ${
                    selectedDate >= format(new Date(), 'yyyy-MM-dd')
                      ? 'text-gray-300'
                      : 'text-gray-600'
                  }`} 
                />
              </button>
            </div>
          </div>
          <button
            onClick={() => {
                setEditingRecord(null)
                setShowForm(true)
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Record
          </button>
          {showForm && (
            <RecordForm
              onComplete={handleRecordComplete}
              onCancel={()=>setShowForm(false)}
            />
          )}
        </div>
      )}

      {dash && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
            Most recent 5 workouts
          </h2>
        </div>
      )}

      {records.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No workouts recorded {!dash && `on ${format(new Date(selectedDate), 'MMM d, yyyy')}`}
        </div>
      ) : (
        <div className="space-y-2">
          {displayRecords.map((record) => (
            <div 
              key={record.id}
              className="rounded-lg shadow p-4 bg-white hover:bg-gray-50 relative"
              onMouseDown={() => handleMouseDown(record)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={() => handleMouseDown(record)}
              onTouchEnd={handleMouseUp}
            >
              <div style={loadingBarStyle(record)}></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-2">
                  <span className="font-medium select-none">{record.exerciseName}</span>
                  <span className="text-gray-500 select-none">
                    {record.count} {record.weight && `@ ${record.weight}${record.unit}`} 
                    {record.rpe && ` RPE: ${record.rpe}`}
                    {record.note && ` - ${record.note}`}
                  </span>
                </div>
                <span className="text-xs text-gray-500 select-none">
                  {format(new Date(`${record.date} ${record.time}`), 'HH:mm')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingRecord && (
        <RecordForm
          record={editingRecord}
          onComplete={handleRecordComplete}
          onCancel={() => setEditingRecord(null)}
          onDelete={handleRecordDelete}
        />
      )}
    </>
  );

  if (dash) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {content}
    </div>
  );
} 