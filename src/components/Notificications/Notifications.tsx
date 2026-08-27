import React, { useEffect, useMemo } from "react"
import { IonIcon, IonLoading, IonText } from "@ionic/react"
import { notificationsOutline, timeOutline } from "ionicons/icons"
import { useNotifications } from "./useNotifications"
import { useNavigateStore } from "../../Store/navigateStore"
import styles from "./Notifications.module.css"

function formatPeriod(period: unknown): string {
  if (period == null || period === "") return "—"
  const raw = String(period).trim()
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T")
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) {
    // ДД.ММ.ГГГГ or already localized
    return raw
  }
  const hasTime = /[T ]\d{1,2}:\d{2}/.test(raw)
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(hasTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  })
}

export function Notifications() {
  const { pages, notifications, loading, refreshNotifications } = useNotifications()
  const currentPage = useNavigateStore((state) => state.currentPage)

  useEffect(() => {
    if (currentPage !== "/page/push") return
    if (pages !== -1 || loading) return
    refreshNotifications()
  }, [currentPage, pages, loading, refreshNotifications])

  return (
    <div className={styles.page}>
      <IonLoading isOpen={loading} message="Загрузка уведомлений..." />

      <div className={styles.hero}>
        <div className={styles.heroKicker}>Лента</div>
        <h1 className={styles.heroTitle}>Уведомления</h1>
      </div>

      {notifications.length === 0 && !loading ? (
        <div className={styles.empty}>Пока нет уведомлений</div>
      ) : (
        <div className={styles.list}>
          {notifications.map((notification, i) => (
            <NotificationCard key={notification.id || i} notification={notification} />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationCard({ notification }: { notification: any }) {
  const periodLabel = useMemo(
    () => formatPeriod(notification.Период),
    [notification.Период]
  )

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.titleRow}>
          <IonIcon icon={notificationsOutline} className={styles.titleIcon} aria-hidden />
          <h2 className={styles.title}>{notification.Шапка || "Уведомление"}</h2>
        </div>
        <div className={styles.period}>
          <IonIcon icon={timeOutline} className={styles.periodIcon} aria-hidden />
          <time dateTime={String(notification.Период || "")}>{periodLabel}</time>
        </div>
      </div>
      {notification.Текст ? (
        <IonText>
          <p className={styles.body}>{notification.Текст}</p>
        </IonText>
      ) : null}
    </article>
  )
}
