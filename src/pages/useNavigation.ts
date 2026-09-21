import { useHistory } from 'react-router-dom';
import { useCallback } from 'react';
import { useNavigateStore } from '../Store/navigateStore';
import { LicsPage } from '../components/Lics';
import { resolveAppPath } from '../routes';

export const useNavigation = () => {
  const history = useHistory();

  const {
    setCurrentPage,
    goBack: navigateBack,
    currentPage,
    page,
    item,
    setItem,
    setPage,
  } = useNavigateStore();

  const goTo = useCallback(
    (path: string) => {
      const resolved = resolveAppPath(path);
      if (currentPage === resolved) return;
      setCurrentPage(resolved);
      history.push(resolved);
    },
    [history, setCurrentPage, currentPage]
  );

  const goBack = useCallback(() => {
    if (page > LicsPage.MAIN) {
      if (page === LicsPage.HISTORY_INDICES) setPage(LicsPage.INDICES);
      else setPage(LicsPage.MAIN);
    } else {
      const previousPage = navigateBack();
      if (previousPage) {
        history.push(previousPage);
      } else {
        history.goBack();
      }
    }
  }, [history, page, navigateBack, setPage]);

  return {
    goTo,
    goBack,
    item,
    setItem,
    page,
    setPage,
  };
};
