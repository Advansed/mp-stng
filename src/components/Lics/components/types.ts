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
// ENUM ДЛЯ СТРАНИЦ - ОБНОВЛЕННЫЙ
// ========================

export enum LicsPage {
  MAIN              = 0,
  ADD_LIC_1         = 1,
  FIND_LIC          = 2,    // 🔄 Переименовано с ADD_LIC_2
  HISTORY           = 3,
  PAYMENTS          = 4,
  PAYMENTS_TO       = 5,
  INDICES           = 6,
  EQUARING          = 7,
  SBER_PAY          = 8,
  HISTORY_INDICES   = 9,
  ALFA_BANK         = 10
}

// ========================
// ТИПЫ ADDLICS - ОБНОВЛЕННЫЕ
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

// 🆕 Шаг 1.1: Добавляем интерфейс для Улуса
export interface Ulus {
  ulus_id: string;
  name: string;
  settlements?: Settlement[];
}

// 🆕 Шаг 1.2: Обновляем данные для добавления по адресу - добавляем улус
export interface AddLicByAddressData {
  // 🆕 Новые поля для улуса
  ulusId?: string;
  ulusName?: string;
  
  // Существующие поля
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

// Справочные данные (существующие)
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

// 🆕 Шаг 1.3: Обновляем состояние компонента AddLics - добавляем улусы
export interface AddLicsState {
  mode: AddLicMode;
  loading: boolean;
  message: string;
  
  // Данные форм
  codeData: AddLicByCodeData;
  addressData: AddLicByAddressData;
  
  // 🆕 Справочники с поддержкой улусов
  uluses: Ulus[];                    // Список улусов
  selectedUlus?: Ulus;               // Выбранный улус
  settlements: Settlement[];          // Список населенных пунктов (может фильтроваться по улусу)
  selectedSettlement?: Settlement;   // Выбранный населенный пункт
  selectedStreet?: Street;           // Выбранная улица
  selectedHouse?: House;             // Выбранный дом
}

// ========================
// 🆕 ТИПЫ ДЛЯ FINDLIC
// ========================

// Данные формы FindLic
export interface FindLicData {
  settlementId?: string;
  settlementName?: string;
  streetId?: string;
  streetName?: string;
  houseId?: string;
  houseNumber?: string;
  apartment?: string;           // Квартира (опционально)
  licenseNumber: string;        // Номер лицевого счета
  fio: string;                  // ФИО
}

// Состояние компонента FindLic
export interface FindLicState {
  settlements: Settlement[];
  selectedSettlement?: Settlement;
  selectedStreet?: Street;
  selectedHouse?: House;
  formData: FindLicData;
  loading: boolean;
  loadingStep: string | null;   // Какой именно шаг загружается
  message: string;              // Сообщение пользователю
  currentStep: number;          // Текущий шаг (1-4)
}

// Props для компонента FindLic
export interface FindLicProps {
  setPage: SetPageFunction;
}

// Возвращаемые значения хука useFindLics
export interface UseFindLicsReturn {
  state: FindLicState;
  selectSettlement: (settlement: Settlement) => Promise<void>;
  selectStreet: (street: Street) => Promise<void>;
  selectHouse: (house: House) => void;
  updateFormData: (field: keyof FindLicData, value: string) => void;
  submitForm: () => Promise<boolean>;
  resetForm: () => void;
  canSubmit: boolean;
}

// ========================
// ТИПЫ ДЛЯ ПРОПСОВ КОМПОНЕНТОВ
// ========================

// Функции для управления состоянием
export type SetPageFunction = (page: number) => void;
export type SetItemFunction = (item: LicsItem) => void;

// Store State
export interface StoreState {
  login: {
    token: string;
  };
  lics: LicsItem[];
}

// Props для различных компонентов
export interface ItemsProps {
  info: LicsItem[];
  setItem: SetItemFunction;
  setPage: SetPageFunction;
}

export interface AddLicProps {
  setPage: SetPageFunction;
}

export interface HistoryProps {
  item: LicsItem;
}

export interface PaymentsProps {
  item: LicsItem;
  setPage: SetPageFunction;
}

export interface IndicesProps {
  item: LicsItem;
  setPage: SetPageFunction;
}

// ========================
// ТИПЫ ДЛЯ ADDLICS КОМПОНЕНТОВ
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

// 🆕 Обновляем пропсы AddressForm - добавляем улусы
export interface AddressFormProps {
  data: AddLicByAddressData;
  
  // 🆕 Справочники с поддержкой улусов
  uluses: Ulus[];
  selectedUlus?: Ulus;
  settlements: Settlement[];
  selectedSettlement?: Settlement;
  selectedStreet?: Street;
  selectedHouse?: House;
  
  // 🆕 Обработчики с поддержкой улусов
  onChange: (field: keyof AddLicByAddressData, value: string) => void;
  onUlusChange: (ulus: Ulus) => void;        // Новый обработчик
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
// ТИПЫ ДЛЯ ХУКА USEADDLICS - ОБНОВЛЕННЫЕ
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
  
  // 🆕 Address form specific - с поддержкой улусов
  loadUluses: () => Promise<void>;                    // Новый метод
  selectUlus: (ulus: Ulus) => Promise<void>;          // Новый метод
  loadSettlements: (ulusId?: string) => Promise<void>; // Обновленный метод
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
// ТИПЫ ДЛЯ API RESPONSES - ОБНОВЛЕННЫЕ
// ========================

export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data?: T;
}

// 🆕 Обновляем параметры AddAccount - используем правильные как в AddLic2
export interface AddAccountParams {
  token: string;
  LC?: string;          // номер лицевого счета
  fio: string;          // ФИО
  
  // Параметры для добавления по адресу (как в AddLic2)
  s_id?: string;        // ID населенного пункта
  ids?: string;         // ID улицы  
  house_id?: string;    // ID дома
  apartment?: string;   // номер квартиры (опционально)
}

// 🆕 Новый тип для ответа API улусов
export interface GetUlusesResponse {
  uluses: Ulus[];
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