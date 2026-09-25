import { useState, useCallback } from 'react';
import { FieldData, PageData, ValidationRule } from '../types';
import { snilsValidationError } from '../fields/snils';
import { passNumberValidationError, seriesValidationError } from '../fields/passport';

interface ValidationErrors {
  [key: string]: string;
}

function fieldText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (value == null) return '';
  return String(value).trim();
}

function findFieldByName(pageData: PageData, name: string): FieldData | undefined {
  for (const section of pageData) {
    const found = section.data.find((item) => item.name === name);
    if (found) return found;
  }
  return undefined;
}

function ruleMatches(rule: ValidationRule, sourceValue: unknown): boolean {
  const current = fieldText(sourceValue);
  if (rule.operator === 'eq') {
    return !Array.isArray(rule.value) && current === fieldText(rule.value);
  }
  if (rule.operator === 'in') {
    const list = Array.isArray(rule.value) ? rule.value : [rule.value];
    return list.some((item) => fieldText(item) === current);
  }
  return false;
}

export function isFieldRequired(field: FieldData, pageData: PageData): boolean {
  const rule = field.validation_rule;
  if (!rule || !rule.field) return field.validate;

  const source = findFieldByName(pageData, rule.field);
  if (!source) return field.validate;
  if (ruleMatches(rule, source.data)) return true;
  return field.validate;
}

export const useValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField   = useCallback( (field: FieldData, sectionIndex: number, fieldIndex: number, pageData?: PageData): string | null => {
    const required = pageData ? isFieldRequired(field, pageData) : field.validate;
    if (!required) return null;

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
        if (field.upload_later?.later) break;
        if (!value) return 'Надо добавить фото';
        break;

      case 'images':
        if (field.upload_later?.later) break;
        if (!value || value.length === 0) return 'Надо добавить фото';
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

      case 'snils':
        return snilsValidationError(typeof value === 'string' ? value : '', true);

      case 'series':
        return seriesValidationError(typeof value === 'string' ? value : '', true);

      case 'pass_number':
        return passNumberValidationError(typeof value === 'string' ? value : '', true);

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
        const error = validateField(field, sIdx, fIdx, data);
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

  const clearError      = useCallback( (sectionIndex: number, fieldIndex: number) => {
    const key = `${sectionIndex}-${fieldIndex}`;
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return {
    errors,
    validateField,
    validateAll,
    clearAll,
    setError,
    clearError,
    isValid: Object.keys(errors).length === 0
  };
};