// src/components/Lics/components/Counter/Counter.tsx
import React, { FC, useState, useEffect, useRef } from 'react';
import { IonButton, IonInput } from '@ionic/react';
import { CounterProps } from './types';
import { useAuthStore } from '../../../Login/authStore';
import {LicCounter } from '../../../../Store/licsStore';
import { useToast } from '../../../Toast';
import { parseReading, UNCONFIRMED_READING } from '../../../../utils/meterReadings';

export const Counter: FC<CounterProps> = ({ info, item, setPage, setIndice }) => {
  const [mode, setMode] = useState(false);
  const [avail, setAvail] = useState(0);
  const [delta, setDelta] = useState(-1);
  const [submitting, setSubmitting] = useState(false);
  const [inputError, setInputError] = useState('');
  const inFlight = useRef(false);

  const toast = useToast()

  const borders = useAuthStore(state => state.user?.borders ) || {from: 20, to: 25}
  const monthes = useAuthStore(state => state.user?.monthes ) || 0

  const monthDiff = (dateFrom: Date, dateTo: Date): number => {
    let months = dateTo.getMonth() - dateFrom.getMonth() + 
      (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
    
    if (dateFrom.getDate() > dateTo.getDate()) months = months - 1;
    return months;
  };

  useEffect(() => {
    const date = new Date();
    let d = date.getDate().toString(); 
    if (d.length === 1) d = "0" + d;
    let m = (date.getMonth() + 1).toString(); 
    if (m.length === 1) m = "0" + m;
    const y = date.getFullYear().toString();

    let pred: Date = new Date("2000-01-01")

    if(info.predPeriod){
        pred = new Date(
            info.predPeriod.substring(6, 10) + "-" + 
            info.predPeriod.substring(3, 5) + "-" + 
            info.predPeriod.substring(0, 2)
        );

    }  

    if (pred.getFullYear() === date.getFullYear() && pred.getMonth() === date.getMonth()) {
      setAvail(1);
    } else if (monthDiff(pred, date) > (monthes === 0 ? 999 : monthes)) {
       setAvail(2);
    } else {
      if (borders.from < borders.to) {
        if (date.getDate() < borders.from || date.getDate() > borders.to) {
           setAvail(3);
        }
      } else {
        if (date.getDate() > borders.to || date.getDate() < borders.from) {
           setAvail(3);
        }
      }
    }

    item.current = d + "." + m + "." + y;

  }, []);

  const lload = async () => {
    
      info.predIndice   = info.indice || 0;
      info.predPeriod   = info.period || "";
      info.indice       = 0; 
      info.period       = "";
      setAvail(4);

  };

  const handleSubmitIndication = async () => {
    if (inFlight.current || !mode) return;
    inFlight.current = true;
    setSubmitting(true);
    try {
      
      const res = await setIndice( [info] as LicCounter[] )
      
      if (res?.error === false) {
        lload();
        setMode(false);
        toast.success(res.message);
      } else toast.error(res?.message || UNCONFIRMED_READING);

    } catch (error) {
      
      toast.error(UNCONFIRMED_READING);
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const handleInputChange = (value: string) => {
    const parsedValue = parseReading(value, info.predIndice || 0);
    const numericValue = /^\d+$/.test(value) ? Number(value) : NaN;
    setInputError(!value || parsedValue !== null ? '' :
      !Number.isSafeInteger(numericValue) ? 'Введите целую часть показания без пробелов и дробных знаков.' :
      numericValue === 0 ? 'Для передачи показания 0 обратитесь в контакт-центр.' :
      numericValue < (info.predIndice || 0) ? 'Новое показание не должно быть меньше предыдущего.' :
      'Разность показаний не должна превышать 10 000 м³.');
    info.indice = parsedValue ?? NaN;
    info.period = item.current || '';
    
    if (parsedValue !== null) {
      setMode(true);
    } else {
      setMode(false);
    }
    
    setDelta(Number.isSafeInteger(numericValue) ? numericValue - (info.predIndice || 0) : -1);
  };

  const handleHistoryClick = () => {
    item.selected = info;
    setPage(9);
  };

  return (
    <>
      <div className="flex fl-space cl-prim">
        <div><b>{ info.name }</b></div>
      </div>
      
      { info.poverka > 0 && (
        <div className='borders'>
          <div className={ "flex fl-space " + ( info.poverka === 3 ? "cl-red" : info.poverka === 2 ? "cl-green" : "cl-red1" ) }>
            <div><b> { info.poverka === 1 ? "Истек срок поверки " : "Истекает срок поверки" } </b></div>
            <div><b>{ info.p_data }</b></div>
          </div>
          <div className={'mt-05 fs-08 '  + ( info.poverka === 3 ? "cl-red" : info.poverka === 2 ? "cl-green" : "cl-red1" )  }> { info.p_text } </div>
        </div>
      )}
      { info.poverka === 0 && (
          <div className={ "flex fl-space cl-green mt-05 ml-1" }>
            <div><b> Срок следующей поверки </b></div>
            <div><b>{ info.p_data }</b></div>
          </div>
      )}
      
      
      <div className="flex fl-space mt-1 ml-1 cl-prim">
        <div>{"Дата показания"}</div>
        <div><b>{info.predPeriod}</b></div>
      </div>
      
      <div className="flex fl-space mt-1 ml-1 cl-prim">
        <div>{"Показание"}</div>
        <div className="fs-11"><b>{info.predIndice}</b></div>
      </div>

      {avail === 1 ? (
        <div className="ml-1 mt-2 fs-08 pb-1">
          <b>Показания уже приняты</b>
        </div>
      ) : avail === 2 ? (
        <div className="ml-1 mt-2 fs-08 pb-1" onClick={() => {
          // TODO: Заменить на роутер
          // Store.dispatch({type: "route", route: "services"})
        }}>
          <b>Нарушен срок подачи показаний, в разделе услуги вам необходимо обратиться в </b>
          <b className="cl-prim fs-11">{" Единый контакт-центр 509-555"}</b>
        </div>
      ) : avail === 3 ? (
        <div className="ml-1 mt-2 fs-08 pb-1">
          <b>В настоящее время прием показаний недоступен. Показания принимаются с 15 по 25 число каждого месяца.</b>
        </div>
      ) : avail === 4 ? (
        <div className="ml-1 mt-2 fs-08 pb-1">
          <b>Ваши показания приняты, сумму начислений Вы увидите после 01 числа следующего месяца</b>
        </div>
      ) : (
        <>
          <div className="flex fl-space mt-1 ml-1 cl-prim">
            <div className="w-40">{"Передать"}</div>
            <div className="w-50 s-input a-right">
              <IonInput
                disabled={submitting}
                className="s-input-1"
                placeholder="Показание"
                onIonInput={(e) => handleInputChange(e.detail.value as string)}
              />
            </div>
          </div>
          {inputError && <p className="cl-red" role="alert">{inputError}</p>}
          <p className="a-right fs-09">
            <b>
              {delta === 0 ? "" :
               delta > 0 ? "Разность показаний " + delta.toString() :
               delta < 0 ? "" : <></>}
            </b>
          </p>
          
          <p className="a-right fs-08">
            <b>
              {delta === 0 ? "Расход за период: 0 м³" :
               delta > 10000 ? "Нельзя передать слишком большое показание" :
               delta < 0 ? "" : <></>}
            </b>
          </p>
          
          <p className="fs-08">
            {"С 20 марта 2025 года показания должны быть введены не более 5 знаков, а также разница не должна превышать объем в 10 000 м3, в противном случае Вам необходимо вызвать инспекторов для снятия показаний"}
          </p>
        </>
      )}

      <div className="mt-1">
        {mode && (
          <IonButton
            disabled={submitting}
            color="tertiary"
            expand="block"
            mode="ios"
            onClick={handleSubmitIndication}
          >
            {"Отправить показания"}
          </IonButton>
        )}
        
        <IonButton
          color="tertiary"
          expand="block"
          mode="ios"
          onClick={handleHistoryClick}
        >
          {"История"}
        </IonButton>
      </div>
    </>
  );
};
