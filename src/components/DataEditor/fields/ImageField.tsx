// src/components/DataEditor/fields/ImageFieldV2.tsx
import React, { useEffect, useState } from "react";
import { IonButton, IonIcon, IonModal, IonSpinner } from "@ionic/react";
import { cameraOutline, trashOutline, closeOutline, documentTextOutline } from "ionicons/icons";
import { PickSource } from "../../Files";
import styles from './ImageField.module.css';
import { useS3Upload } from "../hooks/useS3Upload";
import { AiStatusResultPanel } from "./AiStatusResultPanel";

interface ImageFieldProps {
  name?: string;
  label: string;
  value: string | unknown;
  ai_method?: string;
  /** Срез `app.ai_status[ai_method]` с текущим методом ИИ. */
  ai_status?: any;
  onChange: (value: any) => void;
  /** checkAI из useCheckAI, через DataEditor */
  onCheckAI?: (args: { method: string; objectKey: string; fileUrl: string }) => Promise<any>;
  isAIChecking?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

function normalizeImageSrc(v: unknown): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') return v[0];
  return '';
}

function isPdfSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("data:application/pdf")) return true;
  return /\.pdf($|[?#])/i.test(src);
}

export function ImageField({
  name,
  label,
  value = '',
  ai_method = '',
  ai_status,
  onChange,
  onCheckAI,
  isAIChecking = false,
  placeholder = "Доба вить изображение",
  disabled = false,
  error
}: ImageFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const imageSrc = normalizeImageSrc(value);
  const isPdf = isPdfSrc(imageSrc);

  const { uploadFile, delFileS3, dataUrlToBlob, isUploading, progress, pruneAiByFileUrl } = useS3Upload({
    onError: (error) => console.error("Upload error:", error),
  });
  const isBusy = isUploading || isAIChecking;

  useEffect(() => {
    setLoadError(false);
  }, [imageSrc]);

  async function handleAddPhoto() {
    if (disabled || isBusy) return;
    
    try {
      const photo = await PickSource();
      if (photo?.dataUrl) {
        const blob      = await dataUrlToBlob( photo.dataUrl );
        const fileName  = name + '.' + photo.format; // generateFileName( photo.format );
        const objectKey = `${name}/${fileName}`;
        const fileUrl   = await uploadFile( blob, objectKey );
        if (ai_method && onCheckAI) {
          await onCheckAI({ method: ai_method, objectKey, fileUrl });
        }
        onChange(fileUrl);
      }
    } catch (error) {
      console.error("Ошибка добавления фото:", error);
    }
  }

  async function removeImage() {
    if (disabled || isBusy) return;
    
    try {
        const prevUrl = value as string;
        const response   = await delFileS3( prevUrl );
        if (ai_method) {
          pruneAiByFileUrl(ai_method, prevUrl);
        }
        onChange( response );

    } catch (error) {
      console.error("Ошибка удаления фото:", error);
    }
  }


  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={`${styles.imageWrapper} ${error ? styles.wrapperError : ''}`}>
        
        {imageSrc && (
          <div className={styles.imageContainer}>
            {isPdf ? (
              <div
                className={styles.pdfPreview}
                role="button"
                tabIndex={0}
                onClick={() => !disabled && !isBusy && setModalOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!disabled && !isBusy) setModalOpen(true);
                  }
                }}
              >
                <IonIcon icon={documentTextOutline} className={styles.pdfIcon} />
                <span className={styles.pdfLabel}>PDF документ</span>
              </div>
            ) : !loadError ? (
              <img
                key={imageSrc}
                src={imageSrc}
                alt={label}
                className={styles.imagePreview}
                onClick={() => !disabled && !isBusy && setModalOpen(true)}
                onError={() => {
                  console.error('Failed to load image:', imageSrc);
                  setLoadError(true);
                }}
              />
            ) : (
              <span className={styles.errorMessage}>
                Не удалось загрузить превью — URL может быть без прав на чтение из браузера.
              </span>
            )}
            {isAIChecking && (
              <div className={styles.aiCheckingOverlay} aria-live="polite">
                <IonSpinner name="crescent" />
                <span className={styles.aiCheckingText}>Проверка изображения на ИИ…</span>
              </div>
            )}
            {!disabled && !isBusy && (
              <IonButton
                size="small"
                fill="clear"
                className={styles.removeButton}
                onClick={removeImage}
              >
                <IonIcon icon={trashOutline} />
              </IonButton>
            )}
          </div>
        )}

        {(!disabled && !imageSrc) && (
          <IonButton
            fill="outline"
            className={styles.addButton}
            onClick={handleAddPhoto}
            disabled={isBusy}
          >
            {isUploading ? (
              <>
                <IonSpinner name="crescent" />
                {progress > 0 && ` ${Math.round(progress)}%`}
              </>
            ) : isAIChecking ? (
              <>
                <IonSpinner name="crescent" />
                <span className={styles.aiCheckingInline}>Проверка изображения ИИ…</span>
              </>
            ) : (
              <>
                <IonIcon icon={cameraOutline} className={styles.buttonIcon} />
                {placeholder}
              </>
            )}
          </IonButton>
        )}

        {(!disabled && imageSrc && !isBusy) && (
          <IonButton
            fill="clear"
            size="small"
            className={styles.replaceButton}
            onClick={handleAddPhoto}
            disabled={isBusy}
          >
            <IonIcon icon={cameraOutline} className={styles.buttonIcon} />
            Заменить
          </IonButton>
        )}

        {ai_method ? (
          <AiStatusResultPanel
            ai_method={ai_method}
            ai_status={ai_status}
            imageSrcForSingle={imageSrc}
          />
        ) : null}
      </div>
      
      {error && <span className={styles.errorMessage}>{error}</span>}
      
      <IonModal isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>{label}</div>
            <IonButton fill="clear" onClick={() => setModalOpen(false)}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </div>
          <div className={styles.modalBody}>
            {imageSrc && !isPdf && (
              <img
                key={`modal-${imageSrc}`}
                src={imageSrc}
                alt={label}
                className={styles.modalImage}
              />
            )}
            {imageSrc && isPdf && <iframe src={imageSrc} title={label} className={styles.modalPdf} />}
          </div>
        </div>
      </IonModal>
    </div>
  );
}