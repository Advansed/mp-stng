// src/components/Lics/components/constants.ts

import { LicsItem, LicsPage, AddLicMode, AddLicByCodeData, AddLicByAddressData } from './types';

// ========================
// СУЩЕСТВУЮЩИЕ КОНСТАНТЫ LICS
// ========================

// ID подписок Store
export const LICS_SUBSCRIPTION_IDS = {
  LICS_UPDATE: 22,
  BACK_NAVIGATION: 404
} as const;

// Названия страниц для отладки и логирования
export const LICS_PAGE_NAMES = {
  [LicsPage.MAIN]: 'Основная',
  [LicsPage.ADD_LIC]: 'Добавить ЛС',           // 🔄 Обновлено: объединенная страница
  [LicsPage.HISTORY]: 'История',
  [LicsPage.PAYMENTS]: 'Оплата за газ',
  [LicsPage.PAYMENTS_TO]: 'Оплата за ТО',
  [LicsPage.INDICES]: 'Показания',
  [LicsPage.EQUARING]: 'Оплата через сайт',
  [LicsPage.SBER_PAY]: 'СберПей',
  [LicsPage.HISTORY_INDICES]: 'История показаний',
  [LicsPage.ALFA_BANK]: 'АльфаБанк'
} as const;

// Маршруты возврата для каждой страницы
export const LICS_BACK_ROUTES = {
  [LicsPage.MAIN]: 'back' as const,
  [LicsPage.ADD_LIC]: LicsPage.MAIN,            // 🔄 Обновлено: объединенный маршрут
  [LicsPage.HISTORY]: LicsPage.MAIN,
  [LicsPage.PAYMENTS]: LicsPage.MAIN,
  [LicsPage.PAYMENTS_TO]: LicsPage.MAIN,
  [LicsPage.INDICES]: LicsPage.MAIN,
  [LicsPage.EQUARING]: LicsPage.MAIN,
  [LicsPage.SBER_PAY]: LicsPage.MAIN,
  [LicsPage.HISTORY_INDICES]: LicsPage.INDICES, // Особый случай - возврат к показаниям
  [LicsPage.ALFA_BANK]: LicsPage.MAIN
} as const;

// Дефолтные значения
export const LICS_DEFAULTS = {
  INITIAL_PAGE: LicsPage.MAIN,
  INITIAL_UPD_COUNTER: 0,
  INITIAL_INFO: [] as LicsItem[],
  INITIAL_ITEM: undefined
} as const;

// Константы для валидации показаний
export const INDICES_VALIDATION = {
  MAX_DIFFERENCE: 3000,
  MAX_VOLUME: 10000,
  MAX_DIGITS: 5,
  MIN_DAY: 20,
  MAX_DAY: 25
} as const;

// Константы для отладки
export const DEBUG_PREFIXES = {
  LICS: '[Lics]',
  STORE: '[Store]',
  NAVIGATION: '[Navigation]',
  ERROR: '[Error]',
  ADD_LICS: '[AddLics]'                         // 🆕 Новый префикс для отладки AddLics
} as const;

// ========================
// НОВЫЕ КОНСТАНТЫ ДЛЯ ADDLICS
// ========================

// Константы для AddLics
export const ADD_LICS_CONSTANTS = {
  // Режимы по умолчанию
  DEFAULT_MODE: AddLicMode.SELECTION,
  
  // Начальные данные форм
  INITIAL_CODE_DATA: {
    lc: '',
    fio: ''
  } as AddLicByCodeData,
  
  INITIAL_ADDRESS_DATA: {
    lc: '',
    fio: '',
    apartment: ''
  } as AddLicByAddressData,
  
  // Правила валидации
  VALIDATION: {
    // Лицевой счет
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
  
  // Сообщения для пользователя
  MESSAGES: {
    // Ошибки валидации
    REQUIRED_FIELD: 'Поле обязательно для заполнения',
    INVALID_LC: 'Номер лицевого счета должен содержать только цифры (8-20 символов)',
    INVALID_FIO: 'ФИО должно содержать только русские буквы (2-100 символов)',
    INVALID_APARTMENT: 'Номер квартиры содержит недопустимые символы',
    
    // Выбор справочников
    SELECT_SETTLEMENT: 'Выберите населенный пункт',
    SELECT_STREET: 'Выберите улицу',
    SELECT_HOUSE: 'Выберите дом',
    
    // Состояния загрузки
    LOADING_SETTLEMENTS: 'Загрузка населенных пунктов...',
    LOADING_STREETS: 'Загрузка улиц...',
    LOADING_HOUSES: 'Загрузка домов...',
    ADDING_ACCOUNT: 'Добавление лицевого счета...',
    
    // Успешные операции
    ACCOUNT_ADDED: 'Лицевой счет успешно добавлен',
    
    // Ошибки API
    NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету',
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

// Константы для API эндпоинтов
export const ADD_LICS_API_ENDPOINTS = {
  ADD_ACCOUNT: 'AddAccount',
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

// Порядок полей в формах (для табуляции)
export const ADD_LICS_FIELD_ORDER = {
  BY_CODE: ['lc', 'fio'] as Array<keyof AddLicByCodeData>,
  BY_ADDRESS: ['settlementId', 'streetId', 'houseId', 'apartment', 'lc', 'fio'] as Array<keyof AddLicByAddressData>
} as const;