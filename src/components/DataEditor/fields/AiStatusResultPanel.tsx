import React from "react";
import styles from "./ImageField.module.css";
import { resolveAiResultForDisplay } from "../../../utils/aiRequisites";
const PASSPORT_REG_DATA_LABELS: Record<string, string> = {
  address: "Адрес",
  fio: "ФИО",
  registration: "Регистрация",
  registration_date: "Дата регистрации",
  issue_date: "Дата",
  series: "Серия",
  number: "Номер",
  issued_by: "Кем выдан",
  issue_by: "Кем выдан",
};

function labelForRegKey(key: string): string {
  if (PASSPORT_REG_DATA_LABELS[key]) return PASSPORT_REG_DATA_LABELS[key];
  return key.replace(/_/g, " ");
}

const AKT_LABELS: Record<string, string> = {
  address: "Адрес",
  owner: "Собственник",
  date: "Дата акта",
  number: "Номер акта",
  organization: "Организация",
  comment: "Комментарий",
};

interface AiStatusResultPanelProps {
  ai_method: string;
  ai_status?: unknown;
  /** Для одиночного `image`: URL распознанного файла для byUrl/Legacy */
  imageSrcForSingle?: string;
}

export function AiStatusResultPanel({
  ai_method,
  ai_status,
  imageSrcForSingle,
}: AiStatusResultPanelProps) {
  const aiRes = resolveAiResultForDisplay(ai_method, ai_status, imageSrcForSingle);
  if (!aiRes) return null;

  const errors = Array.isArray(aiRes.errors) ? aiRes.errors : [];
  const m = (ai_method || "").toLowerCase();

  if (m === "passport_front") {
    const rows = [
      { label: "ФИО", value: aiRes.data?.fio },
      { label: "Серия", value: aiRes.data?.series },
      { label: "Номер", value: aiRes.data?.number },
      { label: "Дата выдачи", value: aiRes.data?.issue_date },
      { label: "Кем выдан", value: aiRes.data?.issued_by },
    ].filter((row) => Boolean(row.value));

    return (
      <div className={styles.aiResultPanel}>
        <div className={styles.aiResultTitle}>Результат ИИ</div>
        {typeof aiRes.is_passport === "boolean" && (
          <div className={styles.aiResultValue}>Паспорт: {aiRes.is_passport ? "да" : "нет"}</div>
        )}
        <div className={styles.aiResultGrid}>
          {rows.map((row) => (
            <React.Fragment key={row.label}>
              <div className={styles.aiResultLabel}>{row.label}</div>
              <div className={styles.aiResultValue}>{row.value}</div>
            </React.Fragment>
          ))}
        </div>
        {errors.length > 0 && (
          <div className={styles.aiResultError}>
            {errors.map((item, index) => (
              <div key={`${item.field || "field"}-${index}`}>
                {item.field ? `${item.field}: ` : ""}
                {item.error || "Ошибка проверки"}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (m === "passport_reg") {
    return (
      <div className={styles.aiResultPanel}>
        <div className={styles.aiResultTitle}>Результат ИИ: прописка</div>
        {typeof aiRes.is_propiska === "boolean" && (
          <div className={styles.aiResultValue}>
            Прописка обнаружена: {aiRes.is_propiska ? "да" : "нет"}
          </div>
        )}
        {aiRes.data && Object.keys(aiRes.data).length > 0 && (
          <div className={styles.aiResultGrid}>
            {Object.entries(aiRes.data)
              .filter(([, v]) => v != null && String(v).trim() !== "")
              .map(([k, v]) => (
                <React.Fragment key={k}>
                  <div className={styles.aiResultLabel}>{labelForRegKey(k)}</div>
                  <div className={styles.aiResultValue}>{String(v)}</div>
                </React.Fragment>
              ))}
          </div>
        )}
        {errors.length > 0 && (
          <div className={styles.aiResultError}>
            {errors.map((item, index) => (
              <div key={`${item.field || "field"}-${index}`}>
                {item.field ? `${item.field}: ` : ""}
                {item.error || "Ошибка проверки"}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (m === "egrn") {
    const cad = aiRes.data?.cadaster || (aiRes.data as Record<string, string> | undefined)?.cadastral;
    const rows = [
      { label: "Владелец", value: aiRes.data?.owner || "Пусто" },
      { label: "Адрес", value: aiRes.data?.address || "Пусто" },
      { label: "Кадастр", value: cad || "Пусто" },
    ];

    return (
      <div className={styles.aiResultPanel}>
        <div className={styles.aiResultTitle}>Результат ИИ</div>
        {typeof aiRes.is_egrn === "boolean" && (
          <div className={styles.aiResultValue}>Выписка ЕГРН: {aiRes.is_egrn ? "да" : "нет"}</div>
        )}
        <div className={styles.aiResultGrid}>
          {rows.map((row) => (
            <React.Fragment key={row.label}>
              <div className={styles.aiResultLabel}>{row.label}</div>
              <div className={styles.aiResultValue}>{row.value}</div>
            </React.Fragment>
          ))}
        </div>
        {errors.length > 0 && (
          <div className={styles.aiResultError}>
            {errors.map((item, index) => (
              <div key={`${item.field || "field"}-${index}`}>
                {item.error || "Ошибка проверки"}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (m === "ventkanal") {
    const labelAkt = (key: string) => AKT_LABELS[key] || key.replace(/_/g, " ");
    return (
      <div className={styles.aiResultPanel}>
        <div className={styles.aiResultTitle}>Результат ИИ: Акт вентканала</div>
        {typeof aiRes.is_akt === "boolean" && (
          <div className={styles.aiResultValue}>Акт распознан: {aiRes.is_akt ? "да" : "нет"}</div>
        )}
        {aiRes.data && Object.keys(aiRes.data).length > 0 && (
          <div className={styles.aiResultGrid}>
            {Object.entries(aiRes.data)
              .filter(([, v]) => v != null && String(v).trim() !== "")
              .map(([k, v]) => (
                <React.Fragment key={k}>
                  <div className={styles.aiResultLabel}>{labelAkt(k)}</div>
                  <div className={styles.aiResultValue}>{String(v)}</div>
                </React.Fragment>
              ))}
          </div>
        )}
        {errors.length > 0 && (
          <div className={styles.aiResultError}>
            {errors.map((item, index) => (
              <div key={`${item.field || "field"}-${index}`}>
                {item.field ? `${item.field}: ` : ""}
                {item.error || "Ошибка проверки"}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
