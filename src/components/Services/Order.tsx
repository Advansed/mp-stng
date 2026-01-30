// Order.tsx
import React, { useState }                    from 'react';
import { useToast }             from '../Toast';
import { TService }             from '../../Store/serviceStore';
import { FieldData, PageData }  from '../DataEditor/types';
import DataEditor               from '../DataEditor';
import { useProfileData }       from '../Login/authStore';

interface OrderProps {
  service:      TService;
  onSave:       (orderData: any) => Promise<void>;
  onBack:       () => void;
  onPreview:    (order: any) => Promise<any>
}

export const Order: React.FC<OrderProps> = ({ service, onBack, onSave, onPreview }) => {
  const toast         = useToast();
  const profile       = useProfileData();

  /**
   * Получает значение из профиля по имени поля формы
   */
  const getProfileValue = (fieldName: string): any => {
    if (!profile) return null;

    // Нормализуем имя поля для сравнения (нижний регистр, убираем пробелы)
    const normalizedName = fieldName.toLowerCase().trim();

    // Маппинг имен полей формы на поля профиля
    const fieldMapping: { [key: string]: any } = {
      // ФИО
      
      'фио':                profile.surname + ' ' + profile.name + ' ' + profile.lastname,
      'имя':                profile.name,
      'отчество':           profile.lastname,
      'фамилия':            profile.surname,
      'контактныйтелефон':  profile.phone,
      'почта':              profile.email,
      
      // Паспортные данные
      'паспортсерия':       profile.passport?.serial,
      'паспортномер':       profile.passport?.number,
      'паспортдатавыдачи':  profile.passport?.issuedDate,
      'датавыдачипаспорта': profile.passport?.issuedDate,
      'паспорткемвыдан':    profile.passport?.issuedBy,
      'доп6':               profile.passport?.codePodr,
    };

    // Проверяем точное совпадение
    const value = fieldMapping[normalizedName]
    if (value !== undefined) {
      console.log(fieldName, value )
      return value || null;
    }

    // Проверяем частичное совпадение (если имя поля содержит ключевое слово)
    // for (const [key, value] of Object.entries(fieldMapping)) {
    //   if (normalizedName.includes(key) && value) {
    //     return value;
    //   } 
    // }

    console.log(fieldName, undefined )

    return null;
  };

  const getFormData   = (): PageData => {
    if(!service) return []
    if( service.chapters === undefined ) return []
    if ( service.chapters.length === 0 ) return [];

    console.log('service', service)

    const data = service.chapters.map(( chapter ) => ({
      title: chapter.label,
      data: chapter.data?.map(( field ) => {
        // Получаем значение из профиля, если оно есть

        return {
          label:        field.label,
          type:         field.type,
          data:         field.value,
          values:       field.values,    
          validate:     field.validate
        } as FieldData;
      }) || chapter.files?.map(( field ) =>{
        return {
          label:        field.label,
          type:         'images',
          data:         field.data || [],
          values:       [],    
          validate:     field.validate
        } as FieldData
      }) || []
    }));

    console.log('orderData', data)

    return data
  };

  const [ orderData ] = useState<any>( getFormData() )


  const getOrderData  = (data: PageData):any =>{
      const orderData: { [key: string]: any } = {};
      
      orderData.Заявка  = service.text

      data.forEach((chapter, chapterIndex) => {
        chapter.data.forEach((field, fieldIndex) => {
          const originalField = service.chapters[chapterIndex]?.data?.[fieldIndex];
          if (originalField) {
            orderData[originalField.name] = field.data;
          } else {
            const originalFile = service.chapters[chapterIndex]?.files?.[fieldIndex];
            if(originalFile){
              if(orderData.Файлы === undefined) orderData.Файлы = [] as any
              orderData.Файлы.push({name: originalFile.name, label: originalFile.label, files: field.data })
            }
          }
        });
      });

      return orderData
  }

  const handleSave    = async (data: PageData) => {
    try {
      // Собираем все данные из формы
      
      const orderData = getOrderData( data );

      const res = await onSave( orderData );
      
      onBack()

    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Ошибка при отправке заявки');
    }
  };

  if (!service || service.chapters?.length === 0 ) {
    return <></>
  }

  return (
    <DataEditor
      data      = { orderData }
      onSave    = { handleSave }
      onBack    = { onBack }
      onPreview = { ( data: PageData ) => onPreview( getOrderData( data ) ) }
      title     = { service.text }
    />
  );
};