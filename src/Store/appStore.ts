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
  
  fetchApps:    (token: string) => Promise<any>
  saveFiles:    (token: string, id: string, files: any) => Promise<any>
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

      if (!response.error) {
        set({ apps: response.data })
        return response
      }
    } catch (error: any) {
      console.error('Ошибка загрузки заявок:', error)
      return {error: true, message: error.message}
    } finally {
      set({ loading: false })
    }
  },

  saveFiles: async (token: string, id: string, files: any) => {
    set({ loading: true })
    try {
      const response = await api('s_files', { token, id, files })

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error('Ошибка сохранения файлов:', error)
      return {error: true, mnessage: error.message}
    } finally {
      set({ loading: false })
    }
  }

}))

export default useAppsStore