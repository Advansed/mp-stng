import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { IonBadge, IonButton, IonCard, IonLoading, IonText } from '@ionic/react'
import { useLocation } from 'react-router-dom'
import { createOutline, documentTextOutline, timeOutline } from 'ionicons/icons'
import { IonIcon } from '@ionic/react'
import useAppsStore, { AppStatusEntry } from '../../Store/appStore'
import { useToken } from '../Login/authStore'
import { PDFDocModal, usePDFDocModal } from '../Files/PDFDocModal'
import { useToast } from '../Toast'
import { useApps } from './useApps'
import { resolveAppDocId } from './agreementContract'
import {
  badgeColor,
  extractStatusComments,
  hasStatusComments,
  isDeniedStatus,
  isEditStatus,
  isSignedStatus,
  statusHint,
  statusLabel,
} from './appStatusUtils'
import styles from './AppStatuses.module.css'

function formatPeriod(period: string): string {
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

/** Подряд одинаковые статусы — в списке остаётся только последняя запись серии. */
function collapseConsecutiveSameStatus(rows: AppStatusEntry[]): AppStatusEntry[] {
  if (rows.length === 0) return []
  const out: AppStatusEntry[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const next = rows[i + 1]
    const key = (row.status || '').toLowerCase()
    const nextKey = next ? (next.status || '').toLowerCase() : ''
    if (next && nextKey === key) continue
    out.push(row)
  }
  return out
}

export function AppStatuses({ appId, onEditApp }: AppStatusesProps): JSX.Element {
  const location = useLocation()
  const apps = useAppsStore((s) => s.apps)
  const fetchApps = useAppsStore((s) => s.fetchApps)
  const token = useToken()
  const toast = useToast()
  const { getSignedAgreementUrl } = useApps()
  const { isOpen: pdfOpen, pdfData, openModal: openPdf, closeModal: closePdf } = usePDFDocModal()
  const [contractLoading, setContractLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    const hasApp = useAppsStore.getState().apps.some((a) => a.id === appId)
    if (!hasApp) void fetchApps(token)
  }, [appId, fetchApps, token])

  const app = useMemo(() => apps.find((a) => a.id === appId), [apps, appId])
  const docId = useMemo(() => resolveAppDocId(app, appId), [app, appId])

  const statuses: AppStatusEntry[] = useMemo(() => {
    const fromState = (location.state as LocationState | undefined)?.statuses
    if (fromState?.length) return fromState
    if (app?.statuses?.length) return app.statuses
    return []
  }, [location.state, app])

  const sorted = useMemo(() => {
    return [...statuses].sort(
      (a, b) => new Date(a.period.replace(' ', 'T')).getTime() - new Date(b.period.replace(' ', 'T')).getTime()
    )
  }, [statuses])

  const displayRows = useMemo(() => collapseConsecutiveSameStatus(sorted), [sorted])

  const lastStatus = sorted.length > 0 ? sorted[sorted.length - 1] : undefined

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
    return extractStatusComments(lastStatus as unknown as Record<string, unknown>)
  }, [lastStatus])

  const nextActionCommentsTitle = lastStatus && isDeniedStatus(lastStatus.status)
    ? 'Причина отказа'
    : 'Комментарий'

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
        {app?.number ? (
          <p className={styles.subtitle}>Номер: {app.number}</p>
        ) : (
          <p className={styles.subtitle}>История изменений статуса</p>
        )}

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
                    {statusLabel(row.status)}
                  </IonBadge>

                  {statusHint(row.status) && (
                    <p className={styles.statusHint}>{statusHint(row.status)}</p>
                  )}
                </div>
              </div>
            ))}
            {showNextAction && (
              <div className={`${styles.row} ${styles.nextActionRow}`} role="listitem">
                <div className={`${styles.dot} ${styles.nextActionDot}`} aria-hidden />
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
              <div className={`${styles.row} ${styles.signedContractRow}`} role="listitem">
                <div className={`${styles.dot} ${styles.signedContractDot}`} aria-hidden />
                <div className={`${styles.body} ${styles.signedContractBody}`}>
                  <div className={styles.signedContractHeader}>Договор подписан</div>
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
          </div>
        )}
      </IonCard>

      <IonLoading isOpen={contractLoading} message="Загрузка договора..." />
      {pdfData && (
        <PDFDocModal
          isOpen={pdfOpen}
          onClose={closePdf}
          pdfUrl={pdfData.url}
          fileName={pdfData.fileName}
          title={pdfData.title}
          showActions={false}
        />
      )}
    </div>
  )
}
