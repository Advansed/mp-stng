// src/components/Lics/components/useFindLics.ts

import { useReducer, useCallback, useEffect } from 'react';
import { Store, getData, getLics, getProfile } from '../../Store';
import { 
  FindLicState, 
  FindLicData, 
  Settlement, 
  Street, 
  House, 
  UseFindLicsReturn,
  ApiResponse,
  StoreState
} from './types';
import { FIND_LIC_CONSTANTS, DEBUG_PREFIXES } from './constants';

// ========================
// REDUCER ACTIONS
// ========================

type FindLicAction = 
  | { type: 'SET_LOADING'; loading: boolean; step?: string }
  | { type: 'SET_MESSAGE'; message: string }
  | { type: 'SET_SETTLEMENTS'; settlements: Settlement[] }
  | { type: 'SELECT_SETTLEMENT'; settlement: Settlement }
  | { type: 'SET_STREETS'; streets: Street[] }
  | { type: 'SELECT_STREET'; street: Street }
  | { type: 'SET_HOUSES'; houses: House[] }
  | { type: 'SELECT_HOUSE'; house: House }
  | { type: 'UPDATE_FORM_DATA'; field: keyof FindLicData; value: string }
  | { type: 'SET_STEP'; step: number }
  | { type: 'RESET_FORM' };

// ========================
// REDUCER
// ========================

function findLicReducer(state: FindLicState, action: FindLicAction): FindLicState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading,
        loadingStep: action.step || null
      };

    case 'SET_MESSAGE':
      return {
        ...state,
        message: action.message
      };

    case 'SET_SETTLEMENTS':
      return {
        ...state,
        settlements: action.settlements,
        loading: false,
        loadingStep: null,
        currentStep: Math.max(state.currentStep, FIND_LIC_CONSTANTS.STEPS.SETTLEMENT)
      };

    case 'SELECT_SETTLEMENT':
      return {
        ...state,
        selectedSettlement: action.settlement,
        selectedStreet: undefined,
        selectedHouse: undefined,
        formData: {
          ...state.formData,
          settlementId: action.settlement.s_id,
          settlementName: action.settlement.name,
          streetId: '',
          streetName: '',
          houseId: '',
          houseNumber: ''
        },
        currentStep: Math.max(state.currentStep, FIND_LIC_CONSTANTS.STEPS.STREET)
      };

    case 'SET_STREETS':
      return {
        ...state,
        selectedSettlement: state.selectedSettlement ? {
          ...state.selectedSettlement,
          streets: action.streets
        } : state.selectedSettlement,
        loading: false,
        loadingStep: null
      };

    case 'SELECT_STREET':
      return {
        ...state,
        selectedStreet: action.street,
        selectedHouse: undefined,
        formData: {
          ...state.formData,
          streetId: action.street.ids,
          streetName: action.street.name,
          houseId: '',
          houseNumber: ''
        },
        currentStep: Math.max(state.currentStep, FIND_LIC_CONSTANTS.STEPS.HOUSE)
      };

    case 'SET_HOUSES':
      return {
        ...state,
        selectedStreet: state.selectedStreet ? {
          ...state.selectedStreet,
          houses: action.houses
        } : state.selectedStreet,
        loading: false,
        loadingStep: null
      };

    case 'SELECT_HOUSE':
      return {
        ...state,
        selectedHouse: action.house,
        formData: {
          ...state.formData,
          houseId: action.house.id,
          houseNumber: action.house.number
        },
        currentStep: Math.max(state.currentStep, FIND_LIC_CONSTANTS.STEPS.FORM)
      };

    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value
        }
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.step
      };

    case 'RESET_FORM':
      return {
        ...initialState,
        settlements: state.settlements // Сохраняем загруженные населенные пункты
      };

    default:
      return state;
  }
}

// ========================
// INITIAL STATE
// ========================

const initialState: FindLicState = {
  settlements: [],
  selectedSettlement: undefined,
  selectedStreet: undefined,
  selectedHouse: undefined,
  formData: { ...FIND_LIC_CONSTANTS.INITIAL_DATA },
  loading: false,
  loadingStep: null,
  message: '',
  currentStep: 0
};

// ========================
// API FUNCTIONS
// ========================

