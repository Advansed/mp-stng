import { useEffect } from 'react';
import { selectCountersCount, selectTotalDebts, useLicsStore } from '../../Store/licsStore';
import { useToken } from '../../Store/loginStore';

export const useLics    = () => {
  const {
    lics,
    loading,
    selectedLic,
    getLics,
    addLic: add_Lic,
    delLic: del_Lic,
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

  const addLic = async( lic: string, fio: string) => {
      await add_Lic( token || '', lic, fio)
  }

  const delLic = async( lic: string ) => {
      await del_Lic( token || '', lic )
  }

  return {
    info:           lics,
    loading,
    selectedLic,
    totalDebts,
    countersCount,
    refreshLics,
    selectLic,
    addLic,
    delLic,
    isLoading:      loading
  };
};