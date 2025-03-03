'use client'
import { useState } from 'react'

import ConfigEdit from './config_edit'
import ExerciseList from './exercise_list'
import RecordList from './record_list'
import WeekTracker from './week_tracker'

type TabType = 'dashboard' | 'exercises' | 'records' | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  const tabs = [
    { id: 'dashboard', name: "Dashboard" },
    { id: 'exercises', name: 'Exercises' },
    { id: 'records', name: 'Records' },
    { id: 'settings', name: 'Settings' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-0">
      {/* <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Workout Tracker</h1>
      </div> */}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex justify-center" aria-label="Tabs">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Week Tracker - Show only in dashboard and records tabs */}
      {(activeTab === 'dashboard') && (
        <WeekTracker />
      )}

      {/* Tab Panels */}
      {activeTab === 'dashboard' && (
        <div>
          <RecordList dash={true} />
        </div>
      )}

      {activeTab === 'exercises' && (
        <ExerciseList />
      )}

      {activeTab === 'records' && (
        <RecordList />
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ConfigEdit />
        </div>
      )}
    </div>
  )
}