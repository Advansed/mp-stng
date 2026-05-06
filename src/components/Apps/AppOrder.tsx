// AppOrder.tsx — редактирование заявки (аналог Order.tsx из Services)
import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import { TService } from '../../Store/serviceStore';
import useAppsStore from '../../Store/appStore';
import { FieldChangeEvent, FieldData, PageData, Section } from '../DataEditor/types';
import DataEditor from '../DataEditor';
import { useLicsStore } from '../../Store/licsStore';
import { useCheckAI } from './useCheckAI';

interface AppOrderProps {
  onSave: (orderData: any) => Promise<void>;
  onBack: () => void;
  onPreview: (order: any) => Promise<any>;
}

export const AppOrder: React.FC<AppOrderProps> = ({ onBack, onSave, onPreview }) => {
  const toast     = useToast();
  const app       = useAppsStore((s) => s.app);
  const setApp    = useAppsStore((s) => s.setApp);
  const { checkAI, isAIChecking } = useCheckAI();

  
  const service   = app?.service;

  const lics      = useLicsStore();

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
          doc:          field.doc,
          label:        field.label,
          type:         field.type,
          data:         field.value,
          ai_method:    field.ai_method,
          ai_status:    field.ai_status,
          values:       field.values,
          validate:     field.validate
        } as FieldData;
      });

      const chapterFiles = (chapter.files || []).map((field) => {
        return {
          doc:          field.doc,
          name:         field.name,
          label:        field.label,
          type:         'images',
          data:         field.data || [],
          ai_method:    field.ai_method,
          ai_status:    field.ai_status,
          values:       [],
          validate:     field.validate
        } as FieldData;
      });

      return {
        title: chapter.label,
        data: [...chapterData, ...chapterFiles]
      };
    });

    setOrderData(data);
    setIsLoading(false);
  }, [service, app?.id]);

  /**
   * Преобразует данные формы обратно в формат для API
   */
  const getOrderData    = (data: PageData): any => {
    if (!normalizedService) return {};

    const orderData: { [key: string]: any } = {};
    let ii_pass = false;
    orderData.Заявка = normalizedService.text;
    orderData.ai_status = {
      id:                 app?.id || "",
      status:             false,
      checks: {
        passport_front:   null,
        passport_reg:     null,
        egrn:             null,
        akt:              null
      }
    }

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
            
            const jarr:any = []
            
            field.data.forEach(elem => {
              const filename = elem.match(/\/stng\/([^?]+)/)[1];
              jarr.push( filename );
            });

            orderData.Файлы.push({ name: originalFile.name, label: originalFile.label, files: jarr });

            switch(originalFile.name) {
              case "Passport1":
                orderData.ai_status.checks.passport_front   = field.ai_status
                if ((field.ai_status?.errors || []).length > 0) ii_pass = true
                break
              case "Passport2":
                orderData.ai_status.checks.passport_reg     = field.ai_status
                if ((field.ai_status?.errors || []).length > 0) ii_pass = true
                break
              case "EGRN":
                orderData.ai_status.checks.egrn             = field.ai_status
                if ((field.ai_status?.errors || []).length > 0) ii_pass = true
                break
              case "ActVentCanal":
                orderData.ai_status.checks.akt              = field.ai_status
                if ((field.ai_status?.errors || []).length > 0) ii_pass = true
                break
            }
          }
        }
      });
    });

    const aiStatusPayload = (data as any)?.ai_status
    if (aiStatusPayload && typeof aiStatusPayload === 'object') {
      orderData.ai_status = {
        ...orderData.ai_status,
        ...aiStatusPayload,
        checks: {
          ...(orderData.ai_status?.checks || {}),
          ...((aiStatusPayload as any)?.checks || {}),
        },
      }
    }

    orderData.ai_status.status = !ii_pass

    return orderData;
  };

  const handleSave      = async (data: PageData) => {
    try {
      console.log("save PageData", data)
      const orderData = getOrderData(data);
      console.log("orderData", orderData)
      await onSave(orderData);
      onBack();
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Ошибка при сохранении заявки');
    }
  };

  const onChange        = (data: Section) => {
    setOrderData((prev) => {
      const sectionIndexFromEditor = (data as any).__sectionIndex
      const sectionIndex =
        typeof sectionIndexFromEditor === 'number'
          ? sectionIndexFromEditor
          : prev.findIndex((section) => section.title === data.title)
      if (sectionIndex < 0) return prev

      let nextSection = {
        ...data,
        data: data.data.map((field) => ({ ...field })),
      }

      if (nextSection.title === "Объект газификации") {
        const selectedLic = nextSection.data.find((field) => field.type === "lics")?.data
        const lic = lics.lics.find((item) => item.code === selectedLic)
        const licAddress  = lic?.address || ""

        nextSection = {
          ...nextSection,
          data: nextSection.data.map((field) => {
            if (field.type !== "address") return field
            const currentAddressObj =
              field.data && typeof field.data === "object" ? field.data : {}
            return {
              ...field,
              data: {
                ...currentAddressObj,
                address: licAddress,
              },
            }
          }),
        }
      }

      return prev.map((section, idx) => (idx === sectionIndex ? nextSection : section))
    })
  }

  const onFieldChange   = (event: FieldChangeEvent) => {
    if (event.source !== 'user') return
    if (event.field.type !== 'lics') return

    const appNow = useAppsStore.getState().app
    if (!appNow?.service?.chapters?.length) return

    const chapter = appNow.service.chapters[event.sectionIndex]
    if (!chapter || chapter.label !== "Объект газификации") return

    const lic = lics.lics.find((item) => item.code === event.value)
    const licAddress = lic?.address || ""
    const addressIdx = (chapter.data || []).findIndex((item: any) => item.type === "address")
    if (addressIdx < 0) return

    const chaptersNext = appNow.service.chapters.map((ch: any, idx: number) => {
      if (idx !== event.sectionIndex) return ch
      return {
        ...ch,
        data: (ch.data || []).map((field: any, fIdx: number) => {
          if (fIdx !== addressIdx) return field
          const currentValue =
            field.value && typeof field.value === "object" ? field.value : {}
          return {
            ...field,
            value: {
              ...currentValue,
              address: licAddress,
            },
          }
        }),
      }
    })

    setApp({
      ...appNow,
      service: {
        ...appNow.service,
        chapters: chaptersNext,
      },
    })
  }

  // Добавим отображение загрузки для отладки
  if (isLoading) {
    return <div>Загрузка формы...</div>;
  }

  if (!normalizedService || !normalizedService.chapters || normalizedService.chapters.length === 0 || orderData.length === 0) {
    return <div>Нет данных для отображения формы</div>;
  }

  return (
    <DataEditor
      data            = { orderData }
      onSave          = { handleSave }
      onBack          = { onBack }
      onPreview       = { (data: PageData) => onPreview(getOrderData(data)) }
      onCheckAI       = { ({ method, objectKey, fileUrl }) => checkAI(method, objectKey, fileUrl) }
      isAIChecking    = { isAIChecking }
      onChange        = { onChange }
      onFieldChange   = { onFieldChange }
      title           = { normalizedService.text }
    />
  );
};