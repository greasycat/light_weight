'use client'

import { useState } from 'react'
import { useAppConfig, StorageType, Theme } from '@/app/lib/config_store'

export default function ConfigPanel() {
  const { config, loaded, toggleStorageType, toggleTheme } = useAppConfig()
  const [showPanel, setShowPanel] = useState(false)

  if (!loaded) return null

  return (
    <div>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="text-blue-500 text-sm flex items-center"
      >
        <span className="mr-1">⚙️</span> {showPanel ? 'Hide Settings' : 'Settings'}
      </button>
      
      {showPanel && (
        <div className="absolute right-0 mt-2 p-4 bg-white rounded-lg border border-gray-200 shadow-lg z-10 w-64">
          <h3 className="text-md font-medium mb-3">App Configuration</h3>
          
          <div className="flex items-center mb-2">
            <span className="mr-2 text-sm">Storage Mode:</span>
            <button
              onClick={toggleStorageType}
              className={`px-3 py-1 rounded-md text-sm ${
                config.storageType === StorageType.POSTGRES
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {config.storageType === StorageType.POSTGRES
                ? 'PostgreSQL'
                : 'Local Storage'}
            </button>
          </div>

          <div className="flex items-center mb-2">
            <span className="mr-2 text-sm">Theme:</span>
            <button
              onClick={toggleTheme}
              className={`px-3 py-1 rounded-md text-sm ${
                config.theme === Theme.DARK
                  ? 'bg-gray-800 text-white'
                  : 'bg-yellow-500 text-white'
              }`}
            >
              {config.theme === Theme.DARK ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            {config.storageType === StorageType.POSTGRES
              ? 'Your data is stored in a remote PostgreSQL database.'
              : 'Your data is stored locally in your browser.'}
          </p>
        </div>
      )}
    </div>
  )
}