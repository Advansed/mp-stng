import { useEffect }        from 'react'
import { useServiceStore }  from '../../Store/serviceStore'
import { useToast }         from '../Toast'
import { useToken }         from '../../Store/loginStore'

export const useServices = () => {
  const {
    services,
    saveService: save,
    loadServices: load,
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

  const saveService         = async (order: any):Promise<any> => {
    order.token = token
    const res = await save( order )
    console.log('saveservice', res)
    if(res.error) toast.error( res.message )
    else toast.success( res.message )
    return res
  }


  return {
    services,
    loadServices,
    preview,
    saveService
  }
}