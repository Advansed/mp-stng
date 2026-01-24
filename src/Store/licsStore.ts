import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from './api';


export interface   LicCounter {
  counterId:            string;
  code:                 string;
  name:                 string;
  number:               string;
  tip:                  string;
  predIndice:           number;
  predPeriod:           string;
  poverka:              number;
  p_text:               string;
  p_data:               string;
  indice:               number;
  period:               string;
}

interface   Debt {
  id:                   string;
  label:                string;
  sum:                  number;
  pay:                  number;
}

export interface   Lic {
  
  id:                   string;
  code:                 string;
  name:                 string;
  address:              string;
  client:               'ВДГО' | 'Газоснабжение';
  counters:             LicCounter[];
  debts:                Debt[];
  sum:                  number;
  order:                any;
  notice?:              any;

}

interface   ApiResponse {
  error:                boolean;
  data?:                Lic[];
  message?:             string;
}

export interface    HistPayment {
  number:               string;
  summ:                 number;  
}

export interface    HistSection {
  date:                 string;
  pays:                 HistPayment[];
  summ:                 number;
}

export interface    History {
  LC:                   string;
  payments:             HistSection[];
}

interface           LicsState {
  lics:                 Lic[];
  hist_payment:         History[];
  hist_indices:         any;
  loading:              boolean;
  selectedLic:          Lic | null;
}

interface           LicsActions {
  
  getLics:              ( token: string) => Promise<any>;
  addLic:               ( token: string, lic: string ) => Promise<any>;
  delLic:               ( token: string, lic: string ) => Promise<any>;
  get_payment:          ( token: string, LC: string ) => Promise<any>
  get_indices:          ( token: string, counterId: string ) => Promise<any>
  setIndice:            ( token: string, counters: LicCounter[] ) => Promise<boolean>;
  setLoading:           ( loading: boolean ) => void;
  setSelectedLic:       ( lic: Lic | null ) => void;

}

type        LicsStore = LicsState & LicsActions;


export const useLicsStore = create<LicsStore>()(
  devtools(
    (set, get) => ({
      // State
      lics:             [],
      hist_payment:     [],
      hist_indices:     [],
      loading:          false,
      selectedLic:      null,

      // Actions
      getLics:         async (token: string) => {
        set({ loading: true });
        try {
          const res = await api('getAccount', { token });
          
          if (res.error) {
            return res;
          }

          const licsWithSum = res.data?.map(lic => ({
            ...lic,
            sum: parseFloat(lic.debts.reduce((total, debt) => total + debt.sum, 0).toFixed(2))
          })) || [];
          
          set({ lics: licsWithSum || [], loading: false });

          return res
        } catch (error) {
          set({ loading: false });
          return {error: true, message: "Ошибка получения ЛС"}
        }
      },

      addLic:         async ( token: string, lic: string ) => {
        set({ loading: true })
        
        const res = await api('addAccount', { token: token, LC: lic });
          
        if (res.error) {
          set({ loading: false })
          return res;
        }

         try {
          const res = await api('getAccount', { token });
          
          if (res.error) {
            return res ;
          }

          const licsWithSum = res.data?.map(lic => ({
            ...lic,
            sum: parseFloat(lic.debts.reduce((total, debt) => total + debt.sum, 0).toFixed(2))
          })) || [];
          
          set({ lics: licsWithSum || [], loading: false });
          return res;
        } catch (error) {
          set({ loading: false });
          return {error: true, message: "Ошибка добавления ЛС "}
        } finally {
          set({ loading: false })
        }
        
      },

      delLic:         async ( token: string, lic: string ) => {
        set({ loading: true })
        
        const res = await api('delAccount', { token: token, LC: lic });
          
        if (res.error) {
          return res ;
        }

         try {
          const res = await api('getAccount', { token });
          
          if (res.error) {
            return res;
          }

          const licsWithSum = res.data?.map(lic => ({
            ...lic,
            sum: parseFloat(lic.debts.reduce((total, debt) => total + debt.sum, 0).toFixed(2))
          })) || [];
          
          set({ lics: licsWithSum || [], loading: false });
          return res
        } catch (error) {
          return {error: true, message: "Ошибка удаления ЛС"}
        } finally {
          set({ loading: false })  
        }
        
      },

      setIndice:      async ( token: string, counters: LicCounter[] ) => { 
        set({ loading: true })
         const res = await api('setIndications', { token: token, counters: counters });

         if(!res.error){
            try {
              const res = await api('getAccount', { token });
              
              if (res.error) {
                return res;
              }

              const licsWithSum = res.data?.map(lic => ({
                ...lic,
                sum: parseFloat(lic.debts.reduce((total, debt) => total + debt.sum, 0).toFixed(2))
              })) || [];
              
              set({ lics: licsWithSum || [], loading: false });
              return res
            } catch (error) {
              return { error: true, message: "Ошибка передачи показаний"}
            } finally {
              set({ loading: false });
            }
        } else {
          set({ loading: false })
          return res
        } 
      },

      get_payment:    async ( token: string, LC: string ) => {
          set({ loading: true})

          try {
              const res = await api("getPayments1", { token, LC } )
              if(!res.error){
                const { hist_payment } = get()
                hist_payment.push( res.data[0]) 
                set({ hist_payment })
              }
              return res;
          } finally {
            set({ loading: false })
          }
      },

      get_indices:     async ( token: string, counterId: string ) => {
          set({ loading: true})

          try {
              const res = await api("getIndices1", { token, counterId } )
              if(!res.error){
                const { hist_indices } = get()
                hist_indices.push( res.data[0]) 
                set({ hist_indices })
              }
              return res;
          } finally {
            set({ loading: false })
          }
      },  

      setLoading:     async ( loading: boolean ) => set({ loading }),

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

