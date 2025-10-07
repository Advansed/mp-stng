import { create } from 'zustand'
import { api } from './api'

let storeInstanceId = 0;

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
  preview:      ( order:any ) => Promise<any>
  loadServices: ( token: string ) => Promise<any>
  resetState:   () => void
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  
    _storeInstanceId: ++storeInstanceId,
    
    services:       [],

    order:          { icon: "", text: "", chapters: [] },
  
    loading:        false,
  
    setInfo:        ( services )      => set({ services }),
  
    setLoading:     ( loading )   => set({ loading }),
  
    saveService:    async ( orderData: any) => {
        console.log("setLoading", true)
        set({ loading: true})
        try {
            // TODO: Заменить на fetch вместо getData
            console.log(orderData)
            const res = await api('services', orderData )
            console.log("saveService", res)
            set((state) => ({ ...state, loading: false })) // Функциональное обновление
            return res
        } catch (error:any) {
            set((state) => ({ ...state, loading: false })) // Функциональное обновление
            console.log(error)
            return { error: true, message: error.message }
        }
        
    },
    
    preview:        async ( orderData: any) => {
        try {
            // TODO: Заменить на fetch вместо getData
            console.log(orderData)
            const res = await api('preview', orderData )
            console.log("preview", res)
            return res
        } catch (error:any) {
            console.log(error)
            return { error: true, message: error.message }
        }        
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