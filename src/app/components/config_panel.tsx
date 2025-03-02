'use client'

import { useState } from 'react'
import { useAppConfig, StorageType, Theme } from '@/app/lib/config_store'

export default function ConfigPanel() {
  const { config, loaded, toggleStorageType, toggleTheme, updateConfig} = useAppConfig()
  const [showPanel, setShowPanel] = useState(false)
  const [dbUrl, setDbUrl] = useState(config.postgresUrl || '')

  const handleDbUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDbUrl(e.target.value)
  }

  const saveDbUrl = () => {
    updateConfig({ postgresUrl: dbUrl })
  }

  if (!loaded) return null

  return (
    <div className="h-screen w-full flex flex-col bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <div className="flex items-center">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="text-blue-500 text-sm flex items-center mr-4"
          >
            <span className="mr-1">⚙️</span> {showPanel ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col">
        <div className="bg-gray-50 p-5 rounded-lg flex-grow">
          <h3 className="text-lg font-medium mb-6">App Configuration</h3>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="mr-4 text-md">Storage Mode:</span>
              <button
                onClick={toggleStorageType}
                className={`px-4 py-2 rounded-md ${config.storageType === StorageType.POSTGRES
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-500 text-white'
                  }`}
              >
                {config.storageType === StorageType.POSTGRES
                  ? 'PostgreSQL'
                  : 'Local Storage'}
              </button>
            </div>

            {config.storageType === StorageType.POSTGRES && (
              <div className="mt-3 ml-2 pl-4 border-l-2 border-red-300">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Database URL
                </label>
                <input
                  type="text"
                  value={dbUrl}
                  onChange={handleDbUrlChange}
                  placeholder="postgres://username:password@host:port/database"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm mb-2"
                />
                <button
                  onClick={() => {
                    console.log('Saving encrypted URL:', dbUrl);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-sm "
                >
                  Save Encrypted
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  Use @greasycat's authentication service by default. You can set up your own authentication service as documented. The authentication service only stores a hashed version of your password.
                </p>

                <button
                  onClick={saveDbUrl}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md text-sm mb-3 mt-3"
                >
                  Save Without Encryption (unsafe)
                </button>
                <p className="text-xs text-red-500">
                  Warning: The postgres URL will be saved in plaintext.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center mb-6">
            <span className="mr-4 text-md">Theme:</span>
            <button
              onClick={toggleTheme}
              className={`px-4 py-2 rounded-md ${config.theme === Theme.DARK
                  ? 'bg-gray-800 text-white'
                  : 'bg-yellow-500 text-white'
                }`}
            >
              {config.theme === Theme.DARK ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>


          {showPanel && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-200">
              <h4 className="text-md font-medium mb-3">Advanced Settings</h4>
              <p className="text-xs text-gray-500">
                Additional configuration options will be available here in future updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}