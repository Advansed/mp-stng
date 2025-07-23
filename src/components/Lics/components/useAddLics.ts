// src/components/Lics/components/useAddLics.ts

/* ===============================================================================
 * ПЛАН ПЕРЕДЕЛКИ AddLics.tsx для поиска по адресу
 * ===============================================================================
 * 
 * ✅ ВЫПОЛНЕНО:
 * - Шаг 1: Обновлены типы данных (Ulus, AddLicByAddressData, AddLicsState)
 * - Шаг 2: Обновлены API методы (loadUluses, selectUlus, исправлены существующие)
 * 
 * 🔄 В ПРОЦЕССЕ:
 * - Шаг 3: Исправление API вызовов (используем рабочие из AddLic2)
 * - Шаг 4: Исправление отправки данных в AddAccount
 * 
 * ⏳ ПЛАНИРУЕТСЯ:
 * - Шаг 5: Обновление UI компоненты
 * - Шаг 6: Отладка и тестирование
 * 
 * ===============================================================================
 */

import { useState, useCallback } from 'react';
import { Store, getData, getLics, getProfile } from '../../Store';
import { 
  AddLicMode, 
  AddLicsState, 
  AddLicByCodeData, 
  AddLicByAddressData,
  Ulus,           // 🆕
  Settlement,
  Street,
  House,
  UseAddLicsReturn,
  ApiResponse,
  AddAccountParams,
  StoreState
} from './types';
import { 
  ADD_LICS_CONSTANTS, 
  ADD_LICS_API_ENDPOINTS,
  DEBUG_PREFIXES 
} from './constants';

