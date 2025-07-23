// src/components/Lics/components/AddLics/AddressForm.tsx

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
  businessOutline
} from 'ionicons/icons';
import { AddressFormProps, AddLicByAddressData, Settlement, Street, House } from './types';
import { ADD_LICS_CONSTANTS } from './constants';

export function AddressForm({ 
  data, 
  settlements, 
  selectedSettlement, 
  selectedStreet, 
  selectedHouse,
  onChange, 
  onSettlementChange, 
  onStreetChange, 
  onHouseChange, 
  onSubmit, 
  loading 
}: AddressFormProps): JSX.Element {
  
  const [touched, setTouched] = useState<{ [K in keyof AddLicByAddressData]?: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<{ [K in keyof AddLicByAddressData]?: string | null }>({});

  // ========================
  // ВАЛИДАЦИЯ
  // ========================

  const validateField = useCallback((field: keyof AddLicByAddressData, value: string): string | null => {
    const { VALIDATION, MESSAGES } = ADD_LICS_CONSTANTS;

    switch (field) {
      case 'settlementId':
        return !value ? MESSAGES.SELECT_SETTLEMENT : null;
      
      case 'streetId':
        return !value ? MESSAGES.SELECT_STREET : null;
      
      case 'houseId':
        return !value ? MESSAGES.SELECT_HOUSE : null;
      
      case 'apartment':
        if (value && value.length > 0) {
          if (value.length > VALIDATION.MAX_APARTMENT_LENGTH) {
            return `Номер квартиры не должен превышать ${VALIDATION.MAX_APARTMENT_LENGTH} символов`;
          }
          if (!VALIDATION.APARTMENT_PATTERN.test(value)) {
            return MESSAGES.INVALID_APARTMENT;
          }
        }
        return null;
      
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

  // ========================
  // ОБРАБОТЧИКИ СОБЫТИЙ
  // ========================

  const handleInputChange = useCallback((field: keyof AddLicByAddressData, value: string) => {
    onChange(field, value);

    if (touched[field]) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [onChange, touched, validateField]);

  const handleInputBlur = useCallback((field: keyof AddLicByAddressData) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    const error = validateField(field, data[field] || '');
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, [data, validateField]);

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
  // РЕНДЕРИНГ
  // ========================

  return (
    <div className="ml-1 mr-1">
      {/* Описание формы */}
      <div className="mb-1">
        <p className="fs-08 color-medium text-center">
          Выберите адрес и введите данные лицевого счета
        </p>
      </div>

      {/* Выбор населенного пункта */}
      <div className="mb-1">
        <IonItem className="t-underline">
          <IonIcon icon={locationOutline} slot="start" color="tertiary" />
          <IonLabel position="stacked">Населенный пункт *</IonLabel>
          <IonSelect
            placeholder="Выберите населенный пункт"
            value={data.settlementId}
            onIonChange={(e) => handleSettlementSelect(e.detail.value)}
            disabled={loading || settlements.length === 0}
          >
            {settlements.map(settlement => (
              <IonSelectOption key={settlement.s_id} value={settlement.s_id}>
                {settlement.name}
              </IonSelectOption>
            ))}
          </IonSelect>
          {settlements.length === 0 && (
            <IonSpinner slot="end" name="crescent" />
          )}
        </IonItem>
        
        {validationErrors.settlementId && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.settlementId}</small>
            </IonText>
          </div>
        )}
      </div>

      {/* Выбор улицы */}
      <div className="mb-1">
        <IonItem className="t-underline">
          <IonIcon icon={businessOutline} slot="start" color="tertiary" />
          <IonLabel position="stacked">Улица *</IonLabel>
          <IonSelect
            placeholder="Выберите улицу"
            value={data.streetId}
            onIonChange={(e) => handleStreetSelect(e.detail.value)}
            disabled={loading || !selectedSettlement || !selectedSettlement.streets}
          >
            {selectedSettlement?.streets?.map(street => (
              <IonSelectOption key={street.ids} value={street.ids}>
                {street.name}
              </IonSelectOption>
            ))}
          </IonSelect>
          {loading && selectedSettlement && !selectedSettlement.streets && (
            <IonSpinner slot="end" name="crescent" />
          )}
        </IonItem>
        
        {validationErrors.streetId && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.streetId}</small>
            </IonText>
          </div>
        )}
      </div>

      {/* Выбор дома */}
      <div className="mb-1">
        <IonItem className="t-underline">
          <IonIcon icon={homeOutline} slot="start" color="tertiary" />
          <IonLabel position="stacked">Дом *</IonLabel>
          <IonSelect
            placeholder="Выберите дом"
            value={data.houseId}
            onIonChange={(e) => handleHouseSelect(e.detail.value)}
            disabled={loading || !selectedStreet || !selectedStreet.houses}
          >
            {selectedStreet?.houses?.map(house => (
              <IonSelectOption key={house.id} value={house.id}>
                {house.number}
              </IonSelectOption>
            ))}
          </IonSelect>
          {loading && selectedStreet && !selectedStreet.houses && (
            <IonSpinner slot="end" name="crescent" />
          )}
        </IonItem>
        
        {validationErrors.houseId && (
          <div className="ml-1 mt-05">
            <IonText color="danger">
              <small>{validationErrors.houseId}</small>
            </IonText>
          </div>
        )}
      </div>

      {/* Поле квартиры (опционально) */}
      <div className="mb-1">
        <div className="flex items-center t-underline s-input">
          <div className="flex-1">
            <IonInput
              className="s-input-1 ml-1"
              placeholder="Квартира (необязательно)"
              value={data.apartment || ''}
              maxlength={ADD_LICS_CONSTANTS.VALIDATION.MAX_APARTMENT_LENGTH}
              onIonInput={(e) => handleInputChange('apartment', e.detail.value!)}
              onIonBlur={() => handleInputBlur('apartment')}
              onKeyPress={handleKeyPress}
              disabled={loading}
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

      {/* Поле номера лицевого счета */}
      <div className="mb-1">
        <div className="flex items-center t-underline s-input">
          <div className="flex-1">
            <IonInput
              className="s-input-1 ml-1"
              placeholder="Номер лицевого счета *"
              value={data.lc}
              maxlength={ADD_LICS_CONSTANTS.VALIDATION.MAX_LC_LENGTH}
              inputMode="numeric"
              onIonInput={(e) => handleInputChange('lc', e.detail.value!)}
              onIonBlur={() => handleInputBlur('lc')}
              onKeyPress={handleKeyPress}
              disabled={loading}
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

      {/* Поле ФИО */}
      <div className="mb-1">
        <div className="flex items-center t-underline s-input">
          <div className="flex-1">
            <IonInput
              className="s-input-1 ml-1"
              placeholder="ФИО владельца *"
              value={data.fio}
              maxlength={ADD_LICS_CONSTANTS.VALIDATION.MAX_FIO_LENGTH}
              onIonInput={(e) => handleInputChange('fio', e.detail.value!)}
              onIonBlur={() => handleInputBlur('fio')}
              onKeyPress={handleKeyPress}
              disabled={loading}
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
            <li>Выберите населенный пункт</li>
            <li>Выберите улицу (загрузится автоматически)</li>
            <li>Выберите дом (загрузится автоматически)</li>
            <li>Укажите квартиру (если есть)</li>
            <li>Введите номер ЛС и ФИО</li>
          </ol>
        </div>
      </div>

      {/* Текущий выбранный адрес */}
      {(selectedSettlement || selectedStreet || selectedHouse) && (
        <div className="mb-1">
          <div className="bg-success-light p-1 rounded">
            <p className="fs-08 color-dark mb-05">
              <b>Выбранный адрес:</b>
            </p>
            <p className="fs-07 color-dark">
              {selectedSettlement?.name}
              {selectedStreet && `, ${selectedStreet.name}`}
              {selectedHouse && `, д. ${selectedHouse.number}`}
              {data.apartment && `, кв. ${data.apartment}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}