'use client'
import { useState } from 'react'

import ConfigEdit from './config_edit'
import ExerciseList from './exercise_list'
import RecordList from './record_list'
import WeekTracker from './week_tracker'
import PlanList from './plan_list'

type TabType = 'dashboard' | 'exercises' | 'records' | 'plans' | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [isAnimating, setIsAnimating] = useState(false)

  const tabs = [
    { id: 'dashboard', name: "Dashboard" },
    { id: 'exercises', name: 'Exercises' },
    { id: 'records', name: 'Records' },
    { id: 'plans', name: 'Plans' },
    { id: 'settings', name: 'Settings' },
  ]

  // Get the current tab index and calculate visible tabs
  const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
  
  // Calculate the indices for visible tabs with wrapping
  const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
  const nextIndex = (currentIndex + 1) % tabs.length
  
  const visibleTabs = [
    tabs[prevIndex],
    tabs[currentIndex],
    tabs[nextIndex]
  ]

  const handleTabClick = async (tabId: TabType) => {
    if (isAnimating || tabId === activeTab) return

    setIsAnimating(true)
    
    setActiveTab(tabId)

    setIsAnimating(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-0">
      {/* <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Workout Tracker</h1>
      </div> */}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex justify-center" aria-label="Tabs">
        <div className="relative flex space-x-8">
  {visibleTabs.map((tab, index) => {
    const isActive = index === 1;
    return (
      <button
        key={tab.id}
        onClick={() => handleTabClick(tab.id as TabType)}
        disabled={isAnimating}
        className={`
          whitespace-nowrap py-2 px-0 border-b-2 font-medium text-sm
          transition-all duration-300 ease-out
          ${isActive 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'}
          ${isAnimating ? 'pointer-events-none' : ''}
        `}
        style={{
          transform: `scale(${isActive ? 1.1 : 0.9})`,
          opacity: isActive ? 1 : 0.8,
          filter: isActive ? 'none' : 'blur(0.5px)',
          transformOrigin: 'center bottom'
        }}
      >
        {tab.name}
      </button>
    );
  })}
</div>
        </nav>
      </div>

      {/* Content */}
      <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
        {/* Week Tracker */}
        {activeTab === 'dashboard' && <WeekTracker />}

        {/* Tab Panels */}
        {activeTab === 'dashboard' && (
          <div>
            <RecordList dash={true} />
          </div>
        )}

        {activeTab === 'exercises' && <ExerciseList />}

        {activeTab === 'records' && <RecordList />}

        {activeTab === 'plans' && <PlanList />}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ConfigEdit />
          </div>
        )}
      </div>
    </div>
  )
}