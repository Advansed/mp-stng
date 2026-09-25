import { useState, useEffect } from 'react';
import { FieldData, PageData } from '../types';

export const useFormState = (initialData: PageData) => {
  const [data, setData] = useState<PageData>(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const updateField = (sectionIndex: number, fieldIndex: number, value: any) => {
    const newData = [...data];
    if (newData[sectionIndex]?.data[fieldIndex]) {
      newData[sectionIndex].data[fieldIndex].data = value;
      setData(newData);
    }
  };

  const updateAiStatus = (sectionIndex: number, fieldIndex: number, aiStatus: any) => {
    const newData = [...data];
    if (newData[sectionIndex]?.data[fieldIndex]) {
      newData[sectionIndex].data[fieldIndex].ai_status = aiStatus;
      setData(newData);
    }
  };

  const updateUploadLater = (sectionIndex: number, fieldIndex: number, later: boolean) => {
    const newData = [...data];
    const field = newData[sectionIndex]?.data[fieldIndex];
    if (field) {
      field.upload_later = { ...field.upload_later, later };
      setData(newData);
    }
  };

  const replaceSectionData = (sectionIndex: number, fields: FieldData[]) => {
    setData((prev) =>
      prev.map((section, idx) =>
        idx === sectionIndex ? { ...section, data: fields } : section
      )
    );
  };

  return { data, updateField, updateAiStatus, updateUploadLater, replaceSectionData };
};
