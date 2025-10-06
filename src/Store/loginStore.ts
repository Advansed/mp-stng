import { create } from 'zustand';
import { api, version } from './api';

const url = 'https://fhd.aostng.ru/inter_vesta/hs/API_STNG/V2/'

export interface User {
  id:               string;
  email:            string;
  name:             string;
  surname:          string;
  lastname:         string;
  phone:            string;
  token:            string;
  pincode?:         string;
  monthes:          number;
  borders:          {
     from:          number;
     to:            number;
  }
  passport?: {
    serial:         string;
    number:         string;
    issuedDate:     string;
    issuedBy:       string;
    codePodr:       string;
  };

}

interface LoginStore {

    auth:           boolean,
    reg:            boolean,
    user:           User | null;
    token:          string | null;
    phone:          string | null;
    isLoading:      boolean;
    error:          string | null;
  
    login:          ( phone: string, password: string ) => Promise<any>;
    create:         ( phone: string, name: string, terms: boolean ) => Promise<boolean>;
    restore:        ( phone: string ) => Promise<boolean>;
    compare:        ( sms: string ) => boolean;
    setReg:         ( reg: boolean ) => void;
    setUser:        ( user: User ) => void;
    password:       ( password: string ) => Promise<boolean>;
    logout:         ( ) => void;
    getProfile:     ( ) => Promise<void>;
    updateProfile:  ( data: Partial<User> ) => Promise<void>;

}

export const useLoginStore = create<LoginStore>((set, get) => ({
    auth:           false,
    reg:            false,
    user:           null,
    token:          localStorage.getItem('token'),
    phone:          null,
    isLoading:      false,
    error:          null,
    isAuth:         !!localStorage.getItem('token'),

    login: async (login, password) => {
        
        set({ isLoading: true, error: null });

        const res = await api("authorization", {
            phone:      login, 
            password:   password, 
            version :   version, 
            mode:       "android"
        })
        
        if( !res.error ){
            set({ user: res.data, token: res.data.token, phone: res.data.code, auth: true, isLoading: false });
            return res
        }
        else {
            set({ isLoading: false });
            return res
        }
            
    },

    setUser: async ( login: User) => {
         set({ user: login, token: login.token, phone: login.phone, auth: true, isLoading: false });
    },

    setReg:   async( reg: boolean ) => { set({ reg: reg })},

    create: async (phone, name, terms) => {
        if (!phone || !terms) return false;
        
        set({ isLoading: true });
        try {
            const res = await api('registration', { phone, name, terms });
            console.log(res)
            if (!res.error) {
                set({ user: res.data, token: res.data.token, isLoading: false });
                return true;
            }
            set({ isLoading: false });
            return false;
        } catch {
            set({ isLoading: false });
            return false;
        }
    },

    restore: async (phone) => {
        set({ isLoading: true });
        try {
            const res = await api('restore', { phone });
            console.log(res);
            if (!res.error) {
                set({ 
                    user:       res.data.data , 
                    token:      res.data.data.token,
                    isLoading:  false 
                });
                return true;
            }
            set({ isLoading: false });
            return false;
        } catch {
            set({ isLoading: false });
            return false;
        }
    },

    compare: (sms) => {
        const { user } = get();
        console.log("restore", sms, user)
        return sms === user?.pincode;
    },

    password: async (password) => {
        set({ isLoading: true });
        try {
            const { token } = get();
            const res = await api('profile', { token: token, password });
            console.log(res )
            if (!res.error) {
                set({ auth: true, isLoading: false });
                return true;
            }
            set({ isLoading: false });
            return false;
        } catch {
            set({ isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('stngul.phone');
        localStorage.removeItem('stngul.pass');
        set({ user: null, auth: false });
    },

    getProfile: async () => {
        const { token } = get();
        if (!token) return;
        
        set({ isLoading: true });
        try {
        const res = await fetch('/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to get profile');
        
        const user = await res.json();
        set({ user, isLoading: false });
        } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
        }
    },

    updateProfile: async (data) => {
        const { token } = get();
        if (!token) return;
        
        set({ isLoading: true, error: null });
        try {

            const { user } = get()

            const res =  await api('set_profile', { token: token, ...data });
            
            if(!res.error)
                set({ user: {...user, ...data} as User, isLoading: false });

        } catch (error) {

            set({ error: (error as Error).message, isLoading: false });

        }
    }

}));

export const loginGetters = {

    getUser: () => useLoginStore.getState().user,

}

export const useToken   = () => useLoginStore(state => state.token );

export const useUser    = () => useLoginStore(state => state.user );

export const useAuth    = () => useLoginStore(state => state.auth)

export const useReg     = () => useLoginStore(state => state.reg)

export const useSetReg  = () => useLoginStore(state => state.setReg)

export const useSetUser = () => useLoginStore(state => state.setUser)


