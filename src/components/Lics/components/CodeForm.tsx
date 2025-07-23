// src/components/Lics/components/AddLics/CodeForm.tsx

import React, { useState, useCallback } from 'react';
import { IonInput, IonButton, IonText, IonIcon } from '@ionic/react';
import { informationCircleOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { CodeFormProps, AddLicByCodeData } from './types';
import { ADD_LICS_CONSTANTS } from './constants';

export function CodeForm({ data, onChange, onSubmit, loading }: CodeFormProps): JSX.Element {
  const [touched, setTouched] = useState<{ [K in keyof AddLicByCodeData]?: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<{ [K in keyof AddLicByCodeData]?: string }>({});

  // ========================
  // ВАЛИДАЦИЯ
  // ========================

  const validateField = useCallback((field: keyof AddLicByCodeData, value: string): string | null => {
    const { VALIDATION, MESSAGES } = ADD_LICS_CONSTANTS;

    switch (field) {
      case 'lc':
        if (!value || value.trim().length === 0) {
          return MESSAGES.REQUIRED_FIELD;
        }
        if (value.length < VALIDATION.MIN_LC_LENGTH || value.length > VALIDATION.MAX_LC_LENGTH) {
          return `Номер ЛС должен содержать от ${VALIDATION.MIN_LC_LENGTH} до ${VALIDATION.MAX_LC_LENGTH} символов`;
        }
        if (!VALIDATION.LC_PATTERN.test(value)) {
          return MESSAGES.INVALID_LC;
        }
        return null;

      case 'fio':
        if (!value || value.trim().length === 0) {
          return MESSAGES.REQUIRED_FIELD;
        }
        if (value.length < VALIDATION.MIN_FIO_LENGTH || value.length > VALIDATION.MAX_FIO_LENGTH) {
          return `ФИО должно содержать от ${VALIDATION.MIN_FIO_LENGTH} до ${VALIDATION.MAX_FIO_LENGTH} символов`;
        }
        if (!VALIDATION.FIO_PATTERN.test(value)) {
          return MESSAGES.INVALID_FIO;
        }
        return null;

      default:
        return null;
    }
  }, []);

  const validateAllFields = useCallback((): boolean => {
    const errors: { [K in keyof AddLicByCodeData]?: string } = {};
    let isValid = true;

    // Валидация всех полей
    (Object.keys(data) as Array<keyof AddLicByCodeData>).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  }, [data, validateField]);

  // ========================
  // ОБРАБОТЧИКИ СОБЫТИЙ
  // ========================

  const handleInputChange = useCallback((field: keyof AddLicByCodeData, value: string) => {
    // Обновляем данные
    onChange(field, value);

    // Валидируем поле если оно уже было затронуто
    if (touched[field]) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [onChange, touched, validateField]);

  const handleInputBlur = useCallback((field: keyof AddLicByCodeData) => {
    // Отмечаем поле как затронутое
    setTouched(prev => ({ ...prev, [field]: true }));

    // Валидируем поле
    const error = validateField(field, data[field]);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, [data, validateField]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Отмечаем все поля как затронутые
    setTouched({ lc: true, fio: true });

    // Валидируем все поля
    if (validateAllFields()) {
      onSubmit();
    }
  }, [validateAllFields, onSubmit]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  }, [handleSubmit, loading]);

  // ========================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ========================

  const getFieldIcon = (field: keyof AddLicByCodeData) => {
    if (!touched[field]) return informationCircleOutline;
    if (validationErrors[field]) return alertCircleOutline;
    if (data[field] && !validationErrors[field]) return checkmarkCircleOutline;
    return informationCircleOutline;
  };

  const getFieldColor = (field: keyof AddLicByCodeData) => {
    if (!touched[field]) return 'medium';
    if (validationErrors[field]) return 'danger';
    if (data[field] && !validationErrors[field]) return 'success';
    return 'medium';
  };

  const isFormValid = () => {
    return data.lc && data.fio && 
           Object.keys(validationErrors).length === 0 &&
           Object.values(validationErrors).every(error => !error);
  };

  // ========================
  // РЕНДЕРИНГ
  // ========================

  return (
    <form onSubmit={handleSubmit} className="ml-1 mr-1">
      {/* Описание формы */}
      <div className="mb-1">
        <p className="fs-08 color-medium text-center">
          Введите номер лицевого счета и ФИО владельца
        </p>
      </div>

      {/* Поле номера лицевого счета */}
      <div className="mb-1">
        <div className="flex items-center t-underline s-input">
          <div className="flex-1">
            <IonInput
              className="s-input-1 ml-1"
              placeholder="Номер лицевого счета"
              value={data.lc}
              maxlength={ADD_LICS_CONSTANTS.VALIDATION.MAX_LC_LENGTH}
              inputMode="numeric"
              onIonInput={(e) => handleInputChange('lc', e.detail.value!)}
              onIonBlur={() => handleInputBlur('lc')}
              onKeyPress={handleKeyPress}
              disabled={loading}
              style={{
                '--border-color': validationErrors.lc ? 'var(--ion-color-danger)' : 
                                  (touched.lc && data.lc && !validationErrors.lc) ? 'var(--ion-color-success)' : 
                                  'var(--ion-color-medium)'
              }}
            />
          </div>
          <div className="flex-shrink-0 mr-1">
            <IonIcon 
              icon={getFieldIcon('lc')} 
              color={getFieldColor('lc')}
              className="w-12 h-12"
            />
          </div>
        </div>
        
        {touched.lc && validationErrors.lc && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.lc}</small>
            </IonText>
          </div>
        )}
        
        {touched.lc && !validationErrors.lc && data.lc && (
          <div className="ml-1 mt-05">
            <IonText color="success">
              <small>✓ Номер лицевого счета корректен</small>
            </IonText>
          </div>
        )}
      </div>

      {/* Поле ФИО */}
      <div className="mb-1">
        <div className="flex items-center t-underline s-input">
          <div className="flex-1">
            <IonInput
              className="s-input-1 ml-1"
              placeholder="ФИО владельца"
              value={data.fio}
              maxlength={ADD_LICS_CONSTANTS.VALIDATION.MAX_FIO_LENGTH}
              onIonInput={(e) => handleInputChange('fio', e.detail.value!)}
              onIonBlur={() => handleInputBlur('fio')}
              onKeyPress={handleKeyPress}
              disabled={loading}
              style={{
                '--border-color': validationErrors.fio ? 'var(--ion-color-danger)' : 
                                  (touched.fio && data.fio && !validationErrors.fio) ? 'var(--ion-color-success)' : 
                                  'var(--ion-color-medium)'
              }}
            />
          </div>
          <div className="flex-shrink-0 mr-1">
            <IonIcon 
              icon={getFieldIcon('fio')} 
              color={getFieldColor('fio')}
              className="w-12 h-12"
            />
          </div>
        </div>
        
        {touched.fio && validationErrors.fio && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.fio}</small>
            </IonText>
          </div>
        )}
        
        {touched.fio && !validationErrors.fio && data.fio && (
          <div className="ml-1 mt-05">
            <IonText color="success">
              <small>✓ ФИО корректно</small>
            </IonText>
          </div>
        )}
      </div>

      {/* Подсказки */}
      <div className="mb-1">
        <div className="bg-light p-1 rounded">
          <p className="fs-07 color-medium mb-05">
            <b>Подсказки:</b>
          </p>
          <ul className="fs-07 color-medium ml-1">
            <li>Номер ЛС содержит только цифры (8-20 символов)</li>
            <li>ФИО указывается полностью русскими буквами</li>
            <li>Нажмите Enter для быстрой отправки</li>
          </ul>
        </div>
      </div>

      {/* Кнопка отправки (скрытая, так как используется ActionButtons) */}
      <button type="submit" style={{ display: 'none' }} disabled={!isFormValid() || loading}>
        Добавить
      </button>
    </form>
  );
}