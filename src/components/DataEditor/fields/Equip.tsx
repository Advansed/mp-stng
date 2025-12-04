import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { calendarOutline, addOutline, trashOutline } from 'ionicons/icons';
import styles from './Equip.module.css';

export interface GasEquipmentData {
  type: string;
  manufacturer: string;
  number: string;
  plomb: string;
  release_date: string;
}

interface GasEquipmentFieldProps {
  label: string;
  value: GasEquipmentData[];
  onChange: (value: GasEquipmentData[]) => void;
  disabled?: boolean;
  error?: string;
  validate?: boolean;
}

export const EquipField: React.FC<GasEquipmentFieldProps> = ({ 
  label, 
  value = [], 
  onChange,
  disabled = false,
  error
}) => {

  const addEquipment = () => {
    if (disabled) return;
    
    const newEquipment: GasEquipmentData = {
      type: '',
      manufacturer: '',
      number: '',
      plomb: '',
      release_date: ''
    };
    
    onChange([...value, newEquipment]);
  };

  const removeEquipment = (index: number) => {
    if (disabled) return;
    
    const newEquipment = value.filter((_, i) => i !== index);
    onChange(newEquipment);
  };

  const updateEquipment = (index: number, field: keyof GasEquipmentData, fieldValue: string) => {
    if (disabled) return;
    
    const updatedEquipment = value.map((equipment, i) => {
      if (i === index) {
        return {
          ...equipment,
          [field]: fieldValue
        };
      }
      return equipment;
    });
    
    onChange(updatedEquipment);
  };

  const isEquipmentValid = (equipment: GasEquipmentData): boolean => {
    return !!equipment.type?.trim() && 
           !!equipment.manufacturer?.trim() && 
           !!equipment.number?.trim() && 
           !!equipment.release_date;
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={`${styles.equipmentWrapper} ${error ? styles.equipmentWrapperError : ''}`}>
        
        <div className={styles.equipmentList}>
          {value.length === 0 ? (
            <div className={styles.emptyState}>
              Нет добавленных приборов учета
            </div>
          ) : (
            value.map((equipment, index) => (
              <div key={index} className={styles.equipmentItem}>
                <div className={styles.equipmentItemHeader}>
                  <div className={styles.equipmentItemTitle}>
                    Прибор учета #{index + 1}
                    {!isEquipmentValid(equipment) && (
                      <span style={{color: '#ff4444', marginLeft: '0.5em', fontSize: '0.8em'}}>
                        (не заполнено)
                      </span>
                    )}
                  </div>
                  <IonButton
                    size="small"
                    fill="solid"
                    className={styles.removeButton}
                    onClick={() => removeEquipment(index)}
                    disabled={disabled}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </div>

                <div className={styles.equipmentGrid}>
                  {/* Тип оборудования */}
                  <div className={styles.equipmentRow}>
                    <input 
                      type="text"
                      className={`${styles.input} ${!equipment.type ? styles.inputError : ''}`}
                      value={equipment.type || ''}
                      onChange={(e) => updateEquipment(index, 'type', e.target.value)}
                      placeholder="Тип оборудования *"
                      disabled={disabled}
                    />
                  </div>

                  {/* Производитель */}
                  <div className={styles.equipmentRow}>
                    <input 
                      type="text"
                      className={`${styles.input} ${!equipment.manufacturer ? styles.inputError : ''}`}
                      value={equipment.manufacturer || ''}
                      onChange={(e) => updateEquipment(index, 'manufacturer', e.target.value)}
                      placeholder="Производитель *"
                      disabled={disabled}
                    />
                  </div>

                  {/* Заводской номер */}
                  <div className={styles.equipmentRow}>
                    <input 
                      type="text"
                      className={`${styles.input} ${!equipment.number ? styles.inputError : ''}`}
                      value={equipment.number || ''}
                      onChange={(e) => updateEquipment(index, 'number', e.target.value)}
                      placeholder="Заводской номер *"
                      disabled={disabled}
                    />
                  </div>

                  {/* Номер пломбы */}
                  <div>
                    <input 
                      type="text"
                      className={styles.input}
                      value={equipment.plomb || ''}
                      onChange={(e) => updateEquipment(index, 'plomb', e.target.value)}
                      placeholder="Номер пломбы"
                      disabled={disabled}
                    />
                  </div>

                  {/* Дата выпуска */}
                  <div className={styles.dateWrapper}>
                    <input 
                      type="date"
                      className={`${styles.dateInput} ${!equipment.release_date ? styles.inputError : ''}`}
                      value={equipment.release_date || ''}
                      onChange={(e) => updateEquipment(index, 'release_date', e.target.value)}
                      disabled={disabled}
                    />
                    <IonIcon icon={calendarOutline} className={styles.dateIcon} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!disabled && (
          <IonButton
            fill="outline"
            className={styles.addButton}
            onClick={addEquipment}
          >
            <IonIcon icon={addOutline} slot="start" />
            Добавить прибор учета
          </IonButton>
        )}

      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};