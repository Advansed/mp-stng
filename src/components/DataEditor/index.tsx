import React, { useRef, useState } from 'react';
import { DataEditorProps, FieldData } from './types';
import { useNavigation } from './hooks/useNavigation';
import { useFormState } from './hooks/useFormState';
import { TextField } from './fields/TextField';
import { NumberField } from './fields/NumberField';
import { SelectField } from './fields/SelectField';
import { DateField } from './fields/DateField';
import { PartyField } from './fields/PartyField';
import { WizardHeader } from './components/WizardHeader';
import { CityField } from './fields/СityField';
import { AddressField } from './fields/AddressField';
import { useValidation } from './hooks/useValidation';
import { ViewField } from './fields/ViewField';
import { ImageField } from './fields/ImageField';
import { ImagesField } from './fields/ImagesField';
import { CheckField } from './fields/CheckField';
import { RateField } from './fields/RateField';
import { useLicsStore } from '../../Store/licsStore';
import { FioField } from './fields/FIOField';
import { IonLoading } from '@ionic/react';
import { PreviewField } from './fields/PreviewField';
import { SignField } from './fields/SignField';
import { EquipField } from './fields/Equip';
import { EmailField } from './fields/EmailField';
import useAppsStore from '../../Store/appStore';
import type { AiPassportImageResult } from '../../Store/appStore';
import {
  extractAiInboundFromCheckResponse,
  galleryUrlsFromUnknown,
  normalizeAiMethodKey,
  normalizeAiResultsArray,
  remapGalleryAiToUrlList,
  shouldInvalidateAiStatusOnFieldChange,
} from '../../utils/aiRequisites';

import './styles.css';
import { PassportFront } from './fields/PassportFront';

