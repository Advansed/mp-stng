import { create } from 'zustand'
import { api } from './api'

export interface TService {
    icon:       string,
    text:       string,
    chapters:   TChapter[]
}

export interface TChapter {
    label:      string,
    data:       TField[],
    files:      TFile[]
}

export interface TField {
    name:       string,
    value:      any,
    type:       string,
    label:      string,
    values:     string[],
    validate:   boolean
}

export interface TFile {
    name:       string,
    label:      string,
    validate:   boolean,
    data:       TURL[]
}

export interface TURL {
    dataUrl:    string,
    format:     string,
}

interface ServiceState {

  services:     TService[]
  loading:      boolean
  
  setInfo:      ( info: any ) => void
  setLoading:   ( loading: boolean ) => void
  
  saveService:  ( order:any ) => Promise<any>
  loadServices: ( token: string ) => Promise<any>
  resetState:   () => void
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  
    services:       [],

    order:          { icon: "", text: "", chapters: [] },
  
    loading:        false,
  
    setInfo:        ( services )      => set({ services }),
  
    setLoading:     ( loading )   => set({ loading }),
  
    saveService:    async ( orderData: any) => {
        const { setLoading } = get()
        setLoading(true)
        
        try {
            // TODO: Заменить на fetch вместо getData
            const res = await api('Services', orderData )
            console.log("saveService", res)
            return res
        } catch (error:any) {
            console.log(error)
            return { error: true, message: error.message }
        }
        
        setLoading(false)
    },

    loadServices:   async( token: string) => {

        set({ loading: true })
        console.log("s_detals")
        try {
            const res = await api("s_details1", { token: token })
            console.log( res.data )
            if(res.error){
                set({ loading: false})
                return res
            }
            else {
                set({ services: res.data })
                set({ loading: false})
                return res
            }
        } catch(e) {
            console.log("error loadservice", e)
            set({ loading: false})
        }
    },

    resetState:     () => set({

        services:   [],
        loading:    false,

    })
}))