import { useEffect } from 'react'
import { useServiceStore } from '../../Store/serviceStore'
import { useToast } from '../Toast'
import { useToken } from '../../Store/loginStore'

export const useServices = () => {
  const {
    info,
    order,
    loading,
    setOrder,
    saveService,
    loadServices: load,
    resetState
  } = useServiceStore()

  const token = useToken()
  const toast = useToast()

  // TODO: Заменить на fetch вместо Store.getState().services
  const loadServices        = async () => {
    try {
      const res = await load( token || '' )
      if(res.error) toast.error("Ошибка загрузки услуг")

    } catch (error) {
        
        toast.error("Ошибка загрузки услуг")

    }
  }

  const handleSave          = async () => {
    await saveService()
  }


  useEffect(() => {
    loadServices()
    return () => resetState()
  }, [])

  return {
    info,
    order,
    loading,
    setOrder,
    handleSave
  }
}