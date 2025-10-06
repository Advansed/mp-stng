// Login.tsx
import React, { useEffect, useState } from "react";
import { IonLoading } from "@ionic/react";
import { isPlatform } from "@ionic/core";
import "./Login.css";
import { LoginForm } from "./LoginForm";
import { RestoreForm } from "./RestoreForm";
import { RegistrationForm } from "./RegistrationForm";
import { useLogin } from "./useLogin";
import SMSForm from "./SMSForm";
import { PassForm } from "./PassForm";

export type LoginPage = 'login' | 'restore' | 'SMS' | 'Pass' | 'Reg';

export function Login(props:{ reg: boolean}) {
    const [currentPage, setCurrentPage] = useState<LoginPage>( props.reg ? 'Reg' : 'login');
    const { isLoading, user,  ulogin, ucompare, urestore, ucreate, upassword } = useLogin()

    const renderPage = () => {
        switch (currentPage) {
            case 'login':
                return <LoginForm
                    onNavigate  = { setCurrentPage }
                    onLogin     = { ulogin }
                />;
            case 'restore':
                return <RestoreForm 
                    onNavigate  = { setCurrentPage }
                    onRestore   = { urestore }
                />;
            case 'SMS':
                return <SMSForm 
                    phone       = { user.code }
                    onNavigate  = { setCurrentPage }
                    onRestore   = { urestore }
                    onCompare   = { ucompare }
                />;
            case 'Pass':
                return <PassForm 
                    onNavigate  = { setCurrentPage }
                    onPassword  = { upassword }
                />;
            case 'Reg':
                return <RegistrationForm 
                    onNavigate  = { setCurrentPage }
                    onCreate    = { ucreate }
                />;
            default:
                return <LoginForm 
                    onNavigate  = { setCurrentPage }
                    onLogin     = { ulogin }
                />;
        }
    };

    return (
        <>
            <IonLoading isOpen={isLoading} message={"Подождите..."}/>
            <div className={isPlatform("ios") ? "login-background w-100 h-100 mt-3" : 'login-background w-100 h-100'}>
                <div className="login-container">
                    {renderPage()}
                </div>
            </div>
        </>
    );
}