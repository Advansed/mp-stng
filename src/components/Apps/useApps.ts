import { useEffect } from 'react'
import { useToken } from '../../Store/loginStore' // Предполагаем что токен берется отсюда
import useAppsStore from '../../Store/appStore'

export const useApps = () => {
  const token = useToken()
  const {
    apps,
    loading,
    fetchApps,
    saveFiles
  } = useAppsStore()

  useEffect(() => {
    if (token) {
      fetchApps(token)
    }
  }, [token, fetchApps])

  const refreshApps = () => {
    if (token) {
      fetchApps(token)
    }
  }

  const handleSaveFiles = async (id: string, files: any) => {
    if (token) {
      return await saveFiles(token, id, files)
    }
    return false
  }

  return {
    apps,
    loading,
    refreshApps,
    saveFiles: handleSaveFiles
  }
}