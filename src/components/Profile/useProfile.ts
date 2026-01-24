import { useEffect } from 'react';
import { 
  useProfileData, 
  useProfileLoading, 
  useProfileError,
  useAuthStore,
  useToken
} from '../Login/authStore';

export const useProfile = () => {
  const profile         = useProfileData();
  const isLoading       = useProfileLoading();
  const error           = useProfileError();

  const getProfile      = useAuthStore(state => state.getProfile);
  const updateProfile   = useAuthStore(state => state.updateProfile);

  const token           = useToken();
  
  // Автоматическая загрузка профиля при наличии токена
  // Проверяем, что профиль еще не загружен (пустые поля) и есть токен
  useEffect(() => {
    if (token && !profile.id && !isLoading) {
      getProfile();
    }
  }, [token]);
  
  const save = async (data: any) => {
    await updateProfile(data);
  };

  const refresh = async () => {
    await getProfile();
  };

  return {
    profile,
    isLoading,
    error,
    save,
    refresh
  };
};