import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchSettings, processQueue, syncQueue } from '../api/client'

const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('pos_ip') || `http://${import.meta.env.VITE_DEFAULT_POS_IP}:3000`)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingSync, setPendingSync] = useState(0)
  const [settings, setSettings] = useState(null)

  const updateBaseUrl = (url) => {
    setBaseUrl(url)
    localStorage.setItem('pos_ip', url)
  }

  const checkSyncStatus = useCallback(async () => {
    const keys = await syncQueue.keys()
    setPendingSync(keys.length)
  }, [])

  const loadSettings = useCallback(async () => {
    if (!baseUrl) return
    try {
      const data = await fetchSettings(baseUrl)
      setSettings(data)
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }, [baseUrl])

  useEffect(() => {
    checkSyncStatus()
    loadSettings()
    const handleOnline = async () => {
      setIsOnline(true)
      if (baseUrl) {
        await processQueue(baseUrl)
        checkSyncStatus()
        loadSettings()
      }
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [baseUrl, checkSyncStatus, loadSettings])

  return (
    <AppContext.Provider value={{ baseUrl, updateBaseUrl, isOnline, pendingSync, checkSyncStatus, settings }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppConfig = () => useContext(AppContext)
