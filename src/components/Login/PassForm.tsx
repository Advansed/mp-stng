// RestoreForm.tsx
import React, { useState } from "react";
import { IonImg, IonText, IonButton, IonInput } from "@ionic/react";
import { LoginPage } from "./Login";
import MaskedInput from "../../mask/reactTextMask";
import { useToast } from "../Toast";

interface PassFormProps {
    onNavigate:     ( page: LoginPage ) => void;
    onPassword:     ( phone: string )   => Promise<boolean>;

}

export function PassForm({ onNavigate, onPassword }: PassFormProps) {
    const [ info, setInfo ] = useState({ password: "", password1: "",})
    const toast  = useToast()

    const handlePassword = async() => {
        console.log("handle password ")
        if( info.password === info.password1) {
            await  onPassword ( info.password )  
        } else {
            toast.error("Пароли не совпадают")
            setInfo({ password: "", password1:"" })
        }
    
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
                    Для завершения восстановления пароля введите пароль и подтвердите его
                </p>
            </IonText>

                <div className="login-input ml-1 mr-1 mt-1">
                    <IonInput
                        className="ml-1"
                        placeholder="Пароль" 
                        value={ info.password } 
                        type="password"  
                        onIonChange={(e)=>{
                            info.password = e.target.value as string;
                        }}
                    />
                </div>
                <div className="login-input mt-1 ml-1 mr-1">
                    <IonInput 
                        className="ml-1"
                        placeholder="Повторите пароль" 
                        value={ info.password1 } 
                        type="password"  
                        onIonChange={(e)=>{
                            info.password1 = e.target.value as string;
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
                    console.log("onClick")
                    handlePassword()
                }}
            >
                Сохранить
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