import React, { useEffect, useState } from 'react';
import { 
    IonButton, 
    IonCard, 
    IonInput, 
    IonItem, 
    IonLoading, 
    IonIcon, 
    IonLabel,
    IonText
} from '@ionic/react';
import { 
    closeCircleOutline, 
    searchOutline, 
    arrowForwardOutline,
    chevronDownOutline 
} from 'ionicons/icons';
import { 
    MapPin, 
    Home, 
    Building2, 
    Hash, 
    Navigation 
} from 'lucide-react';
import { 
    useFindLic, 
    type Ulus, 
    type Settlement, 
    type Street, 
    type House, 
    type Apartment, 
    type Lic 
} from './useFindLic';
import { AddAccountParams, LicsPage } from '../types';
import styles from './FindLic.module.css';

interface FindLicProps {
  setPage: (page: number) => void;
}

export const FindLic = ({ setPage }: FindLicProps): JSX.Element => {
  const { state, loadSettlements, loadStreets, loadHouses, addAccount, setState } = useFindLic();

  useEffect(() => {
    if (state.info.length === 0) {
        loadSettlements();
    }
  }, []);

  const handleSubmit = async () => {
    if (state.lc) {
      await addAccount({ LC: state.lc } as AddAccountParams);
      setPage(LicsPage.MAIN);
    } else {
      setPage(LicsPage.MAIN);
    }
  };

  return (
    <>
      <IonLoading isOpen={state.load} message="Поиск данных..." spinner="crescent" />
      
      <IonCard className={`${styles.card} pb-1`}>
        {/* Заголовок в стиле LicItem */}
        <div className="flex fl-space mt-1 ml-1 mr-1">
          <div className="cl-black fs-12">
            <b>Узнать лицевой счет</b>
          </div>
          <IonButton fill="clear" onClick={() => setPage(LicsPage.MAIN)}>
            <IonIcon icon={closeCircleOutline} color="medium" slot="icon-only" />
          </IonButton>
        </div>

        {/* Инфо-строка разделитель */}
        <div className="ml-1 mr-1 t-underline pb-05 fs-09 flex">
          <Navigation size={16} className="w-15 h-15 cl-prim" />
          <div className="ml-1 cl-prim"><b>Поиск по адресу</b></div>
        </div>

        <div className="mt-1">
          {/* 1. Выбор улуса */}
          <SearchInput
            label="Улус (Район)"
            placeholder="Выберите район"
            icon={<MapPin size={18} className="cl-prim mr-1" />}
            items={state.info.map(u => ({ id: u.ulus, label: u.ulus, data: u }))}
            selectedItem={state.ulus?.ulus}
            onSelect={(item: any) => setState({ ulus: item.data })}
            onClear={() => setState({ ulus: undefined, naspunkt: undefined, street: undefined, house: undefined, kv: undefined, lc: undefined })}
          />

          {/* 2. Выбор населенного пункта */}
          {state.ulus && (
            <SearchInput
              label="Населенный пункт"
              placeholder="Город / Село"
              icon={<Building2 size={18} className="cl-prim mr-1" />}
              items={state.ulus.settlements.map(s => ({ id: s.settlement, label: s.settlement, data: s }))}
              selectedItem={state.naspunkt?.settlement}
              onSelect={(item: any) => loadStreets(item.data)}
              onClear={() => setState({ naspunkt: undefined, street: undefined, house: undefined, kv: undefined, lc: undefined })}
            />
          )}

          {/* 3. Выбор улицы */}
          {state.naspunkt && (
            <SearchInput
              label="Улица"
              placeholder="Название улицы"
              icon={<Navigation size={18} className="cl-prim mr-1" />}
              items={state.naspunkt.streets.map(s => ({ id: s.street, label: s.street, data: s }))}
              selectedItem={state.street?.street}
              onSelect={(item: any) => loadHouses(item.data)}
              onClear={() => setState({ street: undefined, house: undefined, kv: undefined, lc: undefined })}
            />
          )}

          {/* 4. Выбор дома */}
          {state.street && (
            <SearchInput
              label="Дом"
              placeholder="Номер дома"
              icon={<Home size={18} className="cl-prim mr-1" />}
              items={state.street.houses.map(h => ({ id: h.house, label: h.house, data: h }))}
              selectedItem={state.house?.house}
              onSelect={(item: any) => setState({ house: item.data })}
              onClear={() => setState({ house: undefined, kv: undefined, lc: undefined })}
            />
          )}

          {/* 5. Выбор квартиры */}
          {state.house?.apartments && state.house.apartments.length > 0 && (
            <SearchInput
              label="Квартира"
              placeholder="№ Кв."
              icon={<Hash size={18} className="cl-prim mr-1" />}
              items={state.house.apartments.map(a => ({ id: a.apartment, label: `Кв. ${a.apartment}`, data: a }))}
              selectedItem={state.kv?.apartment}
              onSelect={(item: any) => setState({ kv: item.data })}
              onClear={() => setState({ kv: undefined, lc: undefined })}
            />
          )}

          {/* 6. Выбор Л/С */}
          {(state.house?.lics || state.kv?.lics) && (
            <SearchInput
              label="Лицевой счет"
              placeholder="Выберите Л/С"
              icon={<Hash size={18} className="cl-prim mr-1" />}
              items={(state.kv?.lics || state.house?.lics || []).map(l => ({ id: l.code, label: `Л/С ${l.code}`, data: l }))}
              selectedItem={state.lc}
              onSelect={(item: any) => setState({ lc: item.data.code })}
              onClear={() => setState({ lc: undefined })}
            />
          )}
        </div>

        {/* Кнопка действия */}
        <div className={styles.buttonContainer}>
          <IonButton
            color="tertiary"
            expand="block"
            mode="ios"
            className={styles.submitButton}
            onClick={handleSubmit}
          >
            <IonIcon slot="start" icon={state.lc ? arrowForwardOutline : searchOutline} />
            {state.lc ? "Добавить этот счет" : "Закрыть"}
          </IonButton>
        </div>
      </IonCard>
    </>
  );
};

