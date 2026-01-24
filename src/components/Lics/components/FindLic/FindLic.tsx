// src/components/Lics/FindLic.tsx
import React, { useEffect, useState } from 'react';
import { IonButton, IonCard, IonInput, IonItem, IonLoading } from '@ionic/react';
import { useFindLic, type Ulus, type Settlement, type Street, type House, type Apartment, type Lic } from './useFindLic';
import { AddAccountParams } from '../types';
import { useToast } from '../../../Toast';

interface FindLicProps {
  setPage: (page: number) => void;
}

export const FindLic = ({ setPage }: FindLicProps): JSX.Element => {
  const { state, loadSettlements, loadStreets, loadHouses, addAccount, setState } = useFindLic();

  useEffect(() => {
    if(state.info.length === 0)
      loadSettlements();
  }, []);

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
    setState({ kv: apartment });
  };

  const handleLicSelect = (lic: Lic) => {
    setState({ lc: lic.code || '' });
  };

  const handleSubmit = async () => {
    if ( state.lc ) {
      const res = await addAccount({ LC: state.lc } as AddAccountParams);
      setPage(0);
    } else {
      setPage(0);
    }
  };

  const handleUlusClear = () => {
    setState({ ulus: undefined, naspunkt: undefined, street: undefined, house: undefined, kv : undefined, lc : undefined });
  };

  const handleSettlementClear = () => {
    setState({ naspunkt: undefined, street: undefined, house: undefined, kv : undefined, lc : undefined });
  };

    const handleStreetClear = () => {
    setState({ street: undefined, house: undefined, kv : undefined, lc : undefined });
  };

  const handleHouseClear = () => {
    setState({ house: undefined, kv : undefined, lc : undefined });
  };

  const handleKvClear = () => {
    setState({ kv : undefined, lc : undefined });
  };

  const handlelcClear = () => {
    setState({lc : undefined });
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
        {state.info && (
          <UlusList uluses = { state.info } onSelect={handleUlusSelect}  onClear={ handleUlusClear }/>
        )}

        {/* Выбор населенного пункта */}
        {state.ulus && (
          <SettlementList settlements={state.ulus.settlements} onSelect={handleSettlementSelect}   onClear={ handleSettlementClear } />
        )}

        {/* Выбор улицы */}
        {state.naspunkt && (
          <StreetList streets={state.naspunkt.streets} onSelect={handleStreetSelect}  onClear = { handleStreetClear }/>
        )}

        {/* Выбор дома */}
        {state.street && (
          <HouseList houses={state.street.houses} onSelect={handleHouseSelect} onClear = { handleHouseClear } />
        )}

        {/* Выбор квартиры */}
        {( state.house && state.house.apartments ) && (
          <ApartmentList apartments={state.house.apartments || []} onSelect={handleApartmentSelect}  onClear = { handleKvClear }/>
        )}

        {/* Выбор лицевого счета из дома */}
        {state.house && state.house.lics && (
          <LicList lics = { state.house.lics } onSelect = { handleLicSelect } onClear = { handlelcClear } />
        )}

        {/* Выбор лицевого счета из квартиры */}
        {( state.kv && state.kv?.lics ) && (
          <LicList 
            lics = { state.kv.lics || [] }  
            onSelect={handleLicSelect} onClear = { handlelcClear }
          />
        )}


        {/* Кнопка действия */}
        <div className="mt-1 ml-1 mr-1">
          <IonButton
            color="tertiary"
            expand="block"
            mode="ios"
            onClick={handleSubmit}
          >
            {state.lc ? "Добавить л/с" : "Закрыть"}
          </IonButton>
        </div>
      </IonCard>
    </>
  );
}

// Компоненты Input с выпадающими списками

interface UlusInputProps {
  uluses: Ulus[];
  selectedUlus?: Ulus;
  onSelect: (ulus: Ulus) => void;
  onClear: () => void;
}

const UlusList = ({ uluses, selectedUlus, onSelect, onClear }: UlusInputProps) => {
  const [value, setValue] = useState(selectedUlus?.ulus || "");
  const [focus, setFocus] = useState(false);

  return (
    <>
      <div className="s-input mr-1 pl-1 pr-1 ml-2">
        <IonInput
          className="s-input-1"
          placeholder="Улус (Район)"
          value={value}
          onIonInput={(e) => {
            setValue(e.detail.value as string);
            onClear();
          }}
          onIonFocus={() => setFocus(true)}
          onIonBlur={() => setTimeout(() => setFocus(false), 200)}
        />
      </div>
      {focus && (
        <div className="ml-1 mr-1">
          {uluses.map((ulus, ind) => {
            if (ulus.ulus.toUpperCase().includes(value.toUpperCase())) {
              return (
                <IonItem
                  key={ind}
                  onClick={() => {
                    setValue(ulus.ulus);
                    onSelect(ulus);
                    setFocus(false);
                  }}
                >
                  {ulus.ulus}
                </IonItem>
              );
            }
            return null;
          })}
        </div>
      )}
    </>
  );
};

interface SettlementInputProps {
  settlements: Settlement[];
  selectedSettlement?: Settlement;
  onSelect: (settlement: Settlement) => void;
  onClear: () => void;
}

