import React, { useState } from "react"
import { IonButton, IonCard, IonLoading, IonText } from "@ionic/react"
import { Agrees, Filesss } from "../Files"
import { useApps } from "./useApps"

export function Apps(): JSX.Element {
    const { apps, loading, refreshApps } = useApps()
    const [upd, setUpd] = useState(0)

    // TODO: Добавить обработку кнопки назад через Store.subscribe
    // Store.subscribe({num : 404, type: "back", func: handleBack})

    return (
        <>
            <IonText>
                <h1 className="main-title ion-text-wrap ml-1">
                    Договора, заявки
                </h1>
            </IonText>
            
            {loading && <IonLoading isOpen={loading} message="Загрузка..." />}
            
            {apps.map((app, i) => (
                <App key={app.id || i} info={app} onUpdate={() => setUpd(upd + 1)} />
            ))}
        </>
    )
}

function App({ info, onUpdate }: { info: any, onUpdate: () => void }): JSX.Element {
    const { loading, saveFiles } = useApps()
    const [localLoading, setLocalLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [mode, setMode] = useState(false)

    const handleSaveFiles = async () => {
        setLocalLoading(true)
        const success = await saveFiles(info.id, info.files)
        if (success) {
            setMode(false)
            onUpdate()
        }
        setLocalLoading(false)
    }

    const handleCancel = () => {
        setMode(false)
        onUpdate()
    }

    return (
        <IonCard className="pb-1 pr-1 s-card">
            <div className="mt-1 ml-1 t-underline">
                <b>{info.service}</b>
            </div>
            
            <div className="flex">
                <div className="flex fl-space ml-1 mt-1 w-50">
                    <div className="cl-gray">Дата</div>
                    <div>{info.date}</div>
                </div>
                <div className="flex fl-space ml-1 mt-1 w-50">
                    <div className="cl-gray">Номер</div>
                    <div>{info.number}</div>
                </div>
            </div>
            
            <div className="flex fl-space ml-1 mt-1">
                <div className="cl-gray">Адрес</div>
                <div>{info.address}</div>
            </div>
            
            <div className="flex fl-space ml-1 mt-1">
                <div className="cl-gray">Статус</div>
                <div>{info.status}</div>
            </div>

            {info.agreements?.Файлы?.length > 0 && (
                <Agrees info={info.agreements.Файлы} />
            )}

            {info.files?.Файлы?.length > 0 && (
                <>
                    <Filesss 
                        info={info.files.Файлы} 
                        onMode={setMode} 
                    />
                    <p className="ml-2">{message}</p>
                    
                    <div className="flex fl-space">
                        <div></div>
                        {mode && (
                            <div className="flex">
                                <IonButton onClick={handleCancel}>
                                    Отмена
                                </IonButton>
                                <IonButton onClick={handleSaveFiles}>
                                    Сохранить
                                </IonButton>
                            </div>
                        )}
                    </div>
                </>
            )}
            
            <IonLoading 
                isOpen={localLoading || loading} 
                message="Подождите" 
            />
        </IonCard>
    )
}