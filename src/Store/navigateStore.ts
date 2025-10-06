// Store/navigateStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigateState {
  currentPage:      string;
  previousPage:     string;
  page:             number;
  item:             any;
  history:          string[];
  back:             number,
  isPageActive:     (pageName: string) => boolean;
  setCurrentPage:   (pageName: string) => void;
  goBack:           () => string | null;
  setBack:          () => void;
  setPage:          (page:number) => void;
  setItem:          (item: any) => void;
  getPreviousPage:  () => string | null;
  clearHistory:     () => void;
}

export const useNavigateStore = create<NavigateState>()(
  
    persist(
        (set, get) => ({
            currentPage:    '',
            previousPage:   '',
            page:           0,
            item:           null,
            history:        [],
            back:           0,

            isPageActive: (pageName: string) => {
                return get().currentPage === pageName;
            },

            setCurrentPage: (pageName: string) => {
                const { currentPage, history } = get();
                
                if (currentPage === pageName) return;

                set({
                    previousPage:       currentPage,
                    currentPage:        pageName,
                    page:               0,
                    history:            [...history.slice(-9), pageName] // храним последние 10 страниц
                });
            },

            goBack: () => {
                const { history } = get();
                if (history.length < 2) return null;

                const newHistory = history.slice(0, -1);
                const previousPage = newHistory[newHistory.length - 1] || '';

                set({
                history: newHistory,
                currentPage: previousPage,
                previousPage: history[history.length - 1]
                });

                return previousPage;
            },

            setBack: () => {
                set({ back: 1 })
            },

            setPage: (page: number) => {
                set({ page : page})
            },

            setItem: (item: any) => {
                set({ item : item})
            },

            getPreviousPage: () => {
                const { history } = get();
                return history.length > 1 ? history[history.length - 2] : null;
            },

            clearHistory: () => {
                set({
                currentPage: '',
                previousPage: '',
                history: []
                });
            }
        }
    ),
    {
      name: 'navigate-storage',
      partialize: (state) => ({ 
        history: state.history,
        currentPage: state.currentPage 
      })
    }
  )
);

// Хук для использования в компонентах
export const useCurrentPage = () => {
  return useNavigateStore(state => state.currentPage);
};

export const useIsPageActive = (pageName: string) => {
  return useNavigateStore(state => state.isPageActive(pageName));
};