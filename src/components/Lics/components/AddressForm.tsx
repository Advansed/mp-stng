// src/components/Lics/components/AddressForm.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { 
  IonInput, 
  IonButton, 
  IonText, 
  IonIcon, 
  IonItem, 
  IonLabel, 
  IonSelect, 
  IonSelectOption,
  IonSpinner
} from '@ionic/react';
import { 
  informationCircleOutline, 
  checkmarkCircleOutline, 
  alertCircleOutline,
  locationOutline,
  homeOutline,
  businessOutline,
  mapOutline
} from 'ionicons/icons';
import { AddressFormProps, AddLicByAddressData, Ulus, Settlement, Street, House } from './types';
import { ADD_LICS_CONSTANTS } from './constants';

export function AddressForm({ 
  data, 
  uluses,           // 🆕
  selectedUlus,     // 🆕
  settlements, 
  selectedSettlement, 
  selectedStreet, 
  selectedHouse,
  onChange, 
  onUlusChange,     // 🆕
  onSettlementChange, 
  onStreetChange, 
  onHouseChange, 
  onSubmit, 
  loading 
}: AddressFormProps): JSX.Element {
  
  const [touched, setTouched] = useState<{ [K in keyof AddLicByAddressData]?: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<{ [K in keyof AddLicByAddressData]?: string | null }>({});

  // ========================
  // ВАЛИДАЦИЯ - ОБНОВЛЕННАЯ
  // ========================

  const validateField = useCallback((field: keyof AddLicByAddressData, value: string): string | null => {
    const { VALIDATION, MESSAGES } = ADD_LICS_CONSTANTS;

    switch (field) {
      // 🆕 Валидация улуса
      case 'ulusId':
        return !value ? MESSAGES.SELECT_ULUS : null;
      
      case 'settlementId':
        return !value ? MESSAGES.SELECT_SETTLEMENT : null;
      
      case 'streetId':
        return !value ? MESSAGES.SELECT_STREET : null;
      
      case 'houseId':
        return !value ? MESSAGES.SELECT_HOUSE : null;
      
      case 'apartment':
        if (!value || value.length === 0) return null; // Опционально
        if (value.length > VALIDATION.MAX_APARTMENT_LENGTH) {
          return `Максимум ${VALIDATION.MAX_APARTMENT_LENGTH} символов`;
        }
        if (!VALIDATION.APARTMENT_PATTERN.test(value)) {
          return MESSAGES.INVALID_APARTMENT;
        }
        return null;
      
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
  const handleFieldChange = useCallback((field: keyof AddLicByAddressData, value: string) => {
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
  const handleInputBlur = useCallback((field: keyof AddLicByAddressData) => {
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

  // Эффект для валидации всех полей при загрузке
  useEffect(() => {
    const errors: { [K in keyof AddLicByAddressData]?: string | null } = {};
    Object.keys(data).forEach(key => {
      const field = key as keyof AddLicByAddressData;
      const value = data[field] || '';
      errors[field] = validateField(field, value);
    });
    setValidationErrors(errors);
  }, [data, validateField]);

  // ========================
  // ОБРАБОТЧИКИ ВЫБОРА - ОБНОВЛЕННЫЕ
  // ========================

  // 🆕 Обработчик выбора улуса
  const handleUlusSelect = useCallback((ulusId: string) => {
    const ulus = uluses.find(u => u.ulus_id === ulusId);
    if (ulus) {
      onUlusChange(ulus);
      
      // Сбрасываем последующие выборы
      onChange('settlementId', '');
      onChange('streetId', '');
      onChange('houseId', '');
      setValidationErrors(prev => ({
        ...prev,
        ulusId: undefined,
        settlementId: undefined,
        streetId: undefined,
        houseId: undefined
      }));
    }
  }, [uluses, onUlusChange, onChange]);

  const handleSettlementSelect = useCallback((settlementId: string) => {
    const settlement = settlements.find(s => s.s_id === settlementId);
    if (settlement) {
      onSettlementChange(settlement);
      
      // Сбрасываем последующие выборы
      onChange('streetId', '');
      onChange('houseId', '');
      setValidationErrors(prev => ({
        ...prev,
        settlementId: undefined,
        streetId: undefined,
        houseId: undefined
      }));
    }
  }, [settlements, onSettlementChange, onChange]);

  const handleStreetSelect = useCallback((streetId: string) => {
    const street = selectedSettlement?.streets?.find(s => s.ids === streetId);
    if (street) {
      onStreetChange(street);
      
      // Сбрасываем выбор дома
      onChange('houseId', '');
      setValidationErrors(prev => ({
        ...prev,
        streetId: undefined,
        houseId: undefined
      }));
    }
  }, [selectedSettlement, onStreetChange, onChange]);

  const handleHouseSelect = useCallback((houseId: string) => {
    const house = selectedStreet?.houses?.find(h => h.id === houseId);
    if (house) {
      onHouseChange(house);
      setValidationErrors(prev => ({
        ...prev,
        houseId: undefined
      }));
    }
  }, [selectedStreet, onHouseChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      onSubmit();
    }
  }, [onSubmit, loading]);

  // ========================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ========================

  const getFieldIcon = (field: keyof AddLicByAddressData) => {
    if (!touched[field]) return informationCircleOutline;
    if (validationErrors[field]) return alertCircleOutline;
    
    const value = data[field];
    if (value && !validationErrors[field]) return checkmarkCircleOutline;
    return informationCircleOutline;
  };

  const getFieldColor = (field: keyof AddLicByAddressData) => {
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
    <div className="address-form">
      
      {/* 🆕 1. Выбор улуса (района) */}
      <div className="mb-1">
        <div className="flex items-center">
          <div className="flex-grow">
            <IonText color="dark">
              <p className="mb-05"><strong>Улус (район):</strong></p>
            </IonText>
            
            <IonSelect
              value={data.ulusId}
              placeholder="Выберите улус"
              onIonChange={(e) => handleUlusSelect(e.detail.value)}
              disabled={loading || uluses.length === 0}
              className="w-full"
            >
              {uluses.map((ulus) => (
                <IonSelectOption key={ulus.ulus_id} value={ulus.ulus_id}>
                  {ulus.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>
          <div className="flex-shrink-0 mr-1">
            <IonIcon 
              icon={mapOutline} 
              color={getFieldColor('ulusId')}
              className="w-12 h-12"
            />
          </div>
        </div>
        
        {validationErrors.ulusId && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.ulusId}</small>
            </IonText>
          </div>
        )}
      </div>

      {/* 2. Выбор населенного пункта */}
      <div className="mb-1">
        <div className="flex items-center">
          <div className="flex-grow">
            <IonText color="dark">
              <p className="mb-05"><strong>Населенный пункт:</strong></p>
            </IonText>
            
            <IonSelect
              value={data.settlementId}
              placeholder="Выберите населенный пункт"
              onIonChange={(e) => handleSettlementSelect(e.detail.value)}
              disabled={loading || settlements.length === 0}
              className="w-full"
            >
              {settlements.map((settlement) => (
                <IonSelectOption key={settlement.s_id} value={settlement.s_id}>
                  {settlement.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>
          <div className="flex-shrink-0 mr-1">
            <IonIcon 
              icon={locationOutline} 
              color={getFieldColor('settlementId')}
              className="w-12 h-12"
            />
          </div>
        </div>
        
        {validationErrors.settlementId && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.settlementId}</small>
            </IonText>
          </div>
        )}
      </div>

      {/* 3. Выбор улицы */}
      <div className="mb-1">
        <div className="flex items-center">
          <div className="flex-grow">
            <IonText color="dark">
              <p className="mb-05"><strong>Улица:</strong></p>
            </IonText>
            
            <IonSelect
              value={data.streetId}
              placeholder="Выберите улицу"
              onIonChange={(e) => handleStreetSelect(e.detail.value)}
              disabled={loading || !selectedSettlement || !selectedSettlement.streets || selectedSettlement.streets.length === 0}
              className="w-full"
            >
              {selectedSettlement?.streets?.map((street) => (
                <IonSelectOption key={street.ids} value={street.ids}>
                  {street.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>
          <div className="flex-shrink-0 mr-1">
            <IonIcon 
              icon={businessOutline} 
              color={getFieldColor('streetId')}
              className="w-12 h-12"
            />
          </div>
        </div>
        
        {validationErrors.streetId && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.streetId}</small>
            </IonText>
          </div>
        )}
      </div>

      {/* 4. Выбор дома */}
      <div className="mb-1">
        <div className="flex items-center">
          <div className="flex-grow">
            <IonText color="dark">
              <p className="mb-05"><strong>Дом:</strong></p>
            </IonText>
            
            <IonSelect
              value={data.houseId}
              placeholder="Выберите дом"
              onIonChange={(e) => handleHouseSelect(e.detail.value)}
              disabled={loading || !selectedStreet || !selectedStreet.houses || selectedStreet.houses.length === 0}
              className="w-full"
            >
              {selectedStreet?.houses?.map((house) => (
                <IonSelectOption key={house.id} value={house.id}>
                  {house.number}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>
          <div className="flex-shrink-0 mr-1">
            <IonIcon 
              icon={homeOutline} 
              color={getFieldColor('houseId')}
              className="w-12 h-12"
            />
          </div>
        </div>
        
        {validationErrors.houseId && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.houseId}</small>
            </IonText>
          </div>
        )}
      </div>

      {/* 5. Квартира (опционально) */}
      <div className="mb-1">
        <div className="flex items-center">
          <div className="flex-grow">
            <IonText color="dark">
              <p className="mb-05"><strong>Квартира (необязательно):</strong></p>
            </IonText>
            <IonInput
              value={data.apartment}
              placeholder="Введите номер квартиры"
              onIonInput={(e) => handleFieldChange('apartment', e.detail.value!)}
              onIonBlur={() => handleInputBlur('apartment')}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="s-input"
            />
          </div>
          <div className="flex-shrink-0 mr-1">
            <IonIcon 
              icon={getFieldIcon('apartment')} 
              color={getFieldColor('apartment')}
              className="w-12 h-12"
            />
          </div>
        </div>
        
        {validationErrors.apartment && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.apartment}</small>
            </IonText>
          </div>
        )}
      </div>

      {/* 6. Номер лицевого счета */}
      <div className="mb-1">
        <div className="flex items-center">
          <div className="flex-grow">
            <IonText color="dark">
              <p className="mb-05"><strong>Номер лицевого счета:</strong></p>
            </IonText>
            <IonInput
              value={data.lc}
              placeholder="Введите номер ЛС"
              onIonInput={(e) => handleFieldChange('lc', e.detail.value!)}
              onIonBlur={() => handleInputBlur('lc')}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="s-input"
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
        
        {validationErrors.lc && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.lc}</small>
            </IonText>
          </div>
        )}
      </div>

      {/* 7. ФИО */}
      <div className="mb-1">
        <div className="flex items-center">
          <div className="flex-grow">
            <IonText color="dark">
              <p className="mb-05"><strong>ФИО:</strong></p>
            </IonText>
            <IonInput
              value={data.fio}
              placeholder="Введите ФИО"
              onIonInput={(e) => handleFieldChange('fio', e.detail.value!)}
              onIonBlur={() => handleInputBlur('fio')}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="s-input"
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
            <b>Последовательность заполнения:</b>
          </p>
          <ol className="fs-07 color-medium ml-1">
            <li>Выберите улус (район)</li>
            <li>Выберите населенный пункт</li>
            <li>Выберите улицу (загрузится автоматически)</li>
            <li>Выберите дом (загрузится автоматически)</li>
            <li>Укажите квартиру (если есть)</li>
            <li>Введите номер ЛС и ФИО</li>
          </ol>
        </div>
      </div>

      {/* Текущий выбранный адрес */}
      {(selectedUlus || selectedSettlement || selectedStreet || selectedHouse) && (
        <div className="mb-1">
          <div className="bg-success-light p-1 rounded">
            <p className="fs-08 color-dark mb-05">
              <b>Выбранный адрес:</b>
            </p>
            <p className="fs-07 color-dark">
              {selectedUlus?.name && `${selectedUlus.name}, `}
              {selectedSettlement?.name}
              {selectedStreet && `, ${selectedStreet.name}`}
              {selectedHouse && `, д. ${selectedHouse.number}`}
              {data.apartment && `, кв. ${data.apartment}`}
            </p>
          </div>
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading && (
        <div className="flex justify-center mt-1">
          <IonSpinner name="crescent" />
        </div>
      )}
    </div>
  );
}