const DataEditor: React.FC<DataEditorProps> = ({
  data,
  onSave,
  onBack,
  onPreview,
  onCheckAI,
  isAIChecking,
  onFieldChange,
  onChange,
}) => {
  const scrollRef                    = useRef<HTMLDivElement>(null);
  const navigation                   = useNavigation(data.length);
  const formState                    = useFormState(data);

  const [loading, setLoading]        = useState(false);

  const { errors, validateField
      , setError, clearAll }         = useValidation();

  const lics                         = useLicsStore(state => state.lics)
  const app                          = useAppsStore((state) => state.app)
  const setApp                       = useAppsStore((state) => state.setApp)

  const [fias, setFias]              = useState('')

  const scrollToTop                  = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  const handleBackNavigation         = () => {
    if (navigation.currentPage > 0) {
      navigation.prevPage();
      scrollToTop();
    } else {
      onBack();
    }
  };

  const handleForwardNavigation      = () => {
    if (navigation.canGoNext) {
      // Валидация полей текущей страницы
      const currentSection = data[navigation.currentPage];
      let hasErrors = false;

      currentSection.data.forEach((field, fIdx) => {
        if (field.validate) {
          const error = validateField(field, navigation.currentPage, fIdx);
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

  const handleSave                   = () => {

    const currentSection = data[navigation.currentPage];
    let hasErrors = false;

    currentSection.data.forEach((field, fIdx) => {
      if (field.validate) {
        const error = validateField(field, navigation.currentPage, fIdx);
        if (error) {
          setError(navigation.currentPage, fIdx, error);
          hasErrors = true;
        }
      }
    });

    // Переход только если нет ошибок
    if (!hasErrors) {
      clearAll();
      const orderData = [...formState.data] as typeof formState.data & { ai_status?: any }
      orderData.ai_status = buildAiStatusPayload()
      onSave?.(orderData as any)
    }
  }

  const handlePreview                = async () => {

    setLoading(true)

    const currentSection = data[navigation.currentPage];
    let hasErrors = false;

    currentSection.data.forEach((field, fIdx) => {
      if (field.validate) {
        const error = validateField(field, navigation.currentPage, fIdx);
        if (error) {
          setError(navigation.currentPage, fIdx, error);
          hasErrors = true;
        }
      }
    });

    // Переход только если нет ошибок
    if (!hasErrors) {
      clearAll();
      setLoading(false)
      return onPreview(formState.data)
    } else {
      setLoading(true)
      return undefined
    }


  }

  const handleClose                  = () => {
    // Закрытие с отменой - просто возвращаемся назад
    onBack();
  }

  const getPageTitle                 = () => {
    return (navigation.currentPage + 1) + ' страница из ' + data.length
  }

  const getLics                      = () => {
    return lics.map((e) => { return e.code })
  }

  const parsePossibleObject          = (value: unknown): Record<string, any> | null => {
    if (!value) return null
    if (typeof value === 'object') return value as Record<string, any>
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (parsed && typeof parsed === 'object') return parsed as Record<string, any>
      } catch {
        return null
      }
    }
    return null
  }

  const pickByUrlResult              = (raw: Record<string, any>): AiPassportImageResult | null => {
    const byUrl = raw.byUrl
    if (!byUrl || typeof byUrl !== 'object') return null
    const first = Object.values(byUrl)[0]
    if (!first || typeof first !== 'object') return null
    return first as AiPassportImageResult
  }

  const errorsForChecksPayload       = (
    raw: Record<string, any>,
    byUrlRes: AiPassportImageResult | null
  ): AiPassportImageResult['errors'] | undefined => {
    if (Array.isArray(raw.errors)) return raw.errors
    if (byUrlRes && Array.isArray(byUrlRes.errors)) return byUrlRes.errors
    return undefined
  }

  const hasErrorForChecksPayload     = (
    raw: Record<string, any>,
    byUrlRes: AiPassportImageResult | null,
    errs: AiPassportImageResult['errors'] | undefined
  ): boolean | undefined => {
    if (typeof raw.has_error === 'boolean') return raw.has_error
    if (byUrlRes && typeof byUrlRes.has_error === 'boolean') return byUrlRes.has_error
    if (Array.isArray(errs)) return errs.length > 0
    return undefined
  }

  const normalizeCheckByMethod       = (method: string, rawInput: unknown): Record<string, any> | null => {
    const raw = parsePossibleObject(rawInput)
    if (!raw) return null

    const byUrlRes = pickByUrlResult(raw)
    const data = byUrlRes?.data || parsePossibleObject(raw.data) || parsePossibleObject(raw.merged) || undefined
    const errs = errorsForChecksPayload(raw, byUrlRes)
    const hasErr = hasErrorForChecksPayload(raw, byUrlRes, errs)
    const withExtras = {
      ...(errs !== undefined ? { errors: errs } : {}),
      ...(typeof hasErr === 'boolean' ? { has_error: hasErr } : {}),
    }

    if (method === 'passport_front') {
      const isPassport =
        typeof byUrlRes?.is_passport === 'boolean'
          ? byUrlRes.is_passport
          : typeof raw.is_passport === 'boolean'
            ? raw.is_passport
            : undefined
      return { is_passport: isPassport, data, ...withExtras }
    }

    if (method === 'passport_reg') {
      const isPropiska =
        typeof byUrlRes?.is_propiska === 'boolean'
          ? byUrlRes.is_propiska
          : typeof raw.is_propiska === 'boolean'
            ? raw.is_propiska
            : undefined
      return { is_propiska: isPropiska, data, ...withExtras }
    }

    if (method === 'egrn') {
      const isEgrn =
        typeof (byUrlRes as any)?.is_egrn === 'boolean'
          ? (byUrlRes as any).is_egrn
          : typeof raw.is_egrn === 'boolean'
            ? raw.is_egrn
            : undefined
      return { is_egrn: isEgrn, data, ...withExtras }
    }

    if (method === 'akt' || method === 'Ventkanal' || method === 'ventkanal') {
      const isAkt =
        typeof (byUrlRes as any)?.is_akt === 'boolean'
          ? (byUrlRes as any).is_akt
          : typeof raw.is_akt === 'boolean'
            ? raw.is_akt
            : undefined
      return { is_akt: isAkt, data, ...withExtras }
    }

    return null
  }

  const buildAiStatusPayload         = (): { id?: string; status: boolean; checks: Record<string, any> } => {
    const checks: Record<string, any> = {}
    const appAiStatus = (app?.ai_status || {}) as Record<string, unknown>

    formState.data.forEach((section, sectionIndex) => {
      section.data.forEach((field, fieldIndex) => {
        const method = field.ai_method
        if (!method) return
        if (field.type !== 'images' && field.type !== 'image' && field.type !== 'pass_front') return

        const ch = app?.service?.chapters?.[sectionIndex]
        const chDataLen = ch?.data?.length ?? 0
        const fileIdx = fieldIndex - chDataLen
        const fromChapterFile =
          fileIdx >= 0 && ch?.files?.[fileIdx] != null
            ? (ch.files[fileIdx] as { ai_status?: unknown }).ai_status
            : undefined
        const rawSource = appAiStatus[method] ?? fromChapterFile ?? field.ai_status
        const raw = aiStatusResolved(rawSource)
        const normalized = normalizeCheckByMethod(method, raw)
        if (!normalized) return

        const normalizedKey =
          method === 'Ventkanal' || method === 'ventkanal' ? 'akt' : method
        checks[normalizedKey] = normalized
      })
    })

    const boolFlags: boolean[] = []
    if (typeof checks.passport_front?.is_passport === 'boolean') boolFlags.push(checks.passport_front.is_passport)
    if (typeof checks.passport_reg?.is_propiska === 'boolean') boolFlags.push(checks.passport_reg.is_propiska)
    if (typeof checks.egrn?.is_egrn === 'boolean') boolFlags.push(checks.egrn.is_egrn)
    if (typeof checks.akt?.is_akt === 'boolean') boolFlags.push(checks.akt.is_akt)

    return {
      id: app?.id,
      status: boolFlags.length > 0 ? boolFlags.every(Boolean) : false,
      checks,
    }
  }

  const aiStatusResolved             = (raw: any) => {
    console.log('raw', raw)
    if (!raw) return null;
    if (!Array.isArray(raw)) return raw;
    if (raw.length === 0) return null;
    if (raw.length === 1) return raw[0];

    // 1. Берем структуру из последнего элемента как основу
    const lastRes = raw[0];

    const resolved: any = { data: {} }
    const errors: any = []

    for (const field in lastRes.data) {
      let value : any = null;
      let error = null;
      
      for (let i = 0; i < raw.length; i++) {
        const elem = raw[i];
    
        value = elem.data[field];
        if(elem.errors) {
          error = elem.errors.find(item => item.field === field)?.error
        }
    
        if (!error)   break; 

      }
      
      resolved.data[field] = value;

      if(error) errors.push({ field, error });

    }
    for (const field in lastRes){
      if(field.substring(0, 2) === 'is') {
        let value = false;
        for (let i = raw.length - 1; i >= 0; i--) {
          const elem = raw[i];
      
          if (elem[field]) {
            value = true;
            break;
          }
        }        
        resolved[field] = value;
      }
    }

    resolved.errors = errors;

    console.log('resolved', resolved)
    return resolved;
  };
  
  const renderField                  = (field: FieldData, sectionIdx: number, fieldIdx: number) => {
    const emitSectionChange = (nextField: FieldData) => {
      const section = formState.data?.[sectionIdx]
      if (!section) return
      const nextSection = {
        ...section,
        data: section.data.map((item, idx) => (idx === fieldIdx ? nextField : item)),
      }
      onChange?.({ ...(nextSection as any), __sectionIndex: sectionIdx })
    }
    
    const applyAiStatus = (ai_data: any, ai_method: string) => {
      
      if(field.data.length > 0){
        const prevAiStatus = field.ai_status
        if( Array.isArray(prevAiStatus)) {
          ai_data = [...prevAiStatus, ai_data]
        } else ai_data = [prevAiStatus, ai_data]
      } 

  
      formState.updateAiStatus(sectionIdx, fieldIdx, ai_data)

    
      const appNow = useAppsStore.getState().app;
      if (!appNow?.service?.chapters?.length) return;
      const targetMethod = normalizeAiMethodKey(ai_method).toLowerCase();
      const updatedChapters = appNow.service.chapters.map((chapter: any, chIdx: number) => {
        if (chIdx !== sectionIdx) return chapter;
        const chapterDataLength = chapter.data?.length || 0;
        const isDataField = fieldIdx < chapterDataLength;
        if (isDataField && chapter.data?.[fieldIdx]) {
          return {
            ...chapter,
            data: chapter.data.map((item: any, i: number) =>
              i === fieldIdx ? { ...item, ai_status: ai_data } : item
            ),
          };
        }
        // file-поле: обновляем нужный file по ai_method
        if (chapter.files?.length) {
          return {
            ...chapter,
            files: chapter.files.map((f: any) => {
              const m = normalizeAiMethodKey(f.ai_method || "").toLowerCase();
              return m === targetMethod ? { ...f, ai_status: ai_data } : f;
            }),
          };
        }
        return chapter;
      });

      // 4) setApp только новым объектом
      setApp({
        ...appNow,
        service: {
          ...appNow.service,
          chapters: updatedChapters,
        },
      });


    }

    const update = (value: any) => {
      const prevValue = formState.data?.[sectionIdx]?.data?.[fieldIdx]?.data
      const prevAiSnapshot = formState.data?.[sectionIdx]?.data?.[fieldIdx]?.ai_status
      formState.updateField(sectionIdx, fieldIdx, value)

      const appNow = useAppsStore.getState().app
      if (appNow?.service?.chapters?.length) {
        const chapter = appNow.service.chapters[sectionIdx]
        if (chapter) {
          const chapterDataLength = chapter.data?.length || 0
          const isDataField = fieldIdx < chapterDataLength

          const updatedChapters = appNow.service.chapters.map((currentChapter, chapterIdx) => {
            if (chapterIdx !== sectionIdx) return currentChapter

            if (isDataField && currentChapter.data?.[fieldIdx]) {
              return {
                ...currentChapter,
                data: currentChapter.data.map((item, itemIdx) =>
                  itemIdx === fieldIdx ? { ...item, value } : item
                )
              }
            }

            const fileIndex = fieldIdx - chapterDataLength
            if (fileIndex >= 0 && currentChapter.files?.[fileIndex]) {
              return {
                ...currentChapter,
                files: currentChapter.files.map((item, itemIdx) =>
                  itemIdx === fileIndex ? { ...item, data: value } : item
                )
              }
            }

            return currentChapter
          })

          setApp({
            ...appNow,
            service: {
              ...appNow.service,
              chapters: updatedChapters
            }
          })
        }
      }

      onFieldChange?.({
        sectionIndex: sectionIdx,
        fieldIndex: fieldIdx,
        field,
        value,
        prevValue,
        source: 'user',
      })

      emitSectionChange({ ...field, data: value })

      if (
        shouldInvalidateAiStatusOnFieldChange({
          field,
          source: 'user',
          prevValue,
          nextValue: value,
        })
      ) {
        const rawMethod = field.ai_method || ''
        const methodKey = normalizeAiMethodKey(rawMethod)
        const appWithUpdates = useAppsStore.getState().app
        if (appWithUpdates?.ai_status) {
          const nextAiStatus = { ...(appWithUpdates.ai_status as Record<string, unknown>) }
          const hadMethodKey = methodKey in nextAiStatus
          const hadRawKey = !!rawMethod && rawMethod in nextAiStatus
          delete nextAiStatus[methodKey]
          if (rawMethod && rawMethod !== methodKey) {
            delete nextAiStatus[rawMethod]
          }
          if (hadMethodKey || hadRawKey) {
            setApp({
              ...appWithUpdates,
              ai_status: nextAiStatus,
            })
          }
        }
      }

      if (field.type === 'images' && field.ai_method) {
        const prevUrls = galleryUrlsFromUnknown(prevValue)
        const nextUrls = galleryUrlsFromUnknown(value)
        const remapped = remapGalleryAiToUrlList(prevUrls, nextUrls, prevAiSnapshot)
        if (remapped !== undefined) {
          const prevStr = JSON.stringify(normalizeAiResultsArray(prevAiSnapshot))
          const nextStr = JSON.stringify(remapped)
          if (prevStr !== nextStr) {
            const nextAi =
              remapped.length === 0 ? null : remapped.length === 1 ? remapped[0] : remapped
            applyAiStatus(nextAi, field.ai_method)
          }
        }
      }
    }

    const key = `${sectionIdx}-${fieldIdx}`

    const props = {
      doc:      field.doc,
      name:     field.name,
      label:    field.label,
      value:    field.data,
      error:    errors[key],
      onChange: update,
    };

    const chapterForAi = app?.service?.chapters?.[sectionIdx]
    const chDataLen = chapterForAi?.data?.length ?? 0
    const fileIdxForAi = fieldIdx - chDataLen
    const fileAppAiStatus =
      fileIdxForAi >= 0 && chapterForAi?.files?.[fileIdxForAi] != null
        ? (chapterForAi.files[fileIdxForAi] as { ai_status?: unknown }).ai_status
        : undefined


    const mergedRemoteAiCheck =
      async (args: { method: string; objectKey: string; fileUrl: string }): Promise<any> => {
        if (!onCheckAI || !field.ai_method) return null;
        console.log('field1', field.ai_status?.data?.address)
        const res = await onCheckAI(args);
        console.log('field2', field.ai_status?.data?.address)
        const incoming = extractAiInboundFromCheckResponse(field.ai_method, res);
        if (incoming != null) {
          console.log('field3', field.ai_status?.data?.address)
          applyAiStatus(incoming, field.ai_method);
        }
        return res;
      };

    switch (field.type) {

      case 'view':        return <ViewField       {...props} />;
      case 'text':        return <TextField       {...props} />;
      case 'password':    return <TextField       {...props} type={"password"} />;
      case 'number':      return <NumberField     {...props} />;
      case 'box':         return <SelectField     {...props} options={field.values || []} />;
      case 'select':      return <SelectField     {...props} options={field.values || []} />;
      case 'lics':        return <SelectField     {...props} options={getLics() || []} />;
      case 'date':        return <DateField       {...props} />;
      case 'city':        return <CityField       {...props} onFIAS={setFias} />;
      case 'address':     return <AddressField    {...props} cityFias={fias} />;
      case 'party':       return <PartyField      {...props} cityFias={fias} />;
      case 'image':       return <ImageField      {...props}
                                                      ai_method = { field.ai_method }
                                                      ai_status = { aiStatusResolved( field.ai_status ) }
                                                      onCheckAI = { onCheckAI ? mergedRemoteAiCheck : undefined }
                                                      isAIChecking = { isAIChecking }/>;
      case 'pass_front':  return <PassportFront   {...props} />;
      case 'images':      return <ImagesField     {...props} 
                                                      ai_method = { field.ai_method } 
                                                      ai_status = { aiStatusResolved( field.ai_status ) } 
                                                      onCheckAI = { onCheckAI ? mergedRemoteAiCheck : undefined }
                                                      isAIChecking = { isAIChecking } />;
      case 'check':       return <CheckField      {...props} />;
      case 'rate':        return <RateField       {...props} />;
      case 'fio':         return <FioField        {...props} />;
      case 'sign':        return <SignField       {...props} />;
      case 'equip':       return <EquipField      {...props} />;
      case 'email':       return <EmailField      {...props} />;
      case 'preview':     return loading ? <>
        <IonLoading isOpen={loading} message={"Подождите..."} />
        <PreviewField getPreview={handlePreview} />
      </> : <PreviewField getPreview={handlePreview} />

      default: return null;
    }
  };

  const currentSection               = formState.data[navigation.currentPage];
  if (!currentSection) return null;

  const isLastPage                   = navigation.currentPage === navigation.totalPages - 1;

  return (
    <div className="data-editor-wizard">
      <div className="wizard-content" ref={scrollRef}>
        <WizardHeader
          title={currentSection.title}
          pages={getPageTitle()}
          onBack={handleBackNavigation}
          onForward={handleForwardNavigation}
          onClose={handleClose} // Изменили onSave на onClose
          isLastStep={isLastPage}
          canGoBack={true}
          canGoForward={navigation.canGoNext}
        />

        <div className="step-container">
          <div className="page-content">
            {
              currentSection.data.map((field, idx) => (
                <div key={idx}>
                  {renderField(field, navigation.currentPage, idx)}
                </div>
              ))
            }

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