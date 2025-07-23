// src/components/Lics/components/FindLicUtils.ts

import { Settlement, Street, House, UlusWithSettlements } from './types';

/**
 * Утилиты для автофильтрации в компоненте FindLic
 */

export interface FilterOptions {
  caseSensitive?: boolean;
  exactMatch?: boolean;
  minSearchLength?: number;
}

/**
 * Базовая функция фильтрации текста
 */
export const filterByText = (
  text: string, 
  searchText: string, 
  options: FilterOptions = {}
): boolean => {
  const {
    caseSensitive = false,
    exactMatch = false,
    minSearchLength = 0
  } = options;

  // Если поисковый текст слишком короткий
  if (searchText.length < minSearchLength) {
    return true;
  }

  const normalizedText = caseSensitive ? text : text.toLowerCase();
  const normalizedSearch = caseSensitive ? searchText : searchText.toLowerCase();

  if (exactMatch) {
    return normalizedText === normalizedSearch;
  }

  return normalizedText.includes(normalizedSearch);
};

/**
 * Фильтрация улусов
 */
export const filterUluses = (
  uluses: UlusWithSettlements[], 
  searchText: string,
  options?: FilterOptions
): UlusWithSettlements[] => {
  if (!searchText.trim()) return uluses;

  return uluses.filter(ulus => 
    filterByText(ulus.ulus, searchText, options)
  );
};

/**
 * Фильтрация населенных пунктов
 */
export const filterSettlements = (
  settlements: Settlement[], 
  searchText: string,
  options?: FilterOptions
): Settlement[] => {
  if (!searchText.trim()) return settlements;

  return settlements.filter(settlement => 
    filterByText(settlement.name, searchText, options)
  );
};

/**
 * Фильтрация улиц
 */
export const filterStreets = (
  streets: Street[], 
  searchText: string,
  options?: FilterOptions
): Street[] => {
  if (!searchText.trim()) return streets;

  return streets.filter(street => 
    filterByText(street.name, searchText, options)
  );
};

/**
 * Фильтрация домов
 */
export const filterHouses = (
  houses: House[], 
  searchText: string,
  options?: FilterOptions
): House[] => {
  if (!searchText.trim()) return houses;

  return houses.filter(house => 
    filterByText(house.number, searchText, options)
  );
};

/**
 * Подсветка найденного текста в строке
 */
export const highlightMatch = (
  text: string, 
  searchText: string, 
  className: string = 'highlight'
): string => {
  if (!searchText.trim()) return text;

  const regex = new RegExp(`(${searchText})`, 'gi');
  return text.replace(regex, `<span class="${className}">$1</span>`);
};

/**
 * Сортировка результатов по релевантности
 */
export const sortByRelevance = <T>(
  items: T[],
  searchText: string,
  getText: (item: T) => string
): T[] => {
  if (!searchText.trim()) return items;

  return [...items].sort((a, b) => {
    const textA = getText(a).toLowerCase();
    const textB = getText(b).toLowerCase();
    const search = searchText.toLowerCase();

    // Точное совпадение в начале - приоритет
    const startsWithA = textA.startsWith(search);
    const startsWithB = textB.startsWith(search);
    
    if (startsWithA && !startsWithB) return -1;
    if (!startsWithA && startsWithB) return 1;

    // Затем по длине текста (короткие выше)
    return textA.length - textB.length;
  });
};

/**
 * Дебаунс для оптимизации поиска
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Клавиатурная навигация для выпадающих списков
 */
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  items: any[],
  selectedIndex: number,
  onSelect: (item: any, index: number) => void,
  onClose: () => void
): number => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      const nextIndex = selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
      return nextIndex;

    case 'ArrowUp':
      event.preventDefault();
      const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
      return prevIndex;

    case 'Enter':
      event.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        onSelect(items[selectedIndex], selectedIndex);
      }
      return selectedIndex;

    case 'Escape':
      event.preventDefault();
      onClose();
      return -1;

    default:
      return selectedIndex;
  }
};

/**
 * Форматирование отображаемого текста для элементов
 */
export const formatDisplayText = {
  ulus: (ulus: UlusWithSettlements): string => {
    const count = ulus.settlements.length;
    return count >= 3 
      ? `${ulus.ulus} (${count} нас. пунктов)`
      : ulus.ulus;
  },

  settlement: (settlement: Settlement): string => settlement.name,

  street: (street: Street): string => street.name,

  house: (house: House): string => house.number
};

/**
 * Проверка валидности выбора
 */
export const validateSelection = {
  ulus: (ulus?: UlusWithSettlements): boolean => 
    !!ulus && !!ulus.ulus && ulus.settlements.length > 0,

  settlement: (settlement?: Settlement): boolean => 
    !!settlement && !!settlement.s_id && !!settlement.name,

  street: (street?: Street): boolean => 
    !!street && !!street.ids && !!street.name,

  house: (house?: House): boolean => 
    !!house && !!house.id && !!house.number
};

/**
 * Константы для автофильтрации
 */
export const FILTER_CONSTANTS = {
  MIN_SEARCH_LENGTH: 0,
  DEBOUNCE_DELAY: 300,
  MAX_VISIBLE_ITEMS: 50,
  SCROLL_THRESHOLD: 5
} as const;

/**
 * Хук для управления фокусом в выпадающих списках
 */
export const useFocusManagement = () => {
  const focusInput = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const blurInput = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return { focusInput, blurInput };
};

/**
 * Типы для расширенной конфигурации фильтрации
 */
export interface FilterConfig {
  enableDebounce: boolean;
  debounceDelay: number;
  enableSorting: boolean;
  enableHighlighting: boolean;
  minSearchLength: number;
  maxVisibleItems: number;
  caseSensitive: boolean;
  exactMatch: boolean;
}