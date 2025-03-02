'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export enum StorageType {
  POSTGRES = 'postgres',
  LOCAL_STORAGE = 'localStorage'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

interface AppConfig {
  storageType: StorageType
  theme: Theme
  postgresUrl?: string
  // Add more config options here as needed
}

const DEFAULT_CONFIG: AppConfig = {
  storageType: StorageType.LOCAL_STORAGE,
  theme: Theme.LIGHT,
  postgresUrl: '',
}

// Cookie name
const CONFIG_COOKIE = 'workout_tracker_config'

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  const [loaded, setLoaded] = useState(false)

  // Load config from cookie on initial render
  useEffect(() => {
    const savedConfig = Cookies.get(CONFIG_COOKIE)
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig))
      } catch (e) {
        console.error('Failed to parse config cookie:', e)
        // If cookie is invalid, set it to default
        Cookies.set(CONFIG_COOKIE, JSON.stringify(DEFAULT_CONFIG))
      }
    } else {
      // If no cookie exists, create one with default config
      Cookies.set(CONFIG_COOKIE, JSON.stringify(DEFAULT_CONFIG))
    }
    setLoaded(true)
  }, [])

  // Update config
  const updateConfig = (newConfig: Partial<AppConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfig(updatedConfig)
    Cookies.set(CONFIG_COOKIE, JSON.stringify(updatedConfig))
    return updatedConfig
  }

  // Toggle storage type
  const toggleStorageType = () => {
    const newStorageType = config.storageType === StorageType.POSTGRES 
      ? StorageType.LOCAL_STORAGE 
      : StorageType.POSTGRES
    
    return updateConfig({ storageType: newStorageType })
  }

  const toggleTheme = () => {
    const newTheme = config.theme === Theme.DARK ? Theme.LIGHT : Theme.DARK
    return updateConfig({ theme: newTheme })
  }


  return {
    config,
    loaded,
    updateConfig,
    toggleStorageType,
    toggleTheme,
  }
}