export const useAddLics = (): UseAddLicsReturn => {
  // ========================
  // ОСНОВНОЕ СОСТОЯНИЕ - ОБНОВЛЕННОЕ
  // ========================
  
  const [state, setState] = useState<AddLicsState>({
    mode: ADD_LICS_CONSTANTS.DEFAULT_MODE,
    loading: false,
    message: '',
    codeData: { ...ADD_LICS_CONSTANTS.INITIAL_CODE_DATA },
    addressData: { ...ADD_LICS_CONSTANTS.INITIAL_ADDRESS_DATA },
    
    // 🆕 Добавляем поддержку улусов в состояние
    uluses: [],
    selectedUlus: undefined,
    settlements: [],
    selectedSettlement: undefined,
    selectedStreet: undefined,
    selectedHouse: undefined,
  });

  // ========================
  // УТИЛИТЫ
  // ========================

  // Безопасное обновление состояния
  const updateState = useCallback((updates: Partial<AddLicsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Получение токена из Store
  const getToken = useCallback((): string => {
    try {
      const storeState = Store.getState() as StoreState;
      return storeState.login.token;
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ADD_LICS} Error getting token:`, error);
      throw new Error('Не удалось получить токен авторизации');
    }
  }, []);

  // Логирование для отладки
  const log = useCallback((message: string, data?: any) => {
    console.log(`${DEBUG_PREFIXES.ADD_LICS} ${message}`, data || '');
  }, []);

  // ========================
  // УПРАВЛЕНИЕ РЕЖИМАМИ
  // ========================

  const setMode = useCallback((mode: AddLicMode) => {
    log(`Setting mode: ${mode}`);
    updateState({ 
      mode, 
      message: '' // Очищаем сообщения при смене режима
    });
  }, [updateState, log]);

  const resetToSelection = useCallback(() => {
    log('Resetting to selection mode');
    updateState({
      mode: AddLicMode.SELECTION,
      message: ''
    });
  }, [updateState, log]);

  // ========================
  // УПРАВЛЕНИЕ ДАННЫМИ ФОРМ
  // ========================

  const updateCodeData = useCallback((field: keyof AddLicByCodeData, value: string) => {
    log(`Updating code form field: ${field} = ${value}`);
    setState(prev => ({
      ...prev,
      codeData: {
        ...prev.codeData,
        [field]: value
      }
    }));
  }, [log]);

  const updateAddressData = useCallback((field: keyof AddLicByAddressData, value: string) => {
    log(`Updating address form field: ${field} = ${value}`);
    setState(prev => ({
      ...prev,
      addressData: {
        ...prev.addressData,
        [field]: value
      }
    }));
  }, [log]);

  // ========================
  // РАБОТА СО СПРАВОЧНИКАМИ - ОБНОВЛЕННАЯ
  // ========================
  
  // 🆕 Шаг 2.1: Новый метод loadUluses для загрузки улусов
  const loadUluses = useCallback(async (): Promise<void> => {
    try {
      log('Loading uluses...');
      updateState({ 
        loading: true, 
        message: ADD_LICS_CONSTANTS.MESSAGES.LOADING_ULUSES 
      });

      // Попробуем загрузить улусы через API
      // Если API для улусов нет, будем фильтровать населенные пункты
      try {
        const response: ApiResponse = await getData(ADD_LICS_API_ENDPOINTS.GET_ULUSES, {
          token: getToken()
        });

        if (!response.error && response.data) {
          const uluses: Ulus[] = response.data || [];
          log(`Loaded ${uluses.length} uluses`);

          updateState({
            uluses,
            loading: false,
            message: ''
          });
          return;
        }
      } catch (error) {
        log('No dedicated uluses API, will extract from settlements');
      }

      // Если API для улусов нет, извлекаем улусы из населенных пунктов
      const settlementsResponse: ApiResponse = await getData(ADD_LICS_API_ENDPOINTS.GET_SETTLEMENTS, {
        token: getToken()
      });

      if (settlementsResponse.error) {
        throw new Error(settlementsResponse.message || ADD_LICS_CONSTANTS.MESSAGES.ULUSES_LOAD_ERROR);
      }

      const settlements: Settlement[] = settlementsResponse.data || [];
      
      // Извлекаем уникальные улусы из названий населенных пунктов
      const ulusesMap = new Map<string, Ulus>();
      settlements.forEach(settlement => {
        // Предполагаем, что улус указан в начале названия населенного пункта
        const parts = settlement.name.split(' ');
        if (parts.length > 1) {
          const ulusName = parts[0] + ' ' + (parts[1] || ''); // Берем первые 2 слова как улус
          const ulusId = `ulus_${ulusName.toLowerCase().replace(/\s+/g, '_')}`;
          
          if (!ulusesMap.has(ulusId)) {
            ulusesMap.set(ulusId, {
              ulus_id: ulusId,
              name: ulusName,
              settlements: []
            });
          }
          
          ulusesMap.get(ulusId)!.settlements!.push(settlement);
        }
      });

      const uluses = Array.from(ulusesMap.values());
      log(`Extracted ${uluses.length} uluses from settlements`);

      updateState({
        uluses,
        settlements,
        loading: false,
        message: ''
      });

    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ADD_LICS} Error loading uluses:`, error);
      updateState({
        loading: false,
        message: error instanceof Error ? error.message : ADD_LICS_CONSTANTS.MESSAGES.ULUSES_LOAD_ERROR
      });
    }
  }, [getToken, updateState, log]);

  // 🆕 Шаг 2.1: Новый метод selectUlus для выбора улуса
  const selectUlus = useCallback(async (ulus: Ulus): Promise<void> => {
    try {
      log(`Selecting ulus: ${ulus.name} (${ulus.ulus_id})`);
      
      updateState({ 
        selectedUlus: ulus,
        selectedSettlement: undefined,
        selectedStreet: undefined,
        selectedHouse: undefined,
        settlements: ulus.settlements || []
      });

      updateAddressData('ulusId', ulus.ulus_id);
      updateAddressData('ulusName', ulus.name);
      
      // Сбрасываем последующие выборы
      updateAddressData('settlementId', '');
      updateAddressData('streetId', '');
      updateAddressData('houseId', '');

    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ADD_LICS} Error selecting ulus:`, error);
      updateState({
        message: 'Ошибка при выборе улуса'
      });
    }
  }, [updateState, updateAddressData, log]);

  // ✅ Шаг 2.2: Исправляем loadSettlements - добавляем поддержку ulusId
  const loadSettlements = useCallback(async (ulusId?: string): Promise<void> => {
    try {
      log('Loading settlements...', { ulusId });
      updateState({ 
        loading: true, 
        message: ADD_LICS_CONSTANTS.MESSAGES.LOADING_SETTLEMENTS 
      });

      // ✅ Шаг 3.1: Используем рабочий API вызов как в AddLic2
      const response: ApiResponse = await getData(ADD_LICS_API_ENDPOINTS.GET_SETTLEMENTS, {
        token: getToken()
        // Примечание: в AddLic2 этот вызов идет без дополнительных параметров
      });

      if (response.error) {
        throw new Error(response.message || ADD_LICS_CONSTANTS.MESSAGES.SETTLEMENTS_LOAD_ERROR);
      }

      let settlements: Settlement[] = response.data || [];
      
      // Если указан ulusId, фильтруем населенные пункты
      if (ulusId && state.uluses.length > 0) {
        const selectedUlus = state.uluses.find(u => u.ulus_id === ulusId);
        if (selectedUlus && selectedUlus.settlements) {
          settlements = selectedUlus.settlements;
        }
      }
      
      log(`Loaded ${settlements.length} settlements`);

      updateState({
        settlements,
        loading: false,
        message: ''
      });

    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ADD_LICS} Error loading settlements:`, error);
      updateState({
        loading: false,
        message: error instanceof Error ? error.message : ADD_LICS_CONSTANTS.MESSAGES.SETTLEMENTS_LOAD_ERROR
      });
    }
  }, [getToken, updateState, log, state.uluses]);

  // ✅ Шаг 2.2: Исправляем selectSettlement - используем правильные параметры
  const selectSettlement = useCallback(async (settlement: Settlement): Promise<void> => {
    try {
      log(`Selecting settlement: ${settlement.name} (${settlement.s_id})`);
      updateState({ 
        loading: true,
        message: ADD_LICS_CONSTANTS.MESSAGES.LOADING_STREETS,
        selectedSettlement: settlement,
        selectedStreet: undefined,
        selectedHouse: undefined
      });

      updateAddressData('settlementId', settlement.s_id);
      updateAddressData('settlementName', settlement.name);

      // ✅ Шаг 3.1: Используем рабочий API вызов как в AddLic2
      const response: ApiResponse = await getData(ADD_LICS_API_ENDPOINTS.GET_STREETS, {
        token: getToken(),
        s_id: settlement.s_id  // ✅ Правильный параметр как в AddLic2
      });

      if (response.error) {
        throw new Error(response.message || ADD_LICS_CONSTANTS.MESSAGES.STREETS_LOAD_ERROR);
      }

      const streets: Street[] = response.data || [];
      log(`Loaded ${streets.length} streets for settlement ${settlement.name}`);

      // Обновляем settlement с улицами
      const updatedSettlement = { ...settlement, streets };

      updateState({
        selectedSettlement: updatedSettlement,
        loading: false,
        message: ''
      });

    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ADD_LICS} Error loading streets:`, error);
      updateState({
        loading: false,
        message: error instanceof Error ? error.message : ADD_LICS_CONSTANTS.MESSAGES.STREETS_LOAD_ERROR
      });
    }
  }, [getToken, updateState, updateAddressData, log]);

  // ✅ Шаг 2.2: Исправляем selectStreet - используем правильные параметры
  const selectStreet = useCallback(async (street: Street): Promise<void> => {
    try {
      log(`Selecting street: ${street.name} (${street.ids})`);
      updateState({ 
        loading: true,
        message: ADD_LICS_CONSTANTS.MESSAGES.LOADING_HOUSES,
        selectedStreet: street,
        selectedHouse: undefined
      });

      updateAddressData('streetId', street.ids);
      updateAddressData('streetName', street.name);

      // ✅ Шаг 3.1: Используем рабочий API вызов как в AddLic2
      const response: ApiResponse = await getData(ADD_LICS_API_ENDPOINTS.GET_HOUSES, {
        token: getToken(),
        ids: street.ids  // ✅ Правильный параметр как в AddLic2
      });

      if (response.error) {
        throw new Error(response.message || ADD_LICS_CONSTANTS.MESSAGES.HOUSES_LOAD_ERROR);
      }

      const houses: House[] = response.data || [];
      log(`Loaded ${houses.length} houses for street ${street.name}`);

      // Обновляем street с домами
      const updatedStreet = { ...street, houses };

      updateState({
        selectedStreet: updatedStreet,
        loading: false,
        message: ''
      });

    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ADD_LICS} Error loading houses:`, error);
      updateState({
        loading: false,
        message: error instanceof Error ? error.message : ADD_LICS_CONSTANTS.MESSAGES.HOUSES_LOAD_ERROR
      });
    }
  }, [getToken, updateState, updateAddressData, log]);

  const selectHouse = useCallback((house: House): void => {
    log(`Selecting house: ${house.number} (${house.id})`);
    updateState({ selectedHouse: house });
    updateAddressData('houseId', house.id);
    updateAddressData('houseNumber', house.number);
  }, [updateState, updateAddressData, log]);

  // ========================
  // ВАЛИДАЦИЯ - ОБНОВЛЕННАЯ
  // ========================

  const validateCodeForm = useCallback((): boolean => {
    const { lc, fio } = state.codeData;
    const { VALIDATION } = ADD_LICS_CONSTANTS;

    // Проверка номера ЛС
    if (!lc || lc.trim().length === 0) {
      return false;
    }
    if (lc.length < VALIDATION.MIN_LC_LENGTH || lc.length > VALIDATION.MAX_LC_LENGTH) {
      return false;
    }
    if (!VALIDATION.LC_PATTERN.test(lc)) {
      return false;
    }

    // Проверка ФИО
    if (!fio || fio.trim().length === 0) {
      return false;
    }
    if (fio.length < VALIDATION.MIN_FIO_LENGTH || fio.length > VALIDATION.MAX_FIO_LENGTH) {
      return false;
    }
    if (!VALIDATION.FIO_PATTERN.test(fio)) {
      return false;
    }

    return true;
  }, [state.codeData]);

  // ✅ Шаг 5.2: Обновляем валидацию - добавляем проверку ulusId
  const validateAddressForm = useCallback((): boolean => {
    const { ulusId, settlementId, streetId, houseId, apartment, lc, fio } = state.addressData;
    const { VALIDATION } = ADD_LICS_CONSTANTS;

    // 🆕 Проверка улуса (пока делаем опциональной, так как может не быть API для улусов)
    // if (!ulusId) return false;

    // Проверка обязательных справочников
    if (!settlementId || !streetId || !houseId) {
      return false;
    }

    // Проверка квартиры (опционально)
    if (apartment && apartment.length > 0) {
      if (apartment.length > VALIDATION.MAX_APARTMENT_LENGTH) {
        return false;
      }
      if (!VALIDATION.APARTMENT_PATTERN.test(apartment)) {
        return false;
      }
    }

    // Проверка номера ЛС
    if (!lc || lc.trim().length === 0) {
      return false;
    }
    if (lc.length < VALIDATION.MIN_LC_LENGTH || lc.length > VALIDATION.MAX_LC_LENGTH) {
      return false;
    }
    if (!VALIDATION.LC_PATTERN.test(lc)) {
      return false;
    }

    // Проверка ФИО
    if (!fio || fio.trim().length === 0) {
      return false;
    }
    if (fio.length < VALIDATION.MIN_FIO_LENGTH || fio.length > VALIDATION.MAX_FIO_LENGTH) {
      return false;
    }
    if (!VALIDATION.FIO_PATTERN.test(fio)) {
      return false;
    }

    return true;
  }, [state.addressData]);

  // ========================
  // ОТПРАВКА ДАННЫХ - ИСПРАВЛЕННАЯ
  // ========================

  const submitByCode = useCallback(async (): Promise<boolean> => {
    try {
      if (!validateCodeForm()) {
        updateState({ message: 'Проверьте корректность заполнения формы' });
        return false;
      }

      log('Submitting by code...', state.codeData);
      updateState({ 
        loading: true, 
        message: ADD_LICS_CONSTANTS.MESSAGES.ADDING_ACCOUNT 
      });

      const params: AddAccountParams = {
        token: getToken(),
        LC: state.codeData.lc,
        fio: state.codeData.fio
      };

      const response: ApiResponse = await getData(ADD_LICS_API_ENDPOINTS.ADD_ACCOUNT, params);

      if (response.error) {
        throw new Error(response.message || ADD_LICS_CONSTANTS.MESSAGES.ADD_ACCOUNT_ERROR);
      }

      log('Account added successfully by code');

      // Обновляем данные lics и profile
      await Promise.all([
        getLics({ token: getToken() }),
        getProfile({ token: getToken() })
      ]);

      updateState({
        loading: false,
        message: ADD_LICS_CONSTANTS.MESSAGES.ACCOUNT_ADDED
      });

      return true;

    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ADD_LICS} Error submitting by code:`, error);
      updateState({
        loading: false,
        message: error instanceof Error ? error.message : ADD_LICS_CONSTANTS.MESSAGES.ADD_ACCOUNT_ERROR
      });
      return false;
    }
  }, [state.codeData, validateCodeForm, getToken, updateState, log]);

  // ✅ Шаг 4.2: Исправляем submitByAddress - используем правильные параметры как в AddLic2
  const submitByAddress = useCallback(async (): Promise<boolean> => {
    try {
      if (!validateAddressForm()) {
        updateState({ message: 'Проверьте корректность заполнения формы' });
        return false;
      }

      log('Submitting by address...', state.addressData);
      updateState({ 
        loading: true, 
        message: ADD_LICS_CONSTANTS.MESSAGES.ADDING_ACCOUNT 
      });

      // ✅ Шаг 4.1: Используем правильные параметры как в AddLic2
      const params: AddAccountParams = {
        token: getToken(),
        fio: state.addressData.fio,
        s_id: state.addressData.settlementId,      // ✅ ID населенного пункта
        ids: state.addressData.streetId,           // ✅ ID улицы
        house_id: state.addressData.houseId,       // ✅ ID дома
        LC: state.addressData.lc                   // ✅ номер лицевого счета
      };

      // Добавляем квартиру если указана
      if (state.addressData.apartment && state.addressData.apartment.trim().length > 0) {
        params.apartment = state.addressData.apartment.trim();
      }

      const response: ApiResponse = await getData(ADD_LICS_API_ENDPOINTS.ADD_ACCOUNT, params);

      if (response.error) {
        throw new Error(response.message || ADD_LICS_CONSTANTS.MESSAGES.ADD_ACCOUNT_ERROR);
      }

      log('Account added successfully by address');

      // Обновляем данные lics и profile
      await Promise.all([
        getLics({ token: getToken() }),
        getProfile({ token: getToken() })
      ]);

      updateState({
        loading: false,
        message: ADD_LICS_CONSTANTS.MESSAGES.ACCOUNT_ADDED
      });

      return true;

    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ADD_LICS} Error submitting by address:`, error);
      updateState({
        loading: false,
        message: error instanceof Error ? error.message : ADD_LICS_CONSTANTS.MESSAGES.ADD_ACCOUNT_ERROR
      });
      return false;
    }
  }, [state.addressData, validateAddressForm, getToken, updateState, log]);

  // ========================
  // УТИЛИТЫ УПРАВЛЕНИЯ - ОБНОВЛЕННЫЕ
  // ========================

  const resetForms = useCallback(() => {
    log('Resetting all forms');
    updateState({
      codeData: { ...ADD_LICS_CONSTANTS.INITIAL_CODE_DATA },
      addressData: { ...ADD_LICS_CONSTANTS.INITIAL_ADDRESS_DATA },
      selectedUlus: undefined,           // 🆕
      selectedSettlement: undefined,
      selectedStreet: undefined,
      selectedHouse: undefined,
      message: ''
    });
  }, [updateState, log]);

  const clearMessage = useCallback(() => {
    updateState({ message: '' });
  }, [updateState]);

  const setMessage = useCallback((message: string) => {
    updateState({ message });
  }, [updateState]);

  // ========================
  // ВОЗВРАТ ИНТЕРФЕЙСА ХУКА - ОБНОВЛЕННЫЙ
  // ========================

  return {
    // State
    state,
    
    // Mode management
    setMode,
    resetToSelection,
    
    // Form data management
    updateCodeData,
    updateAddressData,
    
    // 🆕 Address form specific - с поддержкой улусов
    loadUluses,           // Новый метод
    selectUlus,           // Новый метод
    loadSettlements,      // Обновленный метод с поддержкой ulusId
    selectSettlement,
    selectStreet,
    selectHouse,
    
    // Form submission
    submitByCode,
    submitByAddress,
    
    // Utilities
    validateCodeForm,
    validateAddressForm,
    resetForms,
    clearMessage,
    setMessage
  };
};