// RegistrationForm.tsx
import React, { useState } from "react";
import { IonImg, IonText, IonButton, IonCheckbox, IonInput } from "@ionic/react";
import { LoginPage } from "./Login";
import MaskedInput from "../../mask/reactTextMask";

interface RegistrationFormProps {
    onNavigate:     ( page: LoginPage ) => void;
    onCreate:       ( phone: string, name: string, terms: boolean ) => Promise<boolean>;

}

export function RegistrationForm({ onNavigate, onCreate }: RegistrationFormProps) {
    const [ phone,  setPhone ]  = useState("")
    const [ name,   setName ]   = useState("")
    const [ agree,  setAgree ]  = useState( false)

    const handleCreate = async() =>{
         const res = await onCreate( phone, name, agree )
         if(res)   onNavigate('SMS')
    }

    return (
        <>
            <div className="login-header mt-1">
                <IonImg className="login-logo" src="assets/img/logoSTNG.png" alt="logo"></IonImg>
                <IonText>
                    <p className="login-title">Регистрация</p>
                </IonText>
            </div>

            <IonText>
                <p className="login-text a-center ml-1 mr-1">
                    Регистрация нового пользователя
                </p>
                <p className="login-text a-center ml-1 mr-1">
                    Для регистрации используйте номер вашего мобильного телефона
                </p>
            </IonText>

            <div>
                <IonText>
                    <p className="login-text a-center ml-1 mr-1">
                        * - Обязательное поле для заполнения
                    </p>
                </IonText>
            </div>

            <div className="login-input pl-1 ml-1 mr-1">
                <MaskedInput
                    mask        = { ['+', /[7]/, '(', /\d/, /\d/, /\d/, ')', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
                    className   = "m-input"
                    id          = '1'
                    value       = { phone }
                    placeholder = "Телефон"
                    type        = 'text'
                    onChange    = { (e) => {

                        setPhone( e.target.value as string )

                    }}
                />                
            </div>

            <div className="login-input mt-1 ml-1 mr-1">
                <IonInput 
                    className   = "ml-1"
                    placeholder = "ФИО" 
                    value       = { name } 
                    type        = { "text" } 
                    onIonChange = {(e)=>{
                        setName( e.target.value as string );
                    }}
                />
            </div>

            <div className="ml-1 mr-1 pt-1">
                <IonCheckbox
                    justify         = "start"
                    labelPlacement  = "end"
                    mode            = "ios"
                    checked         = { agree }
                    className       = "login-checkbox"
                    onClick         = {()=>{
                        setAgree( !agree )
                    }}
                >
                    <span className="wrap">Согласен(-на) на обработку персональных данных</span>
                </IonCheckbox>
            </div>

            <IonText>
                <p className="ion-text-start error ml-1 cl-red">
                    {/* Error message will appear here */}
                </p>
            </IonText>

            <div className="ml-1 mr-1 login-button"
                onClick = { handleCreate }
            >
                Запросить СМС
            </div>

            <IonButton className="login-text-url ion-text-wrap" fill="clear">
                Пользовательское соглашение
            </IonButton>

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