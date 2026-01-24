import { IonButton, IonCard, IonCardContent, IonCardHeader, IonLoading } from "@ionic/react"
import React, { useState } from "react"
import QRCode from "react-qr-code"
import "./Bonuse.css"
import { FioSuggestions } from "react-dadata"
import { useBonuses } from "./useBonuses"
import useBonusesStore from "../../Store/bonusesStore"
import { useAuthStore } from "../Login/authStore"

export function Bonuses({ name }: { name: string }) {
    const { bonusCard, loading, message, handleCreateCard, clearMessage } = useBonuses()

    // TODO: Добавить обработку кнопки назад через Store.subscribe
    // Store.subscribe({num : 404, type: "back", func: handleBack})

    if (bonusCard === null) {
        return (
            <>
                <IonLoading isOpen={loading} message="Подождите" />
                <img src="assets/robot.jpg" alt="robot" />
            </>
        )
    }

    if (!bonusCard.owner_id) {
        return (
            <>
                <IonLoading isOpen={loading} message="Подождите" />
                <IonCard>
                    <IonCardHeader className="t-underline ml-1 mr-1">
                        Бонусы АГЗС
                    </IonCardHeader>
                    <IonCardContent>
                        <FIOComponent />
                        <p>{message}</p>
                        <div className="mt-1">
                            <IonButton
                                expand="block"
                                mode="ios"
                                color="tertiary"
                                onClick={() => {
                                    clearMessage()
                                    handleCreateCard()
                                }}
                            >
                                Создать бонусную карту
                            </IonButton>
                        </div>
                    </IonCardContent>
                </IonCard>
            </>
        )
    }

    return (
        <>
            <IonLoading isOpen={loading} message="Подождите" />
            <IonCard>
                <IonCardHeader className="t-underline ml-1 mr-1">
                    Бонусы АГЗС
                </IonCardHeader>
                <IonCardContent>
                    <div className="flex fl-center mt-1 cl-prim">
                        <div>Накоплено</div>
                        <div className="ml-1">
                            <h1><b>{bonusCard.balance}</b></h1>
                        </div>
                        <div className="ml-1">баллов</div>
                    </div>
                    <div className="flex fl-center mt-1">
                        <div>
                            <QRCode value={bonusCard.QRCode || ''} />
                        </div>
                    </div>
                    <BonusCard card={bonusCard} />
                </IonCardContent>
            </IonCard>
        </>
    )
}

function BonusCard({ card }: { card: any }) {
    return (
        <div className="b-card">
            <div className="cl-white ml-1 pt-1">
                <h1><b>Бонусная карта</b></h1>
            </div>
            <div className="cl-white ml-1 mt-2">
                <h2><b>{card.name}</b></h2>
            </div>
            <div className="b-number cl-white">
                <h1><b>{card.card_id}</b></h1>
            </div>
        </div>
    )
}

function FIOComponent() {
    const { profile, handleSaveProfile } = useBonuses()
    const [upd, setUpd] = useState(0)
    
    const user = useAuthStore( state => state.user )

    const handleFIOChange = (e: any) => {
        const newProfile = {
            surname: e?.data.surname || '',
            name: e?.data.name || '',
            lastname: e?.data.patronymic || ''
        }
        
        handleSaveProfile(newProfile)
        setUpd(upd + 1)
    }

    return (
        <div className="ml-1 mr-1 mt-1 cl-prim fs-bold">
            <div>ФИО</div>
            <div className="ml-1">
                <FioSuggestions
                    token="50bfb3453a528d091723900fdae5ca5a30369832"
                    value={{
                        value: user?.surname + " " + user?.name + " " + user?.lastname,
                        unrestricted_value: user?.surname + " " + user?.name + " " + user?.lastname,
                        data: {
                            surname:    user?.surname || '',
                            name:       user?.name || '',
                            patronymic: user?.lastname || '',
                            gender:     "MALE",
                            source:     null,
                            qc:         "0"
                        }
                    }}
                    onChange={handleFIOChange}
                />
            </div>
        </div>
    )
}

// Утилитарные функции для шифрования (если понадобятся)
export const cipher = (text: string): string => {
    const st = text + ";" + (new Date()).toISOString()
    const jarr = st.split("")
    const key = "AOSTNG"
    let result = ""
    let i = 0
    
    jarr.forEach(elem => {
        if (i >= key.length) i = 0
        result += String.fromCharCode(elem.charCodeAt(0) + (key.charCodeAt(i) - key.charCodeAt(0)))
        i += 1
    })
    
    return result
}

export const decipher = (st: string): string => {
    const jarr = st.split("")
    const key = "AOSTNG"
    let result = ""
    let i = 0
    
    jarr.forEach(elem => {
        if (i >= key.length) i = 0
        result += String.fromCharCode(elem.charCodeAt(0) - (key.charCodeAt(i) - key.charCodeAt(0)))
        i += 1
    })
    
    return result
}