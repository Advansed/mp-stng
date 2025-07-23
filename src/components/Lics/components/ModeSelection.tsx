// src/components/Lics/components/AddLics/ModeSelection.tsx

import React from 'react';
import { IonIcon } from '@ionic/react';
import { pencilOutline, documentTextOutline } from 'ionicons/icons';
import { ModeSelectionProps, AddLicMode } from './types';
import { ADD_LICS_CONSTANTS } from './constants';

export function ModeSelection({ onModeSelect }: ModeSelectionProps): JSX.Element {
  return (
    <div className="ml-05 mr-05">
      {/* Заголовок с описанием */}
      <div className="ml-1 mr-1 mb-1">
        <p className="text-center fs-08 color-medium">
          Выберите способ добавления лицевого счета
        </p>
      </div>

      {/* Вариант 1: По номеру ЛС */}
      <div 
        className="ls-item1 mb-05"
        onClick={() => onModeSelect(AddLicMode.BY_CODE)}
        style={{ cursor: 'pointer' }}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <IonIcon 
              icon={pencilOutline} 
              className="w-15 h-15 ml-05" 
              color="tertiary" 
              mode="ios" 
            />
          </div>
          <div className="flex-1 ml-1">
            <div className="fs-09">
              <b>{ADD_LICS_CONSTANTS.MODE_NAMES[AddLicMode.BY_CODE]}</b>
            </div>
            <div className="fs-08 color-medium">
              {ADD_LICS_CONSTANTS.MODE_DESCRIPTIONS[AddLicMode.BY_CODE]}
            </div>
          </div>
          <div className="flex-shrink-0 mr-05">
            <IonIcon 
              icon="chevron-forward-outline" 
              className="w-12 h-12" 
              color="medium" 
            />
          </div>
        </div>
      </div>

      {/* Вариант 2: По адресу */}
      <div 
        className="ls-item1"
        onClick={() => onModeSelect(AddLicMode.BY_ADDRESS)}
        style={{ cursor: 'pointer' }}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <IonIcon 
              icon={documentTextOutline} 
              className="w-15 h-15 ml-05" 
              color="tertiary" 
              mode="ios" 
            />
          </div>
          <div className="flex-1 ml-1">
            <div className="fs-09">
              <b>{ADD_LICS_CONSTANTS.MODE_NAMES[AddLicMode.BY_ADDRESS]}</b>
            </div>
            <div className="fs-08 color-medium">
              {ADD_LICS_CONSTANTS.MODE_DESCRIPTIONS[AddLicMode.BY_ADDRESS]}
            </div>
          </div>
          <div className="flex-shrink-0 mr-05">
            <IonIcon 
              icon="chevron-forward-outline" 
              className="w-12 h-12" 
              color="medium" 
            />
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="ml-1 mr-1 mt-1">
        <p className="text-center fs-07 color-medium">
          💡 Вы можете добавить несколько лицевых счетов
        </p>
      </div>
    </div>
  );
}