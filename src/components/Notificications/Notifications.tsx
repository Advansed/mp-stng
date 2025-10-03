import React from "react"
import { IonCard, IonText, IonLoading } from "@ionic/react"
import { useNotifications } from "./useNotifications"

export function Notifications() {
    const { notifications, loading } = useNotifications()

    // TODO: Добавить обработку кнопки назад через Store.subscribe
    // Store.subscribe({num : 404, type: "back", func: handleBack})

    return (
        <>
            <IonLoading isOpen={loading} message="Загрузка..." />
            <div>
                {notifications.map((notification, i) => (
                    <NotificationCard key={notification.id || i} notification={notification} />
                ))}
            </div>
        </>
    )
}

function NotificationCard({ notification }: { notification: any }) {
    return (
        <IonCard className="pb-1">
            <div className="ml-1 mt-1 flex fl-space mr-1 cl-prim">
                <div>
                    <b>{notification.Шапка}</b>
                </div>
                <div className="fs-10">{notification.Период}</div>
            </div>
            <div className="ml-2 mt-1">
                <IonText>{notification.Текст}</IonText>
            </div>
        </IonCard>
    )
}
