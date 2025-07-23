// src/components/Lics/components/ModeSelection.tsx

import React, { useCallback } from 'react';
import { IonIcon, IonText } from '@ionic/react';
import { 
  pencilOutline, 
  documentTextOutline, 
  chevronForwardOutline,
  checkmarkCircleOutline,
  mapOutline
} from 'ionicons/icons';
import { ModeSelectionProps, AddLicMode } from './types';
import { ADD_LICS_CONSTANTS } from './constants';

export function ModeSelection({ onModeSelect }: ModeSelectionProps): JSX.Element {
  
  const handleModeClick = useCallback((mode: AddLicMode) => {
    onModeSelect(mode);
  }, [onModeSelect]);

  return (
    <div className="mode-selection">
      {/* Описание */}
      <div className="mb-1 text-center">
        <IonText color="medium">
          <p>Выберите способ добавления лицевого счета:</p>
        </IonText>
      </div>

      {/* Режим: По номеру ЛС */}
      <div 
        className="ls-item1 mb-1 cursor-pointer"
        onClick={() => handleModeClick(AddLicMode.BY_CODE)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleModeClick(AddLicMode.BY_CODE);
          }
        }}
      >
        <div className="flex items-center w-full">
          {/* Иконка */}
          <div className="flex-shrink-0 mr-1">
            <IonIcon 
              icon={pencilOutline} 
              color="primary" 
              className="w-16 h-16"
            />
          </div>
          
          {/* Контент */}
          <div className="flex-grow">
            <div className="font-bold color-primary">
              {ADD_LICS_CONSTANTS.MODE_NAMES[AddLicMode.BY_CODE]}
            </div>
            <div className="fs-07 color-medium mt-025">
              {ADD_LICS_CONSTANTS.MODE_DESCRIPTIONS[AddLicMode.BY_CODE]}
            </div>
            <div className="fs-06 color-medium mt-025">
              Быстро и просто - достаточно знать номер
            </div>
          </div>
          
          {/* Стрелка */}
          <div className="flex-shrink-0">
            <IonIcon 
              icon={chevronForwardOutline} 
              color="medium" 
              className="w-10 h-10"
            />
          </div>
        </div>
      </div>

      {/* Режим: По адресу */}
      <div 
        className="ls-item1 mb-1 cursor-pointer"
        onClick={() => handleModeClick(AddLicMode.BY_ADDRESS)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleModeClick(AddLicMode.BY_ADDRESS);
          }
        }}
      >
        <div className="flex items-center w-full">
          {/* Иконка */}
          <div className="flex-shrink-0 mr-1">
            <IonIcon 
              icon={documentTextOutline} 
              color="primary" 
              className="w-16 h-16"
            />
          </div>
          
          {/* Контент */}
          <div className="flex-grow">
            <div className="font-bold color-primary">
              {ADD_LICS_CONSTANTS.MODE_NAMES[AddLicMode.BY_ADDRESS]}
            </div>
            <div className="fs-07 color-medium mt-025">
              {ADD_LICS_CONSTANTS.MODE_DESCRIPTIONS[AddLicMode.BY_ADDRESS]}
            </div>
            <div className="fs-06 color-medium mt-025">
              Пошаговый выбор: улус → населенный пункт → улица → дом
            </div>
          </div>
          
          {/* Стрелка */}
          <div className="flex-shrink-0">
            <IonIcon 
              icon={chevronForwardOutline} 
              color="medium" 
              className="w-10 h-10"
            />
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="mt-1">
        <div className="bg-light p-1 rounded">
          <div className="flex items-start">
            <IonIcon 
              icon={checkmarkCircleOutline} 
              color="success" 
              className="flex-shrink-0 mr-05 mt-025"
            />
            <div>
              <p className="fs-07 color-dark mb-05">
                <strong>Рекомендации по выбору:</strong>
              </p>
              <ul className="fs-06 color-medium ml-1">
                <li className="mb-025">
                  <strong>По номеру ЛС</strong> - если у вас есть номер лицевого счета
                </li>
                <li className="mb-025">
                  <strong>По адресу</strong> - если номера ЛС нет, но известен точный адрес
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Схема адресной иерархии */}
      <div className="mt-1">
        <div className="bg-info-light p-1 rounded">
          <div className="flex items-start">
            <IonIcon 
              icon={mapOutline} 
              color="primary" 
              className="flex-shrink-0 mr-05 mt-025"
            />
            <div>
              <p className="fs-07 color-dark mb-05">
                <strong>Структура адреса:</strong>
              </p>
              <div className="fs-06 color-medium">
                <div className="flex items-center">
                  <span className="bg-primary-light px-05 py-025 rounded mr-05">Улус</span>
                  <IonIcon icon={chevronForwardOutline} className="w-8 h-8 mx-025" />
                  <span className="bg-primary-light px-05 py-025 rounded mr-05">Населенный пункт</span>
                  <IonIcon icon={chevronForwardOutline} className="w-8 h-8 mx-025" />
                  <span className="bg-primary-light px-05 py-025 rounded">Улица → Дом</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}