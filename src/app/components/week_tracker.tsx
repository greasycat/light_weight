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
            const startDate = startOfCurrentWeek.toISOString()
            const endDate = addDays(startOfCurrentWeek, 6).toISOString()
            const records = await ExerciseDB.getRecordsByDateRange(startDate, endDate)

            // Create a Set of dates that have records in local time (yyyy-MM-dd)
            const datesSet = new Set(records.map(record => format(new Date(record.dateTime), 'yyyy-MM-dd')))
            console.log(datesSet)
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
                    className={`relative w-12 h-12 flex flex-col items-center justify-center rounded-lg shadow-sm select-none bg-gray-50 text-gray-500
                        ${day.isToday && 'ring-2 ring-black-500'}`}
                >
                    <div className="relative">
                        {!day.hasRecords && (
                            <>
                                <span className="text-xs font-bold select-none">{day.dayName}</span>
                                <span className="text-sm block text-center select-none">{day.dayNumber}</span>
                            </>
                        )}
                        {day.hasRecords && (
                            <svg viewBox="0 0 24 24" fill="none" className={`w-5 h-5 text-black-500 hover:bg-neutral-100`} stroke='currentColor' strokeWidth="3">
                                <path d="M20 6L9 17L4 12"/>
                            </svg>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
} 