async function getSettlementsApi(token: string): Promise<Settlement[]> {
  try {
    const response: ApiResponse = await getData('getSettlements', { token });
    
    if (response.error) {
      throw new Error(response.message || 'Ошибка загрузки населенных пунктов');
    }
    
    return response.data || [];
  } catch (error) {
    console.error(`${DEBUG_PREFIXES.ERROR} Error loading settlements:`, error);
    throw error;
  }
}

async function getStreetsApi(token: string, settlementId: string): Promise<Street[]> {
  try {
    const response: ApiResponse = await getData('getStreets', {
      token,
      s_id: settlementId
    });
    
    if (response.error) {
      throw new Error(response.message || 'Ошибка загрузки улиц');
    }
    
    return response.data || [];
  } catch (error) {
    console.error(`${DEBUG_PREFIXES.ERROR} Error loading streets:`, error);
    throw error;
  }
}

async function getHousesApi(token: string, streetId: string): Promise<House[]> {
  try {
    const response: ApiResponse = await getData('getHouses', {
      token,
      ids: streetId
    });
    
    if (response.error) {
      throw new Error(response.message || 'Ошибка загрузки домов');
    }
    
    return response.data || [];
  } catch (error) {
    console.error(`${DEBUG_PREFIXES.ERROR} Error loading houses:`, error);
    throw error;
  }
}

async function addAccountApi(token: string, formData: FindLicData): Promise<void> {
  try {
    const params = {
      token,
      fio:          formData.fio,
      s_id:         formData.settlementId,
      ids:          formData.streetId,
      house_id:     formData.houseId,
      apartment:    formData.apartment,
      LC:           formData.licenseNumber
    };

    // Добавляем квартиру если указана
    if (formData.apartment && formData.apartment.trim().length > 0) {
      params.apartment = formData.apartment.trim();
    }

    const response: ApiResponse = await getData('AddAccount', params);
    
    if (response.error) {
      throw new Error(response.message || 'Ошибка добавления лицевого счета');
    }
  } catch (error) {
    console.error(`${DEBUG_PREFIXES.ERROR} Error adding account:`, error);
    throw error;
  }
}

// ========================
// VALIDATION FUNCTIONS
// ========================

function validateLicenseNumber(value: string): boolean {
  if (!value || value.trim().length === 0) return false;
  if (value.length < 8 || value.length > 20) return false;
  return /^[0-9]+$/.test(value);
}

function validateFIO(value: string): boolean {
  if (!value || value.trim().length === 0) return false;
  if (value.length < 2 || value.length > 100) return false;
  return /^[а-яёА-ЯЁ\s\-.]+$/.test(value);
}

function validateFormData(formData: FindLicData): boolean {
  return (
    !!formData.settlementId &&
    !!formData.streetId &&
    !!formData.houseId &&
    validateLicenseNumber(formData.licenseNumber) &&
    validateFIO(formData.fio)
  );
}

// ========================
// HOOK
// ========================

