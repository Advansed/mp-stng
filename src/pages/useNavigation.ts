import { useHistory } from 'react-router-dom';
import { useCallback } from 'react';
import { useNavigateStore } from '../Store/navigateStore';
import { LicsPage } from '../components/Lics';
import { ROUTES, isAppStatusPath, resolveAppPath } from '../routes';

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
      if (resolved === ROUTES.services) setPage(0);
      if (currentPage === resolved) return;
      setCurrentPage(resolved);
      history.push(resolved);
    },
    [history, setCurrentPage, setPage, currentPage]
  );

  const goBack = useCallback(() => {
    const onServices = currentPage === ROUTES.services;
    const onStatus = isAppStatusPath(currentPage);

    if (onServices && page > LicsPage.MAIN) {
      setPage(page - 1);
      return;
    }

    if (!onStatus && page > LicsPage.MAIN) {
      if (page === LicsPage.HISTORY_INDICES) setPage(LicsPage.INDICES);
      else setPage(LicsPage.MAIN);
      return;
    }

    const previousPage = navigateBack();
    if (previousPage) {
      history.push(previousPage);
    } else {
      history.goBack();
    }
  }, [history, page, currentPage, navigateBack, setPage]);

  return {
    goTo,
    goBack,
    item,
    setItem,
    page,
    setPage,
  };
};
