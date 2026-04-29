import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchSettings, processQueue, syncQueue } from '../api/client'

const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('pos_ip') || `http://${import.meta.env.VITE_DEFAULT_POS_IP}:3000`)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [posOnline, setPosOnline] = useState(false)
  const [pendingSync, setPendingSync] = useState(0)
  const [settings, setSettings] = useState(null)
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

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
      setPosOnline(true)
    } catch (err) {
      setPosOnline(false)
    }
  }, [baseUrl])

  const triggerRefresh = useCallback(() => {
    setRefreshing(prev => !prev)
  }, [])

  useEffect(() => {
    checkSyncStatus()
    loadSettings()
    
    const interval = setInterval(() => {
      loadSettings()
    }, 10000)

    const handleOnline = async () => {
      setIsOnline(true)
      if (baseUrl) {
        await processQueue(baseUrl)
        checkSyncStatus()
        loadSettings()
      }
    }
    const handleOffline = () => {
      setIsOnline(false)
      setPosOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [baseUrl, checkSyncStatus, loadSettings])

  useEffect(() => {
    if (posOnline && baseUrl) {
      processQueue(baseUrl).then(checkSyncStatus)
    }
  }, [posOnline, baseUrl, checkSyncStatus])

  const clearSyncQueue = useCallback(async () => {
    await syncQueue.clear()
    checkSyncStatus()
  }, [checkSyncStatus])

  return (
    <AppContext.Provider value={{ 
      baseUrl, updateBaseUrl, isOnline, posOnline, pendingSync, 
      checkSyncStatus, settings, search, setSearch, 
      refreshing, triggerRefresh, clearSyncQueue 
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppConfig = () => useContext(AppContext)
