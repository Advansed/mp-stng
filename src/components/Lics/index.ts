// src/components/Lics/index.ts

import { Lics } from './Lics';

// Основной компонент
export { Lics } from './Lics';

// Кастомный хук
export { useLics } from './useLics';

// Типы и интерфейсы
export type {
  LicsItem,
  LicsCounter,
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

// Enum для страниц
export { LicsPage } from './components/types';

// Константы
export {
  LICS_SUBSCRIPTION_IDS,
  LICS_PAGE_NAMES,
  LICS_BACK_ROUTES,
  LICS_DEFAULTS,
  INDICES_VALIDATION,
  DEBUG_PREFIXES
} from './components/constants';

// Вспомогательные функции (если понадобятся в будущем)
//export type { WidgetParams } from './Lics';

// Дефолтный экспорт - основной компонент
export default Lics;