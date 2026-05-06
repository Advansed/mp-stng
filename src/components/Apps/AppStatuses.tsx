import React, { useEffect, useMemo } from 'react'
import { IonBadge, IonButton, IonCard, IonText } from '@ionic/react'
import { useLocation } from 'react-router-dom'
import { createOutline, timeOutline } from 'ionicons/icons'
import { IonIcon } from '@ionic/react'
import useAppsStore, { AppStatusEntry } from '../../Store/appStore'
import { useToken } from '../Login/authStore'
import styles from './AppStatuses.module.css'

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  ai_checked: 'Проверено ИИ',
  created: 'Договор создан',
}

function formatPeriod(period: string): string {
  const normalized = period.includes('T') ? period : period.replace(' ', 'T')
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return period
  return d.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

function statusLabel(status: string): string {
  const key = (status || '').toLowerCase()
  return STATUS_LABELS[key] ?? status.replace(/_/g, ' ')
}

function badgeColor(status: string): 'success' | 'warning' | 'danger' | 'medium' | 'primary' {
  const s = (status || '').toLowerCase()
  if (s.includes('check') || s.includes('done') || s.includes('complete')) return 'success'
  if (s.includes('wait') || s.includes('process')) return 'warning'
  if (s.includes('fail') || s.includes('reject') || s.includes('cancel')) return 'danger'
  if (s === 'new') return 'medium'
  if (s === 'created') return 'warning'
  return 'primary'
}

type LocationState = { statuses?: AppStatusEntry[] }

interface AppStatusesProps {
  appId: string
  onEditApp?: (id: string) => void
}

type AnyObj = Record<string, any>

interface AICheckPayload {
  id?: string
  status?: boolean
  checks?: {
    passport_front?: { is_passport?: boolean; has_error?: boolean; data?: AnyObj }
    passport_reg?: { is_propiska?: boolean; has_error?: boolean; data?: AnyObj }
    egrn?: { is_egrn?: boolean; has_error?: boolean; data?: AnyObj }
    akt?: { is_akt?: boolean; has_error?: boolean; data?: AnyObj }
  }
}

type CheckKey = keyof NonNullable<AICheckPayload['checks']>

/** Флаги is_passport / is_egrn / … — признак типа файла, а не «проверка пройдена». */
const CHECK_RULES: {
  key: CheckKey
  shortLabel: string
  matchesExpectedType: (c: AnyObj) => boolean
  matchText: string
  noMatchText: string
}[] = [
  {
    key: 'passport_front',
    shortLabel: 'Паспорт',
    matchesExpectedType: (c) => c.is_passport === true,
    matchText: 'есть',
    noMatchText: 'нет',
  },
  {
    key: 'passport_reg',
    shortLabel: 'Прописка',
    matchesExpectedType: (c) => c.is_propiska === true,
    matchText: 'есть',
    noMatchText: 'нет',
  },
  {
    key: 'egrn',
    shortLabel: 'ЕГРН',
    matchesExpectedType: (c) => c.is_egrn === true,
    matchText: 'есть',
    noMatchText: 'нет',
  },
  {
    key: 'akt',
    shortLabel: 'Акт вентканала',
    matchesExpectedType: (c) => c.is_akt === true,
    matchText: 'есть',
    noMatchText: 'нет',
  },
]

function deriveChecksUi(checks: AICheckPayload['checks']): {
  rows: {
    key: CheckKey
    shortLabel: string
    matchesType: boolean
    lineText: string
    hasError: boolean
  }[]
} {
  if (!checks || typeof checks !== 'object') {
    return { rows: [] }
  }

  const rows: {
    key: CheckKey
    shortLabel: string
    matchesType: boolean
    lineText: string
    hasError: boolean
  }[] = []
  for (const rule of CHECK_RULES) {
    const raw = checks[rule.key]
    if (raw == null) continue
    const c = raw as AnyObj
    const matchesType = rule.matchesExpectedType(c)
    const lineText = matchesType ? rule.matchText : rule.noMatchText
    const hasError = c.has_error === true
    rows.push({ key: rule.key, shortLabel: rule.shortLabel, matchesType, lineText, hasError })
  }

  return { rows }
}

type OverallVerdict = 'passed' | 'failed' | 'unknown'

/** Общий итог только по полю status с бэка; is_* в checks на это не влияют. */
function overallVerdictFromAi(ai: AICheckPayload | null): OverallVerdict {
  if (!ai) return 'unknown'
  if (ai.status === false) return 'failed'
  if (ai.status === true) return 'passed'
  return 'unknown'
}

function parsePossibleObject(value: unknown): AnyObj | null {
  if (!value) return null
  if (typeof value === 'object') return value as AnyObj
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object') return parsed as AnyObj
    } catch {
      return null
    }
  }
  return null
}

function extractAI(row: AppStatusEntry): AICheckPayload | null {
  const source = row as unknown as AnyObj
  const aiStatusObj = parsePossibleObject(source.ai_status)
  const payloadObj = parsePossibleObject(source.payload)

  let statusCandidate: boolean | undefined = undefined
  if (typeof source.verify_status === 'boolean') statusCandidate = source.verify_status
  else if (typeof source.check_status === 'boolean') statusCandidate = source.check_status
  else if (typeof source.ai_status === 'boolean') statusCandidate = source.ai_status
  else if (typeof aiStatusObj?.status === 'boolean') statusCandidate = aiStatusObj.status
  else if (typeof payloadObj?.status === 'boolean') statusCandidate = payloadObj.status

  // Основной новый формат: вся структура в ai_status
  if (aiStatusObj?.checks) {
    return {
      id: aiStatusObj.id || source.id,
      status: statusCandidate,
      checks: aiStatusObj.checks,
    }
  }

  if (source.checks) {
    return {
      id: source.id,
      status: statusCandidate,
      checks: source.checks,
    }
  }

  if (payloadObj?.checks) {
    return {
      id: payloadObj.id,
      status: typeof payloadObj.status === 'boolean' ? payloadObj.status : statusCandidate,
      checks: payloadObj.checks,
    }
  }

  return null
}

