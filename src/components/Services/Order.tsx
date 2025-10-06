// Order.tsx
import React                                from 'react';
import { useToast }                         from '../Toast';
import { TService, useServiceStore }        from '../../Store/serviceStore';
import { FieldData, PageData }              from '../DataEditor/types';
import DataEditor                           from '../DataEditor';

interface OrderProps {
  service:   TService;
  onSave: (orderData: any) => void;
  onBack: () => void;
}

export const Order: React.FC<OrderProps> = ({ service, onBack, onSave }) => {
  const toast = useToast();
  const getFormData = (): PageData => {
    if (!service || service.chapters.length === 0 ) {
      return [];
    }

    const data = service.chapters.map((chapter, chapterIndex) => ({
      title: chapter.label,
      data: chapter.data?.map((field, fieldIndex) => {
        return {
          label:    field.label,
          type:     field.type,
          data:     field.value || '',
          values:   field.values,    
          validate: field.validate
        } as FieldData;
      }) || []
    }));
    console.log("formdata", data)
    return data
  };

  const handleSave = async (data: PageData) => {
    try {
      // Собираем все данные из формы
      const orderData: { [key: string]: any } = {};
      
      data.forEach((chapter, chapterIndex) => {
        chapter.data.forEach((field, fieldIndex) => {
          const originalField = service.chapters[chapterIndex]?.data?.[fieldIndex];
          if (originalField) {
            orderData[originalField.name] = field.data;
            console.log( field.data)
          }
        });
      });


      await onSave( orderData );
      
      onBack()

      toast.success('Заявка успешно отправлена');

    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Ошибка при отправке заявки');
    }
  };

  if (!service || service.chapters.length === 0 ) {
    return <></>
  }

  return (
    <DataEditor
      data      = { getFormData() }
      onSave    = { handleSave }
      onBack    = { onBack }
      title     = { service.text }
    />
  );
};