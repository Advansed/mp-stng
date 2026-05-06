import { useCallback, useMemo } from 'react'
import { useToken } from '../Login/authStore'
import useAppsStore from '../../Store/appStore'
import { useToast } from '../Toast'
import { api } from '../../Store/api'

let refreshInFlight: Promise<any> | null = null

export const useApps = () => {
  const token               = useToken()
  const toast               = useToast()
  const apps                = useAppsStore((state) => state.apps)
  const loading             = useAppsStore((state) => state.loading)
  const fetchApps           = useAppsStore((state) => state.fetchApps)
  const saveFiles           = useAppsStore((state) => state.saveFiles)
  const setLoading          = useAppsStore((state) => state.setLoading)

  const handleRefresh       = useCallback(async () => {
    if (refreshInFlight) return refreshInFlight

    refreshInFlight = (async () => {
      const res = await fetchApps(token || '')
      if (res?.error) toast.error("Ошибка загрузки заявок")
      else toast.success("Данные загрузились")
      return res
    })()

    try {
      return await refreshInFlight
    } finally {
      refreshInFlight = null
    }
  }, [token, fetchApps, toast])

  const handleSaveFiles     = useCallback(async (id: string, files: any) => {
    if (token) {
      return await saveFiles(token, id, files)
    }
    return false
  }, [token, saveFiles])

  /** Получение детальной информации о заявке для редактирования */
  const get_details1        = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const res = await api('get_details1', { token, id })

      if (res.success) {
        return res.data
      } else {
        toast.error(res.message || "Ошибка загрузки заявки")
        return undefined
      }
    } catch (error) {
      console.error("get_details1 error:", error)
      toast.error("Ошибка загрузки заявки")
      return undefined
    } finally {
      setLoading(false)
    }
  }, [token, setLoading, toast])

  /** Сохранение отредактированной заявки */
  const saveApp             = useCallback(async (orderData: any): Promise<any> => {
    orderData.token = token
    setLoading(true)
    try {
      console.log("save orderData", orderData )
      const res = await api("upd_details1", orderData)
      console.log("upd_details1", res)
      if (res.error) toast.error(res.message || "Ошибка сохранения")
      else toast.success(res.message || "Заявка сохранена")

      return res
    } catch (error: any) {
      toast.error("Ошибка сохранения заявки")
      return { error: true, message: error.message }
    } finally {
      setLoading(false)
    }
  }, [token, setLoading, toast])

  /** Предпросмотр заявки */
  const previewApp          = useCallback(async (orderData: any): Promise<any> => {
    orderData.token = token
    try {
      const res = await api('preview', orderData)
      return res
    } catch (error: any) {
      console.error('Error previewing app:', error)
      return { error: true, message: error.message }
    }
  }, [token])

  return useMemo(() => ({
    apps,
    loading,
    refreshApps: handleRefresh,
    saveFiles: handleSaveFiles,
    get_details1,
    saveApp,
    previewApp
  }), [apps, loading, handleRefresh, handleSaveFiles, get_details1, saveApp, previewApp])
}