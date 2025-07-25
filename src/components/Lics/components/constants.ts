// src/components/Lics/components/constants.ts

import { AddLicMode, AddLicByCodeData, AddLicByAddressData, LicsItem, FindLicData } from './types';

// ========================
// СУЩЕСТВУЮЩИЕ КОНСТАНТЫ
// ========================

export const LICS_SUBSCRIPTION_IDS = {
  LICS_UPDATE: 1,
  BACK_NAVIGATION: 2
} as const;

// 🔄 Обновленные названия страниц
export const LICS_PAGE_NAMES = {
  0:    'Главная',
  1:    'Добавить ЛС',
  2:    'Найти ЛС',        // 🔄 Переименовано с "Добавить ЛС" 
  3:    'История',
  4:    'Платежи',
  5:    'Платежи ТО',
  6:    'Показания',
  7:    'Сверка',
  8:    'СберПэй',
  9:    'История показаний',
  10:   'Газпромбанк',
  11:   'СБП газпромбанк'
} as const;

// 🔄 Обновленные маршруты возврата
export const LICS_BACK_ROUTES = {
    1: 0,    // С добавления ЛС на главную
    2: 0,    // 🔄 С поиска ЛС на главную (было ADD_LIC_2)
    3: 0,    // С истории на главную
    4: 0,    // С платежей на главную
    5: 0,    // С платежей ТО на платежи
    6: 0,    // С показаний на главную
    7: 0,    // Со сверки на главную
    8: 4,    // С СберПэй на платежи
    9: 6,    // С истории показаний на показания
    10: 0,   // С АльфаБанк на платежи
    11: 0    // С СБП на платежи
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
    FIO_PATTERN: /^[а-яёА-ЯЁ\s.-]+$/, // Кириллица, пробелы, точки, дефисы
    
    // Квартира
    MAX_APARTMENT_LENGTH: 10,
    APARTMENT_PATTERN: /^[0-9а-яёА-ЯЁ\s/-]+$/ // Цифры, буквы, пробелы, слеши, дефисы
  },
  
  // Сообщения
  MESSAGES: {
    LOADING_ULUSES: 'Загрузка улусов...',
    LOADING_SETTLEMENTS: 'Загрузка населенных пунктов...',
    LOADING_STREETS: 'Загрузка улиц...',
    LOADING_HOUSES: 'Загрузка домов...',
    ADDING_ACCOUNT: 'Добавление лицевого счета...',
    ACCOUNT_ADDED: 'Лицевой счет успешно добавлен',
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


export const DEBUG_PREFIXES = {
  INFO:         '[FindLic Info]',
  ERROR:        '[FindLic Error]',
  WARNING:      '[FindLic Warning]',
  SUCCESS:      '[FindLic Success]',
  LICS:         '[LICS]',
  NAVIGATION:   '[NAVIGATION]'
} as const;

// ========================
// FINDLIC КОНСТАНТЫ - ОБНОВЛЕННЫЕ С УЛУСАМИ
// ========================

export const FIND_LIC_CONSTANTS = {
  // 🆕 Обновленные шаги с добавлением улуса
  STEPS: {
    ULUS: 1,            // 🆕 Новый шаг - выбор улуса
    SETTLEMENT: 2,      // Изменен с 1 на 2
    STREET: 3,          // Изменен с 2 на 3
    HOUSE: 4,           // Изменен с 3 на 4
    FORM: 5             // Изменен с 4 на 5
  },
  
  // 🔄 Обновленные сообщения
  MESSAGES: {
    LOADING_SETTLEMENTS: 'Загрузка данных...',      // 🔄 Обновленное сообщение
    LOADING_STREETS: 'Загрузка улиц...',
    LOADING_HOUSES: 'Загрузка домов...',
    SUBMITTING: 'Добавление лицевого счета...',
    SUCCESS: 'Лицевой счет успешно добавлен!',
    SELECT_ULUS: 'Выберите улус',                   // 🆕
    SELECT_SETTLEMENT: 'Выберите населенный пункт',
    SELECT_STREET: 'Выберите улицу',
    SELECT_HOUSE: 'Выберите дом',
    FILL_FORM: 'Заполните данные'
  },
  
  // 🆕 Обновленные начальные данные с улусом
  INITIAL_DATA: {
    ulusName: '',         // 🆕
    settlementId: '',
    settlementName: '',
    streetId: '',
    streetName: '',
    houseId: '',
    houseNumber: '',
    apartment: '',
    licenseNumber: '',
    fio: ''
  } as FindLicData,
  
  // Валидация
  VALIDATION: {
    LICENSE_MIN_LENGTH: 8,
    LICENSE_MAX_LENGTH: 20,
    FIO_MIN_LENGTH: 2,
    FIO_MAX_LENGTH: 100
  },
  
  // Регулярные выражения
  REGEX: {
    LICENSE_NUMBER: /^[0-9]+$/,
    FIO: /^[а-яёА-ЯЁ\s\-.]+$/
  },
  
  // Ошибки
  ERRORS: {
    INVALID_LICENSE: 'Номер лицевого счета должен содержать только цифры и быть длиной от 8 до 20 символов',
    INVALID_FIO: 'ФИО должно содержать только русские буквы, пробелы, дефисы и точки',
    EMPTY_ULUS: 'Выберите улус',                      // 🆕
    EMPTY_SETTLEMENT: 'Выберите населенный пункт',
    EMPTY_STREET: 'Выберите улицу',
    EMPTY_HOUSE: 'Выберите дом',
    NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету',
    AUTH_ERROR: 'Ошибка авторизации. Попробуйте войти заново'
  },
  
  // Таймауты
  TIMEOUTS: {
    API_REQUEST: 30000,        // 30 секунд для API запросов
    SUCCESS_MESSAGE: 2000,     // 2 секунды показа сообщения об успехе
    ERROR_MESSAGE: 5000,       // 5 секунд показа сообщения об ошибке
    LOADING_TIMEOUT: 30000     // 30 секунд максимум для загрузки
  },
  
  // CSS классы
  CSS_CLASSES: {
    CONTAINER: 'find-lic-container',
    STEP_INDICATOR: 'find-lic-step-indicator',
    STEP_ACTIVE: 'find-lic-step-active',
    STEP_COMPLETED: 'find-lic-step-completed',
    PROGRESS_BAR: 'find-lic-progress-bar',
    FORM_SECTION: 'find-lic-form-section',
    BUTTON_SECTION: 'find-lic-button-section',
    MESSAGE: 'find-lic-message',
    ERROR: 'find-lic-error',
    SUCCESS: 'find-lic-success'
  }
} as const;

// ========================
// ОБНОВЛЕННЫЕ КОНСТАНТЫ ДЛЯ API ЭНДПОИНТОВ
// ========================

// 🆕 Обновленные константы для API эндпоинтов с поддержкой улусов
export const ADD_LICS_API_ENDPOINTS = {
  ADD_ACCOUNT: 'AddAccount',
  GET_ULUSES: 'getUluses',           // Новый эндпоинт для улусов
  GET_SETTLEMENTS: 'getSettlements',
  GET_STREETS: 'getStreets',
  GET_HOUSES: 'getHouses'
} as const;

// 🆕 API endpoints для FindLic (используют те же эндпоинты)
export const FIND_LIC_API_ENDPOINTS = {
  GET_SETTLEMENTS: 'getSettlements',  // 🔑 Возвращает улусы с поселениями
  GET_STREETS: 'getStreets',
  GET_HOUSES: 'getHouses',
  ADD_ACCOUNT: 'AddAccount'
} as const;

// ========================
// CSS КЛАССЫ ДЛЯ КОМПОНЕНТОВ
// ========================

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

// ========================
// ДОПОЛНИТЕЛЬНЫЕ КОНСТАНТЫ ДЛЯ FINDLIC
// ========================

// 🆕 Константы для работы с улусами в FindLic
export const FIND_LIC_ULUS_CONSTANTS = {
  MIN_SETTLEMENTS_TO_SHOW_COUNT: 3,     // Показывать количество поселений если их больше 3
  ULUS_SELECTION_PLACEHOLDER: 'Выберите улус из списка',
  SETTLEMENT_SELECTION_PLACEHOLDER: 'Выберите населенный пункт из списка',
  STREET_SELECTION_PLACEHOLDER: 'Выберите улицу из списка',
  HOUSE_SELECTION_PLACEHOLDER: 'Выберите дом из списка'
} as const;

// 🆕 Лейблы для форм FindLic
export const FIND_LIC_LABELS = {
  ULUS: 'Улус',
  SETTLEMENT: 'Населенный пункт',
  STREET: 'Улица',
  HOUSE: 'Дом',
  APARTMENT: 'Квартира (необязательно)',
  LICENSE_NUMBER: 'Номер лицевого счета',
  FIO: 'ФИО владельца'
} as const;

// 🆕 Плейсхолдеры для инпутов FindLic
export const FIND_LIC_PLACEHOLDERS = {
  APARTMENT: 'Введите номер квартиры',
  LICENSE_NUMBER: 'Введите номер лицевого счета',
  FIO: 'Введите ФИО владельца лицевого счета'
} as const;
