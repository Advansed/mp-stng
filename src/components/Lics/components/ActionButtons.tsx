// src/components/Lics/components/AddLics/ActionButtons.tsx

import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { 
  arrowBackOutline, 
  refreshOutline, 
  checkmarkOutline, 
  hourglassOutline 
} from 'ionicons/icons';
import { ActionButtonsProps, AddLicMode } from './types';
import { ADD_LICS_CONSTANTS } from './constants';

export function ActionButtons({ 
  mode, 
  canSubmit, 
  loading, 
  onSubmit, 
  onBack, 
  onReset 
}: ActionButtonsProps): JSX.Element {

  // ========================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ========================

  const getSubmitButtonText = (): string => {
    if (loading) {
      return 'Добавление...';
    }
    
    switch (mode) {
      case AddLicMode.BY_CODE:
        return 'Добавить по номеру';
      case AddLicMode.BY_ADDRESS:
        return 'Добавить по адресу';
      default:
        return 'Добавить';
    }
  };

  const getBackButtonText = (): string => {
    switch (mode) {
      case AddLicMode.BY_CODE:
      case AddLicMode.BY_ADDRESS:
        return 'К выбору способа';
      default:
        return 'Назад';
    }
  };

  const getResetButtonText = (): string => {
    switch (mode) {
      case AddLicMode.BY_CODE:
        return 'Очистить форму';
      case AddLicMode.BY_ADDRESS:
        return 'Сбросить адрес';
      default:
        return 'Сбросить';
    }
  };

  // ========================
  // РЕНДЕРИНГ
  // ========================

  return (
    <div className="action-buttons">
      {/* Основные кнопки */}
      <div className="flex fl-space ml-1 mr-1 mb-1 mt-1">
        {/* Кнопка "Назад" */}
        <IonButton
          fill="outline"
          color="medium"
          size="default"
          disabled={loading}
          onClick={onBack}
          className="flex-shrink-0"
        >
          <IonIcon icon={arrowBackOutline} slot="start" />
          {getBackButtonText()}
        </IonButton>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Кнопка "Добавить" */}
        <IonButton
          fill="solid"
          color="primary"
          size="default"
          disabled={!canSubmit || loading}
          onClick={onSubmit}
          className="flex-shrink-0"
        >
          <IonIcon 
            icon={loading ? hourglassOutline : checkmarkOutline} 
            slot="start" 
          />
          {getSubmitButtonText()}
        </IonButton>
      </div>

      {/* Дополнительные кнопки */}
      <div className="flex justify-center ml-1 mr-1 mb-1">
        {/* Кнопка "Сбросить" */}
        <IonButton
          fill="clear"
          color="medium"
          size="small"
          disabled={loading}
          onClick={onReset}
        >
          <IonIcon icon={refreshOutline} slot="start" />
          {getResetButtonText()}
        </IonButton>
      </div>

      {/* Подсказки для пользователя */}
      <div className="ml-1 mr-1 mb-05">
        {loading ? (
          <p className="text-center fs-07 color-primary">
            ⏳ Пожалуйста, подождите...
          </p>
        ) : !canSubmit ? (
          <p className="text-center fs-07 color-medium">
            💡 Заполните все обязательные поля для продолжения
          </p>
        ) : (
          <p className="text-center fs-07 color-success">
            ✅ Форма готова к отправке
          </p>
        )}
      </div>

      {/* Информация о режиме (для отладки в development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="ml-1 mr-1 mb-05">
          <p className="text-center fs-06 color-light">
            Debug: Mode={mode}, CanSubmit={canSubmit.toString()}, Loading={loading.toString()}
          </p>
        </div>
      )}
    </div>
  );
}

// ========================
// ДОПОЛНИТЕЛЬНЫЕ КОМПОНЕНТЫ
// ========================

// Компонент для отображения прогресса заполнения (опционально)
export function FormProgress({ 
  mode, 
  completedSteps, 
  totalSteps 
}: { 
  mode: AddLicMode; 
  completedSteps: number; 
  totalSteps: number; 
}): JSX.Element {
  const progress = (completedSteps / totalSteps) * 100;
  
  return (
    <div className="form-progress ml-1 mr-1 mb-1">
      <div className="flex justify-between items-center mb-05">
        <span className="fs-07 color-medium">
          Прогресс заполнения
        </span>
        <span className="fs-07 color-medium">
          {completedSteps}/{totalSteps}
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

// Компонент для отображения шагов заполнения
export function FormSteps({ 
  mode, 
  currentStep 
}: { 
  mode: AddLicMode; 
  currentStep: number; 
}): JSX.Element {
  const getSteps = () => {
    switch (mode) {
      case AddLicMode.BY_CODE:
        return [
          'Номер ЛС',
          'ФИО',
          'Готово'
        ];
      case AddLicMode.BY_ADDRESS:
        return [
          'Населенный пункт',
          'Улица',
          'Дом',
          'Номер ЛС и ФИО',
          'Готово'
        ];
      default:
        return [];
    }
  };

  const steps = getSteps();

  return (
    <div className="form-steps ml-1 mr-1 mb-1">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`form-step ${index <= currentStep ? 'completed' : 'pending'}`}
          >
            <div className="form-step-number">
              {index <= currentStep ? (
                <IonIcon icon={checkmarkOutline} />
              ) : (
                index + 1
              )}
            </div>
            <div className="form-step-label fs-07">
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}