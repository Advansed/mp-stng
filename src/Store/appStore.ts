import { create } from 'zustand'
import { api } from './api'

interface AppFile {
  Файлы:        any[]
}

interface AppItem {
  id:           string
  service:      string
  date:         string
  number:       string
  address:      string
  status:       string
  agreements?:  AppFile
  files?:       AppFile
}

interface AppsStore {
  apps:         AppItem[]
  loading:      boolean
  
  setApps:      (apps: AppItem[]) => void
  setLoading:   (loading: boolean) => void
  
  fetchApps:    (token: string) => Promise<void>
  saveFiles:    (token: string, id: string, files: any) => Promise<boolean>
}

const useAppsStore = create<AppsStore>((set, get) => ({
  apps: [],
  loading: false,

  setApps: (apps) => set({ apps }),
  setLoading: (loading) => set({ loading }),

  fetchApps: async (token: string) => {
    set({ loading: true })
    try {
      const response = await api('ListServices', { token: token })

      console.log("Apps", response)
      if (!response.error) {
        set({ apps: response.data })
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
    } finally {
      set({ loading: false })
    }
  },

  saveFiles: async (token: string, id: string, files: any) => {
    set({ loading: true })
    try {
      const response = await fetch('https://aostng.ru/api/v2/s_files/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, id, files })
      })
      const data = await response.json()
      
      if (!data.error) {
        // Перезагрузить заявки после сохранения
        await get().fetchApps(token)
        return true
      }
      return false
    } catch (error) {
      console.error('Ошибка сохранения файлов:', error)
      return false
    } finally {
      set({ loading: false })
    }
  }
}))

export default useAppsStore