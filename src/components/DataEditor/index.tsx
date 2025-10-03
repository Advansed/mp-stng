import React, { useEffect, useRef, useState }   from 'react';
import { DataEditorProps, FieldData }           from './types';
import { useNavigation }                        from './hooks/useNavigation';
import { useFormState }                         from './hooks/useFormState';
import { TextField }                            from './fields/TextField';
import { NumberField }                          from './fields/NumberField';
import { SelectField }                          from './fields/SelectField';
import { DateField }                            from './fields/DateField';
import { PartyField }                           from './fields/PartyField';
import { WizardHeader }                         from './components/WizardHeader';
import { CityField }                            from './fields/СityField';
import { AddressField }                         from './fields/AddressField';
import { useValidation }                        from './hooks/useValidation';
import { ViewField }                            from './fields/ViewField';
import { ImagesField }                          from './fields/ImagesField';
import './styles.css';
import { ImageField } from './fields/ImageField';
import { CheckField } from './fields/CheckField';
import { RateField } from './fields/RateField';

const DataEditor: React.FC<DataEditorProps> = ({ 
    data, 
    onSave, 
    onBack
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigation = useNavigation(data.length);
  const formState = useFormState(data);
  const { errors, validateField, setError, clearAll } = useValidation();
 

  const [fias, setFias ] = useState('')

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  const handleBackNavigation      = () => {
    if (navigation.currentPage > 0) {
      navigation.prevPage();
      scrollToTop();
    } else {
      onBack();
    }
  };

  const handleForwardNavigation   = () => {
    console.log("go", navigation.canGoNext)
    if (navigation.canGoNext) {
      // Валидация полей текущей страницы
      const currentSection = data[navigation.currentPage];
      let hasErrors = false;
      
      currentSection.data.forEach((field, fIdx) => {
        if (field.validate) {
          const error = validateField(field, navigation.currentPage, fIdx);
          console.log('validate',error)
          if (error) {
            setError(navigation.currentPage, fIdx, error);
            hasErrors = true;
          }
        }
      });
      
      // Переход только если нет ошибок
      if (!hasErrors) {
        clearAll();
        navigation.nextPage();
        scrollToTop();
      }
    }
  };

  const handleSave                = () => {
      const currentSection = data[navigation.currentPage];
      let hasErrors = false;
      
      currentSection.data.forEach((field, fIdx) => {
        if (field.validate) {
          const error = validateField(field, navigation.currentPage, fIdx);
          console.log('validate',error)
          if (error) {
            setError(navigation.currentPage, fIdx, error);
            hasErrors = true;
          }
        }
      });
      
      // Переход только если нет ошибок
      if (!hasErrors) {
        clearAll();
        onSave?.(formState.data)
      }
  }

  const handleClose = () => {
    // Закрытие с отменой - просто возвращаемся назад
    onBack();
  }

  const getPageTitle = () => {
    return (navigation.currentPage + 1) + ' страница из ' +  data.length
  }

  useEffect(()=>{
    console.log(errors)
  },[errors])
  
  const renderField = (field: FieldData, sectionIdx: number, fieldIdx: number) => {
    const update = (value: any) => formState.updateField(sectionIdx, fieldIdx, value);

    const key = `${sectionIdx}-${fieldIdx}`
    
    const props = {
      label:          field.label,
      value:          field.data,
      error:          errors[key],
      onChange:       update
    };

    switch (field.type) {

        case 'view':        return <ViewField       { ...props } />;
        case 'string':      return <TextField       { ...props } />;
        case 'password':    return <TextField       { ...props } type = { "password" }/>;
        case 'number':      return <NumberField     { ...props } />;
        case 'select':      return <SelectField     { ...props } options={field.values || []} />;
        case 'date':        return <DateField       { ...props } />;
        case 'city':        return <CityField       { ...props } onFIAS={ setFias}/>;
        case 'address':     return <AddressField    { ...props } cityFias = { fias } />;
        case 'party':       return <PartyField      { ...props } cityFias = { fias } />;
        case 'image':       return <ImageField      { ...props } />;
        case 'images':      return <ImagesField     { ...props } />;
        case 'check':       return <CheckField      { ...props } />;
        case 'rate':        return <RateField       { ...props } />;

        default:            return null;
    }
  };

  const currentSection = formState.data[navigation.currentPage];
  if (!currentSection) return null;

  const isLastPage = navigation.currentPage === navigation.totalPages - 1;

  return (
    <div className="data-editor-wizard">
      <div className="wizard-content" ref={scrollRef}>
        <WizardHeader
          title         = { currentSection.title }
          pages         = { getPageTitle() }
          onBack        = { handleBackNavigation }
          onForward     = { handleForwardNavigation }
          onClose       = { handleClose } // Изменили onSave на onClose
          isLastStep    = { isLastPage }
          canGoBack     = { true }
          canGoForward  = { navigation.canGoNext }
        />
        
        <div className="step-container">
          <div className="page-content">
            {currentSection.data.map((field, idx) => (
              <div key={idx}>
                {renderField(field, navigation.currentPage, idx)}
              </div>
            ))}
            
            {/* Большая кнопка Сохранить на последней странице */}
            {isLastPage && (
              <div className="save-button-container">
                <button 
                  className="big-save-button" 
                  onClick={handleSave}
                >
                  Сохранить
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataEditor;