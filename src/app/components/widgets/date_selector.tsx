import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface DateSelectorProps {
    selectedDate: Date
    handlePreviousDay: () => void
    handleNextDay: () => void
    handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const dateToInputFormat = (date: Date) => {
    try {
        return format(date, 'yyyy-MM-dd')
    } catch (err) {
        console.error('Error formatting date:', err)
        return format(new Date(), 'yyyy-MM-dd')
    }
}

const DateSelector = ({ selectedDate, handlePreviousDay, handleNextDay, handleDateChange }: DateSelectorProps) => {
    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={handlePreviousDay}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Previous day"
                type="button"
            >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <input
                type="date"
                value={dateToInputFormat(selectedDate)}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
                onClick={handleNextDay}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={dateToInputFormat(selectedDate) >= dateToInputFormat(new Date())}
                aria-label="Next day"
                type="button"
            >
                <ChevronRightIcon
                    className={`h-5 w-5 ${dateToInputFormat(selectedDate) >= dateToInputFormat(new Date())
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }`}
                />
            </button>
        </div>
    )
}

export default DateSelector