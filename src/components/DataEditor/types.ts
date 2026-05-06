export interface CityData {
  city: string;
  fias: string;
}

export interface AddressData {
  address: string;
  fias: string;
  lat: string;
  lon: string;
}

export interface EquipData {
  type: string;
  manufacturer: string;
  number: string;
  plomb: string;
  release_date: string;
}

export interface FieldData {
  doc?:       string;
  name?:      string;
  label:      string;
  type:       'preview' |  'text' | 'number' | 'select' | 'date' | 'boolean' | 'city' | 'address' | 'view' | 'party' | 'images' | 'image' 
                | 'password' | 'check' | 'rate' | 'fio' | 'lics' | 'box' | 'textarea' | 'fio' | 'sign' | 'equip' | 'email' | "pass_front";
  values?:    string[] | null;
  ai_method?: string;
  ai_status?: any;
  validate:   boolean;
  data:       any; 
}

export interface Section {
  title:  string;
  data:   FieldData[];
}

export type PageData = Section[];

export type FieldChangeSource = 'user' | 'ai' | 'system';

export interface FieldChangeEvent {
  sectionIndex: number;
  fieldIndex: number;
  field: FieldData;
  value: any;
  prevValue: any;
  source: FieldChangeSource;
}


export interface DataEditorProps {
  data:         PageData;
  onSave?:      (data: PageData) => void;
  onChange?:    (data: Section) => void;
  onFieldChange?: (event: FieldChangeEvent) => void;
  onBack:       () => void;
  onPreview:    (data: PageData) => Promise<any>;
  /** checkAI через useCheckAI: API + сверка полей анкеты, ответ уже с errors в checks */
  onCheckAI?:   (args: { method: string; objectKey: string; fileUrl: string }) => Promise<any>;
  isAIChecking?: boolean;
  title?:       string;
}
