// src/components/Lics/hooks/useFindLic.ts
import { useState, useEffect } from 'react';
import { api } from '../../../../Store/api';
import { useToken } from '../../../../Store/loginStore';
import { useLicsStore } from '../../../../Store/licsStore';

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
  kv?:              string;
  lc?:              string;
  fio:              string;
  message:          string;
  load:             boolean;
}

interface UseFindLicReturn {
  state:            FindLicData;
  loadSettlements:  () => Promise<void>;
  loadStreets:      (settlement: Settlement) => Promise<void>;
  loadHouses:       (street: Street) => Promise<void>;
  addAccount:       (params: AddAccountParams) => Promise<void>;
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
    message:        "",
    load:           false
  });

  const token = useToken()

  const { addLic } = useLicsStore()

  const updateState = (updates: Partial<FindLicData>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const loadSettlements = async () => {
    updateState({ load: true });
    const res = await api("getSettlements", { token })
    console.log(res)
    updateState({ 
      info: res.data as Ulus[],
      load: false 
    });
  };

  const loadStreets = async (settlement: Settlement) => {
    updateState({ load: true });
    const res = await api("getStreets", { token, s_id: settlement.s_id })
    
    if (res.error) {
      updateState({ message: res.message, load: false });
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
      updateState({ message: res.message, load: false });
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

        await addLic( token || '',  params.LC || '', params.fio || '' )    

    updateState({ load: false });

  };

  useEffect(() => {
    loadSettlements();
  }, []);

  return {
    state,
    loadSettlements,
    loadStreets,
    loadHouses,
    addAccount,
    setState: updateState
  };
};
