import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import DataEditor from './index';

jest.mock('./hooks/useHydrateDraftFiles', () => ({ useHydrateDraftFiles: () => {} }));
jest.mock('./fields/TextField', () => ({ TextField: () => <div>Поле заявки</div> }));
jest.mock('./components/WizardHeader', () => ({ WizardHeader: ({onClose}: any) => <button onClick={onClose}>Закрыть</button> }));
beforeAll(() => { HTMLElement.prototype.scrollTo = jest.fn(); });
const field = { name: 'Фамилия', label: 'Фамилия', type: 'text', data: '', validate: true };
const pages = [{ title: 'Данные', data: [field] }];
test('draft saves incomplete data; submit validates instead', async () => {
 const draft=jest.fn().mockResolvedValue(undefined),submit=jest.fn();
 render(<DataEditor data={pages as any} onSave={submit} onSaveDraft={draft} saveLabel="Отправить заявку" onBack={()=>{}} onPreview={async()=>null} />);
 fireEvent.click(screen.getByText('Отправить заявку'));expect(submit).not.toHaveBeenCalled();
 fireEvent.click(screen.getByText('Сохранить черновик'));
 await waitFor(()=>expect(draft).toHaveBeenCalledTimes(1));expect(submit).not.toHaveBeenCalled();
});
test('pending final request cannot be double clicked or closed', async () => {
 let finish: (()=>void) | undefined;
 const submit=jest.fn(()=>new Promise<void>(resolve=>{finish=resolve})),back=jest.fn();
 render(<DataEditor data={[{title:'Данные',data:[{...field,data:'СИНТЕТИЧЕСКИЙ'}]}] as any} onSave={submit} saveLabel="Отправить заявку" onBack={back} onPreview={async()=>null} />);
 fireEvent.click(screen.getByText('Отправить заявку'));fireEvent.click(screen.getByText('Сохранение…'));fireEvent.click(screen.getByText('Закрыть'));
 expect(submit).toHaveBeenCalledTimes(1);expect(back).not.toHaveBeenCalled();finish?.();
 await waitFor(()=>expect(screen.getByText('Отправить заявку')).not.toBeDisabled());
});

jest.mock('./fields/NumberField', () => ({ NumberField: () => null }));
jest.mock('./fields/SelectField', () => ({ SelectField: () => null }));
jest.mock('./fields/DateField', () => ({ DateField: () => null }));
jest.mock('./fields/PartyField', () => ({ PartyField: () => null }));
jest.mock('./fields/СityField', () => ({ CityField: () => null }));
jest.mock('./fields/AddressField', () => ({ AddressField: () => null }));
jest.mock('./fields/ViewField', () => ({ ViewField: () => null }));
jest.mock('./fields/ImageField', () => ({ ImageField: () => null }));
jest.mock('./fields/ImagesField', () => ({ ImagesField: () => null }));
jest.mock('./fields/CheckField', () => ({ CheckField: () => null }));
jest.mock('./fields/RateField', () => ({ RateField: () => null }));
jest.mock('./fields/FIOField', () => ({ FioField: () => null }));
jest.mock('./fields/PreviewField', () => ({ PreviewField: () => null }));
jest.mock('./fields/SignField', () => ({ SignField: () => null }));
jest.mock('./fields/Equip', () => ({ EquipField: () => null }));
jest.mock('./fields/EmailField', () => ({ EmailField: () => null }));
jest.mock('./fields/SnilsField', () => ({ SnilsField: () => null }));
jest.mock('./fields/SeriesField', () => ({ SeriesField: () => null }));
jest.mock('./fields/PassNumberField', () => ({ PassNumberField: () => null }));
jest.mock('./fields/PassportFront', () => ({ PassportFront: () => null }));
jest.mock('@ionic/react', () => ({ IonLoading: () => null }));
jest.mock('../../Store/api', () => ({ api: jest.fn(() => { throw new Error('NETWORK_FORBIDDEN_IN_TEST'); }) }));
