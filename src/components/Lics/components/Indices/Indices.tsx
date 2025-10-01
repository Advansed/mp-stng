// src/components/Lics/components/Indices/Indices.tsx
import React, { FC } from 'react';
import { IonCard } from '@ionic/react';
import { Counter } from './Counter';
import { IndicesProps } from './types';

export const Indices: FC<IndicesProps> = ({ item, setPage, setIndice }) => {
  const counters = item.counters || [];

  return (
    <IonCard className="pb-1">
      <div className="flex fl-space mt-1 ml-1">
        <div className="cl-black">
          <h4><b>{"Лицевой счет №" + item.code}</b></h4>
        </div>
      </div>
      
      <div className="ml-2 mr-1 cl-prim">
        {item.name}
      </div>
      
      <div className="ml-2 mr-1 pb-1 mt-1 cl-prim">
        {item.address}
      </div>
      
      <div className="mt-1 ml-1 mr-1 t-underline cl-prim">
        <b>{"Счетчики"}</b>
      </div>

      <div className="ml-2 mr-1 mt-1">
        {counters.map((counter, index) => (
          <Counter 
            key         = { index }
            info        = { counter } 
            item        = { item }
            setPage     = { setPage } 
            setIndice   = { setIndice }
          />
        ))}
      </div>
    </IonCard>
  );
};