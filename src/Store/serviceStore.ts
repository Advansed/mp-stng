import { create } from 'zustand'
import { api } from './api'

interface ServiceState {
  info:         any
  order:        any
  loading:      boolean
  
  setInfo:      (info: any) => void
  setOrder:     (order: any) => void
  setLoading:   (loading: boolean) => void
  
  saveService:  () => Promise<void>
  loadServices: ( token: string ) => Promise<any>
  resetState:   () => void
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  info:         {},
  order:        {},
  loading:      false,
  
  setInfo:      (info)      => set({ info }),
  
  setOrder:     (order)     => set({ order }),
  
  setLoading:   (loading)   => set({ loading }),
  
  saveService:  async ( ) => {
    const { order, setLoading } = get()
    setLoading(true)
    
    try {
      // TODO: Заменить на fetch вместо getData
      const res = await api('Services', order)
      
      if (!res.error) {
        set({ order: res.data })
      } else {
        set({ order: res.data })
      }
    } catch (error) {

    }
    
    setLoading(false)
  },

  loadServices: async( token: string) => {

    set({ loading: true })
        const res = await api("S_Details", { token: token })

        if(res.error){
            set({ loading: false})
            return res
        }
        else {
            set({ info: res.data })
            set({ loading: false})
            return res
        }
  },

  resetState:   () => set({
    info:       {},
    order:      {},
    loading:    false,
  })
}))