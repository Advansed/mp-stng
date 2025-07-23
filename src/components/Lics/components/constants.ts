// src/components/Lics/components/constants.ts

import { AddLicMode, AddLicByCodeData, AddLicByAddressData, LicsItem , } from './types';

// ========================
// СУЩЕСТВУЮЩИЕ КОНСТАНТЫ
// ========================

export const LICS_SUBSCRIPTION_IDS = {
  LICS_UPDATE: 1,
  BACK_NAVIGATION: 2
} as const;

export const LICS_PAGE_NAMES = {
  0: 'Главная',
  1: 'Добавить ЛС',
  3: 'История',
  4: 'Платежи',
  5: 'Платежи ТО',
  6: 'Показания',
  7: 'Сверка',
  8: 'СберПэй',
  9: 'История показаний',
  10: 'АльфаБанк'
} as const;

export const LICS_BACK_ROUTES = {
  1: 0,    // С добавления ЛС на главную
  3: 0,    // С истории на главную
  4: 0,    // С платежей на главную
  5: 4,    // С платежей ТО на платежи
  6: 0,    // С показаний на главную
  7: 0,    // Со сверки на главную
  8: 4,    // С СберПэй на платежи
  9: 6,    // С истории показаний на показания
  10: 4    // С АльфаБанк на платежи
} as const;

export const LICS_DEFAULTS = {
  INITIAL_INFO: [] as LicsItem[],
  INITIAL_UPD_COUNTER: 0,
  INITIAL_PAGE: 0,
  INITIAL_ITEM: undefined
} as const;

export const INDICES_VALIDATION = {
  MIN_VALUE: 0,
  MAX_VALUE: 999999,
  DECIMAL_PLACES: 2
} as const;

export const DEBUG_PREFIXES = {
  LICS: '[LICS]',
  ADD_LICS: '[ADD_LICS]',
  NAVIGATION: '[NAV]',
  ERROR: '[ERROR]'
} as const;

// ========================
// КОНСТАНТЫ ДЛЯ ADDLICS - ОБНОВЛЕННЫЕ
// ========================

export const ADD_LICS_CONSTANTS = {
  // Режим по умолчанию
  DEFAULT_MODE: AddLicMode.SELECTION,
  
  // 🆕 Обновленные начальные данные с поддержкой улусов
  INITIAL_CODE_DATA: {
    lc: '',
    fio: ''
  } as AddLicByCodeData,
  
  INITIAL_ADDRESS_DATA: {
    // 🆕 Поля для улуса
    ulusId: '',
    ulusName: '',
    
    // Существующие поля
    settlementId: '',
    settlementName: '',
    streetId: '',
    streetName: '',
    houseId: '',
    houseNumber: '',
    apartment: '',
    lc: '',
    fio: ''
  } as AddLicByAddressData,
  
  // Валидация
  VALIDATION: {
    // Номер лицевого счета
    MIN_LC_LENGTH: 8,
    MAX_LC_LENGTH: 20,
    LC_PATTERN: /^[0-9]+$/, // Только цифры
    
    // ФИО
    MIN_FIO_LENGTH: 2,
    MAX_FIO_LENGTH: 100,
    FIO_PATTERN: /^[а-яёА-ЯЁ\s-.]+$/, // Русские буквы, пробелы, дефисы, точки
    
    // Квартира
    MAX_APARTMENT_LENGTH: 10,
    APARTMENT_PATTERN: /^[а-яёА-ЯЁ0-9\s-/]+$/, // Буквы, цифры, пробелы, дефисы, слеши    
  },
  
  // 🆕 Обновленные сообщения с поддержкой улусов
  MESSAGES: {
    // Ошибки валидации
    REQUIRED_FIELD: 'Поле обязательно для заполнения',
    INVALID_LC: 'Номер лицевого счета должен содержать только цифры (8-20 символов)',
    INVALID_FIO: 'ФИО должно содержать только русские буквы (2-100 символов)',
    INVALID_APARTMENT: 'Номер квартиры содержит недопустимые символы',
    
    // 🆕 Выбор справочников с улусами
    SELECT_ULUS: 'Выберите улус (район)',
    SELECT_SETTLEMENT: 'Выберите населенный пункт',
    SELECT_STREET: 'Выберите улицу',
    SELECT_HOUSE: 'Выберите дом',
    
    // 🆕 Состояния загрузки с улусами
    LOADING_ULUSES: 'Загрузка улусов...',
    LOADING_SETTLEMENTS: 'Загрузка населенных пунктов...',
    LOADING_STREETS: 'Загрузка улиц...',
    LOADING_HOUSES: 'Загрузка домов...',
    ADDING_ACCOUNT: 'Добавление лицевого счета...',
    
    // Успешные операции
    ACCOUNT_ADDED: 'Лицевой счет успешно добавлен',
    
    // 🆕 Ошибки API с улусами
    NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету',
    ULUSES_LOAD_ERROR: 'Не удалось загрузить список улусов',
    SETTLEMENTS_LOAD_ERROR: 'Не удалось загрузить список населенных пунктов',
    STREETS_LOAD_ERROR: 'Не удалось загрузить список улиц',
    HOUSES_LOAD_ERROR: 'Не удалось загрузить список домов',
    ADD_ACCOUNT_ERROR: 'Не удалось добавить лицевой счет',
  },
  
  // Названия режимов для UI
  MODE_NAMES: {
    [AddLicMode.SELECTION]: 'Выбор способа',
    [AddLicMode.BY_CODE]: 'По номеру ЛС',
    [AddLicMode.BY_ADDRESS]: 'По адресу'
  },
  
  // Описания режимов для UI
  MODE_DESCRIPTIONS: {
    [AddLicMode.BY_CODE]: 'Добавление лицевого счета по номеру',
    [AddLicMode.BY_ADDRESS]: 'Добавление лицевого счета по адресу'
  },
  
  // Таймауты для операций
  TIMEOUTS: {
    API_REQUEST: 30000,        // 30 секунд для API запросов
    MESSAGE_AUTO_HIDE: 5000,   // 5 секунд для автоскрытия сообщений
  }
} as const;

