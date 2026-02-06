import React, { useState, useEffect } from 'react';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import axios from 'axios';
import './ESIALoginButton.css';

const ESIALoginButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Генерация случайной строки для state
  const generateState = (): string => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Инициализация авторизации
  const initiateESIALogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Генерируем и сохраняем state
      const state = generateState();
      sessionStorage.setItem('esia_state', state);

      // Параметры для запроса авторизации
      const params = new URLSearchParams({
        client_id:      process.env.REACT_APP_ESIA_CLIENT_ID || '1234567890',
        scope:          'openid fullname email snils',
        response_type:  'code',
        redirect_uri:   'mystnglk://auth/callback',
        state:          state,
        access_type:    'offline',
        timestamp:      new Date().toISOString().split('.')[0] + 'Z'
      });

      const authUrl = `https://esia.gosuslugi.ru/aas/oauth2/ac?${params.toString()}`;

      // Открываем браузер для авторизации
      await Browser.open({ url: authUrl });
    } catch (err) {
      console.error('Ошибка инициализации авторизации:', err);
      setError('Не удалось начать авторизацию');
      setIsLoading(false);
    }
  };

  // Обработка возврата из браузера
  useEffect(() => {
    const handleAppUrlOpen = async (data: any) => {
      console.log('Received URL:', data.url);

      if (data.url && data.url.includes('mystnglk://auth/callback')) {
        try {
          // Закрываем браузер
          await Browser.close();

          // Парсим URL
          const url = new URL(data.url.replace('mystnglk://', 'http://'));
          const code = url.searchParams.get('code');
          const state = url.searchParams.get('state');
          const errorParam = url.searchParams.get('error');

          if (errorParam) {
            setError(`Ошибка авторизации: ${errorParam}`);
            return;
          }

          const savedState = sessionStorage.getItem('esia_state');

          if (!state || state !== savedState) {
            setError('Ошибка безопасности: неверный state параметр');
            return;
          }

          if (code) {
            // Отправляем код на ваш бэкенд-сервер
            await exchangeCodeForToken(code);
          }
        } catch (err) {
          console.error('Ошибка обработки callback:', err);
          setError('Ошибка обработки ответа от Госуслуг');
        } finally {
          setIsLoading(false);
          sessionStorage.removeItem('esia_state');
        }
      }
    };

    // Подписываемся на событие открытия deep link
    App.addListener('appUrlOpen', handleAppUrlOpen);

    return () => {
      // Отписываемся при размонтировании
      App.removeAllListeners();
    };
  }, []);

  // Обмен кода на токен (через ваш сервер)
  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/esia-exchange', // Ваш бэкенд
        { code },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Сохраняем токен
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        
        // Обновляем состояние приложения
        window.dispatchEvent(new Event('authChange'));
        
        // Редирект на главную
        window.location.href = '/';
      } else {
        setError(response.data.error || 'Ошибка авторизации');
      }
    } catch (err: any) {
      console.error('Ошибка обмена кода:', err);
      setError(err.response?.data?.error || 'Ошибка соединения с сервером');
    }
  };

  return (
    <div className="esia-login-container">
      <button
        onClick={initiateESIALogin}
        disabled={isLoading}
        className="esia-login-button"
      >
        {isLoading ? (
          <span className="loading-text">Подключение к Госуслугам...</span>
        ) : (
          <>
            <img 
              src="/assets/gosuslugi-logo.svg" 
              alt="Госуслуги"
              className="esia-logo"
            />
            <span>Войти через Госуслуги</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="esia-error">
          {error}
        </div>
      )}
      
      <div className="esia-hint">
        Будет открыт браузер для авторизации
      </div>
    </div>
  );
};

export default ESIALoginButton;