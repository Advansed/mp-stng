// useAuth.ts
import { useEffect, useState } from 'react';
import { Store, getData, version } from '../Store';
import { useToast } from '../Toast';

export interface AuthCredentials {
    phone:          string;
    password:       string;
}

interface UseAuthReturn {
    isLoading:      boolean;
    info:           any;
    login:          ( credentials: AuthCredentials ) => Promise<boolean>;
    create:         ( phone: string, name: string, terms: boolean ) => Promise<boolean>;
    restore:        ( phone: string ) => Promise<boolean>;
    compare:        ( sms: string ) => Promise<boolean>;
    password:       ( password: string ) => Promise<boolean>;
    logout:         ( ) => void;
}

export const useLogin = (): UseAuthReturn => {
    
    const [ isLoading, setIsLoading ] = useState(false);
    
    const [ info, setInfo ] = useState<any>( Store.getState().login )

    useEffect(()=>{
        
        Store.subscribe({num: 9001, type: "login", func: ()=>{
            setInfo( Store.getState().login)
        }})

        return ()=>{
            Store.unSubscribe( 9001 )
        }

    },[])

    const toast = useToast()

    const login     = async (credentials: AuthCredentials): Promise<boolean> => {
        setIsLoading(true);
        
        try {

            if (!credentials.phone || !credentials.password) {
                toast.error('Заполните все поля!')
                setIsLoading(false);
                return false;
            }

            const res = await getData("authorization", {
                ...credentials,
                version:    version, // добавим версию из оригинального кода
                mode:       "android"
            });

            console.log('Auth response:', res);

            if (!res.error) {
                // Сохраняем в localStorage как в оригинальном коде
                localStorage.setItem("stngul.phone",    credentials.phone);
                localStorage.setItem("stngul.pass",     credentials.password);

                // Диспатчим в Store как в оригинальном коде
                Store.dispatch({ type: "login",         login: res.data });
                Store.dispatch({ type: "auth",          auth: true });
                
                setIsLoading(false);
                return true;
            } else {
                let errorMessage = res.message;
                
                // Обработка специфичных ошибок как в оригинале
                if (res.message === "Пароль не верен") {
                    errorMessage = "Неверный пароль";
                } else if (res.message === "Пользователь не найден") {
                    errorMessage = "Пользователь с таким телефоном не найден";
                }
                
                toast.error(errorMessage);
                setIsLoading(false);
                return false;
            }

        } catch (err) {
            console.error('Auth error:', err);
            toast.error('Ошибка соединения. Проверьте интернет и попробуйте снова');
            setIsLoading(false);
            return false;
        }
    };

    const restore   = async ( phone: string ): Promise<boolean> => {
        setIsLoading(true);
        
        try {

            const res = await getData("restore", {
                phone: phone 
            });

            console.log('Restore response:', res);

            if (!res.error) {   
                console.log(res.data.data)
                Store.dispatch({ type: "login",     login: res.data.data })
                
                setIsLoading(false);
                return true;
            } else {
                const errorMessage = res.message;
                
                toast.error(errorMessage);

                setIsLoading(false);
                return false;
            }

        } catch (err) {

            console.error('Auth error:', err);

            toast.error('Ошибка соединения. Проверьте интернет и попробуйте снова');

            setIsLoading(false);

            return false;
        }
    };

    const compare   = async ( sms: string ): Promise<boolean> => {

        setIsLoading(true);
        
        try {

            console.log( info )
            console.log( sms, info.pincode, sms === info.pincode )
            if ( sms === info.pincode ) {
                
                setIsLoading(false);
                return true;
            } else {
                toast.error("неверный СМС");

                setIsLoading(false);
                return false;
            }

        } catch (err: any) {

            toast.error( err.message );

            setIsLoading(false);

            return false;
        }

    };

    const password  = async ( password: string ): Promise<boolean> => {
        setIsLoading(true);
        
        try {

            const params = {
                token:      Store.getState().login.token,
                password:   password
            }

            console.log( params )

            const res = await getData("profile", params )

            console.log( res )

            if(!res.error){

                Store.dispatch({type: "auth", auth: true }) 

                return true
            } else return false 
            

        } catch (err: any) {

            toast.error( err.message );

            setIsLoading(false);

            return false;
        }
    };

    const logout    = (): void => {
        // Очищаем localStorage
        localStorage.removeItem("stngul.phone");
        localStorage.removeItem("stngul.pass");
        
        // Сбрасываем состояние в Store
        Store.dispatch({ type: "login", login: null });
        Store.dispatch({ type: "auth", auth: false });
        
    };

    const create    = async ( phone: string, name: string, terms: boolean ): Promise<boolean> => {
        setIsLoading(true);
        
        try {

            console.log(phone, terms, !phone || terms)
            if (!phone || !terms) {
                toast.error('Заполните все поля!')
                setIsLoading(false);
                return false;
            }

            const res = await getData("registration", {
                phone:      phone,
                terms:      terms
            });

            console.log('Reg response:', res);

            if (!res.error) {
                Store.dispatch({ type: "login", login: res.data })    
                setIsLoading(false);
                return true;
            } else {
                const errorMessage = res.message;
                                
                toast.error(errorMessage);
                setIsLoading(false);
                return false;
            }

        } catch (err) {
            console.error('Auth error:', err);
            toast.error('Ошибка соединения. Проверьте интернет и попробуйте снова');
            setIsLoading(false);
            return false;
        }
    };

    return {
        isLoading,
        info,
        restore,
        compare, 
        login,
        password,
        create,
        logout
    };
};