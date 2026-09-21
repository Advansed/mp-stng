import { create } from 'zustand'
import { api } from './api'

let storeInstanceId = 0;

export interface TService {
    id:         string,
    icon:       string,
    text:       string,
    type?:      string,
    chapters:   TChapter[]
}

export interface TChapter {
    label:      string,
    data:       TField[],
    files:      TFile[]
}

export interface TField {
    doc?:       string,
    name:       string,
    value:      any,
    type:       string,
    ai_method:  string,
    label:      string,
    values:     string[],
    validate:   boolean
}

export interface TFile {
    doc?:       string,
    name:       string,
    label:      string,
    validate:   boolean,
    data:       TURL[],
    ai_method:  string,
    ai_status?: any,
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
  
  saveService:  ( order:any, options?: { silent?: boolean } ) => Promise<any>
  preview:      ( order:any ) => Promise<any>
  loadServices: ( token: string, options?: { silent?: boolean } ) => Promise<any>
  resetState:   () => void
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  
    _storeInstanceId: ++storeInstanceId,
    
    services:       [],

    order:          { icon: "", text: "", chapters: [] },
  
    loading:        false,
  
    setInfo:        ( services )      => set({ services }),
  
    setLoading:     ( loading )   => set({ loading }),
  
    saveService:    async ( orderData: any, options?: { silent?: boolean }) => {
        const silent = options?.silent || orderData?.Проведен === 2
        if (!silent) set({ loading: true})
        try {
            const res = await api('services_set', orderData )
            if (!res?.error && orderData?.token) {
                await get().loadServices(orderData.token, { silent: true })
            }
            return res
        } catch (error:any) {
            console.error('Error saving service:', error);
            return { error: true, message: error.message }
        } finally {
            if (!silent) set((state) => ({ ...state, loading: false }))
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

    loadServices:   async( token: string, options?: { silent?: boolean }) => {

        const silent = !!options?.silent
        if (!silent) set({ loading: true })
        try {
            const res = await api("services_get", { token: token })
            if(res.error){
                if (!silent) set({ loading: false})
                return res
            }
            else {
                set(silent ? { services: res.data } : { services: res.data, loading: false })
                return res
            }
        } catch(e) {
            console.error("Error loading services:", e)
            if (!silent) set({ loading: false})
        
        }
    },

    resetState:     () => set({

        services:   [],
        
        loading:    false,

    })
}))