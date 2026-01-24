import { useEffect } from 'react'
import { useToken } from '../Login/authStore'
import useAppsStore from '../../Store/appStore'
import { useToast } from '../Toast'

export const useApps = () => {
  const token = useToken()
  const toast = useToast()
  const {
    apps,
    loading,
    fetchApps,
    saveFiles
  } = useAppsStore()



  const handleRefresh = async () => {
    const res = await fetchApps( token || '' )
    if(res.error) toast.error("Ошибка загрузки заявок")
    else toast.success("Данные загрузились")
  }

  const handleSaveFiles = async (id: string, files: any) => {
    if (token) {
      return  await saveFiles(token, id, files)
    }
    return false
  }

  return {
    apps,
    loading,
    refreshApps: handleRefresh,
    saveFiles: handleSaveFiles
  }
}