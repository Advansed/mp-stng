import { useCallback, useMemo } from 'react'
import { useToken } from '../Login/authStore'
import useAppsStore from '../../Store/appStore'
import { useToast } from '../Toast'
import { api } from '../../Store/api'
import { agreementContractPath, parseSignedUrlResponse } from './agreementContract'

export const useApps = () => {
  const token               = useToken()
  const toast               = useToast()
  const loading             = useAppsStore((state) => state.loading)
  const saveFiles           = useAppsStore((state) => state.saveFiles)
  const setLoading          = useAppsStore((state) => state.setLoading)

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
      const res = await api("upd_details1", orderData)
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

  /** Подписанный договор по пути `{doc_id}\\AgreementTO\\AgreementTO.pdf`. */
  const getSignedAgreementUrl = useCallback(async (docId: string): Promise<string | null> => {
    if (!token || !docId) return null
    try {
      const res = await api('getsignedurl', {
        token,
        fileUrl: agreementContractPath(docId),
      })

      return parseSignedUrlResponse(res)
    } catch (error) {
      console.error('getsignedurl error:', error)
      return null
    }
  }, [token])

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
    loading,
    saveFiles: handleSaveFiles,
    get_details1,
    saveApp,
    previewApp,
    getSignedAgreementUrl,
  }), [loading, handleSaveFiles, get_details1, saveApp, previewApp, getSignedAgreementUrl])
}