const SettlementList = ({ settlements, selectedSettlement, onSelect, onClear }: SettlementInputProps) => {
  const [value, setValue] = useState(selectedSettlement?.settlement || "");
  const [focus, setFocus] = useState(false);

  return (
    <>
      <div className="s-input mr-1 pl-1 pr-1 ml-2 mt-1">
        <IonInput
          className="s-input-1"
          placeholder="Населенный пункт"
          value={value}
          onIonInput={(e) => {
            setValue(e.detail.value as string);
            onClear();
          }}
          onIonFocus={() => setFocus(true)}
          onIonBlur={() => setTimeout(() => setFocus(false), 200)}
        />
      </div>
      {focus && (
        <div className="ml-1 mr-1">
          {settlements.map((settlement, ind) => {
            if (settlement.settlement.toUpperCase().includes(value.toUpperCase())) {
              return (
                <IonItem
                  key={ind}
                  onClick={() => {
                    setValue(settlement.settlement);
                    onSelect(settlement);
                    setFocus(false);
                  }}
                >
                  {settlement.settlement}
                </IonItem>
              );
            }
            return null;
          })}
        </div>
      )}
    </>
  );
};

interface StreetInputProps {
  streets: Street[];
  selectedStreet?: Street;
  onSelect: (street: Street) => void;
  onClear: () => void;
}

const StreetList = ({ streets, selectedStreet, onSelect, onClear }: StreetInputProps) => {
  const [value, setValue] = useState(selectedStreet?.street || "");
  const [focus, setFocus] = useState(false);

  return (
    <>
      <div className="s-input mr-1 pl-1 pr-1 ml-2 mt-1">
        <IonInput
          className="s-input-1"
          placeholder="Улица"
          value={value}
          onIonInput={(e) => {
            setValue(e.detail.value as string);
            onClear();
          }}
          onIonFocus={() => setFocus(true)}
          onIonBlur={() => setTimeout(() => setFocus(false), 200)}
        />
      </div>
      {focus && (
        <div className="ml-1 mr-1">
          {streets.map((street, ind) => {
            if (street.street.toUpperCase().includes(value.toUpperCase())) {
              return (
                <IonItem
                  key={ind}
                  onClick={() => {
                    setValue(street.street);
                    onSelect(street);
                    setFocus(false);
                  }}
                >
                  {street.street}
                </IonItem>
              );
            }
            return null;
          })}
        </div>
      )}
    </>
  );
};

interface HouseInputProps {
  houses: House[];
  selectedHouse?: House;
  onSelect: (house: House) => void;
  onClear: () => void;
}

const HouseList = ({ houses, selectedHouse, onSelect, onClear }: HouseInputProps) => {
  const [value, setValue] = useState(selectedHouse?.house || "");
  const [focus, setFocus] = useState(false);

  return (
    <>
      <div className="s-input mr-1 pl-1 pr-1 ml-2 mt-1">
        <IonInput
          className="s-input-1"
          placeholder="Дом"
          value={value}
          onIonInput={(e) => {
            setValue(e.detail.value as string);
            onClear();
          }}
          onIonFocus={() => setFocus(true)}
          onIonBlur={() => setTimeout(() => setFocus(false), 200)}
        />
      </div>
      {focus && (
        <div className="ml-1 mr-1">
          {houses.map((house, ind) => {
            if (house.house.toUpperCase().includes(value.toUpperCase())) {
              return (
                <IonItem
                  key={ind}
                  onClick={() => {
                    setValue(house.house);
                    onSelect(house);
                    setFocus(false);
                  }}
                >
                  {house.house}
                </IonItem>
              );
            }
            return null;
          })}
        </div>
      )}
    </>
  );
};

interface ApartmentInputProps {
  apartments: Apartment[];
  selectedApartment?: string;
  onSelect: (apartment: Apartment) => void;
  onClear: () => void;
}

const ApartmentList = ({ apartments, selectedApartment, onSelect, onClear }: ApartmentInputProps) => {
  const [value, setValue] = useState(selectedApartment || "");
  const [focus, setFocus] = useState(false);

  return (
    <>
      <div className="s-input mr-1 pl-1 pr-1 ml-2 mt-1">
        <IonInput
          className="s-input-1"
          placeholder="Квартира"
          value={value}
          onIonInput={(e) => {
            setValue(e.detail.value as string);
            onClear();
          }}
          onIonFocus={() => setFocus(true)}
          onIonBlur={() => setTimeout(() => setFocus(false), 200)}
        />
      </div>
      {focus && (
        <div className="ml-1 mr-1">
          {apartments.map((apartment, ind) => {
            if (apartment.apartment.toUpperCase().includes(value.toUpperCase())) {
              return (
                <IonItem
                  key={ind}
                  onClick={() => {
                    setValue(apartment.apartment);
                    onSelect(apartment);
                    setFocus(false);
                  }}
                >
                  Кв. {apartment.apartment}
                </IonItem>
              );
            }
            return null;
          })}
        </div>
      )}
    </>
  );
};

interface LicInputProps {
  lics: Lic[];
  selectedLic?: string;
  onSelect: (lic: Lic) => void;
  onClear: () => void;
}

const LicList = ({ lics, selectedLic, onSelect, onClear }: LicInputProps) => {
  const [value, setValue] = useState(selectedLic || "");
  const [focus, setFocus] = useState(false);

  return (
    <>
      <div className="s-input mr-1 pl-1 pr-1 ml-2 mt-1">
        <IonInput
          className="s-input-1"
          placeholder="Лицевой счет"
          value={value}
          onIonInput={(e) => {
            setValue(e.detail.value as string);
            onClear();
          }}
          onIonFocus={() => setFocus(true)}
          onIonBlur={() => setTimeout(() => setFocus(false), 200)}
        />
      </div>
      {focus && (
        <div className="ml-1 mr-1">
          {lics.map((lic, ind) => {
            if (lic.code.toUpperCase().includes(value.toUpperCase())) {
              return (
                <IonItem
                  key={ind}
                  onClick={() => {
                    setValue(lic.code);
                    onSelect(lic);
                    setFocus(false);
                  }}
                >
                  Л/С {lic.code}
                </IonItem>
              );
            }
            return null;
          })}
        </div>
      )}
    </>
  );
};