import React, { useState, useEffect } from 'react';
import { IonLoading, IonCard } from '@ionic/react';
import { useLicsStore } from '../../../../Store/licsStore';
import { useToken } from '../../../../Store/loginStore';
import styles from './styles.module.css';
import { User, MapPin, Gauge } from 'lucide-react';

// Типы для props
interface HistoryIndicesProps {
  item: any
}

// Тип для показаний счетчика
interface CounterIndication {
  date:         string;
  indication:   number;
  counterName?: string;
}

const IndicationItems: React.FC<{ info: CounterIndication[] }> = ({ info }) => {
  return (
    <>
      {info.map((indication, idx) => (
        <div className={styles.indicationItem} key={idx}>
          <div className={"ml-1 " + styles.indicationDate}>{indication.date}</div>
          <div className={styles.indicationValue}>
            {new Intl.NumberFormat('ru-RU').format(indication.indication)}
          </div>
        </div>
      ))}
    </>
  );
};

const HistoryIndices: React.FC<HistoryIndicesProps> = ({ item }) => {
  const indices     = useLicsStore(state => state.hist_indices);
  const load        = useLicsStore(state => state.loading);
  const getIndices  = useLicsStore(state => state.get_indices);
  const token       = useToken();

  const counterIndices = indices.filter(ind => String(ind.counterId) === String( item.selected.counterId ));
  const info = counterIndices[0]?.indications || [];

  async function Load() {
    await getIndices(token || '', item.selected.counterId );
  }

  useEffect(() => {
    if (info.length === 0) {
      Load();
    }
  }, []);

  // Группируем показания по счетчикам
  const groupIndicationsByCounter = (indications: CounterIndication[]) => {
    const grouped: { [key: string]: CounterIndication[] } = {};
    
    indications.forEach(indication => {
      const counterName = indication.counterName || 'Основной счетчик';
      if (!grouped[counterName]) {
        grouped[counterName] = [];
      }
      grouped[counterName].push(indication);
    });
    
    return grouped;
  };

  const groupedIndications = groupIndicationsByCounter(info);

  return (
    <>
      <IonLoading 
        isOpen={load} 
        message={"Загрузка данных..."} 
        className={styles.loading}
      />
      
      <IonCard className={styles.compactCard}>
        {/* Заголовок карточки */}
        <div className={styles.header}>
          <div className={styles.accountNumber}>
            Лицевой счет №{item.code}
          </div>
        </div>

        {/* Информация о владельце и адресе */}
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <User size={16} className={styles.icon} />
            <span className={'fs-11 cl-prim ' + styles.detailText}>
              <b>{item.name}</b>
            </span>
          </div>
          
          <div className={styles.detailItem}>
            <MapPin size={16} className={styles.icon} />
            <span className={"fs-italic cl-black " + styles.detailText}>
              {item.address}
            </span>
          </div>
        </div>

        {/* Заголовок истории показаний */}
        <div className={styles.historyTitle}>
          История показаний счетчиков
        </div>

        {/* Секции с показаниями */}
        <div className={styles.indicationSection}>
          {info.length === 0 ? (
            <div className={styles.emptyState}>
              Нет данных о показаниях счетчиков
            </div>
          ) : (
            Object.entries(groupedIndications).map(([counterName, indications], i) => (
              <div key={i} className={styles.counterGroup}>
                <div className={styles.counterName}>
                  <Gauge size={14} className={styles.icon} />
                  {counterName}
                </div>
                
                <div className={styles.indicationList}>
                  <div className={styles.indicationHeader}>
                    <div className={styles.indicationDateHeader}>Дата</div>
                    <div className={styles.indicationValueHeader}>Показание</div>
                  </div>
                  
                  <IndicationItems info={indications} />
                </div>
              </div>
            ))
          )}
        </div>
      </IonCard>
    </>
  );
};

export default HistoryIndices;