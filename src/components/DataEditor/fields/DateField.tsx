import React, { useId, useMemo, useState } from 'react';
import { IonDatetime, IonIcon, IonModal } from '@ionic/react';
import { calendarOutline, closeOutline } from 'ionicons/icons';
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

function toIsoDate(value: string): string {
  if (!value) return '';

  const ddmmyyyy = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month}-${day}`;
  }

  const iso = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];

  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return '';
}

function toDisplay(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

function emitValue(iso: string, format: 'ddmmyyyy' | 'iso'): string {
  if (!iso) return '';
  if (format === 'ddmmyyyy') return toDisplay(iso);
  return iso;
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'ДД.ММ.ГГГГ',
  disabled = false,
  error,
  min,
  max,
}) => {
  const datetimeId = useId().replace(/:/g, '');
  const [open, setOpen] = useState(false);

  const normalizedValue = useMemo(() => toIsoDate(value), [value]);
  const minIso = useMemo(() => toIsoDate(min || ''), [min]);
  const maxIso = useMemo(() => toIsoDate(max || ''), [max]);
  const originalFormat = useMemo<'ddmmyyyy' | 'iso'>(() => {
    if (!value) return 'iso';
    return /^\d{2}\.\d{2}\.\d{4}$/.test(value) ? 'ddmmyyyy' : 'iso';
  }, [value]);

  const display = normalizedValue ? toDisplay(normalizedValue) : '';

  const commit = (iso: string) => {
    onChange(emitValue(iso, originalFormat));
    setOpen(false);
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={datetimeId}>{label}</label>
      <div className={styles.dateWrapper}>
        <button
          id={datetimeId}
          type="button"
          className={`${styles.dateButton} ${error ? styles.inputError : ''} ${!display ? styles.placeholder : ''}`}
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {display || placeholder}
        </button>
        {display && !disabled ? (
          <button
            type="button"
            className={styles.clearButton}
            aria-label="Очистить дату"
            onClick={() => onChange('')}
          >
            <IonIcon icon={closeOutline} />
          </button>
        ) : null}
        <div className={styles.iconWrapper}>
          <IonIcon icon={calendarOutline} className={styles.icon} />
        </div>
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}

      <IonModal
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        className={styles.modal}
      >
        <IonDatetime
          presentation="date"
          locale="ru-RU"
          firstDayOfWeek={1}
          value={normalizedValue || undefined}
          min={minIso || undefined}
          max={maxIso || undefined}
          showDefaultButtons
          doneText="Готово"
          cancelText="Отмена"
          onIonChange={(event) => {
            const raw = event.detail.value;
            const picked = Array.isArray(raw) ? raw[0] : raw;
            commit(toIsoDate(String(picked || '')));
          }}
          onIonCancel={() => setOpen(false)}
        />
      </IonModal>
    </div>
  );
};
