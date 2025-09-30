// src/components/Lics/FindLic.tsx
import React, { useEffect } from 'react';
import { IonButton, IonCard, IonInput, IonLoading } from '@ionic/react';
import { useFindLic, type Ulus, type Settlement, type Street, type House, type Apartment, type Lic } from './useFindLic';

interface FindLicProps {
  setPage: (page: number) => void;
}

export function FindLic({ setPage }: FindLicProps): JSX.Element {
  const { state, loadStreets, loadHouses, addAccount, setState } = useFindLic();

  useEffect(() => {
    console.log( state.info )
  },[ state ])

  // Обработчики для компонентов списков
  const handleUlusSelect = (ulus: Ulus) => {
    setState({ ulus });
  };

  const handleSettlementSelect = async (settlement: Settlement) => {
    await loadStreets(settlement);
  };

  const handleStreetSelect = async (street: Street) => {
    await loadHouses(street);
  };

  const handleHouseSelect = (house: House) => {
    setState({ house });
  };

  const handleApartmentSelect = (apartment: Apartment) => {
    setState({ kv: apartment.apartment });
  };

  const handleLicSelect = (lic: Lic) => {
    setState({ lc: lic.code });
  };

  const handleSubmit = async () => {
    setState({ message: "" });
    
    if (state.lc && state.fio) {
      await addAccount({
        token: "",
        LC: state.lc,
        fio: state.fio,
        s_id: state.naspunkt?.s_id,
        ids: state.street?.ids?.[0],
        house_id: state.house?.house,
        apartment: state.kv
      });
      setPage(0);
    } else {
      setPage(0);
    }
  };

  return (
    <>
      <IonLoading isOpen={state.load} message="Подождите..." />
      <IonCard className="pb-1">
        <div className="flex fl-space mt-1 ml-1">
          <div className="cl-black">
            <h4><b>Узнать лицевой счет</b></h4>
          </div>
        </div>

        {/* Выбор улуса */}
        { state.info && (
          <UlusList uluses={state.info} onSelect={handleUlusSelect} />
        )}

        {/* Выбор населенного пункта */}
        {state.ulus && !state.naspunkt && (
          <SettlementsList settlements={state.ulus.settlements} onSelect={handleSettlementSelect} />
        )}

        {/* Выбор улицы */}
        {state.naspunkt && !state.street && state.naspunkt.streets && (
          <StreetsList streets={state.naspunkt.streets} onSelect={handleStreetSelect} />
        )}

        {/* Выбор дома */}
        {state.street && !state.house && state.street.houses && (
          <HousesList houses={state.street.houses} onSelect={handleHouseSelect} />
        )}

        {/* Выбор квартиры */}
        {state.house && !state.kv && state.house.apartments && (
          <ApartmentsList apartments={state.house.apartments} onSelect={handleApartmentSelect} />
        )}

        {/* Выбор лицевого счета из дома */}
        {state.house && !state.lc && state.house.lics && (
          <LicsList lics={state.house.lics} onSelect={handleLicSelect} />
        )}

        {/* Выбор лицевого счета из квартиры */}
        {state.kv && state.house?.apartments && (
          <LicsList 
            lics={state.house.apartments.find(apt => apt.apartment === state.kv)?.lics || []} 
            onSelect={handleLicSelect} 
          />
        )}

        {/* Форма ввода ФИО */}
        {state.lc && (
          <div className="s-input mt-1 mr-1 ml-2">
            <IonInput
              className="s-input-1 ml-1 mt-1"
              placeholder="Первые три буквы фамилии"
              value={state.fio}
              maxlength={3}
              onIonInput={(e) => setState({ fio: e.detail.value as string })}
            />
          </div>
        )}

        {/* Сообщение */}
        <div className="ml-1 mr-1 mt-1">
          <p>{state.message}</p>
        </div>

        {/* Кнопка действия */}
        <div className="mt-1 ml-1 mr-1">
          <IonButton
            color="tertiary"
            expand="block"
            mode="ios"
            onClick={handleSubmit}
          >
            {state.lc && state.fio ? "Добавить л/с" : "Закрыть"}
          </IonButton>
        </div>
      </IonCard>
    </>
  );
}

// Компоненты списков
interface UlusListProps {
  uluses: Ulus[];
  onSelect: (ulus: Ulus) => void;
}

function UlusList({ uluses, onSelect }: UlusListProps) {
  return (
    <>
      {uluses.map((ulus, index) => (
        <div key={index} className="ml-05 mr-05">
          <div className="ls-item1" onClick={() => onSelect(ulus)}>
            <div>
              <div className="fs-09 ml-1"><b>{ulus.ulus}</b></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

interface SettlementsListProps {
  settlements: Settlement[];
  onSelect: (settlement: Settlement) => void;
}

function SettlementsList({ settlements, onSelect }: SettlementsListProps) {
  return (
    <>
      {settlements.map((settlement, index) => (
        <div key={index} className="ml-05 mr-05">
          <div className="ls-item1" onClick={() => onSelect(settlement)}>
            <div>
              <div className="fs-09 ml-1"><b>{settlement.settlement}</b></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

interface StreetsListProps {
  streets: Street[];
  onSelect: (street: Street) => void;
}

function StreetsList({ streets, onSelect }: StreetsListProps) {
  return (
    <>
      {streets.map((street, index) => (
        <div key={index} className="ml-05 mr-05">
          <div className="ls-item1" onClick={() => onSelect(street)}>
            <div>
              <div className="fs-09 ml-1"><b>{street.street}</b></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

interface HousesListProps {
  houses: House[];
  onSelect: (house: House) => void;
}

function HousesList({ houses, onSelect }: HousesListProps) {
  return (
    <>
      {houses.map((house, index) => (
        <div key={index} className="ml-05 mr-05">
          <div className="ls-item1" onClick={() => onSelect(house)}>
            <div>
              <div className="fs-09 ml-1"><b>{house.house}</b></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

interface ApartmentsListProps {
  apartments: Apartment[];
  onSelect: (apartment: Apartment) => void;
}

function ApartmentsList({ apartments, onSelect }: ApartmentsListProps) {
  return (
    <>
      {apartments.map((apartment, index) => (
        <div key={index} className="ml-05 mr-05">
          <div className="ls-item1" onClick={() => onSelect(apartment)}>
            <div>
              <div className="fs-09 ml-1"><b>Кв. {apartment.apartment}</b></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

interface LicsListProps {
  lics: Lic[];
  onSelect: (lic: Lic) => void;
}

function LicsList({ lics, onSelect }: LicsListProps) {
  return (
    <>
      {lics.map((lic, index) => (
        <div key={index} className="ml-05 mr-05">
          <div className="ls-item1" onClick={() => onSelect(lic)}>
            <div>
              <div className="fs-09 ml-1"><b>Л/С {lic.code}</b></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export {}