// src/components/Lics/components/LicItem/types.ts

export interface LicItemCounter {
  counterId: string;
  code: string;
  name: string;
  number: string;
  tip: string;
  predIndice: number;
  predPeriod: string;
}

export interface LicItemDebt {
  id: string;
  label: string;
  sum: number;
}

export interface LicItemData {
  id: string;
  code: string;
  name: string;
  address: string;
  client: 'ВДГО' | 'Газоснабжение';
  counters: LicItemCounter[];
  debts: LicItemDebt[];
  sum: number;
}

export interface LicItemProps {
  info: LicItemData;
  ind: number;
  setItem: (item: LicItemData) => void;
  setPage: (page: number) => void;
  delAccount: (code: string) => void;
}