// Order.tsx
import React, { useEffect, useState } from 'react';
import { useToast } from '../Toast';
import { TService } from '../../Store/serviceStore';
import { FieldChangeEvent, FieldData, PageData, Section } from '../DataEditor/types';
import DataEditor from '../DataEditor';
import { useProfileData } from '../Login/authStore';
import { useCheckAI } from './useCheckAI';
import { useLicsStore } from '../../Store/licsStore';

interface OrderProps {
  service:      TService;
  onSave:       (orderData: any) => Promise<void>;
  onBack:       () => void;
  onPreview:    (order: any) => Promise<any>
}

export const Order: React.FC<OrderProps> = ({ service, onBack, onSave, onPreview }) => {
  const toast = useToast();
  const profile = useProfileData();
  const lics = useLicsStore();
  const [orderData, setOrderData] = useState<PageData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [normalizedService, setNormalizedService] = useState<TService | null>(null);
  const { checkAI, isAIChecking } = useCheckAI({ service: normalizedService });

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
      return value || null;
    }

    return null;
  };

  useEffect(() => {
    if (!service || !service.chapters?.length) {
      setNormalizedService(null);
      setOrderData([]);
      setIsLoading(false);
      return;
    }

    setNormalizedService(service);
    const data = service.chapters.map((chapter) => {
      const chapterData = (chapter.data || []).map((field) => {
        const fromProfile = getProfileValue(field.label || field.name || '');
        return {
          doc: field.doc,
          name: field.name,
          label: field.label,
          type: field.type,
          data: field.value ?? fromProfile ?? '',
          ai_method: field.ai_method,
          ai_status: undefined,
          values: field.values,
          validate: field.validate,
        } as FieldData;
      });

      const chapterFiles = (chapter.files || []).map((field) => ({
        doc: field.doc,
        name: field.name,
        label: field.label,
        type: 'images',
        data: Array.isArray(field.data) ? field.data : [],
        ai_method: field.ai_method,
        ai_status: field.ai_status,
        values: [],
        validate: field.validate,
      } as FieldData));

      return { title: chapter.label, data: [...chapterData, ...chapterFiles] };
    });

    setOrderData(data);
    setIsLoading(false);
  }, [service, profile]);


  const getOrderData    = (data: PageData): any => {
    if (!normalizedService) return {};
    const next: { [key: string]: any } = {};
    next.Ссылка = normalizedService.id;
    next.Заявка = normalizedService.text;
    next.ai_status = {
      status: false,
      checks: {
        passport_front: null,
        passport_reg: null,
        egrn: null,
        akt: null,
      },
    };

    let ii_pass = false;

    data.forEach((chapter, chapterIndex) => {
      chapter.data.forEach((field, fieldIndex) => {
        const originalField = normalizedService.chapters[chapterIndex]?.data?.[fieldIndex];
        if (originalField) {
          next[originalField.name] = field.data;
          return;
        }

        const fileIndex = fieldIndex - (normalizedService.chapters[chapterIndex]?.data?.length || 0);
        const originalFile = normalizedService.chapters[chapterIndex]?.files?.[fileIndex];
        if (!originalFile) return;

        if (next.Файлы === undefined) next.Файлы = [] as any[];
        const filesArr = Array.isArray(field.data) ? field.data : [];

        const jarr:any = []
            
        filesArr.forEach(elem => {
          const filename = elem.match(/\/stng\/([^?]+)/)[1];
          jarr.push( filename );
        });

        next.Файлы.push({ name: originalFile.name, label: originalFile.label, files: jarr });

        switch (originalFile.name) {
          case 'Passport1':
            next.ai_status.checks.passport_front    = field.ai_status;
            if(field.ai_status.errors.length > 0) ii_pass = true;
            break;
          case 'Passport2':
            next.ai_status.checks.passport_reg      = field.ai_status;
            if(field.ai_status.errors.length > 0) ii_pass = true;
            break;
          case 'EGRN':
            next.ai_status.checks.egrn              = field.ai_status;
            if(field.ai_status.errors.length > 0) ii_pass = true;
            break;
          case 'ActVentCanal':
            next.ai_status.checks.akt               = field.ai_status;
            if(field.ai_status.errors.length > 0) ii_pass = true;
            break;
          default:
            break;
        }

      });
    });

    const aiStatusPayload = (data as any)?.ai_status;
    if (aiStatusPayload && typeof aiStatusPayload === 'object') {
      next.ai_status = {
        ...next.ai_status,
        ...aiStatusPayload,
        checks: {
          ...(next.ai_status?.checks || {}),
          ...((aiStatusPayload as any)?.checks || {}),
        },
      };
    }

    next.ai_status.status = !ii_pass;

    return next;
  }

  const handleSave      = async (data: PageData) => {
    try {
      const payload = getOrderData(data);

      await onSave(payload);
      onBack();

    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Ошибка при отправке заявки');
    }
  };

  const onChange        = (data: Section) => {

    setOrderData((prev) => {
      const sectionIndexFromEditor = (data as any).__sectionIndex;
      const sectionIndex =
        typeof sectionIndexFromEditor === 'number'
          ? sectionIndexFromEditor
          : prev.findIndex((section) => section.title === data.title);
      if (sectionIndex < 0) return prev;

      let nextSection = {
        ...data,
        data: data.data.map((field) => ({ ...field })),
      };

      if (nextSection.title === 'Объект газификации') {

        const selectedLic   = nextSection.data.find((field) => field.type === 'lics')?.data;
        const lic           = lics.lics.find((item) => item.code === selectedLic);
        const licAddress    = lic?.address || '';

        nextSection = {
          ...nextSection,
          data: nextSection.data.map((field) => {
            if (field.type !== 'address') return field;
            const currentAddressObj =
              field.data && typeof field.data === 'object' ? field.data : {};
            return {
              ...field,
              data: {
                ...currentAddressObj,
                address: licAddress,
              },
            };
          })
        }

      }
      const current = prev.map((section, idx) => (idx === sectionIndex ? nextSection : section));
      return current
    });

  };

  const onFieldChange   = (event: FieldChangeEvent) => {
    if (event.source !== 'user') return;
    if (event.field.type !== 'lics') return;
    if (!normalizedService?.chapters?.length) return;

    const chapter = normalizedService.chapters[event.sectionIndex];
    if (!chapter || chapter.label !== 'Объект газификации') return;

    const lic = lics.lics.find((item) => item.code === event.value);
    const licAddress = lic?.address || '';
    const addressIdx = (chapter.data || []).findIndex((item: any) => item.type === 'address');
    if (addressIdx < 0) return;

    setNormalizedService((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: prev.chapters.map((ch, idx) => {
          if (idx !== event.sectionIndex) return ch;
          return {
            ...ch,
            data: (ch.data || []).map((field: any, fIdx: number) => {
              if (fIdx !== addressIdx) return field;
              const currentValue =
                field.value && typeof field.value === 'object' ? field.value : {};
              return {
                ...field,
                value: {
                  ...currentValue,
                  address: licAddress,
                },
              };
            }),
          };
        }),
      };
    });
  };

  if (isLoading) {
    return <div>Загрузка формы...</div>;
  }

  if (!normalizedService || !normalizedService.chapters?.length || orderData.length === 0) {
    return <></>
  }

  return (
    <DataEditor
      data            = { orderData }
      onSave          = { handleSave }
      onBack          = { onBack }
      onPreview       = { (data: PageData) => onPreview(getOrderData(data)) }
      onCheckAI       = { ({ method, objectKey, fileUrl }) => checkAI(method, objectKey) }
      isAIChecking    = { isAIChecking }
      onChange        = { onChange }
      onFieldChange   = { onFieldChange }
      title           = { normalizedService.text }
    />
  );
};