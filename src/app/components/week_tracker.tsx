'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import { ExerciseDB } from '../lib/indexdb_handler'

export default function WeekTracker() {
    const [datesWithRecords, setDatesWithRecords] = useState<Set<string>>(new Set())
    const today = new Date()
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Start from Monday

    useEffect(() => {
        const fetchWeekRecords = async () => {
            const startDate = format(startOfCurrentWeek, 'yyyy-MM-dd')
            const endDate = format(addDays(startOfCurrentWeek, 6), 'yyyy-MM-dd')
            const records = await ExerciseDB.getRecordsByDateRange(startDate, endDate)

            // Create a Set of dates that have records
            const datesSet = new Set(records.map(record => record.date))
            setDatesWithRecords(datesSet)
        }

        fetchWeekRecords()
    }, [])

    // Generate array of dates for the week
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(startOfCurrentWeek, i)
        const dateStr = format(date, 'yyyy-MM-dd')
        const todayStr = format(today, 'yyyy-MM-dd')
        return {
            dayName: format(date, 'EEE'),
            dayNumber: format(date, 'd'),
            dateStr,
            isToday: dateStr === todayStr,
            hasRecords: datesWithRecords.has(dateStr)
        }
    })

    return (
        <div className="flex justify-center space-x-2 mb-6">
            {weekDates.map((day, index) => (
                <div
                    key={index}
                    className={`
            relative w-12 h-12 flex flex-col items-center justify-center rounded-lg
            ${day.isToday
                            ? 'bg-black text-white'
                            : 'bg-gray-50 text-gray-600'
                        }
          `}
                >
                    <div className="relative">
                        {!day.hasRecords && (
                            <>
                                <span className="text-xs font-medium">{day.dayName}</span>
                                <span className="text-sm block text-center">{day.dayNumber}</span>
                            </>
                        )}
                        {day.hasRecords && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-extrabold text-white transform scale-110">✔</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
} 