// src/components/Lics/components/FindLic.tsx

import React from 'react';
import {
  IonCard,
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonLoading,
  IonText,
  IonItem,
  IonLabel,
  IonIcon,
  IonContent
} from '@ionic/react';
import {
  locationOutline,
  businessOutline,
  homeOutline,
  personOutline,
  cardOutline,
  checkmarkCircleOutline,
  arrowBackOutline,
  searchOutline,
  alertCircleOutline,
  refreshOutline
} from 'ionicons/icons';
import { useFindLics } from './useFindLics';
import { FindLicProps, Settlement, Street, House } from './types';
import { FIND_LIC_CONSTANTS } from './constants';
import './FindLic.css';

export function FindLic({ setPage }: FindLicProps): JSX.Element {
  const {
    state,
    selectSettlement,
    selectStreet,
    selectHouse,
    updateFormData,
    submitForm,
    resetForm,
    canSubmit
  } = useFindLics();

  // ========================
  // ВНУТРЕННИЕ КОМПОНЕНТЫ
  // ========================

  // Индикатор прогресса
  const ProgressBar = (): JSX.Element => {
    const steps = [
      { step: 1, label: 'Населенный пункт', completed: !!state.selectedSettlement },
      { step: 2, label: 'Улица', completed: !!state.selectedStreet },
      { step: 3, label: 'Дом', completed: !!state.selectedHouse },
      { step: 4, label: 'Данные', completed: canSubmit }
    ];

    return (
      <div className="find-lic-progress">
        <div className="find-lic-steps">
          {steps.map((stepInfo, index) => (
            <div 
              key={stepInfo.step} 
              className={`find-lic-step ${stepInfo.completed ? 'completed' : ''} ${
                state.currentStep === stepInfo.step ? 'active' : ''
              }`}
            >
              <div className="find-lic-step-circle">
                {stepInfo.completed ? (
                  <IonIcon icon={checkmarkCircleOutline} />
                ) : (
                  stepInfo.step
                )}
              </div>
              <div className="find-lic-step-label">{stepInfo.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Сообщение о состоянии
  const StatusMessage = (): JSX.Element | null => {
    if (!state.message) return null;

    const getMessageType = () => {
      if (state.message.includes('успешно') || state.message.includes('найден')) return 'success';
      if (state.message.includes('ошибка') || state.message.includes('не удалось')) return 'error';
      if (state.message.includes('загрузка') || state.loading) return 'warning';
      return 'warning';
    };

    const getMessageIcon = () => {
      const type = getMessageType();
      switch (type) {
        case 'success': return checkmarkCircleOutline;
        case 'error': return alertCircleOutline;
        default: return alertCircleOutline;
      }
    };

    return (
      <div className={`find-lic-message ${getMessageType()}`}>
        <IonIcon icon={getMessageIcon()} className="find-lic-message-icon" />
        {state.message}
      </div>
    );
  };

  // Форма выбора населенного пункта
  const SettlementForm = (): JSX.Element => (
    <div className="find-lic-form-section find-lic-slide-up">
      <div className="find-lic-section-title">
        <IonIcon icon={locationOutline} className="find-lic-section-icon" />
        Выбор населенного пункта
      </div>
      
      <div className="find-lic-form-group">
        <label className="find-lic-label">Населенный пункт</label>
        <select 
          className="find-lic-select"
          value={state.selectedSettlement?.s_id || ''}
          onChange={(e) => {
            const settlement = state.settlements.find(s => s.s_id === e.target.value);
            if (settlement) selectSettlement(settlement);
          }}
          disabled={state.loading || state.settlements.length === 0}
        >
          <option value="">
            {state.settlements.length === 0 ? 'Загрузка...' : 'Выберите населенный пункт'}
          </option>
          {state.settlements.map((settlement) => (
            <option key={settlement.s_id} value={settlement.s_id}>
              {settlement.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // Форма выбора улицы
  const StreetForm = (): JSX.Element => (
    <div className="find-lic-form-section find-lic-slide-up">
      <div className="find-lic-section-title">
        <IonIcon icon={businessOutline} className="find-lic-section-icon" />
        Выбор улицы
      </div>
      
      <div className="find-lic-form-group">
        <label className="find-lic-label">Улица</label>
        <select 
          className="find-lic-select"
          value={state.selectedStreet?.ids || ''}
          onChange={(e) => {
            const street = state.selectedSettlement?.streets?.find(s => s.ids === e.target.value);
            if (street) selectStreet(street);
          }}
          disabled={state.loading || !state.selectedSettlement}
        >
          <option value="">
            {!state.selectedSettlement ? 'Сначала выберите населенный пункт' : 'Выберите улицу'}
          </option>
          {state.selectedSettlement?.streets?.map((street) => (
            <option key={street.ids} value={street.ids}>
              {street.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // Форма выбора дома
  const HouseForm = (): JSX.Element => (
    <div className="find-lic-form-section find-lic-slide-up">
      <div className="find-lic-section-title">
        <IonIcon icon={homeOutline} className="find-lic-section-icon" />
        Выбор дома
      </div>
      
      <div className="find-lic-form-group">
        <label className="find-lic-label">Дом</label>
        <select 
          className="find-lic-select"
          value={state.selectedHouse?.id || ''}
          onChange={(e) => {
            const house = state.selectedStreet?.houses?.find(h => h.id === e.target.value);
            if (house) selectHouse(house);
          }}
          disabled={state.loading || !state.selectedStreet}
        >
          <option value="">
            {!state.selectedStreet ? 'Сначала выберите улицу' : 'Выберите дом'}
          </option>
          {state.selectedStreet?.houses?.map((house) => (
            <option key={house.id} value={house.id}>
              {house.number}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // Форма данных
  const DataForm = (): JSX.Element => (
    <div className="find-lic-form-section">
      <div className="find-lic-section-title">
        <IonIcon icon={personOutline} className="find-lic-section-icon" />
        Данные владельца
      </div>
      
      <div className="find-lic-form-group">
        <label className="find-lic-label">Номер квартиры (опционально)</label>
        <input 
          type="text" 
          className="find-lic-input"
          placeholder="Введите номер квартиры"
          value={state.formData.apartment || ''}
          onChange={(e) => updateFormData('apartment', e.target.value)}
          disabled={state.loading}
        />
      </div>
      
      <div className="find-lic-form-group">
        <label className="find-lic-label">Номер лицевого счета</label>
        <input 
          type="text" 
          className="find-lic-input"
          placeholder="Введите номер лицевого счета"
          value={state.formData.licenseNumber}
          onChange={(e) => updateFormData('licenseNumber', e.target.value)}
          disabled={state.loading}
          required
        />
      </div>
      
      <div className="find-lic-form-group">
        <label className="find-lic-label">ФИО владельца</label>
        <input 
          type="text" 
          className="find-lic-input"
          placeholder="Введите ФИО владельца"
          value={state.formData.fio}
          onChange={(e) => updateFormData('fio', e.target.value)}
          disabled={state.loading}
          required
        />
      </div>
    </div>
  );

  // ========================
  // ОБРАБОТЧИКИ СОБЫТИЙ
  // ========================

  const handleBack = () => {
    setPage(0); // Вернуться на главную страницу
  };

  const handleReset = () => {
    resetForm();
  };

  const handleSubmit = async () => {
    const success = await submitForm();
    if (success) {
      // После успешного поиска можно перейти на другую страницу
      // setPage(NEXT_PAGE);
    }
  };

  // ========================
  // ОСНОВНОЙ РЕНДЕР
  // ========================

  return (
    <IonContent className="find-lic-container">
      {/* Заголовок */}
      <div className="find-lic-header">
        <h1 className="find-lic-title">Поиск лицевого счета</h1>
        <p className="find-lic-subtitle">Найдите свой счет по адресу</p>
      </div>

      {/* Основная карточка */}
      <div className="find-lic-card find-lic-fade-in">
        {/* Индикатор прогресса */}
        <ProgressBar />

        {/* Сообщения о состоянии */}
        <StatusMessage />

        {/* Формы на основе текущего шага */}
        {state.currentStep >= FIND_LIC_CONSTANTS.STEPS.SETTLEMENT && <SettlementForm />}
        {state.currentStep >= FIND_LIC_CONSTANTS.STEPS.STREET && state.selectedSettlement && <StreetForm />}
        {state.currentStep >= FIND_LIC_CONSTANTS.STEPS.HOUSE && state.selectedStreet && <HouseForm />}
        {state.currentStep >= FIND_LIC_CONSTANTS.STEPS.FORM && state.selectedHouse && <DataForm />}

        {/* Кнопки действий */}
        <div className="find-lic-button-section">
          <button 
            className="find-lic-button find-lic-button-secondary"
            onClick={handleBack}
            disabled={state.loading}
          >
            <IonIcon icon={arrowBackOutline} className="find-lic-button-icon" />
            Назад
          </button>

          {/* Кнопка сброса (показывается только если есть данные для сброса) */}
          {(state.selectedSettlement || state.formData.licenseNumber || state.formData.fio) && (
            <button 
              className="find-lic-button find-lic-button-secondary"
              onClick={handleReset}
              disabled={state.loading}
            >
              <IonIcon icon={refreshOutline} className="find-lic-button-icon" />
              Сбросить
            </button>
          )}

          {/* Кнопка поиска */}
          <button 
            className="find-lic-button find-lic-button-primary"
            onClick={handleSubmit}
            disabled={!canSubmit || state.loading}
          >
            <IonIcon icon={searchOutline} className="find-lic-button-icon" />
            {state.loading ? 'Поиск...' : 'Найти счет'}
          </button>
        </div>
      </div>

      {/* Индикатор загрузки */}
      <IonLoading
        isOpen={state.loading}
        message={state.loadingStep || 'Загрузка...'}
        duration={0}
      />
    </IonContent>
  );
}