import { create } from 'zustand'
import { api } from '../Store/api'

interface Notification {
  Шапка:    string
  Период:   string
  Текст:    string
  id?:      string
}

interface NotificationsStore {
  notifications:    Notification[]
  loading:          boolean
  
  setNotifications: ( notifications: Notification[] ) => void
  setLoading: ( loading: boolean ) => void
  
  fetchNotifications: ( token: string, page?: number ) => Promise<void>
}

const useNotificationsStore = create<NotificationsStore>((set, get) => ({
    notifications: [],
    loading: false,

    setNotifications: (notifications) => set({ notifications }),
    setLoading: (loading) => set({ loading }),

    fetchNotifications: async (token: string, page = 0) => {
        set({ loading: true })
        try {
            const data = await api('GetNotifications', { token, page })
      
            if (!data.error) {
                set({ notifications: data.data })
            }
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error)
        } finally {
            set({ loading: false })
        }
    }
}))

export default useNotificationsStore