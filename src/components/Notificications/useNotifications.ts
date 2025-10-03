import { useEffect } from 'react'
import { useToken } from '../../Store/loginStore'
import useNotificationsStore from '../../Store/Notifications'

export const useNotifications = () => {

    const token = useToken()
    
    const {
        notifications,
        loading,
        fetchNotifications
    } = useNotificationsStore()

    useEffect(() => {
        if (token) {
            fetchNotifications(token, 0)
        }
    }, [token, fetchNotifications])

    const refreshNotifications = (page = 0) => {
        if (token) {
            fetchNotifications(token, page)
        }
    }

    return {
        notifications,
        loading,
        refreshNotifications
    }
    
}