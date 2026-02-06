// LoginForm.tsx
import React, { useEffect, useState } from "react";
import { IonImg, IonText, IonButton, IonInput, IonIcon } from "@ionic/react";
import { LoginPage } from "./Login";
import MaskedInput from "../../mask/reactTextMask";
import { eyeOffOutline, eyeOutline } from "ionicons/icons";
import { AuthCredentials } from "./useLogin";
import { version } from "../../Store/api";
import { Check } from "lucide-react";
import ESIALoginButton from "./ESIALoginButton";

interface LoginFormProps {
    onNavigate:     (page: LoginPage) => void;
    onLogin:        (credentials: AuthCredentials) => Promise<void>;
} 

export function LoginForm({ onNavigate, onLogin }: LoginFormProps) {
    const [ info, setInfo ] = useState( { phone: "", password: "" } )
    const [ showPassword, setShowPassword ] = useState( false )


    useEffect(()=>{

        console.log('check')
        
        const login = { phone: "'", password: ""}
        login.phone = localStorage.getItem("stngul.phone") || '';
        login.password = localStorage.getItem("stngul.pass") || '';
        
        setInfo( login )

    },[])

    return (
        <>
            
            <div className="login-header mt-1">
                <IonImg className="login-logo" src="assets/img/logoSTNG.png" alt="logo"></IonImg>
                <IonText>
                    <p className="login-title">Авторизация</p>
                </IonText>
                <IonText>
                    <p className="login-text a-center ml-1 mr-1">
                        Если у Вас уже есть личный кабинет, пожалуйста авторизуйтесь.
                    </p>
                </IonText>
            </div>
            
            <div>
                <div className="login-input pl-1 ml-1 mr-1">
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
                <div className="login-input mt-1 flex pl-1 ml-1 mr-1">
                    <IonInput
                        type        ={ showPassword ? 'text' : 'password'}
                        placeholder ="Введите пароль"
                        value       ={ info.password }
                        onIonInput  ={(e)=>{
                            info.password = e.detail.value as string
                            setInfo( info )
                        }}
                    />
                     <IonButton 
                        fill        = "clear" 
                        slot        = "end"
                        onClick     = { () =>{
                            setShowPassword( !showPassword )
                        }}
                    >
                        <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline } />
                    </IonButton>
                </div>

                <IonText>
                    <p className="ion-text-start error ml-1 cl-red">
                        {/* Error message will appear here */}
                    </p>
                </IonText>

                <div className="ml-1 mr-1 login-button"
                    onClick={()=>{ onLogin( info ) }}
                >
                    Войти
                </div>
            </div>

            {/* <div>
                <ESIALoginButton />
            </div> */}

            <IonButton className="login-text-url ion-text-wrap" fill="clear"
                onClick={() => onNavigate('restore')}>
                Забыли пароль?
            </IonButton>

            <div className="a-center">
                <IonText className="login-text">Еще не зарегистрированы?</IonText>
            </div>

            <IonButton fill="clear" className="login-text-url ion-text-wrap"
                onClick={() => onNavigate('Reg')}>
                Пройдите регистрацию
            </IonButton>

            <IonButton fill="clear" className="login-text-url"
                onClick={() => onNavigate('video')}>
                Видео инструкция
            </IonButton>

            <div className="cl-white fs-09 ml-1 mt-4">
                { "Версия " + version }
            </div>

        </>
    );
}