import React, { memo, useCallback, useEffect, useRef } from "react"
import { IonCard, IonLoading, IonText, IonBadge, IonIcon, useIonViewWillEnter } from "@ionic/react"
import { useHistory, useLocation, useRouteMatch } from "react-router-dom"
import { useApps } from "./useApps"
import { useNavigateStore } from "../../Store/navigateStore"
import { locationOutline, calendarOutline, documentTextOutline, codeOutline } from "ionicons/icons"
import styles from "./Apps.module.css"
import { TService } from "../../Store/serviceStore"
import useAppsStore from "../../Store/appStore"
import { AppOrder } from "./AppOrder"
import { AppStatuses } from "./AppStatuses"
import type { AppStatusEntry, EditingApp } from "../../Store/appStore"

type AppsLocationState = {
  statuses?: AppStatusEntry[]
  editAppId?: string
}

/** Определяет цвет бейджа статуса на основе текста */
function getStatusColor(status: string): "success" | "warning" | "danger" | "medium" | "primary" {
  const statusLower = (status || "").toLowerCase()
  if (statusLower.includes("требуются") || statusLower.includes("выполн") || statusLower.includes("готов")) {
    return "primary"
  }
  if (statusLower.includes("ожидан") || statusLower.includes("обработке") || statusLower.includes("в процессе")) {
    return "warning"
  }
  if (statusLower.includes("отказ") || statusLower.includes("отмен") || statusLower.includes("проблем")) {
    return "danger"
  }
  return "medium"
}

export function Apps(): JSX.Element {
  const { apps, loading, refreshApps, get_details1, saveApp, previewApp } = useApps()
  const editingApp = useAppsStore((state) => state.app)
  const setApp = useAppsStore((state) => state.setApp)
  const setCurrentPage = useNavigateStore((state) => state.setCurrentPage)
  const location = useLocation<AppsLocationState>()
  const history = useHistory()
  const statusMatch = useRouteMatch<{ appId: string }>("/page/apps/status/:appId")
  const lastHandledEditIdRef = useRef<string>("")

  const refreshAppsRef = useRef(refreshApps)

  useEffect(() => {
    refreshAppsRef.current = refreshApps
  }, [refreshApps])

  useIonViewWillEnter(() => {
    void refreshAppsRef.current()
  }, [])

  const handleEdit = useCallback(async (id: string) => {
    const res = await get_details1(id)
    if (res !== undefined && res.details) {
      const next: EditingApp = { id, service: res.details as TService }
      if (res.ai_status && typeof res.ai_status === "object") {
        next.ai_status = res.ai_status as EditingApp["ai_status"]
      }
      setApp(next)
    } else if (res !== undefined) {
      setApp({ id, service: res as TService })
    }
  }, [get_details1, setApp])

  useEffect(() => {
    const queryEditId = new URLSearchParams(location.search).get("editAppId") || ""
    const stateEditId = location.state?.editAppId || ""
    const editAppId = queryEditId || stateEditId

    if (!editAppId) return
    if (lastHandledEditIdRef.current === editAppId) return

    lastHandledEditIdRef.current = editAppId
    void handleEdit(editAppId)
    history.replace("/page/apps")
  }, [location.search, location.state, history, handleEdit])

  const handleBack = useCallback(() => {
    setApp(null)
  }, [setApp])

  const handleSave = useCallback(async (orderData: any) => {
    const id = useAppsStore.getState().app?.id
    if (id) orderData.id = id
    await saveApp(orderData)
    setApp(null)
    void refreshApps()
  }, [saveApp, refreshApps, setApp])

  const openStatuses = useCallback((id: string, statuses?: AppStatusEntry[]) => {
    const path = `/page/apps/status/${id}`
    setCurrentPage(path)
    history.push(path, { statuses })
  }, [setCurrentPage, history])

  if (editingApp) {
    return (
      <AppOrder
        onSave={handleSave}
        onBack={handleBack}
        onPreview={previewApp}
      />
    )
  }

  if (statusMatch?.params.appId) {
    return <AppStatuses appId={statusMatch.params.appId} onEditApp={handleEdit} />
  }

  return (
    <>
      <IonText>
        <h1 className="main-title ion-text-wrap ml-1">Договора, заявки</h1>
      </IonText>

      {loading && <IonLoading isOpen={loading} message="Загрузка заявок..." />}

      <div className={styles.appsContainer}>
        {apps.map((row, i) => (
          <AppCard key={row.id || i} info={row} onOpenStatuses={openStatuses} />
        ))}
      </div>
    </>
  )
}

interface AppCardProps {
  info: {
    id?: string
    service: string
    date: string
    number: string
    address: string | { address?: string }
    status: string
    statuses?: AppStatusEntry[]
  }
  onOpenStatuses: (id: string, statuses?: AppStatusEntry[]) => void
}

const AppCard = memo(function AppCard({ info, onOpenStatuses }: AppCardProps): JSX.Element {
  const address = typeof info.address === "object" ? info.address?.address : info.address
  const dateStr = info.date ? String(info.date).substring(0, 10) : "—"

  return (
    <IonCard
      className={styles.appCard}
      button
      onClick={() => {
        if (info.id) onOpenStatuses(info.id, info.statuses)
      }}
    >
      <div className={styles.appHeader}>
        <div className={styles.appService}>
          <IonIcon icon={documentTextOutline} className={styles.serviceIcon} />
          <span className={styles.serviceText}>{info.service}</span>
        </div>
      </div>

      <div className={styles.appContent}>
        <div className={styles.infoRow}>
          <div className={styles.infoItem}>
            <div className={styles.infoContent}>
              <IonBadge color={getStatusColor(info.status)} className={styles.statusBadge}>
                {info.status}
              </IonBadge>
            </div>
          </div>

          <div className={styles.infoItem}>
            <IonIcon icon={calendarOutline} className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <div className={styles.infoLabel}>Дата</div>
              <div className={styles.infoValue}>{dateStr}</div>
            </div>
          </div>

          <div className={styles.infoItem}>
            <IonIcon icon={codeOutline} className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <div className={styles.infoLabel}>Номер</div>
              <div className={`${styles.infoValue} ${styles.numberValue}`}>{info.number}</div>
            </div>
          </div>
        </div>

        <div className={`${styles.infoItem} ${styles.fullWidth}`}>
          <IonIcon icon={locationOutline} className={styles.infoIcon} />
          <div className={styles.infoContent}>
            <div className={styles.infoLabel}>Адрес</div>
            <div className={`${styles.infoValue} ${styles.addressValue}`}>{address || "—"}</div>
          </div>
        </div>
      </div>
    </IonCard>
  )
})
