import React, { memo, useCallback, useEffect, useRef, useState } from "react"
import { IonCard, IonLoading, IonBadge, IonIcon } from "@ionic/react"
import { Redirect, useHistory, useLocation, useRouteMatch } from "react-router-dom"
import { ROUTES } from "../../routes"
import { useApps } from "./useApps"
import { locationOutline, calendarOutline, documentTextOutline, codeOutline } from "ionicons/icons"
import styles from "./Apps.module.css"
import { TServiceRecord, useServiceStore } from "../../Store/serviceStore"
import useAppsStore from "../../Store/appStore"
import { useNavigateStore } from "../../Store/navigateStore"
import { useToken } from "../Login/authStore"
import { serviceEditorTarget, ServiceGroup } from "../Services/Services"
import { AppOrder } from "./AppOrder"
import { AppStatuses } from "./AppStatuses"
import type { AppStatusEntry } from "../../Store/appStore"
import { badgeColor, statusLabel } from "./appStatusUtils"

type AppsLocationState = {
  statuses?: AppStatusEntry[]
  editAppId?: string
}

export function Apps(): JSX.Element {
  const { loading, get_details1, saveApp, previewApp } = useApps()
  const token = useToken()
  const editingApp = useAppsStore((state) => state.app)
  const setApp = useAppsStore((state) => state.setApp)
  const location = useLocation<AppsLocationState>()
  const history = useHistory()
  const statusMatch = useRouteMatch<{ appId: string }>(ROUTES.appStatusPattern)
  const lastHandledEditIdRef = useRef<string>("")
  const [editPending, setEditPending] = useState(false)
  const editAppId =
    new URLSearchParams(location.search).get("editAppId") || location.state?.editAppId || ""

  const openServiceEditor = useCallback((target: ServiceGroup) => {
    const nav = useNavigateStore.getState()
    nav.setItem(target)
    nav.setPage(2)
    nav.setCurrentPage(ROUTES.services)
    history.push(ROUTES.services)
  }, [history])

  const handleEdit = useCallback(async (id: string) => {
    let target = serviceEditorTarget(useServiceStore.getState().services, id)
    if (!target && token) {
      await useServiceStore.getState().loadServices(token, { silent: true })
      target = serviceEditorTarget(useServiceStore.getState().services, id)
    }
    if (target) {
      openServiceEditor(target)
      return
    }

    const res = await get_details1(id)
    const service = (res && res.details ? res.details : res) as TServiceRecord | undefined
    if (!service || !Array.isArray(service.chapters) || service.chapters.length === 0) return
    openServiceEditor({
      title: String(service.text || service.title || 'Заявка'),
      source: service,
      submitted: [],
      editing: service,
    })
  }, [get_details1, openServiceEditor, token])

  useEffect(() => {
    if (!editAppId) return
    if (lastHandledEditIdRef.current === editAppId) return

    lastHandledEditIdRef.current = editAppId
    setEditPending(true)
    void handleEdit(editAppId).finally(() => setEditPending(false))
  }, [editAppId, handleEdit])

  const handleBack = useCallback(() => {
    setApp(null)
  }, [setApp])

  const handleSave = useCallback(async (orderData: any) => {
    const id = useAppsStore.getState().app?.id
    if (id) orderData.id = id
    await saveApp(orderData)
    setApp(null)
  }, [saveApp, setApp])

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

  if (!editingApp && !editAppId && !editPending) {
    return <Redirect to={ROUTES.services} />
  }

  return <IonLoading isOpen={loading || editPending} message="Загрузка заявки..." />
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

export const AppCard = memo(function AppCard({ info, onOpenStatuses }: AppCardProps): JSX.Element {
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
