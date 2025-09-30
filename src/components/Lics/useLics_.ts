import { useEffect } from 'react';
import { selectCountersCount, selectTotalDebts, useLicsStore } from '../../Store/licsStore';
import { useToken } from '../../Store/loginStore';

export const useLics_ = () => {
  const {
    lics,
    loading,
    selectedLic,
    getLics,
    setSelectedLic
  } = useLicsStore();

  const token = useToken(); // получаем токен из loginStore

  // Селекторы
  const totalDebts = useLicsStore(selectTotalDebts);
  const countersCount = useLicsStore(selectCountersCount);

  // Автозагрузка при наличии токена
  useEffect(() => {
    if (token && lics.length === 0 && !loading) {
      getLics(token);
    }
  }, [token, lics.length, loading, getLics]);

  // Методы
  const refreshLics = () => {
    if (token) {
      getLics(token);
    }
  };

  const selectLic = (licCode: string) => {
    const lic = lics.find(l => l.code === licCode);
    setSelectedLic(lic || null);
  };

  return {
    lics,
    loading,
    selectedLic,
    totalDebts,
    countersCount,
    refreshLics,
    selectLic,
    isLoading: loading
  };
};