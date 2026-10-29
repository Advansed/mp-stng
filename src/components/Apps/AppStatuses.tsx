import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { IonBadge, IonButton, IonCard, IonLoading, IonText } from '@ionic/react'
import { useLocation } from 'react-router-dom'
import { createOutline, documentTextOutline, timeOutline } from 'ionicons/icons'
import { IonIcon } from '@ionic/react'
import { AppStatusEntry } from '../../Store/appStore'
import { useServiceStore } from '../../Store/serviceStore'
import { useToken } from '../Login/authStore'
import { PDFDocModal, usePDFDocModal } from '../Files/PDFDocModal'
import { useToast } from '../Toast'
import { useApps } from './useApps'
import { resolveAppDocId } from './agreementContract'
import {
  badgeColor,
  extractAiCheckErrorGroups,
  extractStatusComments,
  hasStatusComments,
  isDeniedStatus,
  isEditStatus,
  isSignedStatus,
  isGoskeyReceipt,
  statusHint,
  statusLabel,
} from './appStatusUtils'
import styles from './AppStatuses.module.css'

function formatPeriod(period: string): string {
  if (!period) return 'Дата не указана'
  const normalized = period.includes('T') ? period : period.replace(' ', 'T')
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return period
  return d.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

type LocationState = { statuses?: AppStatusEntry[] }

interface AppStatusesProps {
  appId: string
  onEditApp?: (id: string) => void
}

export function AppStatuses({ appId, onEditApp }: AppStatusesProps): JSX.Element {
  const location                     = useLocation()
  const services                     = useServiceStore((s) => s.services)
  const loadServices                 = useServiceStore((s) => s.loadServices)
  const token                        = useToken()
  const toast                        = useToast()
  const { getSignedAgreementUrl }    = useApps()
  const { isOpen: pdfOpen, pdfData, openModal: openPdf, closeModal: closePdf } = usePDFDocModal()
  const [contractLoading, setContractLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(false)

  const refreshHistory = useCallback(async () => {
    if (!token) return
    setHistoryLoading(true)
    setHistoryError(false)
    try {
      const result = await loadServices(token, { silent: true })
      if (!result || result.error || !Array.isArray(result.data)) setHistoryError(true)
    } catch {
      setHistoryError(true)
    } finally {
      setHistoryLoading(false)
    }
  }, [loadServices, token])

  useEffect(() => { void refreshHistory() }, [appId, refreshHistory])

  const record = useMemo(
    () => services.find((row) => (row.id || row.doc_id) === appId),
    [services, appId]
  )
  const docId = useMemo(
    () => resolveAppDocId(record ? { id: record.id, doc_id: record.doc_id } : undefined, appId),
    [record, appId]
  )

  const statuses: AppStatusEntry[] = useMemo(() => {
    const fromState = (location.state as LocationState | undefined)?.statuses
    if (record?.statuses?.length) return record.statuses as AppStatusEntry[]
    if (!record && fromState?.length) return fromState
    return []
  }, [location.state, record])

  const sorted = useMemo(() => {
    return statuses.map((row, index) => ({ row, index, time: new Date((row.period || '').replace(' ', 'T')).getTime() }))
      .sort((a, b) => {
        if (Number.isFinite(a.time) && Number.isFinite(b.time)) return a.time - b.time || a.index - b.index
        if (Number.isFinite(a.time) !== Number.isFinite(b.time)) return Number.isFinite(a.time) ? -1 : 1
        return a.index - b.index
      }).map(({ row }) => row)
  }, [statuses])

  const displayRows = sorted

  // History is not authoritative current state; never infer it from array order.
  const lastStatus = record?.status ? { period: '', status: record.status, comment: record.comment } : undefined

  const showNextAction = useMemo(() => {
    if (!lastStatus) return false
    return isEditStatus(lastStatus.status) || isDeniedStatus(lastStatus.status)
  }, [lastStatus])

  const showSignedContract = useMemo(() => {
    if (!lastStatus) return false
    return isSignedStatus(lastStatus.status)
  }, [lastStatus])

  const nextActionComments = useMemo(() => {
    if (!lastStatus || !hasStatusComments(lastStatus.status)) return []
    const context = record && Object.prototype.hasOwnProperty.call(record, 'comment') ? record : lastStatus
    return extractStatusComments(context as unknown as Record<string, unknown>)
  }, [lastStatus, record])

  const nextActionCommentsTitle = lastStatus && isDeniedStatus(lastStatus.status)
    ? 'Причина отказа'
    : 'Комментарий'

  const editCheckErrorGroups = useMemo(() => {
    if (!lastStatus || !isEditStatus(lastStatus.status)) return []
    return extractAiCheckErrorGroups(
      lastStatus as unknown as Record<string, unknown>,
      (record || {}) as unknown as Record<string, unknown>
    )
  }, [lastStatus, record])

  const openSignedContract = useCallback(async () => {
    setContractLoading(true)
    try {
      const url = await getSignedAgreementUrl(docId)
      if (url) {
        openPdf(url, 'AgreementTO.pdf', 'Договор')
      } else {
        toast.error('Не удалось получить ссылку на договор')
      }
    } catch {
      toast.error('Ошибка загрузки договора')
    } finally {
      setContractLoading(false)
    }
  }, [docId, getSignedAgreementUrl, openPdf, toast])

  return (
    <div className={styles.wrap}>
      <IonText>
        <h1 className={`main-title ion-text-wrap ${styles.title}`}>Статусы заявки</h1>
      </IonText>
      <IonCard className={styles.contentCard}>
        {lastStatus && <p className={styles.subtitle}>
          Текущий статус: {statusLabel(lastStatus.status, (record || lastStatus) as unknown as Record<string, unknown>)}
        </p>}
        {!showNextAction && record?.comment && extractStatusComments(record as unknown as Record<string, unknown>).map((comment, index) => (
          <p key={index} className={styles.statusHint}>{comment}</p>
        ))}
        <p className={styles.subtitle}>Сохранённые события и сообщения</p>
        <IonButton fill="clear" disabled={historyLoading} onClick={() => void refreshHistory()}>
          {historyLoading ? 'Обновление истории…' : 'Обновить историю'}
        </IonButton>
        {historyError && <p role="alert">Не удалось обновить историю. Показаны ранее загруженные сведения. Попробуйте ещё раз.</p>}

        {sorted.length === 0 ? (
          <div className={styles.empty}>Нет записей о статусах для этой заявки.</div>
        ) : (
          <div className={styles.timeline} role="list">
            {displayRows.map((row, i) => (
              <div className={styles.row} key={`${row.period}-${row.status}-${i}`} role="listitem">
                <div className={styles.dot} aria-hidden />
                <div className={styles.body}>
                  <div className={styles.periodRow}>
                    <IonIcon icon={timeOutline} className={styles.periodIcon} />
                    <span className={styles.periodText}>{formatPeriod(row.period)}</span>
                  </div>
                  <IonBadge color={badgeColor(row.status)} className={styles.badge}>
                    {statusLabel(row.status, row as unknown as Record<string, unknown>)}
                  </IonBadge>

                  {isGoskeyReceipt(row.status, row as unknown as Record<string, unknown>) && (
                    <p className={styles.statusHint}>Получено подтверждение подписания через Госключ</p>
                  )}
                  {extractStatusComments(row as unknown as Record<string, unknown>).map((comment, index) => (
                    <p key={index} className={styles.statusHint}>{comment}</p>
                  ))}
                  {statusHint(row.status) && (
                    <p className={styles.statusHint}>{statusHint(row.status)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {showNextAction && (
          <div className={styles.nextActionRow} aria-label="Действия по заявке">
            <div className={`${styles.body} ${styles.nextActionBody}`}>
              <div className={styles.nextActionHeader}>Следующее действие</div>
              {nextActionComments.length > 0 && (
                <div className={styles.commentsBox}>
                  <div className={styles.commentsTitle}>{nextActionCommentsTitle}</div>
                  <ul className={styles.commentsList}>
                    {nextActionComments.map((text, j) => (
                      <li key={j}>{text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {lastStatus && isEditStatus(lastStatus.status) && (
                <>
                  {editCheckErrorGroups.length > 0 && (
                    <div className={styles.editReasonsBox}>
                      <div className={styles.editReasonsTitle}>Причина возврата</div>
                      <div className={styles.editReasonsList}>
                        {editCheckErrorGroups.map((group) => (
                          <details key={group.key} className={styles.editReasonItem}>
                            <summary className={styles.editReasonSummary}>
                              <span className={styles.editReasonLabel}>{group.label}</span>
                              <span className={styles.editReasonCount}>
                                {group.errors.length}
                              </span>
                            </summary>
                            <ul className={styles.editReasonErrors}>
                              {group.errors.map((err, j) => (
                                <li key={`${group.key}-${j}`}>
                                  {err.field ? (
                                    <>
                                      <span className={styles.editReasonField}>{err.field}: </span>
                                      {err.error || 'Ошибка проверки'}
                                    </>
                                  ) : (
                                    err.error || 'Ошибка проверки'
                                  )}
                                </li>
                              ))}
                            </ul>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={styles.nextActionHint}>
                    Исправьте данные и отправьте заявку повторно
                  </div>
                  <IonButton
                    fill="solid"
                    className={styles.editActionButton}
                    onClick={() => {
                      onEditApp?.(appId)
                    }}
                  >
                    <IonIcon icon={createOutline} slot="start" />
                    Редактировать
                  </IonButton>
                </>
              )}
            </div>
          </div>
        )}
        {showSignedContract && (
          <div className={styles.signedContractRow} aria-label="Документ заявки">
            <div className={`${styles.body} ${styles.signedContractBody}`}>
              <div className={styles.signedContractHeader}>Договор</div>
              <IonButton
                fill="solid"
                className={styles.contractLinkButton}
                onClick={() => void openSignedContract()}
              >
                <IonIcon icon={documentTextOutline} slot="start" />
                Открыть договор
              </IonButton>
            </div>
          </div>
        )}
      </IonCard>

      <IonLoading isOpen={contractLoading} message="Загрузка договора..." />
      
      {pdfData && (
        <PDFDocModal
          isOpen          = { pdfOpen }
          onClose         = { closePdf }
          pdfUrl          = { pdfData.url }
          fileName        = { pdfData.fileName }
          title           = { pdfData.title }
          showActions     = { false }
        />
      )}
    </div>
  )
}
