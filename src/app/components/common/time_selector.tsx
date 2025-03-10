import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface TimeSelectorProps {
    selectedTime: string
    handlePreviousTime: () => void
    handleNextTime: () => void
    handleTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}


const TimeSelector = ({ selectedTime, handlePreviousTime, handleNextTime, handleTimeChange }: TimeSelectorProps) => {
    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={handlePreviousTime}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Previous time"
                type="button"
            >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
                onClick={handleNextTime}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Next time"
                type="button"
            >
                <ChevronRightIcon className={`h-5 w-5 text-gray-600`}/>
            </button>
        </div>
    )
}

export default TimeSelector;
