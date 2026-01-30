// src/components/DataEditor/fields/DateField.tsx
import React, { useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';
import styles from './DateField.module.css';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  min?: string;
  max?: string;
  validate?: boolean;
}

export const DateField: React.FC<DateFieldProps> = ({ 
  label, 
  value, 
  onChange,
  placeholder = "ДД.ММ.ГГГГ",
  disabled = false,
  error,
  min,
  max
}) => {
  // Определение формата даты и конвертация в YYYY-MM-DD для input
  const normalizedValue = useMemo(() => {
    if (!value) return '';
    
    // Проверяем, является ли значение форматом ДД.ММ.ГГГГ
    const ddmmyyyyPattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = value.match(ddmmyyyyPattern);
    
    if (match) {
      // Конвертируем из ДД.ММ.ГГГГ в YYYY-MM-DD
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }
    
    // Проверяем, является ли значение форматом YYYY-MM-DD
    const yyyymmddPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (yyyymmddPattern.test(value)) {
      return value;
    }
    
    // Если формат не распознан, пытаемся распарсить как Date
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch {
      // Игнорируем ошибки парсинга
    }
    
    return value;
  }, [value]);

  // Определение исходного формата для сохранения при изменении
  const originalFormat = useMemo(() => {
    if (!value) return 'iso';
    const ddmmyyyyPattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    return ddmmyyyyPattern.test(value) ? 'ddmmyyyy' : 'iso';
  }, [value]);

  // Обработчик изменения даты
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value; // input type="date" всегда возвращает YYYY-MM-DD
    
    if (!newValue) {
      onChange('');
      return;
    }

    // Если исходный формат был ДД.ММ.ГГГГ, конвертируем обратно
    if (originalFormat === 'ddmmyyyy') {
      const [year, month, day] = newValue.split('-');
      onChange(`${day}.${month}.${year}`);
    } else {
      // Иначе возвращаем в ISO формате
      onChange(newValue);
    }
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.dateWrapper}>
        <input 
          type="date"
          className={`${styles.dateInput} ${error ? styles.inputError : ''} ${!normalizedValue ? styles.placeholder : ''}`}
          value={normalizedValue} 
          onChange={handleChange}
          // placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
        />
        <div className={styles.iconWrapper}>
          <IonIcon icon={calendarOutline} className={styles.icon} />
        </div>
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};