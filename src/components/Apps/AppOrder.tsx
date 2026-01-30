// AppOrder.tsx — редактирование заявки (аналог Order.tsx из Services)
import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import { TService } from '../../Store/serviceStore';
import { FieldData, PageData } from '../DataEditor/types';
import DataEditor from '../DataEditor';

interface AppOrderProps {
  service: TService;
  onSave: (orderData: any) => Promise<void>;
  onBack: () => void;
  onPreview: (order: any) => Promise<any>;
}

export const AppOrder: React.FC<AppOrderProps> = ({ service, onBack, onSave, onPreview }) => {
  const toast = useToast();
  const [orderData, setOrderData] = useState<PageData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [normalizedService, setNormalizedService] = useState<TService | null>(null);

  useEffect(() => {
    if (!service) {
      setNormalizedService(null);
      setOrderData([]);
      setIsLoading(false);
      return;
    }

    // Проверяем наличие chapters
    if (!service.chapters || service.chapters.length === 0) {
      setNormalizedService(null);
      setOrderData([]);
      setIsLoading(false);
      return;
    }

    // Сохраняем нормализованный service
    setNormalizedService(service);

    const chapters = service.chapters;

    const data = chapters.map((chapter) => {
      
      const chapterData = (chapter.data || []).map((field) => {
        return {
          label: field.label,
          type: field.type,
          data: field.value,
          values: field.values,
          validate: field.validate
        } as FieldData;
      });

      const chapterFiles = (chapter.files || []).map((field) => {
        return {
          label: field.label,
          type: 'images',
          data: field.data || [],
          values: [],
          validate: field.validate
        } as FieldData;
      });

      return {
        title: chapter.label,
        data: [...chapterData, ...chapterFiles]
      };
    });

    setOrderData(data);
    setIsLoading(false);
  }, [service]);

  /**
   * Преобразует данные формы обратно в формат для API
   */
  const getOrderData = (data: PageData): any => {
    if (!normalizedService) return {};

    const orderData: { [key: string]: any } = {};
    orderData.Заявка = normalizedService.text;

    data.forEach((chapter, chapterIndex) => {
      chapter.data.forEach((field, fieldIndex) => {
        const originalField = normalizedService.chapters[chapterIndex]?.data?.[fieldIndex];
        if (originalField) {
          orderData[originalField.name] = field.data;
        } else {
          // Проверяем файлы с учетом того, что data может включать и поля и файлы
          const fileIndex = fieldIndex - (normalizedService.chapters[chapterIndex]?.data?.length || 0);
          const originalFile = normalizedService.chapters[chapterIndex]?.files?.[fileIndex];
          if (originalFile) {
            if (orderData.Файлы === undefined) orderData.Файлы = [] as any;
            orderData.Файлы.push({ name: originalFile.name, label: originalFile.label, files: field.data });
          }
        }
      });
    });

    return orderData;
  };

  const handleSave = async (data: PageData) => {
    try {
      console.log("save PageData", data)
      const orderData = getOrderData(data);
      await onSave(orderData);
      onBack();
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Ошибка при сохранении заявки');
    }
  };

  // Добавим отображение загрузки для отладки
  if (isLoading) {
    return <div>Загрузка формы...</div>;
  }

  if (!normalizedService || !normalizedService.chapters || normalizedService.chapters.length === 0 || orderData.length === 0) {
    return <div>Нет данных для отображения формы</div>;
  }

  return (
    <DataEditor
      data        = { orderData }
      onSave      = { handleSave }
      onBack      = { onBack }
      onPreview   = { (data: PageData) => onPreview(getOrderData(data)) }
      title       = { normalizedService.text }
    />
  );
};