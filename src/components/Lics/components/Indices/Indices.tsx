// src/components/Lics/components/Indices/Indices.tsx
import React, { FC } from 'react';
import { IonCard } from '@ionic/react';
import { Counter } from './Counter';
import { IndicesProps } from './types';
import { MapPin, User } from 'lucide-react';

export const Indices: FC<IndicesProps> = ({ item, setPage, setIndice }) => {
  const counters = item.counters || [];

  return (
    <IonCard className="pb-1">
        <div className="flex fl-space mt-1 ml-1">
          <div className="cl-black fs-12">
            <b>{"л/с № " + item.code}</b>
          </div>
        </div>
        
        <div className="ml-1 mr-1 mt-1 t-underline pb-05 fs-09 flex">
          <div>
             <User size={16} className={ "w-15 h-15 cl-prim " } />
            {/* <IonIcon icon={personOutline} className="h-15 w-15" color="tertiary" /> */}
          </div>
          <div className="ml-1 cl-prim "><b>{item.name}</b></div>
        </div>
        
        <div className="ml-1 mr-1 t-underline pb-05 mt-1 flex fs-09">
          <div>
            <MapPin size={16} className={ "w-15 h-15 cl-prim "} />
          </div>
          <div className="ml-1 cl-black">{item.address}</div>
        </div>
      
      <div className="mt-2 ml-1 mr-1 t-underline cl-prim">
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