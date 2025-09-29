import { create } from 'zustand';

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
  
    login:          (email: string, password: string) => Promise<void>;
    logout:         () => void;
    getProfile:     () => Promise<void>;
    updateProfile:  (data: Partial<User>) => Promise<void>;

}

export const useLoginStore = create<LoginStore>((set, get) => ({
    auth:           false,
    user:           null,
    token:          localStorage.getItem('token'),
    phone:          null,
    isLoading:      false,
    error:          null,
    isAuth:         !!localStorage.getItem('token'),

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
        const         res = await fetch('https://fhd.aostng.ru/inter_vesta/hs/API_STNG/V2/authorization', {
            method:     'POST',
            headers:    { 'Content-Type': 'application/json' },
            body:       JSON.stringify({ email, password })
        });
        
        if (!res.ok) throw new Error('Login failed');
        
        const { user, token, phone } = await res.json();
        localStorage.setItem('token', token);
        set({ user, token, phone, auth: true, isLoading: false });
        } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
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