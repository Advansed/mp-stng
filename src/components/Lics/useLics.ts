// src/components/hooks/useLics.ts

import { useState, useEffect, useCallback } from 'react';
import { Store } from '../Store';
import { 
  LicsItem, 
  LicsPage, 
  SetPageFunction, 
  SetItemFunction,
  StoreState
} from './components/types';
import { 
  LICS_SUBSCRIPTION_IDS, 
  LICS_BACK_ROUTES, 
  LICS_DEFAULTS,
  LICS_PAGE_NAMES,
  DEBUG_PREFIXES
} from './components/constants';

interface UseLicsReturn {
  // State
  info: LicsItem[];
  upd: number;
  page: LicsPage;
  item: LicsItem | undefined;
  
  // Setters
  setPage: SetPageFunction;
  setItem: SetItemFunction;
  
  // Methods
  handleBackNavigation: () => void;
  refreshLics: () => void;
  
  // Utility
  getCurrentPageName: () => string;
}

export const useLics = (): UseLicsReturn => {
  // State management
  const [info, setInfo] = useState<LicsItem[]>( LICS_DEFAULTS.INITIAL_INFO );
  const [upd, setUpd] = useState<number>(LICS_DEFAULTS.INITIAL_UPD_COUNTER);
  const [page, setPage] = useState<LicsPage>(LICS_DEFAULTS.INITIAL_PAGE);
  const [item, setItem] = useState<LicsItem | undefined>(LICS_DEFAULTS.INITIAL_ITEM);

  // Utility function to get current page name for debugging
  const getCurrentPageName = useCallback((): string => {
    return LICS_PAGE_NAMES[page] || 'Неизвестная страница';
  }, [page]);

  // Безопасная функция для получения данных из Store
  const getStoreData = useCallback((): LicsItem[] => {
    try {
      const storeState = Store.getState() as StoreState;
      return storeState.lics || [];
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Failed to get lics data from store:`, error);
      return [];
    }
  }, []);

  // Обработчик обновления данных lics
  const handleLicsUpdate = useCallback(() => {
    try {
      const licsData = getStoreData();
      setInfo(licsData);
      setUpd(prev => prev + 1);
      console.log(`${DEBUG_PREFIXES.LICS} Data updated, items count: ${licsData.length}`);
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Error updating lics data:`, error);
    }
  }, [getStoreData]);

  // Обработчик навигации назад
  const handleBackNavigation = useCallback(() => {
    try {
      const backRoute = LICS_BACK_ROUTES[page];
      
      console.log(`${DEBUG_PREFIXES.NAVIGATION} Back from ${getCurrentPageName()} (page ${page})`);
      
      if (backRoute === 'back') {
        Store.dispatch({ type: "route", route: "back" });
      } else if (typeof backRoute === 'number') {
        setPage(backRoute);
      } else {
        // Fallback на основную страницу
        console.warn(`${DEBUG_PREFIXES.NAVIGATION} Unknown back route for page ${page}, fallback to main`);
        setPage(LICS_DEFAULTS.INITIAL_PAGE);
      }
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Error in back navigation:`, error);
      // В случае ошибки пытаемся вернуться через Store
      Store.dispatch({ type: "route", route: "back" });
    }
  }, [page, getCurrentPageName]);

  // Принудительное обновление данных
  const refreshLics = useCallback(() => {
    try {
      const licsData = getStoreData();
      setInfo(licsData);
      console.log(`${DEBUG_PREFIXES.LICS} Data refreshed manually`);
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Error refreshing lics data:`, error);
    }
  }, [getStoreData]);

  // Типизированный setPage с дополнительной валидацией
  const setPageSafe: SetPageFunction = useCallback((newPage: number) => {
    try {
      if (newPage >= 0 && newPage <= 10) {
        console.log(`${DEBUG_PREFIXES.NAVIGATION} Page change: ${getCurrentPageName()} -> ${LICS_PAGE_NAMES[newPage] || newPage}`);
        setPage(newPage as LicsPage);
      } else {
        console.warn(`${DEBUG_PREFIXES.NAVIGATION} Invalid page number: ${newPage}`);
      }
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Error setting page:`, error);
    }
  }, [getCurrentPageName]);

  // Типизированный setItem с дополнительной валидацией
  const setItemSafe: SetItemFunction = useCallback((newItem: LicsItem) => {
    try {
      if (newItem && newItem.id) {
        console.log(`${DEBUG_PREFIXES.LICS} Item selected: ${newItem.name} (${newItem.code})`);
        setItem(newItem);
      } else {
        console.warn(`${DEBUG_PREFIXES.LICS} Invalid item:`, newItem);
      }
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Error setting item:`, error);
    }
  }, []);

  // Подписки на Store и инициализация
  useEffect(() => {
    let isSubscribed = true;

    try {
      // Подписка на обновления lics
      Store.subscribe({
        num: LICS_SUBSCRIPTION_IDS.LICS_UPDATE,
        type: "lics",
        func: handleLicsUpdate
      });

      // Подписка на back навигацию
      Store.subscribe({
        num: LICS_SUBSCRIPTION_IDS.BACK_NAVIGATION,
        type: "back",
        func: handleBackNavigation
      });

      // Инициализация данных только если компонент еще смонтирован
      if (isSubscribed) {
        refreshLics();
        console.log(`${DEBUG_PREFIXES.LICS} Hook initialized`);
      }
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Error initializing useLics hook:`, error);
    }

    // Cleanup подписок
    return () => {
      isSubscribed = false;
      try {
        Store.unSubscribe(LICS_SUBSCRIPTION_IDS.BACK_NAVIGATION);
        Store.unSubscribe(LICS_SUBSCRIPTION_IDS.LICS_UPDATE);
        console.log(`${DEBUG_PREFIXES.LICS} Hook cleanup completed`);
      } catch (error) {
        console.error(`${DEBUG_PREFIXES.ERROR} Error during cleanup:`, error);
      }
    };
  }, [handleLicsUpdate, handleBackNavigation, refreshLics]);

  // Дополнительный useEffect для отслеживания изменений page
  useEffect(() => {
    console.log(`${DEBUG_PREFIXES.NAVIGATION} Current page: ${getCurrentPageName()} (${page})`);
  }, [page, getCurrentPageName]);

  return {
    // State
    info,
    upd,
    page,
    item,
    
    // Setters (с валидацией)
    setPage: setPageSafe,
    setItem: setItemSafe,
    
    // Methods
    handleBackNavigation,
    refreshLics,
    
    // Utility
    getCurrentPageName
  };
};