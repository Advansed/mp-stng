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
import { badgeColor, statusLabel } from "./appStatusUtils"

type AppsLocationState = {
  statuses?: AppStatusEntry[]
  editAppId?: string
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
  const dateStr = (() => {
    if (!info.date) return "—"
    const raw = String(info.date)
    const d = new Date(raw.includes("T") ? raw : raw.replace(" ", "T"))
    if (Number.isNaN(d.getTime())) return raw.substring(0, 10)
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" })
  })()

  return (
    <IonCard
      className={styles.appCard}
      button
      onClick={() => {
        if (info.id) onOpenStatuses(info.id, info.statuses)
      }}
    >
      <div className={styles.appCardInner}>
        <div className={styles.appTop}>
          <div className={styles.appService}>
            <IonIcon icon={documentTextOutline} className={styles.serviceIcon} aria-hidden />
            <h2 className={styles.serviceText}>{info.service || "Заявка"}</h2>
          </div>
          <IonBadge color={badgeColor(info.status)} className={styles.statusBadge}>
            {statusLabel(info.status)}
          </IonBadge>
        </div>

        <div className={styles.appMeta}>
          <div className={styles.metaItem}>
            <IonIcon icon={codeOutline} className={styles.metaIcon} aria-hidden />
            <span className={styles.metaLabel}>№</span>
            <span className={styles.metaNumber}>{info.number || "—"}</span>
          </div>
          <span className={styles.metaDot} aria-hidden />
          <div className={styles.metaItem}>
            <IonIcon icon={calendarOutline} className={styles.metaIcon} aria-hidden />
            <span className={styles.metaDate}>{dateStr}</span>
          </div>
        </div>

        <div className={styles.appAddress}>
          <IonIcon icon={locationOutline} className={styles.addressIcon} aria-hidden />
          <div className={styles.addressBody}>
            <div className={styles.addressLabel}>Адрес</div>
            <div className={styles.addressValue}>{address || "—"}</div>
          </div>
        </div>
      </div>
    </IonCard>
  )
})
