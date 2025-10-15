// Order.tsx
import React                    from 'react';
import { useToast }             from '../Toast';
import { TService }             from '../../Store/serviceStore';
import { FieldData, PageData }  from '../DataEditor/types';
import DataEditor               from '../DataEditor';

interface OrderProps {
  service:      TService;
  onSave:       (orderData: any) => Promise<void>;
  onBack:       () => void;
  onPreview:    (order: any) => Promise<any>
}

export const Order: React.FC<OrderProps> = ({ service, onBack, onSave, onPreview }) => {
  const toast         = useToast();

  const getFormData   = (): PageData => {
    if(!service) return []
    if( service.chapters === undefined ) return []
    if ( service.chapters.length === 0 ) return [];

    const data = service.chapters.map(( chapter ) => ({
      title: chapter.label,
      data: chapter.data?.map(( field ) => {
        return {
          label:    field.label,
          type:     field.type,
          data:     field.value || '',
          values:   field.values,    
          validate: field.validate
        } as FieldData;
      }) || chapter.files?.map(( field ) =>{
        return {
          label:    field.label,
          type:     'images',
          data:     field.data || [],
          values:   [],    
          validate: field.validate
        } as FieldData
      }) || []
    }));
    console.log("formdata", data)
    return data
  };

  const getOrderData  = (data: PageData):any =>{
      const orderData: { [key: string]: any } = {};
      
      orderData.Заявка  = service.text

      data.forEach((chapter, chapterIndex) => {
        chapter.data.forEach((field, fieldIndex) => {
          const originalField = service.chapters[chapterIndex]?.data?.[fieldIndex];
          if (originalField) {
            orderData[originalField.name] = field.data;
            console.log( field.data)
          } else {
            const originalFile = service.chapters[chapterIndex]?.files?.[fieldIndex];
            if(originalFile){
              if(orderData.Файлы === undefined) orderData.Файлы = [] as any
              orderData.Файлы.push({name: originalFile.name, label: originalFile.label, files: field.data })
              console.log( field.data)
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
      console.log("ordersave ", res)
      
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
      data      = { getFormData() }
      onSave    = { handleSave }
      onBack    = { onBack }
      onPreview = { ( data: PageData ) => onPreview( getOrderData( data ) ) }
      title     = { service.text }
    />
  );
};