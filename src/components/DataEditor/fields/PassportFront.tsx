// src/components/DataEditor/fields/ImageFieldV2.tsx
import React, { useEffect, useState } from "react";
import { IonButton, IonIcon, IonModal, IonSpinner } from "@ionic/react";
import { cameraOutline, trashOutline, closeOutline } from "ionicons/icons";
import { PickSource } from "../../Files";
import styles from './ImageField.module.css';
import { useS3Upload } from "../hooks/useS3Upload";

interface ImageFieldProps {
  label: string;
  value: string | unknown;
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

function normalizeImageSrc(v: unknown): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') return v[0];
  return '';
}

export function generateFileName( format: string ): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const extension = format || 'jpg';
  const date = new Date().toISOString().split('T')[0];
  
  return `images/${date}/${timestamp}_${randomString}.${extension}`;
}

export const PassportFront: React.FC<ImageFieldProps> = ({
  label,
  value = '',
  onChange,
  placeholder = "Добавить изображение",
  disabled = false,
  error
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const imageSrc = normalizeImageSrc(value);

  const { uploadFile, delFileS3, dataUrlToBlob, isUploading, progress } = useS3Upload({
    onError: (error) => console.error("Upload error:", error),
  });

  useEffect(() => {
    setLoadError(false);
  }, [imageSrc]);

  async function handleAddPhoto() {
    if (disabled || isUploading) return;
    
    try {
      const photo = await PickSource();
      if (photo?.dataUrl) {
        const blob      = await dataUrlToBlob(photo.dataUrl);
        const fileUrl   = await uploadFile(blob, generateFileName( photo.format) );
        onChange(fileUrl);
      }
    } catch (error) {
      console.error("Ошибка добавления фото:", error);
    }
  }

  async function removeImage() {
    if (disabled || isUploading) return;
    
    try {

        const response   = await delFileS3( value as string );

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
            {!loadError ? (
              <img
                key={imageSrc}
                src={imageSrc}
                alt={label}
                className={styles.imagePreview}
                onClick={() => !disabled && !isUploading && setModalOpen(true)}
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
            {!disabled && !isUploading && (
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
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <IonSpinner name="crescent" />
                {progress > 0 && ` ${Math.round(progress)}%`}
              </>
            ) : (
              <>
                <IonIcon icon={cameraOutline} className={styles.buttonIcon} />
                {placeholder}
              </>
            )}
          </IonButton>
        )}

        {(!disabled && imageSrc && !isUploading) && (
          <IonButton
            fill="clear"
            size="small"
            className={styles.replaceButton}
            onClick={handleAddPhoto}
            disabled={isUploading}
          >
            <IonIcon icon={cameraOutline} className={styles.buttonIcon} />
            Заменить
          </IonButton>
        )}
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
            {imageSrc && (
              <img
                key={`modal-${imageSrc}`}
                src={imageSrc}
                alt={label}
                className={styles.modalImage}
              />
            )}
          </div>
        </div>
      </IonModal>
    </div>
  );
};