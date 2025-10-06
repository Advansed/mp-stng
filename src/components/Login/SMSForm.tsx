import React, { useState, useRef } from 'react';
import {
  IonInput,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonImg
} from '@ionic/react';
import './SMSForm.css';
import { LoginPage } from './Login';
import { version } from '../Store_1';

interface SMSFormProps {
    phone:          string,
    onNavigate:     ( page: LoginPage ) => void;
    onRestore:      ( phone: string )   => Promise<boolean>;
    onCompare:      ( sms: string )   => Promise<boolean>;

}

const SMSForm: React.FC<SMSFormProps> = ({ phone, onNavigate, onCompare, onRestore }) => {
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string>('');
  const inputsRef = useRef<(HTMLIonInputElement | null)[]>([]);

  const handleInputChange = (value: string, index: number) => {
    // Разрешаем только цифры
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue.length > 1) {
      // Если вставлено несколько цифр, берем первую
      const newCode = [...code];
      newCode[index] = numericValue[0];
      setCode(newCode);
      
      // Переходим к следующему полю
      if (index < 3 && inputsRef.current[index + 1]) {
        inputsRef.current[index + 1]?.setFocus();
      }
    } else {
      const newCode = [...code];
      newCode[index] = numericValue;
      setCode(newCode);
      
      // Автопереход к следующему полю при вводе цифры
      if (numericValue && index < 3 && inputsRef.current[index + 1]) {
        inputsRef.current[index + 1]?.setFocus();
      }
      
      // Автопереход к предыдущему полю при удалении
      if (!numericValue && index > 0 && inputsRef.current[index - 1]) {
        inputsRef.current[index - 1]?.setFocus();
      }
    }
    
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.setFocus();
    }
  };

  const handleSubmit = async() => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 4) {
      setError('Введите все 4 цифры кода');
      return;
    }
    
    if (!/^\d{4}$/.test(fullCode)) {
      setError('Код должен состоять из 4 цифр');
      return;
    }
    
    const res = await onCompare( fullCode );
    console.log('onCompare', res)
    if(res) onNavigate('Pass')
    else setCode(['', '', '', ''])
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numericData = pastedData.replace(/\D/g, '').slice(0, 4);
    
    if (numericData.length === 4) {
      const newCode = numericData.split('');
      setCode(newCode);
      
      // Устанавливаем фокус на последнее поле
      if (inputsRef.current[3]) {
        inputsRef.current[3]?.setFocus();
      }
    }
  };

  return (
    <>
      <div className="login-header mt-1">
          <IonImg className="login-logo" src="assets/img/logoSTNG.png" alt="logo"></IonImg>
          <IonText>
              <p className="login-title">Подтверждение SMS</p>
          </IonText>
          <IonText>
              <p className="login-text a-center ml-1 mr-1">
                  Введите код из SMS
              </p>
          </IonText>
      </div>
                
      <div>
          <IonGrid className="code-inputs ml-4 mr-4">
              <IonRow>
                  {code.map((digit, index) => (
                    <IonCol key={index}>
                        <IonInput
                            ref         = { (el) => (inputsRef.current[index] = el) }
                            type        = "tel"
                            inputMode   = "numeric"
                            maxlength   = { 1 }
                            value       = { digit }
                            onIonInput  = { (e) => handleInputChange(e.detail.value!, index) }
                            onKeyDown   = { (e) => handleKeyDown(e, index) }
                            onPaste     = { handlePaste }
                            className   = "code-input"
                            aria-label  = { `Цифра ${index + 1}` }
                        />
                    </IonCol>
                  ))}
             </IonRow>
          </IonGrid>
      </div>
    
      <div className="ml-1 mr-1 login-button"
          onClick = { ()=> {
              console.log("onClick")
                handleSubmit()
          }}
      >
        Подтвердить
      </div>
    

      <div className="a-center">

          <IonText className="login-text">Уже зарегистрированы?</IonText>
      
      </div>

      <IonButton fill="clear" className="login-text-url ion-text-wrap"
          onClick={() => onNavigate('login')}>
          Авторизируйтесь
      </IonButton>
    
      {/*
      <IonButton fill="clear" className="login-text-url ion-text-wrap"
          onClick={() => onNavigate('Reg')}>
              Пройдите регистрацию
      </IonButton> */}
    
      <div className="cl-white fs-09 ml-1 mt-4">
          { "Версия " + version }
      </div>
    
    </>
  );
};

export default SMSForm;