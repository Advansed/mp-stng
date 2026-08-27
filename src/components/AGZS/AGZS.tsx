import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonImg,
  IonLoading,
  IonText,
} from "@ionic/react"
import React, { useEffect, useState } from "react"
import { playCircleOutline, stopCircleOutline } from "ionicons/icons"
import styles from "./AGZS.module.css"
import { getCameras } from "../../Store/api"

type CameraInfo = {
  name?: string
  url?: string
  preview?: string
  map?: string
  status?: boolean
  id?: string | number
}

export function Agzs() {
  const [load, setLoad] = useState(false)
  const [info, setInfo] = useState<CameraInfo[]>([])
  /** Одновременно играет только одна камера — иначе HlsPlayer спамит timeupdate */
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      setLoad(true)
      try {
        const res = await getCameras()
        if (!cancelled && res.status) setInfo(res.data || [])
      } finally {
        if (!cancelled) setLoad(false)
      }
    }
    void loadData()
    return () => {
      cancelled = true
      setActiveId(null)
    }
  }, [])

  const cameraKey = (cam: CameraInfo, index: number) =>
    String(cam.id ?? cam.url ?? cam.name ?? index)

  return (
    <>
      <IonLoading isOpen={load} message="Подождите..." />
      <div className={styles.fone}>
        <div className={styles.header}>
          <IonImg className={styles.pattern} src="assets/img/pattern2.png" alt="" />
          <IonText>
            <h1 className={`${styles.mainTitle} ion-text-wrap ion-text-start`}>
              Мониторинг АГЗС
            </h1>
          </IonText>
        </div>
      </div>

      <div className={styles.lContent}>
        {info.map((cam, i) => {
          const key = cameraKey(cam, i)
          const isPlaying = activeId === key && !!cam.status && !!cam.url
          return (
            <IonCard className={styles.vCard} key={key}>
              {isPlaying ? (
                <div className={styles.videoWrap}>
                  <iframe
                    className={styles.video}
                    height="100%"
                    width="100%"
                    src={cam.url}
                    allow="autoplay; picture-in-picture"
                    title={cam.name || "Камера"}
                  />
                  <button
                    type="button"
                    className={styles.stopBtn}
                    onClick={() => setActiveId(null)}
                  >
                    <IonIcon icon={stopCircleOutline} />
                    Остановить
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.previewWrap}
                  disabled={!cam.status || !cam.url}
                  onClick={() => {
                    if (cam.status && cam.url) setActiveId(key)
                  }}
                >
                  {cam.preview ? (
                    <IonImg src={cam.preview} alt="" />
                  ) : (
                    <div className={styles.previewFallback} />
                  )}
                  {cam.status && cam.url ? (
                    <span className={styles.playOverlay}>
                      <IonIcon icon={playCircleOutline} className={styles.playIcon} />
                      <span>Смотреть</span>
                    </span>
                  ) : (
                    <span className={styles.offlineBadge}>Недоступна</span>
                  )}
                </button>
              )}
              <IonCardHeader>
                <IonButton
                  color="tertiary"
                  expand="block"
                  mode="ios"
                  onClick={() => {
                    if (cam.map) window.open(cam.map, "_system")
                  }}
                >
                  Посмотреть на карте
                </IonButton>
                <IonCardTitle>{cam.name}</IonCardTitle>
              </IonCardHeader>
            </IonCard>
          )
        })}
      </div>
    </>
  )
}
