// useNavigation.ts
import { useIonRouter }         from '@ionic/react';
import { useCallback }          from 'react';
import { useNavigateStore }     from '../Store/navigateStore';
import { LicsPage }             from '../components/Lics';

export const useNavigation = () => {

  const ionRouter   = useIonRouter();

  const { setCurrentPage, goBack: navigateBack, page, item, setItem, setPage } = useNavigateStore();

  const goTo        = useCallback((path: string) => {
    setCurrentPage( path );
    ionRouter.push( path );
  }, [ionRouter, setCurrentPage]);

  const goBack      = useCallback((currentPage?: string) => {
    console.log("goBack", currentPage)
    if ( page > LicsPage.MAIN) {
        if(page === LicsPage.HISTORY_INDICES) setPage(LicsPage.INDICES)
        else setPage( LicsPage.MAIN)
    }
    else {
      const previousPage = navigateBack();
      if (previousPage) {
        ionRouter.push( previousPage);
      } else {
        ionRouter.goBack();
      }
    }
  }, [ionRouter, page, navigateBack]);

  return {
    goTo,
    goBack, 
    item, 
    setItem, 
    page, 
    setPage
  };
};

