// src/components/Lics/components/AddLics.tsx

import React, { useEffect, useCallback } from 'react';
import { IonCard, IonText, IonLoading } from '@ionic/react';
import { useAddLics } from './useAddLics';
import { AddLicMode, AddLicsProps, LicsPage } from './types';
import { ADD_LICS_CONSTANTS, DEBUG_PREFIXES } from './constants';

// Подкомпоненты
import { ModeSelection } from './ModeSelection';
import { CodeForm } from './CodeForm';
import { AddressForm } from './AddressForm';
import { ActionButtons } from './ActionButtons';

export function AddLics({ setPage, initialMode }: AddLicsProps): JSX.Element {
  // ========================
  // ХУК И СОСТОЯНИЕ - ОБНОВЛЕННЫЙ
  // ========================
  
  const {
    state,
    setMode,
    resetToSelection,
    updateCodeData,
    updateAddressData,
    
    // 🆕 Новые методы для работы с улусами
    loadUluses,
    selectUlus,
    loadSettlements,
    selectSettlement,
    selectStreet,
    selectHouse,
    
    submitByCode,
    submitByAddress,
    validateCodeForm,
    validateAddressForm,
    resetForms,
    clearMessage
  } = useAddLics();

  // ========================
  // ЭФФЕКТЫ - ОБНОВЛЕННЫЕ
  // ========================

  // Инициализация режима
  useEffect(() => {
    if (initialMode && initialMode !== state.mode) {
      console.log(`${DEBUG_PREFIXES.ADD_LICS} Setting initial mode: ${initialMode}`);
      setMode(initialMode);
    }
  }, [initialMode, state.mode, setMode]);

  // ✅ Шаг 5: Обновленная загрузка справочников при переходе в режим по адресу
  useEffect(() => {
    if (state.mode === AddLicMode.BY_ADDRESS) {
      console.log(`${DEBUG_PREFIXES.ADD_LICS} Entering address mode, loading directories`);
      
      // 🆕 Сначала загружаем улусы, если они еще не загружены
      if (state.uluses.length === 0) {
        console.log(`${DEBUG_PREFIXES.ADD_LICS} Loading uluses for address mode`);
        loadUluses();
      }
      
      // Загружаем населенные пункты, если они еще не загружены
      if (state.settlements.length === 0) {
        console.log(`${DEBUG_PREFIXES.ADD_LICS} Loading settlements for address mode`);
        loadSettlements();
      }
    }
  }, [state.mode, state.uluses.length, state.settlements.length, loadUluses, loadSettlements]);

  // ========================
  // ОБРАБОТЧИКИ СОБЫТИЙ - ОБНОВЛЕННЫЕ
  // ========================

  const handleModeSelect = useCallback((mode: AddLicMode) => {
    console.log(`${DEBUG_PREFIXES.ADD_LICS} Mode selected: ${mode}`);
    setMode(mode);
    clearMessage();
  }, [setMode, clearMessage]);

  const handleSubmit = useCallback(async () => {
    console.log(`${DEBUG_PREFIXES.ADD_LICS} Submitting form in mode: ${state.mode}`);
    
    let success = false;
    
    if (state.mode === AddLicMode.BY_CODE) {
      success = await submitByCode();
    } else if (state.mode === AddLicMode.BY_ADDRESS) {
      success = await submitByAddress();
    }
    
    if (success) {
      console.log(`${DEBUG_PREFIXES.ADD_LICS} Form submitted successfully, returning to main page`);
      // Небольшая задержка, чтобы пользователь увидел сообщение об успехе
      setTimeout(() => {
        setPage(LicsPage.MAIN);
      }, 1500);
    }
  }, [state.mode, submitByCode, submitByAddress, setPage]);

  const handleBack = useCallback(() => {
    console.log(`${DEBUG_PREFIXES.ADD_LICS} Back button pressed from mode: ${state.mode}`);
    
    if (state.mode === AddLicMode.SELECTION) {
      // Возврат на главную страницу
      setPage(LicsPage.MAIN);
    } else {
      // Возврат к выбору режима
      resetToSelection();
    }
  }, [state.mode, setPage, resetToSelection]);

  const handleReset = useCallback(() => {
    console.log(`${DEBUG_PREFIXES.ADD_LICS} Reset button pressed`);
    resetForms();
  }, [resetForms]);

  // ========================
  // ПРОВЕРКА ВОЗМОЖНОСТИ ОТПРАВКИ - ОБНОВЛЕННАЯ
  // ========================

  const canSubmit = useCallback((): boolean => {
    switch (state.mode) {
      case AddLicMode.BY_CODE:
        return validateCodeForm();
      case AddLicMode.BY_ADDRESS:
        return validateAddressForm();
      default:
        return false;
    }
  }, [state.mode, validateCodeForm, validateAddressForm]);

  // ========================
  // РЕНДЕР КОНТЕНТА - ОБНОВЛЕННЫЙ
  // ========================

  const renderContent = (): JSX.Element => {
    switch (state.mode) {
      case AddLicMode.SELECTION:
        return (
          <ModeSelection onModeSelect={handleModeSelect} />
        );

      case AddLicMode.BY_CODE:
        return (
          <CodeForm
            data={state.codeData}
            onChange={updateCodeData}
            onSubmit={handleSubmit}
            loading={state.loading}
          />
        );

      case AddLicMode.BY_ADDRESS:
        return (
          <AddressForm
            data={state.addressData}
            
            // 🆕 Передаем улусы и связанные данные
            uluses={state.uluses}
            selectedUlus={state.selectedUlus}
            settlements={state.settlements}
            selectedSettlement={state.selectedSettlement}
            selectedStreet={state.selectedStreet}
            selectedHouse={state.selectedHouse}
            
            // 🆕 Передаем обработчики с поддержкой улусов
            onChange={updateAddressData}
            onUlusChange={selectUlus}        // Новый обработчик
            onSettlementChange={selectSettlement}
            onStreetChange={selectStreet}
            onHouseChange={selectHouse}
            onSubmit={handleSubmit}
            loading={state.loading}
          />
        );

      default:
        console.warn(`${DEBUG_PREFIXES.ADD_LICS} Unknown mode: ${state.mode}`);
        return <div>Неизвестный режим</div>;
    }
  };

  const renderHeader = (): JSX.Element => {
    const getTitle = (): string => {
      switch (state.mode) {
        case AddLicMode.SELECTION:
          return 'Добавить лицевой счет';
        case AddLicMode.BY_CODE:
          return 'Добавить по номеру ЛС';
        case AddLicMode.BY_ADDRESS:
          return 'Добавить по адресу';
        default:
          return 'Добавить лицевой счет';
      }
    };

    return (
      <div className="flex fl-space mt-1 ml-1 mr-1">
        <h4><b>{getTitle()}</b></h4>
      </div>
    );
  };

  const renderMessage = (): JSX.Element | null => {
    if (!state.message) return null;

    // Определяем тип сообщения для правильного цвета
    const isError = state.message.includes('Ошибка') || 
                   state.message.includes('Не удалось') || 
                   state.message.includes('недопустимые') ||
                   state.message.includes('Проверьте');
    
    const isSuccess = state.message.includes('успешно') || 
                     state.message.includes('добавлен');

    const color = isError ? 'danger' : isSuccess ? 'success' : 'primary';

    return (
      <div className="ml-1 mr-1 mt-05">
        <IonText color={color}>
          <p className="text-center">
            <small>{state.message}</small>
          </p>
        </IonText>
      </div>
    );
  };

  // ========================
  // ОТЛАДОЧНАЯ ИНФОРМАЦИЯ
  // ========================
  
  const renderDebugInfo = (): JSX.Element | null => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <div className="ml-1 mr-1 mb-1">
        <details>
          <summary className="fs-06 color-medium">Debug Info</summary>
          <div className="fs-06 color-medium mt-05">
            <p>Mode: {state.mode}</p>
            <p>Loading: {state.loading.toString()}</p>
            <p>Can Submit: {canSubmit().toString()}</p>
            <p>Uluses: {state.uluses.length}</p>
            <p>Settlements: {state.settlements.length}</p>
            <p>Selected Ulus: {state.selectedUlus?.name || 'none'}</p>
            <p>Selected Settlement: {state.selectedSettlement?.name || 'none'}</p>
            <p>Selected Street: {state.selectedStreet?.name || 'none'}</p>
            <p>Selected House: {state.selectedHouse?.number || 'none'}</p>
          </div>
        </details>
      </div>
    );
  };

  // ========================
  // ОСНОВНОЙ РЕНДЕР
  // ========================

  console.log(`${DEBUG_PREFIXES.ADD_LICS} Rendering AddLics in mode: ${state.mode}`);

  return (
    <>
      <IonCard className="add-lics-card">
        {/* Заголовок */}
        {renderHeader()}

        {/* Сообщения */}
        {renderMessage()}

        {/* Основной контент */}
        <div className="add-lics-content">
          {renderContent()}
        </div>

        {/* Кнопки управления */}
        {state.mode !== AddLicMode.SELECTION && (
          <ActionButtons
            mode={state.mode}
            canSubmit={canSubmit()}
            loading={state.loading}
            onSubmit={handleSubmit}
            onBack={handleBack}
            onReset={handleReset}
          />
        )}

        {/* Отладочная информация */}
        {renderDebugInfo()}
      </IonCard>

      {/* Индикатор загрузки */}
      <IonLoading
        isOpen={state.loading}
        message={state.message || 'Загрузка...'}
        spinner="crescent"
      />
    </>
  );
}