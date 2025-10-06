import { useEffect }        from 'react'
import { useServiceStore }  from '../../Store/serviceStore'
import { useToast }         from '../Toast'
import { useToken }         from '../../Store/loginStore'

export const useServices = () => {
  const {
    services,
    loading,
    saveService: save,
    loadServices: load,
    resetState,
    preview
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

  const saveService         = async (order: any) => {
    order.token = token
    const res = await save( order )
    if(res.error) toast.error( res.message )
    else toast.success( res.message )
  }


  return {
    services,
    loading,
    loadServices,
    preview,
    saveService
  }
}