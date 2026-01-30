import React, { useEffect, useState } from "react"
import { IonCard, IonLoading, IonText, IonBadge, IonIcon, IonButton } from "@ionic/react"
import { useApps } from "./useApps"
import { useNavigateStore } from "../../Store/navigateStore"
import { locationOutline, calendarOutline, documentTextOutline, codeOutline, createOutline } from "ionicons/icons"
import styles from './Apps.module.css'
import { TService } from "../../Store/serviceStore"
import { AppOrder } from "./AppOrder"

/** Определяет цвет бейджа статуса на основе текста */
function getStatusColor(status: string): "success" | "warning" | "danger" | "medium" {
    const statusLower = (status || "").toLowerCase()
    if (statusLower.includes("обработке") || statusLower.includes("выполн") || statusLower.includes("готов")) {
        return "success"
    }
    if (statusLower.includes("ожидан") || statusLower.includes("проверк") || statusLower.includes("в процессе")) {
        return "warning"
    }
    if (statusLower.includes("отказ") || statusLower.includes("отмен") || statusLower.includes("проблем")) {
        return "danger"
    }
    return "medium"
}

export function Apps(): JSX.Element {
    const { apps, loading, refreshApps, get_details1, saveApp, previewApp } = useApps()
    const currentPage = useNavigateStore(state => state.currentPage)
    
    // Состояние для редактирования заявки
    const [editingApp, setEditingApp] = useState<TService | null>(null)
    const [appId, setAppId] = useState<string>("")

    useEffect(() => {
        if (currentPage === "/page/apps") {
            refreshApps()
        }
    }, [currentPage])

    const handleEdit = async (id: string) => {
        console.log("edit service")
        const res = await get_details1(id)
        console.log("edit service", res )
        if (res !== undefined) {
            console.log(id, res);
            setAppId(id)
            setEditingApp(res)
        }
    }

    const handleBack = () => {
        setEditingApp(null)
        setAppId("")
    }

    const handleSave = async (orderData: any) => {
        orderData.id = appId
        await saveApp(orderData)
        setEditingApp(null)
        setAppId("")
        refreshApps()
    }

    // Экран редактирования заявки
    if (editingApp) {
        console.log("editingApp", editingApp)
        return (
            <AppOrder
                service={editingApp}
                onSave={handleSave}
                onBack={handleBack}
                onPreview={previewApp}
            />
        )
    }

    return (
        <>
            <IonText>
                <h1 className="main-title ion-text-wrap ml-1">Договора, заявки</h1>
            </IonText>
            
            {loading && <IonLoading isOpen={loading} message="Загрузка заявок..." />}
            
            <div className={styles.appsContainer}>
                {apps.map((app, i) => (
                    <AppCard key={app.id || i} info={app} onEdit={handleEdit} />
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
    },
    onEdit: (id: string) => void 
}

function AppCard({ info, onEdit}: AppCardProps): JSX.Element {
    const address = typeof info.address === "object" ? info.address?.address : info.address
    const dateStr = info.date ? String(info.date).substring(0, 10) : "—"

    const handleEdit = () => {

        onEdit( info.id || '')

    }

    return (
        <IonCard className={styles.appCard}>
            <div className={styles.appHeader}>
                <div className={styles.appService}>
                    <IonIcon icon={documentTextOutline} className={styles.serviceIcon} />
                    <span className={styles.serviceText}>{info.service}</span>
                </div>
                { (info.status === "В обработке" || info.status === "Требуется документ") 
                && info.service === 'Заявка на договор тех/обслуживания ВДГО и ВКГО' 
                && (
                    <IonButton
                        fill="solid"
                        size="default"
                        className={styles.editButton}
                        onClick={handleEdit}
                    >
                        <IonIcon icon={createOutline} slot="start" />
                        Редактировать
                    </IonButton>
                )}
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
}