// src/components/Lics/components/AddLics.tsx

import React, { useEffect, useCallback } from 'react';
import { IonCard, IonText, IonLoading } from '@ionic/react';
import { useAddLics } from './useAddLics';
import { AddLicMode, AddLicsProps, LicsPage } from './types';
import { ADD_LICS_CONSTANTS, DEBUG_PREFIXES } from './constants';

// Подкомпоненты (пока заглушки, создадим позже)
import { ModeSelection } from './ModeSelection';
import { CodeForm } from './CodeForm';
import { AddressForm } from './AddressForm';
import { ActionButtons } from './ActionButtons';

export function AddLics({ setPage, initialMode }: AddLicsProps): JSX.Element {
  // ========================
  // ХУК И СОСТОЯНИЕ
  // ========================
  
  const {
    state,
    setMode,
    resetToSelection,
    updateCodeData,
    updateAddressData,
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
  // ЭФФЕКТЫ
  // ========================

  // Инициализация режима
  useEffect(() => {
    if (initialMode && initialMode !== state.mode) {
      console.log(`${DEBUG_PREFIXES.ADD_LICS} Setting initial mode: ${initialMode}`);
      setMode(initialMode);
    }
  }, [initialMode, state.mode, setMode]);

  // Загрузка справочников при переходе в режим по адресу
  useEffect(() => {
    if (state.mode === AddLicMode.BY_ADDRESS && state.settlements.length === 0) {
      console.log(`${DEBUG_PREFIXES.ADD_LICS} Loading settlements for address mode`);
      loadSettlements();
    }
  }, [state.mode, state.settlements.length, loadSettlements]);

  // ========================
  // ОБРАБОТЧИКИ СОБЫТИЙ
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
      clearMessage();
    }
  }, [state.mode, setPage, resetToSelection, clearMessage]);

  const handleReset = useCallback(() => {
    console.log(`${DEBUG_PREFIXES.ADD_LICS} Reset button pressed`);
    resetForms();
  }, [resetForms]);

  // ========================
  // ЛОГИКА ВАЛИДАЦИИ
  // ========================

  const canSubmit = useCallback((): boolean => {
    if (state.loading) return false;
    
    switch (state.mode) {
      case AddLicMode.BY_CODE:
        return validateCodeForm();
      case AddLicMode.BY_ADDRESS:
        return validateAddressForm();
      default:
        return false;
    }
  }, [state.mode, state.loading, validateCodeForm, validateAddressForm]);

  // ========================
  // РЕНДЕРИНГ КОНТЕНТА
  // ========================

  const renderContent = (): JSX.Element => {
    switch (state.mode) {
      case AddLicMode.SELECTION:
        return <ModeSelection onModeSelect={handleModeSelect} />;

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
            settlements={state.settlements}
            selectedSettlement={state.selectedSettlement}
            selectedStreet={state.selectedStreet}
            selectedHouse={state.selectedHouse}
            onChange={updateAddressData}
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

// ========================
// ВРЕМЕННЫЕ ЗАГЛУШКИ ДЛЯ ПОДКОМПОНЕНТОВ
// Эти компоненты мы создадим на следующем шаге
// ========================





