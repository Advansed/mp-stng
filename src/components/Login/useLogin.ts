// useLogin.ts
import { useLoginStore } from '../../Store/loginStore';
import { useToast } from '../Toast';

export interface AuthCredentials {
    phone: string;
    password: string;
}

interface UseAuthReturn {
    isLoading: boolean;
    user: any;
    ulogin: (credentials: AuthCredentials) => Promise<void>;
    ucreate: (phone: string, name: string, terms: boolean) => Promise<boolean>;
    urestore: (phone: string) => Promise<boolean>;
    ucompare: (sms: string) => Promise<boolean>;
    upassword: (password: string) => Promise<boolean>;
    logout: () => void;
}

export const useLogin = (): UseAuthReturn => {
    const toast = useToast();
    const { user, isLoading, login, create, restore, compare, password, logout } = useLoginStore();

    const ulogin = async (credentials: AuthCredentials): Promise<void> => {
        const res = await login(credentials.phone, credentials.password);
        console.log(res)

        if ( res.error ) toast.error('Ошибка авторизации:' + res.message);
        else {  toast.success('Авторизировация прошла успешно');
            localStorage.setItem("stngul.phone", credentials.phone );
            localStorage.setItem("stngul.pass", credentials.password )
        }
    };

    const ucreate = async (phone: string, name: string, terms: boolean): Promise<any> => {
        const result = await create(phone, name, terms);
        if (result.error) toast.error( result.message );
        return result;
    };

    const urestore = async (phone: string): Promise<boolean> => {
        const result = await restore(phone);
        if (!result) toast.error('Ошибка восстановления');
        return result;
    };

    const ucompare = async (sms: string): Promise<boolean> => {
        const result = compare(sms);
        if (!result) toast.error('Неверный СМС');
        return result;
    };

    const upassword = async (pass: string): Promise<boolean> => {
        const result = await password(pass);
        if (!result) toast.error('Ошибка смены пароля');
        return result;
    };

    return { isLoading, user, ulogin, ucreate, urestore, ucompare, upassword, logout };
};