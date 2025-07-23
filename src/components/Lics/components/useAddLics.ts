// src/components/Lics/components/hooks/useAddLics.ts

import { useState, useCallback } from 'react';
import { Store, getData, getLics, getProfile } from '../../Store';
import { 
  AddLicMode, 
  AddLicsState, 
  AddLicByCodeData, 
  AddLicByAddressData,
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
  // ОСНОВНОЕ СОСТОЯНИЕ
  // ========================
  
  const [state, setState] = useState<AddLicsState>({
    mode: ADD_LICS_CONSTANTS.DEFAULT_MODE,
    loading: false,
    message: '',
    codeData: { ...ADD_LICS_CONSTANTS.INITIAL_CODE_DATA },
    addressData: { ...ADD_LICS_CONSTANTS.INITIAL_ADDRESS_DATA },
    settlements: [],
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
  // РАБОТА СО СПРАВОЧНИКАМИ
  // ========================

  const loadSettlements = useCallback(async (): Promise<void> => {
    try {
      log('Loading settlements...');
      updateState({ 
        loading: true, 
        message: ADD_LICS_CONSTANTS.MESSAGES.LOADING_SETTLEMENTS 
      });

      const response: ApiResponse = await getData(ADD_LICS_API_ENDPOINTS.GET_SETTLEMENTS, {
        token: getToken()
      });

      if (response.error) {
        throw new Error(response.message || ADD_LICS_CONSTANTS.MESSAGES.SETTLEMENTS_LOAD_ERROR);
      }

      const settlements: Settlement[] = response.data || [];
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
  }, [getToken, updateState, log]);

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

      const response: ApiResponse = await getData(ADD_LICS_API_ENDPOINTS.GET_STREETS, {
        token: getToken(),
        s_id: settlement.s_id
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

      const response: ApiResponse = await getData(ADD_LICS_API_ENDPOINTS.GET_HOUSES, {
        token: getToken(),
        ids: street.ids
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
  // ВАЛИДАЦИЯ
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

  const validateAddressForm = useCallback((): boolean => {
    const { settlementId, streetId, houseId, apartment, lc, fio } = state.addressData;
    const { VALIDATION } = ADD_LICS_CONSTANTS;

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
  // ОТПРАВКА ДАННЫХ
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

      const params: AddAccountParams = {
        token: getToken(),
        fio: state.addressData.fio,
        s_id: state.addressData.settlementId,
        ids: state.addressData.streetId,
        house_id: state.addressData.houseId,
        LC: state.addressData.lc
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
  // УТИЛИТЫ УПРАВЛЕНИЯ
  // ========================

  const resetForms = useCallback(() => {
    log('Resetting all forms');
    updateState({
      codeData: { ...ADD_LICS_CONSTANTS.INITIAL_CODE_DATA },
      addressData: { ...ADD_LICS_CONSTANTS.INITIAL_ADDRESS_DATA },
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
  // ВОЗВРАТ ИНТЕРФЕЙСА ХУКА
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
    
    // Address form specific
    loadSettlements,
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