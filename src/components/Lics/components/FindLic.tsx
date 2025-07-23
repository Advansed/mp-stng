// src/components/Lics/components/FindLic.tsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  IonCard,
  IonButton,
  IonInput,
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
  refreshOutline,
  chevronDownOutline,
  closeOutline
} from 'ionicons/icons';
import { useFindLics } from './useFindLics';
import { FindLicProps, Settlement, Street, House, UlusWithSettlements } from './types';
import { FIND_LIC_CONSTANTS, FIND_LIC_LABELS, FIND_LIC_PLACEHOLDERS } from './constants';
import './FindLic.css';

export function FindLic({ setPage }: FindLicProps): JSX.Element {
  const {
    state,
    selectUlus,
    selectSettlement,
    selectStreet,
    selectHouse,
    updateFormData,
    submitForm,
    resetForm,
    canSubmit
  } = useFindLics();

  // Состояния для автофильтрации
  const [searchTexts, setSearchTexts] = useState({
    ulus: '',
    settlement: '',
    street: '',
    house: ''
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    ulus: false,
    settlement: false,
    street: false,
    house: false
  });

  // Ref для контейнера dropdown'ов
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Закрытие dropdown'ов при клике вне их
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      let shouldClose = false;
      
      Object.keys(dropdownOpen).forEach(key => {
        if (dropdownOpen[key as keyof typeof dropdownOpen] && dropdownRefs.current[key]) {
          if (!dropdownRefs.current[key]?.contains(event.target as Node)) {
            shouldClose = true;
          }
        }
      });

      if (shouldClose) {
        setDropdownOpen({
          ulus: false,
          settlement: false,
          street: false,
          house: false
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Функция для обновления текста поиска
  const updateSearchText = (field: keyof typeof searchTexts, value: string) => {
    setSearchTexts(prev => ({ ...prev, [field]: value || '' }));
    // Автоматически открываем dropdown при вводе текста
    setDropdownOpen(prev => ({ ...prev, [field]: true }));
  };

  // Функция для переключения dropdown
  const toggleDropdown = (field: keyof typeof dropdownOpen) => {
    setDropdownOpen(prev => ({ 
      ...prev, 
      [field]: !prev[field],
      // Закрываем остальные
      ulus: field === 'ulus' ? !prev[field] : false,
      settlement: field === 'settlement' ? !prev[field] : false,
      street: field === 'street' ? !prev[field] : false,
      house: field === 'house' ? !prev[field] : false
    }));
  };

  // Фильтрованные данные
  const filteredData = useMemo(() => {
    // Безопасная фильтрация улусов
    const ulusFiltered = (state.ulusesData || []).filter(ulus => {
      if (!ulus || !ulus.ulus || !searchTexts.ulus) return true;
      return ulus.ulus.toLowerCase().includes(searchTexts.ulus.toLowerCase());
    });

    // Безопасная фильтрация населенных пунктов
    const settlementsFiltered = (state.settlements || []).filter(settlement => {
      if (!settlement || !settlement.name || !searchTexts.settlement) return true;
      return settlement.name.toLowerCase().includes(searchTexts.settlement.toLowerCase());
    });

    // Безопасная фильтрация улиц
    const streetsFiltered = (state.selectedSettlement?.streets || []).filter(street => {
      if (!street || !street.name || !searchTexts.street) return true;
      return street.name.toLowerCase().includes(searchTexts.street.toLowerCase());
    });

    // Безопасная фильтрация домов
    const housesFiltered = (state.selectedStreet?.houses || []).filter(house => {
      if (!house || !house.number || !searchTexts.house) return true;
      return house.number.toLowerCase().includes(searchTexts.house.toLowerCase());
    });

    return {
      uluses: ulusFiltered,
      settlements: settlementsFiltered,
      streets: streetsFiltered,
      houses: housesFiltered
    };
  }, [state.ulusesData, state.settlements, state.selectedSettlement, state.selectedStreet, searchTexts]);

  // ========================
  // ВНУТРЕННИЕ КОМПОНЕНТЫ
  // ========================

  // Универсальный компонент выпадающего списка с поиском
  const SearchableDropdown = ({
    field,
    label,
    icon,
    items,
    selectedItem,
    onSelect,
    placeholder,
    getDisplayText,
    getKey,
    isDisabled = false,
    additionalInfo
  }: {
    field: keyof typeof searchTexts;
    label: string;
    icon: string;
    items: any[];
    selectedItem: any;
    onSelect: (item: any) => void;
    placeholder: string;
    getDisplayText: (item: any) => string;
    getKey: (item: any) => string;
    isDisabled?: boolean;
    additionalInfo?: string;
  }) => {
    const handleSelect = (item: any) => {
      if (!item) return;
      
      try {
        onSelect(item);
        const displayText = getDisplayText(item);
        setSearchTexts(prev => ({ ...prev, [field]: displayText || '' }));
        setDropdownOpen(prev => ({ ...prev, [field]: false }));
      } catch (error) {
        console.error('Error selecting item:', error);
      }
    };

    const clearSelection = () => {
      setSearchTexts(prev => ({ ...prev, [field]: '' }));
      setDropdownOpen(prev => ({ ...prev, [field]: false }));
    };

    const currentSearchText = searchTexts[field] || '';
    const safeItems = items || [];

    return (
      <div className="find-lic-form-section">
        <div className="find-lic-form-group">
          <label className="find-lic-label">
            <IonIcon icon={icon} className="find-lic-label-icon" />
            {label}
            {additionalInfo && (
              <small className="find-lic-label-info">{additionalInfo}</small>
            )}
          </label>
          
          <div 
            className={`find-lic-dropdown ${dropdownOpen[field] ? 'open' : ''}`}
            ref={(el) => { dropdownRefs.current[field] = el; }}
          >
            {/* Поле ввода с кнопкой */}
            <div className="find-lic-dropdown-input-container">
              <input
                type="text"
                className="find-lic-dropdown-input"
                placeholder={selectedItem ? getDisplayText(selectedItem) : placeholder}
                value={currentSearchText}
                onChange={(e) => updateSearchText(field, e.target.value)}
                onFocus={() => setDropdownOpen(prev => ({ ...prev, [field]: true }))}
                disabled={isDisabled}
              />
              
              <div className="find-lic-dropdown-buttons">
                {currentSearchText && (
                  <button
                    type="button"
                    className="find-lic-dropdown-clear"
                    onClick={clearSelection}
                  >
                    <IonIcon icon={closeOutline} />
                  </button>
                )}
                <button
                  type="button"
                  className="find-lic-dropdown-toggle"
                  onClick={() => toggleDropdown(field)}
                >
                  <IonIcon icon={chevronDownOutline} />
                </button>
              </div>
            </div>

            {/* Выпадающий список */}
            {dropdownOpen[field] && (
              <div className="find-lic-dropdown-list">
                {safeItems.length === 0 ? (
                  <div className="find-lic-dropdown-no-results">
                    <IonIcon icon={alertCircleOutline} />
                    Ничего не найдено
                  </div>
                ) : (
                  safeItems.map((item) => {
                    try {
                      const key = getKey(item);
                      const displayText = getDisplayText(item);
                      const isSelected = selectedItem && getKey(selectedItem) === key;
                      
                      return (
                        <div
                          key={key}
                          className={`find-lic-dropdown-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelect(item)}
                        >
                          <span className="find-lic-dropdown-item-text">
                            {displayText}
                          </span>
                          {isSelected && (
                            <IonIcon icon={checkmarkCircleOutline} className="find-lic-dropdown-item-icon" />
                          )}
                        </div>
                      );
                    } catch (error) {
                      console.error('Error rendering item:', error, item);
                      return null;
                    }
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Индикатор прогресса
  const ProgressBar = (): JSX.Element => {
    const steps = [
      { step: 1, label: 'Улус', completed: !!state.selectedUlus },
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

  // Компонент сообщений
  const MessageSection = (): JSX.Element => {
    if (!state.message) return <></>;
    
    return (
      <div className={`find-lic-message ${state.message.includes('Ошибка') ? 'error' : 'info'}`}>
        <IonIcon 
          icon={state.message.includes('Ошибка') ? alertCircleOutline : checkmarkCircleOutline} 
          className="find-lic-message-icon" 
        />
        {state.message}
      </div>
    );
  };

  // Компонент выбора улуса
  const UlusSelection = (): JSX.Element => {
    if (state.loading && state.loadingStep === FIND_LIC_CONSTANTS.MESSAGES.LOADING_SETTLEMENTS) {
      return (
        <div className="find-lic-loading">
          <div className="find-lic-loading-spinner"></div>
          <span>Загрузка данных...</span>
        </div>
      );
    }

    return (
      <SearchableDropdown
        field="ulus"
        label={FIND_LIC_LABELS.ULUS}
        icon={locationOutline}
        items={filteredData.uluses}
        selectedItem={state.selectedUlus}
        onSelect={selectUlus}
        placeholder="Начните вводить название улуса..."
        getDisplayText={(ulus) => {
          if (!ulus || !ulus.ulus) return '';
          const count = ulus.settlements?.length || 0;
          return count >= 3 ? `${ulus.ulus} (${count} нас. пунктов)` : ulus.ulus;
        }}
        getKey={(ulus) => ulus?.ulus || ''}
      />
    );
  };

  // Компонент выбора населенного пункта
  const SettlementSelection = (): JSX.Element => {
    return (
      <SearchableDropdown
        field="settlement"
        label={FIND_LIC_LABELS.SETTLEMENT}
        icon={homeOutline}
        items={filteredData.settlements}
        selectedItem={state.selectedSettlement}
        onSelect={selectSettlement}
        placeholder="Начните вводить название населенного пункта..."
        getDisplayText={(settlement) => settlement?.name || ''}
        getKey={(settlement) => settlement?.s_id || ''}
        additionalInfo={state.selectedUlus ? `в улусе ${state.selectedUlus.ulus}` : ''}
      />
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

    return (
      <SearchableDropdown
        field="street"
        label={FIND_LIC_LABELS.STREET}
        icon={businessOutline}
        items={filteredData.streets}
        selectedItem={state.selectedStreet}
        onSelect={selectStreet}
        placeholder="Начните вводить название улицы..."
        getDisplayText={(street) => street?.name || ''}
        getKey={(street) => street?.ids || ''}
        additionalInfo={state.selectedSettlement ? `в ${state.selectedSettlement.name}` : ''}
      />
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

    return (
      <SearchableDropdown
        field="house"
        label={FIND_LIC_LABELS.HOUSE}
        icon={homeOutline}
        items={filteredData.houses}
        selectedItem={state.selectedHouse}
        onSelect={selectHouse}
        placeholder="Начните вводить номер дома..."
        getDisplayText={(house) => house?.number || ''}
        getKey={(house) => house?.id || ''}
        additionalInfo={state.selectedStreet ? `на ${state.selectedStreet.name}` : ''}
      />
    );
  };

  // Форма с данными пользователя
  const FormSection = (): JSX.Element => {
    return (
      <div className="find-lic-form-section">
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
      </div>
    );
  };

  // Кнопки действий
  const ActionButtons = (): JSX.Element => {
    return (
      <div className="find-lic-button-section">
        <button
          className="find-lic-button find-lic-button-secondary"
          onClick={() => setPage(0)}
        >
          <IonIcon icon={arrowBackOutline} className="find-lic-button-icon" />
          Назад
        </button>

        <button
          className="find-lic-button find-lic-button-secondary"
          onClick={resetForm}
        >
          <IonIcon icon={refreshOutline} className="find-lic-button-icon" />
          Сброс
        </button>

        <button
          className="find-lic-button find-lic-button-primary"
          onClick={submitForm}
          disabled={!canSubmit || state.loading}
        >
          <IonIcon icon={searchOutline} className="find-lic-button-icon" />
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

        {/* Выбор улуса */}
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