import { useState, useCallback, useEffect } from 'react';
import { Store } from '../Store';
import { LicsItem, LicsPage, SetPageFunction } from './components/types';
import { 
    LICS_SUBSCRIPTION_IDS,
    LICS_BACK_ROUTES, 
    LICS_DEFAULTS,
    LICS_PAGE_NAMES,
    DEBUG_PREFIXES
} from './components/constants';

interface UseNavigationReturn {
  page:                     LicsPage;
  item:                     LicsItem | undefined;
  setItem:                  (item: LicsItem)=> void;
  setPage:                  SetPageFunction;
  handleBackNavigation:     () => void;
  getCurrentPageName:       () => string;
}

export const useNavigation = (): UseNavigationReturn => {
  
    const [ page, setPage ] = useState<LicsPage>(LICS_DEFAULTS.INITIAL_PAGE);
     
    const [ item, setItem ] = useState<LicsItem | undefined>( undefined )

  const getCurrentPageName = useCallback((): string => {
    return LICS_PAGE_NAMES[page] || 'Неизвестная страница';
  }, [page]);

  const setPageSafe: SetPageFunction = useCallback((newPage: number) => {
    if (newPage >= 0 && newPage <= 11) {
      console.log(`${DEBUG_PREFIXES.NAVIGATION} Page change: ${getCurrentPageName()} -> ${LICS_PAGE_NAMES[newPage] || newPage}`);
      setPage(newPage as LicsPage);
    } else {
      console.warn(`${DEBUG_PREFIXES.NAVIGATION} Invalid page number: ${newPage}`);
    }
  }, [getCurrentPageName]);

  const handleBackNavigation = useCallback(() => {
    const backRoute = LICS_BACK_ROUTES[page];
    
    console.log(`${DEBUG_PREFIXES.NAVIGATION} Back from ${getCurrentPageName()} (page ${page})`);
    
    if (backRoute === 'back') {
      Store.dispatch({ type: "route", route: "back" });
    } else if (typeof backRoute === 'number') {
      setPage(backRoute);
    } else {
      console.warn(`${DEBUG_PREFIXES.NAVIGATION} Unknown back route for page ${page}, fallback to main`);
      setPage(LICS_DEFAULTS.INITIAL_PAGE);
    }
  }, [page, getCurrentPageName]);

  // Подписка на back навигацию
  useEffect(() => {
    try {
      Store.subscribe({
        num: LICS_SUBSCRIPTION_IDS.BACK_NAVIGATION,
        type: "back",
        func: handleBackNavigation
      });

      console.log(`${DEBUG_PREFIXES.NAVIGATION} Navigation hook initialized`);
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Error initializing navigation hook:`, error);
    }

    return () => {
      try {
        Store.unSubscribe(LICS_SUBSCRIPTION_IDS.BACK_NAVIGATION);
        console.log(`${DEBUG_PREFIXES.NAVIGATION} Navigation hook cleanup completed`);
      } catch (error) {
        console.error(`${DEBUG_PREFIXES.ERROR} Error during navigation cleanup:`, error);
      }
    };
  }, [handleBackNavigation]);

  return {
    page,
    item,
    setItem,
    setPage: setPageSafe,
    handleBackNavigation,
    getCurrentPageName
  };
};