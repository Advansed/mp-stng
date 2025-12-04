import { useState, useCallback } from 'react';
import { FieldData, PageData } from '../types';

interface ValidationErrors {
  [key: string]: string;
}

export const useValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField   = useCallback( (field: FieldData, sectionIndex: number, fieldIndex: number): string | null => {
    if (!field.validate) return null;

    const value = field.data;
    const key = `${sectionIndex}-${fieldIndex}`;

    // Базовая валидация по типам
    switch (field.type) {
      case 'text':
        if (!value?.trim()) return 'Обязательное поле';
        break;
      
      case 'fio':
        if (!value?.trim()) return 'Обязательное поле';
        break;
      
      case 'number':
        if (!value || isNaN(value)) return 'Введите число';
        if (value <= 0) return 'Значение должно быть больше 0';
        break;
      
      case 'city':
        if (!value?.city || !value?.fias) return 'Выберите город';
        break;
      
      case 'address':
        if (!value?.address || !value?.fias) return 'Выберите адрес';
        break;
      
      case 'date':
        if (!value) return 'Выберите дату';
        break;

      case 'check':
        if (!value) return 'Установите галочку';
        break;
      
      case 'image':
        if (!value) return 'Надо добавить фото';
        break;

      case 'images':
        if (value.length === 0) return 'Надо добавить фото';
        break;
      
      case 'rate':
        if (value === 0) return 'Поставьте оценку работы';
        break;
      
      case 'box':
        if (!value) return 'Выберите значение';
        break;

      case 'lics':
        if (!value) return 'Выберите значение';
        break;

      case 'email':
        if (!value?.trim()) return 'Обязательное поле';
        // Простая валидация email
        { 
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value.trim())) return 'Введите корректный email адрес';
        }
        break;

      case 'equip':
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Добавьте хотя бы один прибор учета';
        }
        
        // Проверяем каждый прибор учета
        for (let i = 0; i < value.length; i++) {
          const equipment = value[i];
          if (!equipment.type?.trim() || 
              !equipment.manufacturer?.trim() || 
              !equipment.number?.trim() || 
              !equipment.release_date) {
            return `Прибор учета #${i + 1} имеет незаполненные обязательные поля`;
          }
        }
        break;
    }

    return null;
  }, []);

  const validateAll     = useCallback( (data: PageData): boolean => {
    const newErrors: ValidationErrors = {};
    
    data.forEach((section, sIdx) => {
      section.data.forEach((field, fIdx) => {
        const error = validateField(field, sIdx, fIdx);
        if (error) {
          newErrors[`${sIdx}-${fIdx}`] = error;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField]);

  const clearAll        = useCallback( () => {
    setErrors({});
  }, []);

  const setError        = useCallback( (sectionIndex: number, fieldIndex: number, error: string) => {
    const key = `${sectionIndex}-${fieldIndex}`;
    setErrors(prev => ({ ...prev, [key]: error }));
  }, []);

  return {
    errors,
    validateField,
    validateAll,
    clearAll,
    setError,
    isValid: Object.keys(errors).length === 0
  };
};