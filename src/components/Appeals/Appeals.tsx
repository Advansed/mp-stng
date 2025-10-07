import { IonCard, IonIcon, IonInput, IonLoading, IonModal, IonText } from "@ionic/react"
import React, { useEffect, useState } from "react"
import "./Appeals.css"
import { cameraOutline, imageOutline, syncCircleOutline } from "ionicons/icons"
import { useAppeals } from "./useAppeals"
import { takePicture } from "../Files"
import { useNavigateStore } from "../../Store/navigateStore"

export function Appeals() {
    const { 
        appeals, 
        messages, 
        selectedAppeal, 
        loading,
        selectAppeal,
        clearSelection,
        refreshAppeals,
        sendAppealMessage
    } = useAppeals()
    
    const currentPage = useNavigateStore(state => state.currentPage)
    
    useEffect(()=>{
        console.log("useAppeals", currentPage )
        if(currentPage === '/page/appeals')
            refreshAppeals()
    },[currentPage])

    
    const handleRefresh = () => {
        refreshAppeals()
        clearSelection()
    }

    return (
        <div className='w-100 h-100'>
            <div className='ml-1 h-3 flex fl-space'>
                <IonText>
                    <h1 className="main-title ion-text-wrap ion-text-start">
                        Обращения
                    </h1>
                </IonText>
                <IonIcon 
                    icon={syncCircleOutline} 
                    className="w-2 h-2 mr-1" 
                    color="warning"
                    onClick={handleRefresh}
                />
            </div>

            <div className='l-content'>
                {loading && <IonLoading isOpen={loading} />}
                {selectedAppeal ? (
                    <Messages appeal={selectedAppeal} />
                ) : (
                    <>
                        {appeals.map((appeal, i) => (
                            <Panel 
                                key={appeal.Код || i} 
                                info={appeal} 
                                onSelect={selectAppeal} 
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

function Panel({ info, onSelect }: { info: any, onSelect: (appeal: any) => void }) {
    return (
        <IonCard className="bg-3 pb-1" onClick={() => onSelect(info)}>
            <div className="flex fl-space ml-1 mr-1">
                <div className="ml-1 mt-1 fs-12"><b>{info.Наименование}</b></div>
                <div>{info.Период}</div>
            </div>
            
            <div className="flex fl-space mr-1 ml-1 mt-1 apl-string">
                <div className="w-90 apl-string">
                    {info.Картинка ? (
                        <div className="flex">
                            <IonIcon icon={imageOutline} className="w-15 h-15"/>
                            <span className="ml-05">Картинка</span>
                        </div>
                    ) : info.Текст}
                </div>
                <div className={info.Кнт === 0 ? "apl-cnt-1" : "apl-cnt"}>
                    {info.Кнт}
                </div>
            </div>
        </IonCard>
    )
}

function Messages({ appeal }: { appeal: any }) {
    const { messages, loading, refreshMessages, sendAppealMessage } = useAppeals()
    const [inputText, setInputText] = useState("")

    const handleSendMessage = async (text: string) => {
        await sendAppealMessage(text)
        setInputText("")
    }

    const handleSendPhoto = async () => {
        const img = await takePicture()
        await resizeImage(img) // TODO: Перенести функцию Size сюда
        await sendAppealMessage("", img)
    }

    // TODO: Перенести функцию Size из оригинала
    const resizeImage = async (source: any) => {
        // Логика изменения размера изображения
    }

    return (
        <div className="apl-body">
            <div className="apl-card">
                {messages.map((msg, i) => (
                    <MessageItem key={i} info={msg} />
                ))}
            </div>
            
            <div className="h-10 ml-1 mr-1 mt-1 fs-09">
                {appeal.Описание}
            </div>
            
            <div className="flex fl-space ml-1 mr-1 mt-1">
                <IonInput
                    className="apl-input"
                    placeholder="Введите сообщение..."
                    value={inputText}
                    onIonInput={(e) => setInputText(e.detail.value!)}
                />
                <IonIcon 
                    icon={cameraOutline} 
                    className="w-2 h-2 ml-1" 
                    onClick={handleSendPhoto}
                />
            </div>
            
            {loading && <IonLoading isOpen={loading} />}
        </div>
    )
}

function MessageItem({ info }: { info: any }) {
    return (
        <div className="flex fl-space">
            {info.Отправлен ? (
                <>
                    <div></div>
                    <div className="w-80 apl-bg mr-1">
                        {info.Картинка ? <MessageImage info={info} /> : info.Текст}
                        <div className="apl-date">{info.Время}</div>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-80 apl-bg1 ml-1">
                        {info.Картинка ? <MessageImage info={info} /> : info.Текст}
                        <div className="apl-date">{info.Время}</div>
                    </div>
                    <div></div>
                </>
            )}
        </div>
    )
}

function MessageImage({ info }: { info: any }) {
    const [img, setImg] = useState("")
    const [modal, setModal] = useState(false)

    // TODO: Реализовать загрузку изображения через fetch
    // const loadImage = async () => { ... }

    return (
        <>
            {img === "" ? (
                <IonIcon icon={imageOutline} />
            ) : (
                <img 
                    src={img} 
                    alt="Картинка" 
                    loading="lazy"
                    onClick={() => setModal(true)}
                />
            )}
            <IonModal isOpen={modal} onDidDismiss={() => setModal(false)}>
                <div className="w-100 h-100">
                    <img src={img} alt="" />
                </div>
            </IonModal>
        </>
    )
}