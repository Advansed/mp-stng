// RestoreForm.tsx
import React, { useState } from "react";
import { IonImg, IonText, IonButton } from "@ionic/react";
import { LoginPage } from "./Login";
import MaskedInput from "../../mask/reactTextMask";

interface RestoreFormProps {
    onNavigate:     ( page: LoginPage ) => void;
    onRestore:      ( phone: string )   => Promise<boolean>;

}

export function RestoreForm({ onNavigate, onRestore }: RestoreFormProps) {
    const [ info, setInfo ] = useState({ phone: "", sms: "",})

    const handleRestore = async() => {
        const res = await  onRestore ( info.phone )  
        if(res)    
            onNavigate('SMS')
    
    }
    return (
        <>
            <div className="login-header mt-1">
                <IonImg className="login-logo" src="assets/img/logoSTNG.png" alt="logo"></IonImg>
                <IonText>
                    <p className="login-title">Восстановление пароля</p>
                </IonText>
            </div>

            <IonText>
                <p className="login-text a-center ml-1 mr-1">
                    Для восстановления пароля используйте номер вашего мобильного телефона
                </p>
            </IonText>

            <div className="login-input pl-1">
                <MaskedInput
                    mask        = { ['+', /[7]/, '(', /\d/, /\d/, /\d/, ')', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
                    className   = "m-input"
                    id          = '1'
                    value       = { info.phone }
                    placeholder = "Телефон"
                    type        = 'text'
                    onChange    = { (e) => {
                        info.phone = e.target.value as string
                        setInfo( info )
                    }}
                />                
            </div>

            <IonText>
                <p className="ion-text-start error ml-1 cl-red">
                    {/* Error message will appear here */}
                </p>
            </IonText>

            <div className="ml-1 mr-1 login-button"
                onClick = { ()=> {
                    handleRestore()
                }}
            >
                Запросить СМС
            </div>

            <div className="a-center">

                <IonText className="login-text">Уже зарегистрированы?</IonText>
            </div>

            <IonButton fill="clear" className="login-text-url ion-text-wrap"
                onClick={() => onNavigate('login')}>
                Авторизируйтесь
            </IonButton>
        </>
    );
}