export function useFindLics(): UseFindLicsReturn {
  const [state, dispatch] = useReducer(findLicReducer, initialState);

  // Получение токена
  const getToken = useCallback((): string => {
    try {
      const storeState = Store.getState() as StoreState;
      return storeState.login.token;
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Error getting token:`, error);
      throw new Error('Не удалось получить токен авторизации');
    }
  }, []);

  // Загрузка населенных пунктов
  const loadSettlements = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true, step: FIND_LIC_CONSTANTS.MESSAGES.LOADING_SETTLEMENTS });
      dispatch({ type: 'SET_MESSAGE', message: '' });

      const settlements = await getSettlementsApi(getToken());
      
      dispatch({ type: 'SET_SETTLEMENTS', settlements });
      
      if (settlements.length === 0) {
        dispatch({ type: 'SET_MESSAGE', message: 'Населенные пункты не найдены' });
      }
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Error in loadSettlements:`, error);
      dispatch({ type: 'SET_LOADING', loading: false });
      dispatch({ 
        type: 'SET_MESSAGE', 
        message: error instanceof Error ? error.message : 'Ошибка загрузки населенных пунктов' 
      });
    }
  }, [getToken]);

  // Выбор населенного пункта
  const selectSettlement = useCallback(async (settlement: Settlement): Promise<void> => {
    try {
      dispatch({ type: 'SELECT_SETTLEMENT', settlement });
      dispatch({ type: 'SET_LOADING', loading: true, step: FIND_LIC_CONSTANTS.MESSAGES.LOADING_STREETS });
      dispatch({ type: 'SET_MESSAGE', message: '' });

      const streets = await getStreetsApi(getToken(), settlement.s_id);
      
      dispatch({ type: 'SET_STREETS', streets });
      
      if (streets.length === 0) {
        dispatch({ type: 'SET_MESSAGE', message: 'Улицы не найдены для выбранного населенного пункта' });
      }
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Error in selectSettlement:`, error);
      dispatch({ type: 'SET_LOADING', loading: false });
      dispatch({ 
        type: 'SET_MESSAGE', 
        message: error instanceof Error ? error.message : 'Ошибка загрузки улиц' 
      });
    }
  }, [getToken]);

  // Выбор улицы
  const selectStreet = useCallback(async (street: Street): Promise<void> => {
    try {
      dispatch({ type: 'SELECT_STREET', street });
      dispatch({ type: 'SET_LOADING', loading: true, step: FIND_LIC_CONSTANTS.MESSAGES.LOADING_HOUSES });
      dispatch({ type: 'SET_MESSAGE', message: '' });

      const houses = await getHousesApi(getToken(), street.ids);
      
      dispatch({ type: 'SET_HOUSES', houses });
      
      if (houses.length === 0) {
        dispatch({ type: 'SET_MESSAGE', message: 'Дома не найдены для выбранной улицы' });
      }
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Error in selectStreet:`, error);
      dispatch({ type: 'SET_LOADING', loading: false });
      dispatch({ 
        type: 'SET_MESSAGE', 
        message: error instanceof Error ? error.message : 'Ошибка загрузки домов' 
      });
    }
  }, [getToken]);

  // Выбор дома
  const selectHouse = useCallback((house: House): void => {
    dispatch({ type: 'SELECT_HOUSE', house });
    dispatch({ type: 'SET_MESSAGE', message: FIND_LIC_CONSTANTS.MESSAGES.FILL_FORM });
  }, []);

  // Обновление данных формы
  const updateFormData = useCallback((field: keyof FindLicData, value: string): void => {
    dispatch({ type: 'UPDATE_FORM_DATA', field, value });
  }, []);

  // Отправка формы
  const submitForm = useCallback(async (): Promise<boolean> => {
    try {
      if (!validateFormData(state.formData)) {
        dispatch({ type: 'SET_MESSAGE', message: 'Проверьте корректность заполнения всех полей' });
        return false;
      }

      dispatch({ type: 'SET_LOADING', loading: true, step: FIND_LIC_CONSTANTS.MESSAGES.SUBMITTING });
      dispatch({ type: 'SET_MESSAGE', message: '' });

      await addAccountApi(getToken(), state.formData);

      // Обновляем данные в Store
      await Promise.all([
        getLics({ token: getToken() }),
        getProfile({ token: getToken() })
      ]);

      dispatch({ type: 'SET_LOADING', loading: false });
      dispatch({ type: 'SET_MESSAGE', message: FIND_LIC_CONSTANTS.MESSAGES.SUCCESS });

      return true;
    } catch (error) {
      console.error(`${DEBUG_PREFIXES.ERROR} Error in submitForm:`, error);
      dispatch({ type: 'SET_LOADING', loading: false });
      dispatch({ 
        type: 'SET_MESSAGE', 
        message: error instanceof Error ? error.message : 'Ошибка при добавлении лицевого счета' 
      });
      return false;
    }
  }, [state.formData, getToken]);

  // Сброс формы
  const resetForm = useCallback((): void => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  // Инициализация - загрузка населенных пунктов при первом использовании
  const initializeIfNeeded = useCallback((): void => {
    if (state.settlements.length === 0 && !state.loading && state.currentStep === 0) {
      loadSettlements();
    }
  }, [state.settlements.length, state.loading, state.currentStep, loadSettlements]);

  // Автоинициализация
  useEffect(() => {
    initializeIfNeeded();
  }, [initializeIfNeeded]);

  // Вычисляемые значения
  const canSubmit = validateFormData(state.formData) && !state.loading;

  return {
    state,
    selectSettlement,
    selectStreet,
    selectHouse,
    updateFormData,
    submitForm,
    resetForm,
    canSubmit
  };
}