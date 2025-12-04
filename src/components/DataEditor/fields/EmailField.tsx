import React from 'react';
import styles from './EmailField.module.css';

interface EmailFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  validate?: boolean;
}

export const EmailField: React.FC<EmailFieldProps> = ({ 
  label, 
  value, 
  onChange,
  placeholder = "example@mail.ru",
  disabled = false,
  error
}) => {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input 
        type="email"
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};