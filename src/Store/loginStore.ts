import { create } from 'zustand';
import { fetchData } from './api';
import { useToast } from '../components/Toast';

const url = 'https://fhd.aostng.ru/inter_vesta/hs/API_STNG/V2/'

const toast = useToast()

interface User {
  id:               string;
  email:            string;
  name:             string;
  surname?:         string;
  lastname?:        string;
  phone?:           string;
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
    user:           User | null;
    token:          string | null;
    phone:          string | null;
    isLoading:      boolean;
    error:          string | null;
  
    login:          ( phone: string, password: string ) => Promise<void>;
    logout:         ( ) => void;
    getProfile:     ( ) => Promise<void>;
    updateProfile:  ( data: Partial<User> ) => Promise<void>;

}

export const useLoginStore = create<LoginStore>((set, get) => ({
    auth:           false,
    user:           null,
    token:          localStorage.getItem('token'),
    phone:          null,
    isLoading:      false,
    error:          null,
    isAuth:         !!localStorage.getItem('token'),

    login: async (login, password) => {
        
        set({ isLoading: true, error: null });

        const res = await fetchData("authorization", {
            phone:      login, 
            password:   password, 
            version :   "2.3.9", 
            mode:       "android"
        })
        
        if( res.error )
            set({ user: res.data, token: res.data.token, phone: res.data.code, auth: true, isLoading: false });
        else {
            set({ isLoading: false });
            toast.error( res.message )
        }
            
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, phone: null, auth: false });
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
        const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });
        
        if (!res.ok) throw new Error('Update failed');
        
        const user = await res.json();
        set({ user, isLoading: false });
        } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
        }
    }

}));

export const useToken   = () => useLoginStore(state => state.token);

export const useAuth    = () => useLoginStore(state => state.auth);
