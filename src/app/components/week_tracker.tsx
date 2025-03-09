'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'

type WeekDate = {
    dayName: string;
    dayNumber: string;
    dateStr: string;
    isToday: boolean;
    hasRecords: boolean;
}

export default function WeekTracker() {
    const [datesWithRecords, setDatesWithRecords] = useState<Set<string>>(new Set())
    const [startOfCurrentWeek, ] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 })) // Start from Monday
    const today = new Date()

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
    }, [startOfCurrentWeek])

    // Generate array of dates for the week
    const getWeekDates = () => { return Array.from({ length: 7 }, (_, i) => {
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
    }

    const [weekDates,] = useState<WeekDate[]>(getWeekDates())

    return (
        <div className="flex justify-center space-x-2 mb-6">
            {weekDates.map((day, index) => (
                <div
                    key={index}
                    className={`relative w-12 h-12 flex flex-col items-center justify-center rounded-lg shadow-sm select-none 
                        ${!day.isToday ? 'bg-gray-50 text-gray-500' : 'bg-black text-white'}`}
                >
                    <div className="relative">
                        {!day.hasRecords && (
                            <>
                                <span className="text-xs font-bold select-none">{day.dayName}</span>
                                <span className="text-sm block text-center select-none">{day.dayNumber}</span>
                            </>
                        )}
                        {day.hasRecords && (
                            <svg viewBox="0 0 24 24" fill="none" className={`w-5 h-5 text-black-500`} stroke='currentColor' strokeWidth="3">
                                <path d="M20 6L9 17L4 12"/>
                            </svg>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
} 