// src/components/constants/lics.constants.ts

import { LicsItem, LicsPage } from './types';

// ID подписок Store
export const LICS_SUBSCRIPTION_IDS = {
  LICS_UPDATE: 22,
  BACK_NAVIGATION: 404
} as const;

// Названия страниц для отладки и логирования
export const LICS_PAGE_NAMES = {
  [LicsPage.MAIN]: 'Основная',
  [LicsPage.ADD_LIC_1]: 'Добавить ЛС (способ 1)',
  [LicsPage.ADD_LIC_2]: 'Добавить ЛС (способ 2)', 
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
  [LicsPage.ADD_LIC_1]: LicsPage.MAIN,
  [LicsPage.ADD_LIC_2]: LicsPage.MAIN,
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
  ERROR: '[Error]'
} as const;