// 🆕 Обновленные константы для API эндпоинтов с поддержкой улусов
export const ADD_LICS_API_ENDPOINTS = {
  ADD_ACCOUNT: 'AddAccount',
  GET_ULUSES: 'getUluses',           // Новый эндпоинт для улусов
  GET_SETTLEMENTS: 'getSettlements',
  GET_STREETS: 'getStreets',
  GET_HOUSES: 'getHouses'
} as const;

// CSS классы для компонентов AddLics
export const ADD_LICS_CSS_CLASSES = {
  // Основные контейнеры
  CARD: 'add-lics-card',
  HEADER: 'add-lics-header',
  CONTENT: 'add-lics-content',
  
  // Выбор режима
  MODE_SELECTOR: 'mode-selector',
  MODE_OPTION: 'mode-option',
  MODE_OPTION_ACTIVE: 'mode-option-active',
  
  // Формы
  FORM: 'add-lics-form',
  FORM_GROUP: 'add-lics-form-group',
  INPUT: 'add-lics-input',
  SELECT: 'add-lics-select',
  
  // Кнопки
  BUTTONS_GROUP: 'add-lics-buttons',
  BUTTON_PRIMARY: 'add-lics-button-primary',
  BUTTON_SECONDARY: 'add-lics-button-secondary',
  
  // Состояния
  LOADING: 'add-lics-loading',
  ERROR: 'add-lics-error',
  SUCCESS: 'add-lics-success',
  
  // Утилиты
  SPACER: 'add-lics-spacer',
  DIVIDER: 'add-lics-divider'
} as const;

// Иконки для режимов добавления
export const ADD_LICS_ICONS = {
  [AddLicMode.BY_CODE]: 'pencilOutline',
  [AddLicMode.BY_ADDRESS]: 'documentTextOutline',
  BACK: 'arrowBackOutline',
  RESET: 'refreshOutline',
  SUBMIT: 'checkmarkOutline',
  LOADING: 'hourglass'
} as const;

// 🆕 Обновленный порядок полей в формах с поддержкой улусов
export const ADD_LICS_FIELD_ORDER = {
  BY_CODE: ['lc', 'fio'] as Array<keyof AddLicByCodeData>,
  BY_ADDRESS: [
    'ulusId',         // 🆕 Сначала выбор улуса
    'settlementId', 
    'streetId', 
    'houseId', 
    'apartment', 
    'lc', 
    'fio'
  ] as Array<keyof AddLicByAddressData>
} as const;