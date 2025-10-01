// src/components/Lics/index.ts

import { Lics } from './Lics';

// ========================
// ОСНОВНЫЕ КОМПОНЕНТЫ
// ========================

// Основной компонент
export { Lics } from './Lics';

// ========================
// ХУКИ
// ========================

// Основной хук
export { useLics } from './useLics';

// ========================
// ТИПЫ И ИНТЕРФЕЙСЫ
// ========================

// Существующие типы
export type {
  LicsItem,
  LicsIndication,
  LicsState,
  SetPageFunction,
  SetItemFunction,
  StoreState,
  ItemsProps,
  AddLicProps,
  HistoryProps,
  PaymentsProps,
  IndicesProps
} from './components/types';

// Новые типы для AddLics
export type {
  AddLicByCodeData,
  AddLicByAddressData,
  Settlement,
  Street,
  House,
  AddLicsState,
  AddLicsProps,
  ModeSelectionProps,
  CodeFormProps,
  AddressFormProps,
  ActionButtonsProps,
  UseAddLicsReturn,
  ApiResponse,
  AddAccountParams,
  GetSettlementsResponse,
  GetStreetsResponse,
  GetHousesResponse
} from './components/types';

// ========================
// ENUMS
// ========================

// Enum для страниц (обновленный)
export { LicsPage } from './components/types';

// Новый enum для режимов AddLics
export { AddLicMode } from './components/types';

// ========================
// КОНСТАНТЫ
// ========================

// Существующие константы
export {
  LICS_SUBSCRIPTION_IDS,
  LICS_PAGE_NAMES,
  LICS_BACK_ROUTES,
  LICS_DEFAULTS,
  INDICES_VALIDATION,
  DEBUG_PREFIXES
} from './components/constants';

// Новые константы для AddLics
export {
  ADD_LICS_CONSTANTS,
  ADD_LICS_API_ENDPOINTS,
  ADD_LICS_CSS_CLASSES,
  ADD_LICS_ICONS,
  ADD_LICS_FIELD_ORDER
} from './components/constants';

// ========================
// ПОДКОМПОНЕНТЫ ADDLICS
// (пока закомментированы, создадим на следующих шагах)
// ========================

// export { ModeSelection } from './components/AddLics/ModeSelection';
// export { CodeForm } from './components/AddLics/CodeForm';
// export { AddressForm } from './components/AddLics/AddressForm';
// export { ActionButtons } from './components/AddLics/ActionButtons';

// ========================
// ДЕФОЛТНЫЙ ЭКСПОРТ
// ========================

// Дефолтный экспорт - основной компонент
export default Lics;

// ========================
// КОММЕНТАРИИ ДЛЯ БУДУЩИХ ЭКСПОРТОВ
// ========================

// При создании подкомпонентов AddLics раскомментировать:
// export type { ModeSelectionProps, CodeFormProps, AddressFormProps, ActionButtonsProps } from './components/types';
// export { ModeSelection, CodeForm, AddressForm, ActionButtons } from './components/AddLics';

// При создании утилит добавить:
// export { validateLicNumber, validateFIO, formatLicNumber } from './components/utils/validation';
// export { formatAddress, formatSettlementName } from './components/utils/formatting';