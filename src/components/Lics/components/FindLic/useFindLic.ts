// src/components/Lics/hooks/useFindLic.ts
import { useState, useEffect } from 'react';
import { api } from '../../../../Store/api';
import { useLicsStore } from '../../../../Store/licsStore';
import { useToast } from '../../../Toast';
import { useToken } from '../../../Login/authStore';

// TODO: Миграция на zustand - заменить useState на store
// TODO: Миграция на fetch - заменить getData на нативный fetch API

export interface Ulus {
  ulus:             string;
  settlements:      Settlement[];
}

export interface Settlement {
  s_id:             string;
  settlement:       string;
  streets:          Street[]
}

export interface Street {
  ids:              string[];
  street:           string;
  houses:           House[]
}

export interface House {
  house:            string;
  apartments?:      Apartment[];
  lics?:            Lic[];
}

export interface Apartment {
  apartment:        string;
  lics?:            Lic[];
}

export interface Lic {
  code: string;
}

interface FindLicData {
  info:             Ulus[];
  ulus?:            Ulus;
  naspunkt?:        Settlement & { streets?: Street[] };
  street?:          Street & { houses?: House[] };
  house?:           House;
  kv?:              Apartment;
  lc?:              string;
  fio:              string;
  load:             boolean;
}

interface UseFindLicReturn {
  state:            FindLicData;
  loadSettlements:  () => Promise<void>;
  loadStreets:      (settlement: Settlement) => Promise<void>;
  loadHouses:       (street: Street) => Promise<void>;
  addAccount:       (params: AddAccountParams) => Promise<any>;
  setState:         (updates: Partial<FindLicData>) => void;
}

interface AddAccountParams {
  token:            string;
  s_id?:            string;
  ids?:             string;
  house_id?:        string;
  apartment?:       string;
  LC?:              string;
  fio:              string;
}

export const useFindLic = (): UseFindLicReturn => {
  const [state, setState] = useState<FindLicData>({
    info:           [],
    ulus:           undefined,
    naspunkt:       undefined,
    street:         undefined, 
    house:          undefined,
    kv:             undefined,
    lc:             undefined,
    fio:            "",
    load:           false
  });

  const token = useToken()
  const toast = useToast()

  const addLic  = useLicsStore( state => state.addLic )

  const updateState = (updates: Partial<FindLicData>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const loadSettlements = async () => {
    updateState({ load: true });
    const res = await api("getSettlements", { token })
    updateState({ 
      info: res.data as Ulus[],
      load: false 
    });
  };

  const loadStreets = async (settlement: Settlement) => {
    updateState({ load: true });
    const res = await api("getStreets", { token, s_id: settlement.s_id })
    
    if (res.error) {
      toast.error(res.message)
      updateState({load: false });
    } else {
      const settlementWithStreets = { 
        ...settlement, 
        streets: res.data as Street[] 
      };
      updateState({ 
        naspunkt: settlementWithStreets,
        load: false 
      });
    }
  };

  const loadHouses = async (street: Street) => {
    updateState({ load: true });
    const res = await api("getHouses", { token, ids: street.ids })
    
    if (res.error) {
      toast.error(res.message)
      updateState({ load: false });
    } else {
      const streetWithHouses = { 
        ...street, 
        houses: res.data as House[] 
      };
      updateState({ 
        street: streetWithHouses,
        load: false 
      });
    }
  };

  const addAccount = async (params: AddAccountParams) => {
    
    updateState({ load: true });
    try{
      const res = await addLic( token || '',  params.LC || '' )    
    
      if(res.error) toast.error(res.message)
      else toast.success("Лицевой счет добавлен")

      return res;
    } catch {
      return { error: true, message: "Ошибка добавления ЛС"}
    } finally {
      updateState({ load: false });  
    }
  };
   

  return {
    state,
    loadSettlements,
    loadStreets,
    loadHouses,
    addAccount,
    setState: updateState
  };
};
