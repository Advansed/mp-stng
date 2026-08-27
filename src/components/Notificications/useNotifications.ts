import { useCallback } from 'react'
import { useToken } from '../Login/authStore'
import useNotificationsStore from '../../Store/notificationStore'

export const useNotifications = () => {
  const token = useToken()

  const notifications = useNotificationsStore((s) => s.notifications)
  const pages = useNotificationsStore((s) => s.pages)
  const loading = useNotificationsStore((s) => s.loading)
  const fetchNotifications = useNotificationsStore((s) => s.fetchNext)

  const refreshNotifications = useCallback(() => {
    if (!token) return
    void fetchNotifications(token)
  }, [token, fetchNotifications])

  return {
    pages,
    notifications,
    loading,
    refreshNotifications,
  }
}
