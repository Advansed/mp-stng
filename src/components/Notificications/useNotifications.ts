import { useToken }             from '../../Store/loginStore'
import useNotificationsStore    from '../../Store/notificationStore'

export const useNotifications = () => {

    const token = useToken()
    
    const {
        notifications,
        pages,
        loading,
        fetchNext: fetchNotifications
    } = useNotificationsStore()



    const refreshNotifications = () => {
        if (token) {
            fetchNotifications(token)
        }
    }
    
    return {
        pages,
        notifications,
        loading,
        refreshNotifications
    }
    
}