import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from './api';
import { useToken } from './loginStore';
import { loadavg } from 'os';
import { getLics } from '../components/Store';
import { useToast } from '../components/Toast';

interface   Counter {
  counterId:            string;
  code:                 string;
  name:                 string;
  number:               string;
  tip:                  string;
  predIndice:           number;
  predPeriod:           string;
}

interface   Debt {
  id:                   string;
  label:                string;
  sum:                  number;
}

interface   Lic {
  id:                   string;
  code:                 string;
  name:                 string;
  address:              string;
  client:               'ВДГО' | 'Газоснабжение';
  counters:             Counter[];
  debts:                Debt[];
}

interface   ApiResponse {
  error:                boolean;
  data?:                Lic[];
  message?:             string;
}

interface   LicsState {
  lics:                 Lic[];
  loading:              boolean;
  selectedLic:          Lic | null;
}

interface   LicsActions {
  getLics:              (token: string) => Promise<void>;
  addLic:               (token: string, lic: string, fio: string) => Promise<void>;
  delLic:                (token: string, lic: string ) => Promise<void>;
  setSelectedLic:       (lic: Lic | null) => void;
}

type        LicsStore = LicsState & LicsActions;


export const useLicsStore = create<LicsStore>()(
  devtools(
    (set) => ({
      // State
      lics:             [],
      loading:          false,
      selectedLic:      null,

      // Actions
      getLics:         async (token: string) => {
        set({ loading: true });
        try {
          const res = await api('getAccount', { token });
          console.log('getAccount', res )
          
          if (res.error) {
            return;
          }

          const licsWithSum = res.data?.map(lic => ({
            ...lic,
            sum: parseFloat(lic.debts.reduce((total, debt) => total + debt.sum, 0).toFixed(2))
          })) || [];
          
          set({ lics: licsWithSum || [], loading: false });
        } catch (error) {
          set({ loading: false });
        }
      },

      addLic:         async ( token: string, lic: string, fio: string ) => {
        set({ loading: true })
        
        const res = await api('addAccount', { token: token, LC: lic, fio: fio });
        console.log( res )
          
        if (res.error) {
          return;
        }

         try {
          const res = await api('getAccount', { token });
          console.log('getAccount', res )
          
          if (res.error) {
            return;
          }

          const licsWithSum = res.data?.map(lic => ({
            ...lic,
            sum: parseFloat(lic.debts.reduce((total, debt) => total + debt.sum, 0).toFixed(2))
          })) || [];
          
          set({ lics: licsWithSum || [], loading: false });
        } catch (error) {
          set({ loading: false });
        }

        set({ loading: false })
      },

      delLic:         async ( token: string, lic: string ) => {
        set({ loading: true })

        console.log("LC", lic)
        
        const res = await api('delAccount', { token: token, LC: lic });

        console.log( res )
          
        if (res.error) {
          return;
        }

         try {
          const res = await api('getAccount', { token });
          console.log('getAccount', res )
          
          if (res.error) {
            return;
          }

          const licsWithSum = res.data?.map(lic => ({
            ...lic,
            sum: parseFloat(lic.debts.reduce((total, debt) => total + debt.sum, 0).toFixed(2))
          })) || [];
          
          set({ lics: licsWithSum || [], loading: false });
        } catch (error) {
          set({ loading: false });
        }
        
        set({ loading: false })
      },

      setSelectedLic:   (lic) => set({ selectedLic: lic }),

    }),
    { name: 'lics-store' }
  )
);

// Selectors
export const selectLicByCode = (code: string) => (state: LicsStore) => 
  state.lics.find(lic => lic.code === code);

export const selectTotalDebts = (state: LicsStore) => 
  state.lics.reduce((total, lic) => 
    total + lic.debts.reduce((sum, debt) => sum + debt.sum, 0), 0);

export const selectCountersCount = (state: LicsStore) => 
  state.lics.reduce((total, lic) => total + lic.counters.length, 0);

