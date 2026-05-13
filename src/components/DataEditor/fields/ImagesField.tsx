import React, { useEffect, useState } from "react";
import { IonButton, IonIcon, IonModal, IonSpinner } from "@ionic/react";
import { cameraOutline, trashOutline, closeOutline, documentTextOutline } from "ionicons/icons";
import { PickSource } from "../../Files";
import styles from "./ImageField.module.css";
import { useS3Upload } from "../hooks/useS3Upload";
import { AiStatusResultPanel } from "./AiStatusResultPanel";
import { normalizeAiResultsArray, pickAiResultForImagesFieldDisplay } from "../../../utils/aiRequisites";

interface ImagesFieldProps {
  doc?: string;
  name?: string;
  label: string;
  value: string[];
  ai_method?: string;
  ai_status?: any;
  onChange: (value: any) => void;
  /** checkAI из useCheckAI; DataEditor кладёт снимок в `ai_status`. */
  onCheckAI?: (args: { method: string; objectKey: string; fileUrl: string }) => Promise<any>;
  isAIChecking?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  maxImages?: number;
  validate?: boolean;
}

function normalizeList(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function isPdfSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("data:application/pdf")) return true;
  return /\.pdf($|[?#])/i.test(src);
}

export function ImagesField({
  doc,
  name,
  label,
  value: valueProp,
  ai_method = "",
  ai_status = null,
  onChange,
  onCheckAI,
  isAIChecking = false,
  placeholder = "Добавьте изображения",
  disabled = false,
  error,
  maxImages = 10,
}: ImagesFieldProps) {
  const value = normalizeList(valueProp);
  const [modalFile, setModalFile] = useState<{ url: string; isPdf: boolean } | undefined>(undefined);
  const [aiFocusedUrl, setAiFocusedUrl] = useState<string | null>(null);

  // Сводный результат: берём последний "чистый" снимок (без ошибок), иначе последнее непустое.
  const aiSummary =
    ai_method && Array.isArray(ai_status)
      ? pickAiResultForImagesFieldDisplay(normalizeAiResultsArray(ai_status))
      : ai_method
        ? ai_status
        : null;

  const { uploadFile, delFileS3, dataUrlToBlob, isUploading, progress } = useS3Upload({
    onError: (err) => console.error("ImagesField S3:", err),
  });
  
  const isBusy = isUploading || isAIChecking;

  useEffect(() => {
    setAiFocusedUrl((f) => {
      if (value.length === 0) return null;
      if (f && value.includes(f)) return f;
      return value[value.length - 1];
    });
  }, [value]);

  const s3KeyForUpload  = (fileName: string) => [doc || "", name || "", fileName].filter(Boolean).join("/");


  const handleAddPhoto  = async (): Promise<void> => {
    if (disabled || isBusy || value.length >= maxImages) return;

    try {
      console.log('handleAddPhoto');
      const photo = await PickSource();
      console.log('photo', photo);
      if (!photo?.dataUrl) return;

      const randomDigits = () => Math.floor(1000 + Math.random() * 9000).toString();

      const pref = value.length > 0 ? value.length.toString() + "_" : "";

      const blob = await dataUrlToBlob(photo.dataUrl);
      const fileName = pref + (name || "") + "_" + randomDigits() + "." + photo.format;
      const objectKey = s3KeyForUpload(fileName);

      const fileUrl = await uploadFile(blob, objectKey);

      if (ai_method && onCheckAI) {
        await onCheckAI({ method: ai_method, objectKey, fileUrl });
      }

      await onChange([...value, fileUrl]);

      setAiFocusedUrl(fileUrl);
    } catch (e) {
      console.error("Ошибка добавления фото:", e);
    }
  };

  const removeImage     = async (index: number) => {
    if (disabled || isBusy) return;
    const url = value[index];
    if (!url) return;

    try {
      await delFileS3(url);
      const next = value.filter((_, i) => i !== index);
      onChange(next);
      setAiFocusedUrl((f) => {
        if (f !== url) return f;
        return next.length ? next[next.length - 1] : null;
      });
    } catch (e) {
      console.error("Ошибка удаления фото:", e);
    }
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={`${styles.imageWrapper} ${error ? styles.wrapperError : ""}`}>
        <div style={{ position: "relative" }}>
          <div className={styles.imageGrid}>
            {value.map((image, index) => (
              <div key={`${image}-${index}`} className={styles.imageItem}>
                {isPdfSrc(image) ? (
                  <div
                    className={styles.pdfThumb}
                    style={{
                      cursor: disabled ? "default" : "pointer",
                      outline:
                        aiFocusedUrl === image ? "2px solid var(--ion-color-primary, #3880ff)" : undefined,
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (disabled || isBusy) return;
                      setModalFile({ url: image, isPdf: true });
                      setAiFocusedUrl(image);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (disabled || isBusy) return;
                        setModalFile({ url: image, isPdf: true });
                        setAiFocusedUrl(image);
                      }
                    }}
                  >
                    <IonIcon icon={documentTextOutline} className={styles.pdfIcon} />
                    <span className={styles.pdfThumbLabel}>PDF</span>
                  </div>
                ) : (
                  <img
                    src={image}
                    alt={`${label} ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 6,
                      cursor: disabled ? "default" : "pointer",
                      outline:
                        aiFocusedUrl === image ? "2px solid var(--ion-color-primary, #3880ff)" : undefined,
                    }}
                    onClick={() => {
                      if (disabled || isBusy) return;
                      setModalFile({ url: image, isPdf: false });
                      setAiFocusedUrl(image);
                    }}
                  />
                )}
                {!disabled && !isBusy && (
                  <IonButton
                    size="small"
                    fill="clear"
                    className={styles.removeButton}
                    onClick={() => void removeImage(index)}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                )}
              </div>
            ))}
          </div>
          {isAIChecking && (
            <div className={styles.aiCheckingOverlay} aria-live="polite" style={{ maxWidth: "100%" }}>
              <IonSpinner name="crescent" />
              <span className={styles.aiCheckingText}>Проверка изображения…</span>
            </div>
          )}
        </div>

        {!disabled && value.length < maxImages && (
          <button
            type="button"
            className={styles.addImageNativeButton}
            onClick={() => void handleAddPhoto()}
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
                <span className={styles.aiCheckingInline}>Проверка изображения…</span>
              </>
            ) : (
              <>
                <IonIcon icon={cameraOutline} className={styles.buttonIcon} />
                {placeholder}
              </>
            )}
          </button>
        )}

        {value.length > 0 && (
          <div className={styles.counter}>
            {value.length} из {maxImages}
          </div>
        )}

        {ai_method ? <AiStatusResultPanel ai_method={ai_method} ai_status={aiSummary} /> : null}
      </div>

      {error && <span className={styles.errorMessage}>{error}</span>}

      <IonModal
        className={styles.modal}
        isOpen={modalFile !== undefined}
        onDidDismiss={() => setModalFile(undefined)}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>{label}</div>
            <IonButton fill="clear" onClick={() => setModalFile(undefined)}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </div>
          <div className={styles.modalBody}>
            {modalFile?.isPdf ? (
              <iframe src={modalFile.url} title={label} className={styles.modalPdf} />
            ) : (
              modalFile?.url && <img src={modalFile.url} alt={label} className={styles.modalImage} />
            )}
          </div>
        </div>
      </IonModal>
    </div>
  );
}
