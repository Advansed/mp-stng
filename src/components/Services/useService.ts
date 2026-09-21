import { useServiceStore }  from '../../Store/serviceStore'
import { useToast }         from '../Toast'
import { useToken }         from '../Login/authStore'

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
  const loadServices        = async (options?: { silent?: boolean }) => {
    try {
      const res = await load( token || '', options )
      if(res?.error && !options?.silent) toast.error("Ошибка загрузки услуг")

    } catch (error) {
        if (!options?.silent) toast.error("Ошибка загрузки услуг")

    }
  }

  const saveService         = async (order: any, options?: { silent?: boolean }):Promise<any> => {
    order.token = token
    const silent = options?.silent || order.Проведен === 2
    const res = await save( order, { silent } )
    if (!silent) {
      if(res.error) toast.error( res.message )
      else toast.success( res.message )
    }
    return res
  }


  return {
    services,
    loadServices,
    preview,
    saveService
  }
}