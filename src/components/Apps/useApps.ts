import { useToken } from '../Login/authStore'
import useAppsStore from '../../Store/appStore'
import { useToast } from '../Toast'
import { api } from '../../Store/api'

export const useApps = () => {
  const token = useToken()
  const toast = useToast()
  const {
    apps,
    loading,
    fetchApps,
    saveFiles,
    setLoading
  } = useAppsStore()

  const handleRefresh = async () => {
    const res = await fetchApps(token || '')
    if (res?.error) toast.error("Ошибка загрузки заявок")
    else toast.success("Данные загрузились")
  }

  const handleSaveFiles = async (id: string, files: any) => {
    if (token) {
      return await saveFiles(token, id, files)
    }
    return false
  }

  /** Получение детальной информации о заявке для редактирования */
  const get_details1 = async (id: string) => {
    setLoading(true)
    try {
      const res = await api('get_details1', { token, id })

      if (res.success) return res.data
      else {
        toast.error(res.message || "Ошибка загрузки заявки")
        return undefined
      }
    } catch (error) {
      toast.error("Ошибка загрузки заявки")
      return undefined
    } finally {
      setLoading(false)
    }
  }

  /** Сохранение отредактированной заявки */
  const saveApp = async (orderData: any): Promise<any> => {
    orderData.token = token
    setLoading(true)
    try {
      const res = await api('save_details1', orderData)
      if (res.error) toast.error(res.message || "Ошибка сохранения")
      else toast.success(res.message || "Заявка сохранена")
      return res
    } catch (error: any) {
      toast.error("Ошибка сохранения заявки")
      return { error: true, message: error.message }
    } finally {
      setLoading(false)
    }
  }

  /** Предпросмотр заявки */
  const previewApp = async (orderData: any): Promise<any> => {
    orderData.token = token
    try {
      const res = await api('preview', orderData)
      return res
    } catch (error: any) {
      console.error('Error previewing app:', error)
      return { error: true, message: error.message }
    }
  }

  return {
    apps,
    loading,
    refreshApps:  handleRefresh,
    saveFiles:    handleSaveFiles,
    get_details1,
    saveApp,
    previewApp
  }
}