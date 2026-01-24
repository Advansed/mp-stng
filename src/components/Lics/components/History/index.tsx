import React, { useState, useEffect } from 'react';
import { IonLoading, IonCard } from '@ionic/react';
import { HistPayment, HistSection, useLicsStore } from '../../../../Store/licsStore';
import styles from './styles.module.css';
import { User, MapPin } from 'lucide-react';
import { useToken } from '../../../Login/authStore';

// Типы для props
interface HistoryProps {
  item: {
    code: string;
    name: string;
    address: string;
  };
}

const PaymentItems: React.FC<{ info: HistPayment[] }> = ({ info }) => {
  return (
    <>
      {info.map((payment, idx) => (
        <div className={styles.paymentItem} key={idx}>
          <div className={"ml-1 " + styles.paymentNumber}>{payment.number}</div>
          <div className={styles.paymentAmount}>
            {new Intl.NumberFormat('ru-RU', { 
              style: 'currency', 
              currency: 'RUB',
              minimumFractionDigits: 0
            }).format(payment.summ)}
          </div>
        </div>
      ))}
    </>
  );
};

const History: React.FC<HistoryProps> = ({ item }) => {
  const payments = useLicsStore(state => state.hist_payment);
  const load = useLicsStore(state => state.loading);
  const getpayments = useLicsStore(state => state.get_payment);
  const token = useToken();

  const jarr = payments.filter(pay => String(pay.LC) === String(item.code));
  const info = jarr[0]?.payments || [];

  async function Load() {
    await getpayments(token || '', item.code);
  }

  useEffect(() => {
    if (info.length === 0) {
      Load();
    }
  }, []);

  const calculateDayTotal = (payments: HistPayment[]) => {
    return payments.reduce((acc, payment) => acc + payment.summ, 0);
  };

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
            <span className={ 'fs-11 cl-prim ' + styles.detailText}>
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

        
        {/* Заголовок истории платежей */}
        <div className={styles.historyTitle}>
          История платежей
        </div>

        {/* Секции с платежами */}
        <div className={styles.paymentSection}>
          {info.length === 0 ? (
            <div className={styles.emptyState}>
              Нет данных о платежах
            </div>
          ) : (
            info.map((section, i) => (
              <div key={i}>
                <div className={styles.paymentDate}>
                  {section.date}
                </div>
                
                <PaymentItems info={section.pays} />
                
                <div className={"ml-1 " + styles.total}>
                  <div>Итого за день:</div>
                  <div>
                    {new Intl.NumberFormat('ru-RU', { 
                      style: 'currency', 
                      currency: 'RUB',
                      minimumFractionDigits: 0
                    }).format(calculateDayTotal(section.pays))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </IonCard>
    </>
  );
};

export default History;