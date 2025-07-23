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
  IonIcon
} from '@ionic/react';
import {
  locationOutline,
  businessOutline,
  homeOutline,
  personOutline,
  cardOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { useFindLics } from './useFindLics';
import { FindLicProps, Settlement, Street, House } from './types';
import { FIND_LIC_CONSTANTS } from './constants';

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
      <div className="mb-1">
        <div className="flex justify-between items-center mb-05">
          {steps.map((stepInfo, index) => (
            <div key={stepInfo.step} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                  stepInfo.completed 
                    ? 'bg-success' 
                    : state.currentStep >= stepInfo.step 
                      ? 'bg-primary' 
                      : 'bg-medium'
                }`}
              >
                {stepInfo.completed ? (
                  <IonIcon icon={checkmarkCircleOutline} />
                ) : (
                  stepInfo.step
                )}
              </div>
              <span className="text-xs mt-1 text-center max-w-16">
                {stepInfo.label}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-light rounded h-1">
          <div 
            className="bg-primary h-1 rounded transition-all duration-300"
            style={{ width: `${(state.currentStep / 4) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  // Селектор населенного пункта
  const SettlementSelector = (): JSX.Element => {
    if (state.currentStep < FIND_LIC_CONSTANTS.STEPS.SETTLEMENT) {
      return <></>;
    }

    return (
      <div className="mb-1">
        <IonItem>
          <IonIcon icon={locationOutline} slot="start" />
          <IonLabel>Населенный пункт</IonLabel>
          <IonSelect
            value={state.selectedSettlement?.s_id || ''}
            placeholder="Выберите населенный пункт"
            onIonChange={(e) => {
              const settlementId = e.detail.value;
              const settlement = state.settlements.find(s => s.s_id === settlementId);
              if (settlement) {
                selectSettlement(settlement);
              }
            }}
            disabled={state.loading}
          >
            {state.settlements.map((settlement: Settlement) => (
              <IonSelectOption key={settlement.s_id} value={settlement.s_id}>
                {settlement.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        
        {state.settlements.length === 0 && !state.loading && (
          <IonText color="medium">
            <p className="text-center mt-05">Нет доступных населенных пунктов</p>
          </IonText>
        )}
      </div>
    );
  };

  // Селектор улицы
  const StreetSelector = (): JSX.Element => {
    if (state.currentStep < FIND_LIC_CONSTANTS.STEPS.STREET || !state.selectedSettlement) {
      return <></>;
    }

    const streets = state.selectedSettlement.streets || [];

    return (
      <div className="mb-1">
        <IonItem>
          <IonIcon icon={businessOutline} slot="start" />
          <IonLabel>Улица</IonLabel>
          <IonSelect
            value={state.selectedStreet?.ids || ''}
            placeholder="Выберите улицу"
            onIonChange={(e) => {
              const streetId = e.detail.value;
              const street = streets.find(s => s.ids === streetId);
              if (street) {
                selectStreet(street);
              }
            }}
            disabled={state.loading || streets.length === 0}
          >
            {streets.map((street: Street) => (
              <IonSelectOption key={street.ids} value={street.ids}>
                {street.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        
        {streets.length === 0 && !state.loading && state.selectedSettlement && (
          <IonText color="medium">
            <p className="text-center mt-05">Нет доступных улиц для выбранного населенного пункта</p>
          </IonText>
        )}
      </div>
    );
  };

  // Селектор дома
  const HouseSelector = (): JSX.Element => {
    if (state.currentStep < FIND_LIC_CONSTANTS.STEPS.HOUSE || !state.selectedStreet) {
      return <></>;
    }

    const houses = state.selectedStreet.houses || [];

    return (
      <div className="mb-1">
        <IonItem>
          <IonIcon icon={homeOutline} slot="start" />
          <IonLabel>Дом</IonLabel>
          <IonSelect
            value={state.selectedHouse?.id || ''}
            placeholder="Выберите дом"
            onIonChange={(e) => {
              const houseId = e.detail.value;
              const house = houses.find(h => h.id === houseId);
              if (house) {
                selectHouse(house);
              }
            }}
            disabled={state.loading || houses.length === 0}
          >
            {houses.map((house: House) => (
              <IonSelectOption key={house.id} value={house.id}>
                {house.number}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        
        {houses.length === 0 && !state.loading && state.selectedStreet && (
          <IonText color="medium">
            <p className="text-center mt-05">Нет доступных домов для выбранной улицы</p>
          </IonText>
        )}
      </div>
    );
  };

  // Форма персональных данных
  const PersonalForm = (): JSX.Element => {
    if (state.currentStep < FIND_LIC_CONSTANTS.STEPS.FORM || !state.selectedHouse) {
      return <></>;
    }

    return (
      <div className="mb-1">
        {/* Квартира (опционально) */}
        <IonItem>
          <IonIcon icon={homeOutline} slot="start" />
          <IonLabel position="stacked">Квартира (не обязательно)</IonLabel>
          <IonInput
            value={state.formData.apartment}
            placeholder="Номер квартиры"
            onIonInput={(e) => updateFormData('apartment', e.detail.value!)}
            disabled={state.loading}
            maxlength={10}
          />
        </IonItem>

        {/* Номер лицевого счета */}
        <IonItem>
          <IonIcon icon={cardOutline} slot="start" />
          <IonLabel position="stacked">Номер лицевого счета *</IonLabel>
          <IonInput
            value={state.formData.licenseNumber}
            placeholder="Введите номер ЛС"
            onIonInput={(e) => updateFormData('licenseNumber', e.detail.value!)}
            disabled={state.loading}
            type="number"
            maxlength={20}
            required
          />
        </IonItem>

        {/* ФИО */}
        <IonItem>
          <IonIcon icon={personOutline} slot="start" />
          <IonLabel position="stacked">ФИО *</IonLabel>
          <IonInput
            value={state.formData.fio}
            placeholder="Введите ФИО"
            onIonInput={(e) => updateFormData('fio', e.detail.value!)}
            disabled={state.loading}
            maxlength={100}
            required
          />
        </IonItem>

        {/* Информация о выбранном адресе */}
        <div className="mt-1 p-1 bg-light rounded">
          <IonText color="medium">
            <h4 className="mt-0 mb-05">Выбранный адрес:</h4>
            <p className="mt-0 mb-0 text-sm">
              {state.selectedSettlement?.name}, {state.selectedStreet?.name}, 
              дом {state.selectedHouse?.number}
              {state.formData.apartment && `, кв. ${state.formData.apartment}`}
            </p>
          </IonText>
        </div>

        {/* Подсказка по заполнению */}
        <IonText color="medium">
          <p className="text-center mt-1 mb-0 text-sm">
            * - обязательные поля
          </p>
        </IonText>
      </div>
    );
  };

  // Секция кнопок
  const ButtonSection = (): JSX.Element => {
    const handleSubmit = async () => {
      const success = await submitForm();
      if (success) {
        // Возвращаемся на главную страницу через 2 секунды
        setTimeout(() => {
          setPage(0);
        }, 2000);
      }
    };

    return (
      <div className="flex gap-1 mt-1">
        {/* Кнопка "Назад" */}
        <IonButton
          fill="outline"
          color="medium"
          onClick={() => setPage(0)}
          disabled={state.loading}
          className="flex-1"
        >
          Назад
        </IonButton>

        {/* Кнопка "Сбросить" - показываем только если есть выбранные данные */}
        {(state.selectedSettlement || state.selectedStreet || state.selectedHouse) && (
          <IonButton
            fill="clear"
            color="medium"
            onClick={resetForm}
            disabled={state.loading}
          >
            Сбросить
          </IonButton>
        )}

        {/* Кнопка "Найти ЛС" */}
        <IonButton
          fill="solid"
          color="primary"
          onClick={handleSubmit}
          disabled={!canSubmit || state.loading}
          className="flex-1"
        >
          {state.loading ? 'Поиск...' : 'Найти ЛС'}
        </IonButton>
      </div>
    );
  };

  // Сообщения пользователю
  const MessageSection = (): JSX.Element => {
    if (!state.message) {
      return <></>;
    }

    const isError = state.message.includes('Ошибка') || state.message.includes('не найден');
    const isSuccess = state.message.includes('успешно') || state.message.includes('найден и добавлен');

    return (
      <div className="mt-1">
        <IonText color={isError ? 'danger' : isSuccess ? 'success' : 'medium'}>
          <p className="text-center mb-0">
            {isError && '❌ '}
            {isSuccess && '✅ '}
            {!isError && !isSuccess && 'ℹ️ '}
            {state.message}
          </p>
        </IonText>
      </div>
    );
  };

  // ========================
  // ОСНОВНОЙ РЕНДЕР
  // ========================

  return (
    <>
      <IonCard>
        <div className="ml-1 mr-1 mt-1 mb-1">
          {/* Заголовок */}
          <div className="text-center mb-1">
            <h2 className="mt-0 mb-05">Поиск лицевого счета</h2>
            <IonText color="medium">
              <p className="mt-0 mb-0">Найдите ЛС по адресу и добавьте в свой список</p>
            </IonText>
          </div>

          {/* Индикатор прогресса */}
          <ProgressBar />

          {/* Селекторы и формы */}
          <SettlementSelector />
          <StreetSelector />
          <HouseSelector />
          <PersonalForm />

          {/* Кнопки */}
          <ButtonSection />

          {/* Сообщения */}
          <MessageSection />
        </div>
      </IonCard>

      {/* Индикатор загрузки */}
      <IonLoading
        isOpen={state.loading}
        message={state.loadingStep || 'Загрузка...'}
        duration={30000} // 30 секунд максимум
      />
    </>
  );
}