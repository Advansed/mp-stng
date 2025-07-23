// src/components/Lics/components/types.ts

// ========================
// ОСНОВНЫЕ ИНТЕРФЕЙСЫ LICS
// ========================

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

// ========================
// ENUM ДЛЯ СТРАНИЦ
// ========================

export enum LicsPage {
  MAIN = 0,
  ADD_LIC = 1,            // 🆕 Объединенная страница вместо ADD_LIC_1 и ADD_LIC_2
  HISTORY = 3,
  PAYMENTS = 4,
  PAYMENTS_TO = 5,
  INDICES = 6,
  EQUARING = 7,
  SBER_PAY = 8,
  HISTORY_INDICES = 9,
  ALFA_BANK = 10
}

// ========================
// ТИПЫ ADDLICS - НОВЫЕ
// ========================

// Режимы добавления лицевого счета
export enum AddLicMode {
  SELECTION = 'selection',     // Выбор способа
  BY_CODE = 'by_code',        // По номеру ЛС
  BY_ADDRESS = 'by_address'   // По адресу
}

// Данные для добавления по коду
export interface AddLicByCodeData {
  lc: string;          // Номер лицевого счета
  fio: string;         // ФИО
}

// Данные для добавления по адресу
export interface AddLicByAddressData {
  settlementId?: string;
  settlementName?: string;
  streetId?: string;
  streetName?: string;
  houseId?: string;
  houseNumber?: string;
  apartment?: string;
  lc: string;
  fio: string;
}

// Справочные данные
export interface Settlement {
  s_id: string;
  name: string;
  streets?: Street[];
}

export interface Street {
  ids: string;
  name: string;
  houses?: House[];
}

export interface House {
  id: string;
  number: string;
}

// Состояние компонента AddLics
export interface AddLicsState {
  mode: AddLicMode;
  loading: boolean;
  message: string;
  
  // Данные форм
  codeData: AddLicByCodeData;
  addressData: AddLicByAddressData;
  
  // Справочники
  settlements: Settlement[];
  selectedSettlement?: Settlement;
  selectedStreet?: Street;
  selectedHouse?: House;
}

// ========================
// БАЗОВЫЕ ФУНКЦИОНАЛЬНЫЕ ТИПЫ
// ========================

export interface SetPageFunction {
  (page: number): void;
}

export interface SetItemFunction {
  (item: LicsItem): void;
}

// ========================
// ТИПЫ ДЛЯ STORE
// ========================

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

// ========================
// ПРОПСЫ КОМПОНЕНТОВ - СУЩЕСТВУЮЩИЕ
// ========================

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

// ========================
// ПРОПСЫ ADDLICS КОМПОНЕНТОВ - НОВЫЕ
// ========================

export interface AddLicsProps {
  setPage: SetPageFunction;
  initialMode?: AddLicMode;
}

export interface ModeSelectionProps {
  onModeSelect: (mode: AddLicMode) => void;
}

export interface CodeFormProps {
  data: AddLicByCodeData;
  onChange: (field: keyof AddLicByCodeData, value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export interface AddressFormProps {
  data: AddLicByAddressData;
  settlements: Settlement[];
  selectedSettlement?: Settlement;
  selectedStreet?: Street;
  selectedHouse?: House;
  onChange: (field: keyof AddLicByAddressData, value: string) => void;
  onSettlementChange: (settlement: Settlement) => void;
  onStreetChange: (street: Street) => void;
  onHouseChange: (house: House) => void;
  onSubmit: () => void;
  loading: boolean;
}

export interface ActionButtonsProps {
  mode: AddLicMode;
  canSubmit: boolean;
  loading: boolean;
  onSubmit: () => void;
  onBack: () => void;
  onReset: () => void;
}

// ========================
// ТИПЫ ДЛЯ ХУКА USEADDLICS - НОВЫЕ
// ========================

export interface UseAddLicsReturn {
  // State
  state: AddLicsState;
  
  // Mode management
  setMode: (mode: AddLicMode) => void;
  resetToSelection: () => void;
  
  // Form data management
  updateCodeData: (field: keyof AddLicByCodeData, value: string) => void;
  updateAddressData: (field: keyof AddLicByAddressData, value: string) => void;
  
  // Address form specific
  loadSettlements: () => Promise<void>;
  selectSettlement: (settlement: Settlement) => Promise<void>;
  selectStreet: (street: Street) => Promise<void>;
  selectHouse: (house: House) => void;
  
  // Form submission
  submitByCode: () => Promise<boolean>;
  submitByAddress: () => Promise<boolean>;
  
  // Utilities
  validateCodeForm: () => boolean;
  validateAddressForm: () => boolean;
  resetForms: () => void;
  clearMessage: () => void;
  setMessage: (message: string) => void;
}

// ========================
// ТИПЫ ДЛЯ API RESPONSES - НОВЫЕ
// ========================

export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data?: T;
}

export interface AddAccountParams {
  token: string;
  LC?: string;
  fio: string;
  s_id?: string;        // Для добавления по адресу
  ids?: string;         // Для добавления по адресу  
  house_id?: string;    // Для добавления по адресу
  apartment?: string;   // Для добавления по адресу
}

export interface GetSettlementsResponse {
  settlements: Settlement[];
}

export interface GetStreetsResponse {
  streets: Street[];
}

export interface GetHousesResponse {
  houses: House[];
}