import React, { useEffect, useState, useRef } from 'react';
import { isPlatform } from '@ionic/react';
import { IonAlert } from '@ionic/react';
import { getVersion, version } from '../Store/api';

/**
 * Компонент для инициализации приложения
 * Запускается только один раз при открытии приложения
 */
export function AppInitializer() {
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const hasCheckedRef = useRef(false); // Флаг для отслеживания, что проверка уже была выполнена

  useEffect(() => {
    // Выполняем проверку только один раз при монтировании компонента
    // и только на мобильной платформе
    if (!hasCheckedRef.current && isPlatform('mobile')) {
      hasCheckedRef.current = true; // Отмечаем, что проверка началась

      const checkVersion = async () => {
        try {
          const res = await getVersion();
          if (res.message !== version) {
            setShowUpdateAlert(true);
          }
        } catch (error) {
          console.error('Ошибка проверки версии:', error);
        }
      };

      checkVersion();
    }
  }, []); // Пустой массив зависимостей - выполняется только один раз при монтировании

  return (
    <IonAlert
      header="Внимание!!!"
      message="Вышло новое обновление приложения"
      isOpen={showUpdateAlert}
      onDidDismiss={() => setShowUpdateAlert(false)}
      buttons={[
        {
          text: 'Закрыть',
          role: 'cancel',
          handler: () => {
            setShowUpdateAlert(false);
          },
        },
        {
          text: 'Обновить',
          role: 'confirm',
          handler: () => {
            if (isPlatform('android')) {
              window.open('https://play.google.com/store/apps/details?id=io.ionic.stng');
            }
            if (isPlatform('ios')) {
              window.open(
                'itms-apps://apps.apple.com/ru/app/%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-%D1%81%D0%B0%D1%85%D0%B0%D1%82%D1%80%D0%B0%D0%BD%D1%81%D0%BD%D0%B5%D1%84%D1%82%D0%B5%D0%B3%D0%B0%D0%B7/id6445904988'
              );
            }
          },
        },
      ]}
    />
  );
}
