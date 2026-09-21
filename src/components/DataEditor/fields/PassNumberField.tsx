import React from 'react';
import { useMaskito } from '@maskito/react';
import styles from './TextField.module.css';
import { PASSPORT_NUMBER_MASK } from './passport';

interface PassNumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const PassNumberField: React.FC<PassNumberFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = '000000',
  disabled = false,
  error,
}) => {
  const maskRef = useMaskito({
    options: { mask: PASSPORT_NUMBER_MASK },
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
