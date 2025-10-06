import React from 'react';
import styles from './TextField.module.css';
import { FioSuggestions } from 'react-dadata';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  validate?: boolean;

}

export const FioField: React.FC<TextFieldProps> = ({ 
  label, 
  value, 
  onChange,
  placeholder = "",
  disabled = false,
  error,
  type = 'text'
}) => {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <FioSuggestions
        token="50bfb3453a528d091723900fdae5ca5a30369832"
        value={{ value: value || '' } as any}
        onChange={(suggestion) => {
          if (suggestion) {
            onChange( suggestion?.value );
          }
        }}
        inputProps={{
          disabled,
          className: `${styles.input} ${error ? styles.inputError : ''}`,
          placeholder: "Введите ФИО"
        }}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
