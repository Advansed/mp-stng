import React, { useEffect, useState } from "react"
import { IonCard, IonLoading, IonText, IonBadge, IonIcon } from "@ionic/react"
import { useApps } from "./useApps"
import { useNavigateStore } from "../../Store/navigateStore"
import { useToast } from "../Toast"
import { locationOutline, calendarOutline, documentTextOutline, codeOutline, arrowForwardOutline } from "ionicons/icons"
import styles from './Apps.module.css'

export function Apps(): JSX.Element {
    const { apps, loading, refreshApps, saveFiles } = useApps()
    const currentPage = useNavigateStore(state => state.currentPage)
    
    useEffect(()=>{
        console.log("useApps", currentPage )
        if(currentPage === '/page/apps')
            refreshApps()
    },[currentPage])

    return (
        <>
            <IonText>
                <h1 className="main-title ion-text-wrap ml-1">
                    Договора, заявки
                </h1>
            </IonText>
            
            {loading && <IonLoading isOpen={loading} message="Загрузка заявок..." />}
            
            <div className={styles.appsContainer}>
                {apps.map((app, i) => (
                    <App key={app.id || i} info={app}  />
                ))}
            </div>
        </>
    )
}

function App({ info }: { info: any }): JSX.Element {
    const [mode, setMode] = useState(false)
    const toast = useToast()

    // Функция для определения цвета статуса
    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase()
        if (statusLower.includes('обработке') || statusLower.includes('выполн') || statusLower.includes('готов')) {
            return "success"
        } else if (statusLower.includes('ожидан') || statusLower.includes('проверк') || statusLower.includes('в процессе')) {
            return "warning"
        } else if (statusLower.includes('отказ') || statusLower.includes('отмен') || statusLower.includes('проблем')) {
            return "danger"
        } else {
            return "medium"
        }
    }

    return (
        <IonCard className={styles.appCard}>
            <div className={styles.appHeader}>
                <div className={styles.appService}>
                    <IonIcon icon={documentTextOutline} className={styles.serviceIcon} />
                    <span className={styles.serviceText}>{info.service}</span>
                </div>
            </div>

            <div className={styles.appContent}>
                <div className={styles.infoRow}>
                    <div className={styles.infoItem}>
                        <div className={ styles.infoContent}>
                            <IonBadge color={getStatusColor(info.status)} className={styles.statusBadge}>
                                {info.status}
                            </IonBadge>
                        </div>
                    </div>

                        <div className={styles.infoItem}>
                            <IonIcon icon={calendarOutline} className={styles.infoIcon} />
                            <div className={ styles.infoContent}>
                                <div className={styles.infoLabel}>Дата</div>
                                <div className={styles.infoValue}>{info.date.substring(0, 10)}</div>
                            </div>
                        </div>
                        
                        <div className={styles.infoItem}>
                            <IonIcon icon={ codeOutline} className={styles.infoIcon} />
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
                        <div className={`${styles.infoValue} ${styles.addressValue}`}>{info.address.address || info.address}</div>
                    </div>
                </div>
            </div>
        </IonCard>
    )
}