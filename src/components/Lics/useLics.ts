import { useEffect } from 'react';
import { LicCounter, selectCountersCount, selectTotalDebts, useLicsStore } from '../../Store/licsStore';
import { useLoginStore, useToken } from '../../Store/loginStore';
import { api } from '../../Store/api';

export const useLics    = () => {
  const {
    lics,
    loading,
    selectedLic,
    getLics,
    addLic: add_Lic,
    delLic: del_Lic,
    setIndice : set_indice,
    setSelectedLic
  } = useLicsStore();

  const token           = useToken(); // получаем токен из loginStore
  const phone           = useLoginStore(state => state.user?.phone )
  const email           = useLoginStore(state => state.user?.email )

  // Селекторы
  const totalDebts      = useLicsStore(selectTotalDebts);
  const countersCount   = useLicsStore(selectCountersCount);

  useEffect(()=>{
    console.log("useLics", lics)
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

  const addLic = async( lic: string ) => {
      return await add_Lic( token || '', lic ) 
  }

  const delLic = async( lic: string ) => {
      return await del_Lic( token || '', lic )
  }

  const setIndice = async( counters: LicCounter[] ) => {
      return await set_indice( token || '', counters )
  }

  const sberPAY    = async( order: any ) => {
      order.token   = token || ''
      order.phone   = phone
      order.email   = email
      return await api('SBOL',  order )
  }
  
  const equaring    = async( order: any ) => {
      order.token   = token || ''
      order.phone   = phone
      order.email   = email
      return await api('VTB', order )
  }

  const sbp         = async( order: any ) => {
      order.token   = token || ''
      order.phone   = phone
      order.email   = email
      return await api('SBP', order )
  }
  
  const getpayments    = async(LC : string ) => {
      return await api('getPayments1', { token: token || '', LC: LC })
  }

  const getIndices    = async(counterId : string ) => {
      return await api('getIndices', { token: token || '', counterId: counterId })
  }

  return {
    info:           lics,
    loading,
    selectedLic,
    totalDebts,
    countersCount,
    refreshLics,
    selectLic,
    setIndice,
    addLic,
    delLic,
    sberPAY,
    equaring,
    sbp,
    getpayments,
    getIndices,
    isLoading:      loading
  };
};