function isAIStatusRow(status: string): boolean {
  const value = (status || '').toLowerCase()
  return value === 'ai_checked' || value.includes('проверено ии')
}

function isNewStatus(status: string): boolean {
  return (status || '').toLowerCase() === 'new'
}

function isCreatedStatus(status: string): boolean {
  return (status || '').toLowerCase() === 'created'
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

  useEffect(() => {
    if (!token) return
    const hasApp = useAppsStore.getState().apps.some((a) => a.id === appId)
    if (!hasApp) void fetchApps(token)
  }, [appId, fetchApps, token])

  const app = useMemo(() => apps.find((a) => a.id === appId), [apps, appId])

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
  const lastStatusAI = useMemo(() => {
    if (!lastStatus) return null
    const appLevelAI = extractAI((app || {}) as unknown as AppStatusEntry)
    const fromRow = extractAI(lastStatus)
    if (fromRow) return fromRow
    if (isAIStatusRow(lastStatus.status) || isNewStatus(lastStatus.status)) return appLevelAI
    return null
  }, [lastStatus, app])

  const showContractSigning = useMemo(() => {
    if (!lastStatus) return false
    return isCreatedStatus(lastStatus.status)
  }, [lastStatus])

  const showContractCreating = useMemo(() => {
    if (!lastStatus || !lastStatusAI || isCreatedStatus(lastStatus.status)) return false
    if (!isAIStatusRow(lastStatus.status)) return false
    return overallVerdictFromAi(lastStatusAI) === 'passed'
  }, [lastStatus, lastStatusAI])

  const showNextAction = useMemo(() => {
    if (!lastStatus || !lastStatusAI || isCreatedStatus(lastStatus.status)) return false
    return overallVerdictFromAi(lastStatusAI) === 'failed'
  }, [lastStatus, lastStatusAI])

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
            {displayRows.map((row, i) => {
              const appLevelAI = extractAI((app || {}) as unknown as AppStatusEntry)
              const ai = extractAI(row) ?? (isAIStatusRow(row.status) ? appLevelAI : null)
              const derived = ai?.checks ? deriveChecksUi(ai.checks) : { rows: [] }
              const verdict = overallVerdictFromAi(ai)

              return (
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

                    {ai && (
                      <div className={styles.aiBox}>
                        <div className={styles.aiResultRow}>
                          <span className={styles.aiResultLabel}>Результат ИИ:</span>
                          <span
                            className={
                              verdict === 'passed'
                                ? styles.aiOk
                                : verdict === 'failed'
                                  ? styles.aiFail
                                  : styles.aiUnknown
                            }
                          >
                            {verdict === 'passed'
                              ? 'проверка пройдена'
                              : verdict === 'failed'
                                ? 'проверка не пройдена'
                                : 'общий статус проверки не указан'}
                          </span>
                        </div>

                        {derived.rows.length > 0 && (
                          <div className={styles.aiFlags}>
                            {derived.rows.map((line) => (
                              <span
                                key={line.key}
                                className={line.matchesType ? styles.flagTypeMatch : styles.flagTypeOther}
                                title={
                                  line.hasError
                                    ? 'ИИ отметил замечание по этому файлу (не равно «проверка не пройдена» целиком)'
                                    : undefined
                                }
                              >
                                <span className={styles.flagTypeLabel}>{line.shortLabel}:</span>{' '}
                                {line.lineText}
                                {line.hasError ? ' · есть замечание' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {!ai && isAIStatusRow(row.status) && (
                      <div className={styles.aiMissing}>
                        Данные проверки ИИ не найдены в этом статусе (ожидался объект `ai_status` с `checks`).
                      </div>
                    )}

                  </div>
                </div>
              )
            })}
            {showContractSigning && (
              <div className={`${styles.row} ${styles.contractSigningRow}`} role="listitem">
                <div className={`${styles.dot} ${styles.contractSigningDot}`} aria-hidden />
                <div className={`${styles.body} ${styles.contractSigningBody}`}>
                  <div className={styles.contractSigningTitle}>
                    Договор создан и находится в подписании
                  </div>
                </div>
              </div>
            )}
            {showContractCreating && (
              <div className={`${styles.row} ${styles.contractCreatingRow}`} role="listitem">
                <div className={`${styles.dot} ${styles.contractCreatingDot}`} aria-hidden />
                <div className={`${styles.body} ${styles.contractCreatingBody}`}>
                  <div className={styles.contractCreatingTitle}>Договор на создании</div>
                </div>
              </div>
            )}
            {showNextAction && (
              <div className={`${styles.row} ${styles.nextActionRow}`} role="listitem">
                <div className={`${styles.dot} ${styles.nextActionDot}`} aria-hidden />
                <div className={`${styles.body} ${styles.nextActionBody}`}>
                  <div className={styles.nextActionHeader}>Следующее действие</div>
                  <div className={styles.nextActionHint}>Исправьте данные и отправьте заявку повторно</div>
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
                </div>
              </div>
            )}
          </div>
        )}
      </IonCard>
    </div>
  )
}