/**
 * Вспомогательный компонент для инпута с выпадающим списком
 */
const SearchInput = ({ label, placeholder, icon, items, onSelect, onClear, selectedItem }: any) => {
  const [value, setValue] = useState(selectedItem || "");
  const [isFocused, setIsFocused] = useState(false);

  // Синхронизация внутреннего значения при выборе из списка или очистке сверху
  useEffect(() => {
    setValue(selectedItem || "");
  }, [selectedItem]);

  const filtered = items.filter((i: any) => 
    value === "" || i.label.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="mb-05">
      <label className={styles.inputLabel}>{label}</label>
      <div className={`${styles.inputWrapper} ${isFocused ? styles.inputWrapperFocus : ''}`}>
        <IonItem lines="none" className={styles.inputItem}>
          {icon}
          <IonInput
            value={value}
            placeholder={placeholder}
            onIonInput={(e) => {
              setValue(e.detail.value!);
              onClear();
            }}
            onIonFocus={() => setIsFocused(true)}
            onIonBlur={() => setTimeout(() => setIsFocused(false), 250)}
          />
          <IonIcon 
            icon={chevronDownOutline} 
            color="medium" 
            style={{ fontSize: '14px', transition: 'transform 0.2s', transform: isFocused ? 'rotate(180deg)' : 'none' }} 
          />
        </IonItem>
      </div>
      
      {isFocused && filtered.length > 0 && (
        <div className={styles.dropdownList}>
          {filtered.map((item: any) => (
            <IonItem 
              button 
              detail={false}
              key={item.id} 
              className={styles.dropdownItem}
              onMouseDown={(e) => {
                // Предотвращаем потерю фокуса до выбора
                e.preventDefault();
                setValue(item.label);
                onSelect(item);
                setIsFocused(false);
              }}
            >
              <IonLabel>{item.label}</IonLabel>
            </IonItem>
          ))}
        </div>
      )}
    </div>
  );
};