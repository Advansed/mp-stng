import { create } from 'zustand'
import { api } from './api'

interface Notification {
  Шапка:    string
  Период:   string
  Текст:    string
  id?:      string
}

interface NotificationsStore {
  notifications:    Notification[]
  pages:            number,
  loading:          boolean
  
  setNotifications: ( notifications: Notification[] ) => void
  setLoading: ( loading: boolean ) => void
  
  fetchNext: ( token: string, page?: number ) => Promise<void>
}

const useNotificationsStore = create<NotificationsStore>((set, get) => ({
    notifications:  [],
    pages:          -1,
    loading:        false,

    setNotifications: (notifications) => set({ notifications }),
    setLoading: (loading) => set({ loading }),

    fetchNext: async ( token: string ) => {
        const { pages, loading } = get()
        if (loading) return
        set({ loading: true })
        const page = pages + 1;
        try {
            const data = await api('GetNotifications', { token, page })
      
            if (!data.error) {
                set({ pages: page, notifications: data.data || [] })
            } else {
                // Чтобы не крутить запрос бесконечно при ошибке API
                set({ pages: Math.max(page, 0) })
            }
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error)
            set({ pages: Math.max(page, 0) })
        } finally {
            set({ loading: false })
        }
    }
    
}))

export default useNotificationsStore