import React, { useEffect, useState } from 'react';
import { IonLoading, IonText } from '@ionic/react';
import { requestJson } from '../Store/api';
import styles from './Queye.module.css';

interface QueueItem {
  window_number: string;
  ticket_number: string;
  role_title: string;
  time_process: string;
}

export function Queye(): JSX.Element {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const loadQueue = async () => {
    try {
      setError(null);
      const json = await requestJson(
        'queye',
        'https://fhd.aostng.ru/inter_vesta/hs/API_STNG/V2/queye'
      );
      if (json && json.success && Array.isArray(json.data)) {
        setItems(json.data as QueueItem[]);
      } else {
        setError('Не удалось загрузить данные очереди');
      }
    } catch (e) {
      setError('Ошибка загрузки данных очереди');
    }
  };

  useEffect(() => {
    loadQueue();
    const timer = setInterval(loadQueue, 5000);
    return () => clearInterval(timer);
  }, []);

  // Обновление текущего времени каждую минуту
  useEffect(() => {
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timeTimer);
  }, []);

  // Функция для определения активного элемента (можно модифицировать под вашу логику)
  const isItemActive = (item: QueueItem): boolean => {
    // Здесь можно добавить свою логику определения активного элемента
    // Например, сравнивать с текущим временем или статусом
    return false; // По умолчанию все неактивные
  };

  // Форматирование даты
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Форматирование времени
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div className='cl-white fs-15'> <b>Онлайн табло</b></div>
      </header>

      {/* Блок с датой и временем */}
      <div className={styles.dateBlock}>
        <div className={styles.dateIcon}>📅</div>
        <div className={styles.dateInfo}>
          <div className={styles.dateDay}>
            {formatDate(currentTime)}
          </div>
          <div className={styles.dateTime}>
            <span>🕐 {formatTime(currentTime)}</span>
            <span className={styles.timeUpdate}>(обновление каждые 15с)</span>
          </div>
        </div>
      </div>

      {/* Список карточек в два ряда */}
      <div className={styles.listContainer}>
        {items.map((item) => (
          <div
            key={item.window_number}
            className={`${styles.listItem} ${isItemActive(item) ? styles.listItemActive : ''}`}
          >
            {/* Верхняя часть: Номер талона, Окно и Время обработки */}
            <div className={styles.ticketSection}>
              <span className={styles.ticketNumber}>{item.ticket_number}</span>
              <div className={styles.windowInfo}>
                <div className={styles.windowBadge}>окно {item.window_number}</div>
                {item.time_process && (
                  <div className={styles.timeBadge}>{item.time_process}</div>
                )}
              </div>
            </div>

            {/* Нижняя часть: Операция */}
            <div className={styles.infoSection}>
              <span className={styles.opName}>{item.role_title}</span>
            </div>

            {/* Полоска для активного элемента */}
            {isItemActive(item) && <div className={styles.glowBar}></div>}
          </div>
        ))}
      </div>

      {/* Индикатор загрузки */}
      {loading && <IonLoading isOpen={loading} message="Загрузка..." />}

      {/* Сообщение об ошибке */}
      {error && (
        <IonText color="danger">
          <p>{error}</p>
        </IonText>
      )}
    </div>
  );
}