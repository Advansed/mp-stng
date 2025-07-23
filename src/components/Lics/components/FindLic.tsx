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
import { FindLicProps, Settlement, Street, House, UlusWithSettlements } from './types';
import { FIND_LIC_CONSTANTS, FIND_LIC_LABELS, FIND_LIC_PLACEHOLDERS } from './constants';
import './FindLic.css';

export function FindLic({ setPage }: FindLicProps): JSX.Element {
  const {
    state,
    selectUlus,        // 🆕
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

  // 🔄 Обновленный индикатор прогресса с 5 шагами
  const ProgressBar = (): JSX.Element => {
    const steps = [
      { step: 1, label: 'Улус', completed: !!state.selectedUlus },              // 🆕
      { step: 2, label: 'Населенный пункт', completed: !!state.selectedSettlement },
      { step: 3, label: 'Улица', completed: !!state.selectedStreet },
      { step: 4, label: 'Дом', completed: !!state.selectedHouse },
      { step: 5, label: 'Данные', completed: canSubmit }
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
              {index < steps.length - 1 && <div className="find-lic-step-line"></div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 🆕 Компонент для выбора улуса
  const UlusSelection = (): JSX.Element => {
    if (state.loading && state.loadingStep === FIND_LIC_CONSTANTS.MESSAGES.LOADING_SETTLEMENTS) {
      return (
        <div className="find-lic-loading">
          <div className="find-lic-loading-spinner"></div>
          <span>Загрузка данных...</span>
        </div>
      );
    }

    if (state.ulusesData.length === 0) {
      return (
        <div className="find-lic-message error">
          <IonIcon icon={alertCircleOutline} className="find-lic-message-icon" />
          Данные не найдены
        </div>
      );
    }

    return (
      <div className="find-lic-form-section">
        <div className="find-lic-form-group">
          <label className="find-lic-label">
            <IonIcon icon={locationOutline} className="find-lic-label-icon" />
            {FIND_LIC_LABELS.ULUS}
          </label>
          <div className="find-lic-list">
            {state.ulusesData.map((ulusData, index) => (
              <div
                key={index}
                className={`find-lic-list-item ${state.selectedUlus?.ulus === ulusData.ulus ? 'selected' : ''}`}
                onClick={() => selectUlus(ulusData)}
              >
                <span className="find-lic-list-item-text">
                  {ulusData.ulus}
                  {ulusData.settlements.length >= 3 && (
                    <small className="find-lic-list-item-count">
                      ({ulusData.settlements.length} нас. пунктов)
                    </small>
                  )}
                </span>
                {state.selectedUlus?.ulus === ulusData.ulus && (
                  <IonIcon icon={checkmarkCircleOutline} className="find-lic-list-item-icon" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 🔄 Обновленный компонент выбора поселения
  const SettlementSelection = (): JSX.Element => {
    // Теперь settlements берутся из state.settlements (которые установлены при выборе улуса)
    if (state.settlements.length === 0) {
      return (
        <div className="find-lic-message error">
          <IonIcon icon={alertCircleOutline} className="find-lic-message-icon" />
          Населенные пункты не найдены в выбранном улусе
        </div>
      );
    }

    return (
      <div className="find-lic-form-section">
        <div className="find-lic-form-group">
          <label className="find-lic-label">
            <IonIcon icon={homeOutline} className="find-lic-label-icon" />
            {FIND_LIC_LABELS.SETTLEMENT}
            {state.selectedUlus && (
              <small className="find-lic-label-info">в улусе {state.selectedUlus.ulus}</small>
            )}
          </label>
          <div className="find-lic-list">
            {state.settlements.map((settlement) => (
              <div
                key={settlement.s_id}
                className={`find-lic-list-item ${state.selectedSettlement?.s_id === settlement.s_id ? 'selected' : ''}`}
                onClick={() => selectSettlement(settlement)}
              >
                <span className="find-lic-list-item-text">{settlement.name}</span>
                {state.selectedSettlement?.s_id === settlement.s_id && (
                  <IonIcon icon={checkmarkCircleOutline} className="find-lic-list-item-icon" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Компонент выбора улицы
  const StreetSelection = (): JSX.Element => {
    if (state.loading && state.loadingStep === FIND_LIC_CONSTANTS.MESSAGES.LOADING_STREETS) {
      return (
        <div className="find-lic-loading">
          <div className="find-lic-loading-spinner"></div>
          <span>Загрузка улиц...</span>
        </div>
      );
    }

    const streets = state.selectedSettlement?.streets || [];

    if (streets.length === 0) {
      return (
        <div className="find-lic-message error">
          <IonIcon icon={alertCircleOutline} className="find-lic-message-icon" />
          Улицы не найдены для выбранного населенного пункта
        </div>
      );
    }

    return (
      <div className="find-lic-form-section">
        <div className="find-lic-form-group">
          <label className="find-lic-label">
            <IonIcon icon={businessOutline} className="find-lic-label-icon" />
            {FIND_LIC_LABELS.STREET}
            {state.selectedSettlement && (
              <small className="find-lic-label-info">в {state.selectedSettlement.name}</small>
            )}
          </label>
          <div className="find-lic-list">
            {streets.map((street) => (
              <div
                key={street.ids}
                className={`find-lic-list-item ${state.selectedStreet?.ids === street.ids ? 'selected' : ''}`}
                onClick={() => selectStreet(street)}
              >
                <span className="find-lic-list-item-text">{street.name}</span>
                {state.selectedStreet?.ids === street.ids && (
                  <IonIcon icon={checkmarkCircleOutline} className="find-lic-list-item-icon" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Компонент выбора дома
  const HouseSelection = (): JSX.Element => {
    if (state.loading && state.loadingStep === FIND_LIC_CONSTANTS.MESSAGES.LOADING_HOUSES) {
      return (
        <div className="find-lic-loading">
          <div className="find-lic-loading-spinner"></div>
          <span>Загрузка домов...</span>
        </div>
      );
    }

    const houses = state.selectedStreet?.houses || [];

    if (houses.length === 0) {
      return (
        <div className="find-lic-message error">
          <IonIcon icon={alertCircleOutline} className="find-lic-message-icon" />
          Дома не найдены для выбранной улицы
        </div>
      );
    }

    return (
      <div className="find-lic-form-section">
        <div className="find-lic-form-group">
          <label className="find-lic-label">
            <IonIcon icon={homeOutline} className="find-lic-label-icon" />
            {FIND_LIC_LABELS.HOUSE}
            {state.selectedStreet && (
              <small className="find-lic-label-info">на {state.selectedStreet.name}</small>
            )}
          </label>
          <div className="find-lic-list">
            {houses.map((house) => (
              <div
                key={house.id}
                className={`find-lic-list-item ${state.selectedHouse?.id === house.id ? 'selected' : ''}`}
                onClick={() => selectHouse(house)}
              >
                <span className="find-lic-list-item-text">дом {house.number}</span>
                {state.selectedHouse?.id === house.id && (
                  <IonIcon icon={checkmarkCircleOutline} className="find-lic-list-item-icon" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Компонент формы данных
  const FormSection = (): JSX.Element => {
    return (
      <div className="find-lic-form-section">
        <div className="find-lic-form-group">
          <label className="find-lic-label">
            <IonIcon icon={homeOutline} className="find-lic-label-icon" />
            {FIND_LIC_LABELS.APARTMENT}
          </label>
          <input
            type="text"
            className="find-lic-input"
            placeholder={FIND_LIC_PLACEHOLDERS.APARTMENT}
            value={state.formData.apartment || ''}
            onChange={(e) => updateFormData('apartment', e.target.value)}
          />
        </div>

        <div className="find-lic-form-group">
          <label className="find-lic-label">
            <IonIcon icon={cardOutline} className="find-lic-label-icon" />
            {FIND_LIC_LABELS.LICENSE_NUMBER}
          </label>
          <input
            type="text"
            className="find-lic-input"
            placeholder={FIND_LIC_PLACEHOLDERS.LICENSE_NUMBER}
            value={state.formData.licenseNumber}
            onChange={(e) => updateFormData('licenseNumber', e.target.value)}
          />
        </div>

        <div className="find-lic-form-group">
          <label className="find-lic-label">
            <IonIcon icon={personOutline} className="find-lic-label-icon" />
            {FIND_LIC_LABELS.FIO}
          </label>
          <input
            type="text"
            className="find-lic-input"
            placeholder={FIND_LIC_PLACEHOLDERS.FIO}
            value={state.formData.fio}
            onChange={(e) => updateFormData('fio', e.target.value)}
          />
        </div>
      </div>
    );
  };

  // Компонент сообщений
  const MessageSection = (): JSX.Element | null => {
    if (!state.message) return null;

    const isSuccess = state.message === FIND_LIC_CONSTANTS.MESSAGES.SUCCESS;
    const messageClass = isSuccess ? 'success' : 'error';

    return (
      <div className={`find-lic-message ${messageClass}`}>
        <IonIcon 
          icon={isSuccess ? checkmarkCircleOutline : alertCircleOutline} 
          className="find-lic-message-icon" 
        />
        {state.message}
      </div>
    );
  };

  // Компонент кнопок действий
  const ActionButtons = (): JSX.Element => {
    const handleSubmit = async () => {
      const success = await submitForm();
      if (success) {
        // Переходим на главную страницу после успешного добавления
        setTimeout(() => setPage(0), 2000);
      }
    };

    return (
      <div className="find-lic-button-section">
        <button
          className="find-lic-button find-lic-button-secondary"
          onClick={() => setPage(0)}
          disabled={state.loading}
        >
          <IonIcon icon={arrowBackOutline} className="find-lic-button-icon" />
          Назад
        </button>

        <button
          className="find-lic-button find-lic-button-secondary"
          onClick={resetForm}
          disabled={state.loading}
        >
          <IonIcon icon={refreshOutline} className="find-lic-button-icon" />
          Сбросить
        </button>

        <button
          className="find-lic-button find-lic-button-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          <IonIcon icon={checkmarkCircleOutline} className="find-lic-button-icon" />
          {state.loading ? 'Добавление...' : 'Добавить'}
        </button>
      </div>
    );
  };

  // ========================
  // ОСНОВНОЙ РЕНДЕР
  // ========================

  return (
    <div className="find-lic-container">
      {/* Заголовок */}
      <div className="find-lic-header">
        <h1 className="find-lic-title">Добавление лицевого счета</h1>
        <p className="find-lic-subtitle">Выберите адрес и заполните данные</p>
      </div>

      {/* Карточка формы */}
      <IonCard className="find-lic-card">
        {/* Индикатор прогресса */}
        <ProgressBar />

        {/* Сообщения */}
        <MessageSection />

        {/* 🆕 Выбор улуса */}
        {state.currentStep >= FIND_LIC_CONSTANTS.STEPS.ULUS && <UlusSelection />}

        {/* Выбор населенного пункта */}
        {state.currentStep >= FIND_LIC_CONSTANTS.STEPS.SETTLEMENT && state.selectedUlus && <SettlementSelection />}

        {/* Выбор улицы */}
        {state.currentStep >= FIND_LIC_CONSTANTS.STEPS.STREET && state.selectedSettlement && <StreetSelection />}

        {/* Выбор дома */}
        {state.currentStep >= FIND_LIC_CONSTANTS.STEPS.HOUSE && state.selectedStreet && <HouseSelection />}

        {/* Форма данных */}
        {state.currentStep >= FIND_LIC_CONSTANTS.STEPS.FORM && state.selectedHouse && <FormSection />}

        {/* Кнопки действий */}
        <ActionButtons />
      </IonCard>

      {/* Индикатор загрузки */}
      <IonLoading
        isOpen={state.loading}
        message={state.loadingStep || 'Загрузка...'}
        duration={FIND_LIC_CONSTANTS.TIMEOUTS.LOADING_TIMEOUT}
      />
    </div>
  );
}