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
        set({ loading: true})
        try {
            const res = await api('services1', orderData )
            return res
        } catch (error:any) {
            console.error('Error saving service:', error);
            return { error: true, message: error.message }
        } finally {
            set((state) => ({ ...state, loading: false })) // Функциональное обновление
        }
        
    },
    
    preview:        async ( orderData: any) => {
        try {
            const res = await api('preview', orderData )
            return res
        } catch (error:any) {
            console.error('Error previewing service:', error);
            return { error: true, message: error.message }
        }        
    },

    loadServices:   async( token: string) => {

        set({ loading: true })
        try {
            const res = await api("s_details1", { token: token })
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
            console.error("Error loading services:", e)
            set({ loading: false})
        
        }
    },

    resetState:     () => set({

        services:   [],
        
        loading:    false,

    })
}))