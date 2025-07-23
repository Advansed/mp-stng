// src/components/types/lics.types.ts

// Основные интерфейсы
export interface LicsCounter {
  counterId: string;
  name: string;
  indice?: number;
  period?: string;
  predIndice?: number;
  predPeriod?: string;
}

export interface LicsItem {
  id: string;
  code: string;
  name: string;
  address: string;
  sum: number;
  counters?: LicsCounter[];
  selected?: LicsCounter;
  order?: any; // для заказов оплаты
}

export interface LicsIndication {
  date: string;
  value: number;
}

export interface LicsState {
  info: LicsItem[];
  upd: number;
  page: LicsPage;
  item: LicsItem | undefined;
}

// Enum для страниц
export enum LicsPage {
  MAIN = 0,
  ADD_LIC_1 = 1,
  ADD_LIC_2 = 2,
  HISTORY = 3,
  PAYMENTS = 4,
  PAYMENTS_TO = 5,
  INDICES = 6,
  EQUARING = 7,
  SBER_PAY = 8,
  HISTORY_INDICES = 9,
  ALFA_BANK = 10
}

// Типы для пропсов компонентов
// export interface LicsProps {
//   // если нужны внешние пропсы в будущем
// }

export interface SetPageFunction {
  (page: number): void;
}

export interface SetItemFunction {
  (item: LicsItem): void;
}

// Типы для Store
export interface StoreState {
  lics: LicsItem[];
  login: {
    token: string;
    monthes?: any;
    borders?: {
      from: number;
      to: number;
    };
  };
  profile: {
    lics?: LicsItem[];
  };
  [key: string]: any;
}

// Типы для компонентов
export interface ItemsProps {
  info: LicsItem[];
  setItem: SetItemFunction;
  setPage: SetPageFunction;
}

export interface AddLicProps {
  setPage: SetPageFunction;
}

export interface HistoryProps {
  item: LicsItem | undefined;
}

export interface PaymentsProps {
  item: LicsItem | undefined;
  setPage: SetPageFunction;
}

export interface IndicesProps {
  item: LicsItem | undefined;
  setPage: SetPageFunction;
}