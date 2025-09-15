// Login.tsx
import React, { useState } from "react";
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

export function Login() {
    const [currentPage, setCurrentPage] = useState<LoginPage>('login');

    const { isLoading, info,  login, compare, restore, create, password } = useLogin()

    const renderPage = () => {
        switch (currentPage) {
            case 'login':
                return <LoginForm
                    onNavigate  = { setCurrentPage }
                    onLogin     = { login }
                />;
            case 'restore':
                return <RestoreForm 
                    onNavigate  = { setCurrentPage }
                    onRestore   = { restore }
                />;
            case 'SMS':
                return <SMSForm 
                    phone       = { info.code }
                    onNavigate  = { setCurrentPage }
                    onRestore   = { restore }
                    onCompare   = { compare }
                />;
            case 'Pass':
                return <PassForm 
                    onNavigate  = { setCurrentPage }
                    onPassword  = { password }
                />;
            case 'Reg':
                return <RegistrationForm 
                    onNavigate  = { setCurrentPage }
                    onCreate    = { create }
                />;
            default:
                return <LoginForm 
                    onNavigate  = { setCurrentPage }
                    onLogin     = { login }
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