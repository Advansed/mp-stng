// src/components/Lics/components/CodeForm.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { IonInput, IonText, IonIcon } from '@ionic/react';
import { 
  informationCircleOutline, 
  checkmarkCircleOutline, 
  alertCircleOutline,
  cardOutline,
  personOutline
} from 'ionicons/icons';
import { CodeFormProps, AddLicByCodeData } from './types';
import { ADD_LICS_CONSTANTS } from './constants';

export function CodeForm({ 
  data, 
  onChange, 
  onSubmit, 
  loading 
}: CodeFormProps): JSX.Element {
  
  const [touched, setTouched] = useState<{ [K in keyof AddLicByCodeData]?: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<{ [K in keyof AddLicByCodeData]?: string | null }>({});

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
          return `Длина от ${VALIDATION.MIN_LC_LENGTH} до ${VALIDATION.MAX_LC_LENGTH} символов`;
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
          return `Длина от ${VALIDATION.MIN_FIO_LENGTH} до ${VALIDATION.MAX_FIO_LENGTH} символов`;
        }
        if (!VALIDATION.FIO_PATTERN.test(value)) {
          return MESSAGES.INVALID_FIO;
        }
        return null;
      
      default:
        return null;
    }
  }, []);

  // Обработчик изменения полей
  const handleFieldChange = useCallback((field: keyof AddLicByCodeData, value: string) => {
    onChange(field, value);
    
    // Валидируем поле при изменении
    if (touched[field]) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [onChange, touched, validateField]);

  // Обработчик потери фокуса
  const handleInputBlur = useCallback((field: keyof AddLicByCodeData) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    const value = data[field] || '';
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, [data, validateField]);

  // Обработчик нажатия Enter
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      onSubmit();
    }
  }, [onSubmit, loading]);

  // Эффект для валидации всех полей при загрузке
  useEffect(() => {
    const errors: { [K in keyof AddLicByCodeData]?: string | null } = {};
    Object.keys(data).forEach(key => {
      const field = key as keyof AddLicByCodeData;
      const value = data[field] || '';
      errors[field] = validateField(field, value);
    });
    setValidationErrors(errors);
  }, [data, validateField]);

  // ========================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ========================

  const getFieldIcon = (field: keyof AddLicByCodeData) => {
    if (!touched[field]) return informationCircleOutline;
    if (validationErrors[field]) return alertCircleOutline;
    
    const value = data[field];
    if (value && !validationErrors[field]) return checkmarkCircleOutline;
    return informationCircleOutline;
  };

  const getFieldColor = (field: keyof AddLicByCodeData) => {
    if (!touched[field]) return 'medium';
    if (validationErrors[field]) return 'danger';
    
    const value = data[field];
    if (value && !validationErrors[field]) return 'success';
    return 'medium';
  };

  // ========================
  // РЕНДЕР КОМПОНЕНТА
  // ========================

  return (
    <div className="code-form">
      
      {/* Описание */}
      <div className="mb-1 text-center">
        <IonText color="medium">
          <p>Введите номер лицевого счета и ФИО для быстрого добавления:</p>
        </IonText>
      </div>

      {/* Номер лицевого счета */}
      <div className="mb-1">
        <div className="flex items-center">
          <div className="flex-grow">
            <IonText color="dark">
              <p className="mb-05"><strong>Номер лицевого счета:</strong></p>
            </IonText>
            <IonInput
              value={data.lc}
              placeholder="Введите номер ЛС (только цифры)"
              onIonInput={(e) => handleFieldChange('lc', e.detail.value!)}
              onIonBlur={() => handleInputBlur('lc')}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="s-input"
              type="text"
              inputmode="numeric"
            />
          </div>
          <div className="flex-shrink-0 mr-1">
            <IonIcon 
              icon={cardOutline} 
              color={getFieldColor('lc')}
              className="w-12 h-12"
            />
          </div>
        </div>
        
        {validationErrors.lc && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.lc}</small>
            </IonText>
          </div>
        )}
      </div>

      {/* ФИО */}
      <div className="mb-1">
        <div className="flex items-center">
          <div className="flex-grow">
            <IonText color="dark">
              <p className="mb-05"><strong>ФИО:</strong></p>
            </IonText>
            <IonInput
              value={data.fio}
              placeholder="Введите ФИО (полностью)"
              onIonInput={(e) => handleFieldChange('fio', e.detail.value!)}
              onIonBlur={() => handleInputBlur('fio')}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="s-input"
              type="text"
            />
          </div>
          <div className="flex-shrink-0 mr-1">
            <IonIcon 
              icon={personOutline} 
              color={getFieldColor('fio')}
              className="w-12 h-12"
            />
          </div>
        </div>
        
        {validationErrors.fio && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.fio}</small>
            </IonText>
          </div>
        )}
      </div>

      {/* Подсказки */}
      <div className="mb-1">
        <div className="bg-light p-1 rounded">
          <p className="fs-07 color-medium mb-05">
            <b>Требования к заполнению:</b>
          </p>
          <ul className="fs-06 color-medium ml-1">
            <li className="mb-025">
              <strong>Номер ЛС:</strong> только цифры, 8-20 символов
            </li>
            <li className="mb-025">
              <strong>ФИО:</strong> полное имя на русском языке
            </li>
          </ul>
        </div>
      </div>

      {/* Примеры */}
      <div className="mb-1">
        <div className="bg-success-light p-1 rounded">
          <p className="fs-07 color-dark mb-05">
            <b>Примеры правильного заполнения:</b>
          </p>
          <div className="fs-06 color-dark">
            <p className="mb-025">
              <strong>Номер ЛС:</strong> 12345678, 1234567890
            </p>
            <p className="mb-025">
              <strong>ФИО:</strong> Иванов Иван Иванович
            </p>
          </div>
        </div>
      </div>

      {/* Статус валидации */}
      {(touched.lc || touched.fio) && (
        <div className="mt-1 text-center">
          {validationErrors.lc || validationErrors.fio ? (
            <IonText color="danger">
              <p className="fs-07">
                ⚠️ Проверьте правильность заполнения полей
              </p>
            </IonText>
          ) : data.lc && data.fio ? (
            <IonText color="success">
              <p className="fs-07">
                ✅ Форма готова к отправке
              </p>
            </IonText>
          ) : null}
        </div>
      )}
    </div>
  );
}