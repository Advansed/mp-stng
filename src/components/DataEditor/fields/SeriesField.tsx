import React from 'react';
import { useMaskito } from '@maskito/react';
import styles from './TextField.module.css';
import { PASSPORT_SERIES_MASK } from './passport';

interface SeriesFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const SeriesField: React.FC<SeriesFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = '00 00',
  disabled = false,
  error,
}) => {
  const maskRef = useMaskito({
    options: { mask: PASSPORT_SERIES_MASK },
  });

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        ref={maskRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={value || ''}
        onInput={(e) => onChange((e.currentTarget as HTMLInputElement).value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
