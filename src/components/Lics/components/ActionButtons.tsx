// src/components/Lics/components/ActionButtons.tsx

import React from 'react';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { 
  arrowBackOutline, 
  refreshOutline, 
  checkmarkOutline,
  hourglassOutline
} from 'ionicons/icons';
import { ActionButtonsProps, AddLicMode } from './types';

export function ActionButtons({ 
  mode,
  canSubmit,
  loading,
  onSubmit,
  onBack,
  onReset
}: ActionButtonsProps): JSX.Element {

  return (
    <div className="action-buttons">
      
      {/* Кнопки управления */}
      <div className="flex gap-1 ml-1 mr-1 mb-1">
        
        {/* Кнопка "Назад" */}
        <IonButton
          fill="outline"
          color="medium"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          <IonIcon icon={arrowBackOutline} slot="start" />
          Назад
        </IonButton>

        {/* Кнопка "Сбросить" */}
        <IonButton
          fill="clear"
          color="medium"
          onClick={onReset}
          disabled={loading}
          className="flex-shrink-0"
        >
          <IonIcon icon={refreshOutline} slot="icon-only" />
        </IonButton>

        {/* Кнопка "Добавить" */}
        <IonButton
          fill="solid"
          color="primary"
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <IonIcon icon={hourglassOutline} slot="start" />
              Добавление...
            </>
          ) : (
            <>
              <IonIcon icon={checkmarkOutline} slot="start" />
              Добавить
            </>
          )}
        </IonButton>
      </div>

      {/* Статус формы */}
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
          'Улус',
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