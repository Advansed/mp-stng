import { useEffect } from 'react';
import { selectCountersCount, selectTotalDebts, useLicsStore } from '../../Store/licsStore';
import { useToken } from '../../Store/loginStore';

export const useLics    = () => {
  const {
    lics,
    loading,
    selectedLic,
    getLics,
    setSelectedLic
  } = useLicsStore();

  const token           = useToken(); // получаем токен из loginStore

  // Селекторы
  const totalDebts      = useLicsStore(selectTotalDebts);
  const countersCount   = useLicsStore(selectCountersCount);

  useEffect(()=>{
    console.log("use", lics)
  },[ lics])

  // Автозагрузка при наличии токена
  useEffect(() => {
    if (token && lics.length === 0 && !loading) {
      getLics(token);
    }
  }, [token ]);

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
    info:           lics,
    loading,
    selectedLic,
    totalDebts,
    countersCount,
    refreshLics,
    selectLic,
    isLoading:      loading
  };
};