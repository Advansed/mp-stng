import { IonButton, IonCard, IonIcon, IonLoading, IonText } from "@ionic/react"
import { chevronForwardOutline, sendOutline } from "ionicons/icons"
import React, { useEffect, useState } from "react"
import { Store } from "./Store"

export function Request(){
    const [ load  ] = useState(false)
    const [ info ] = useState<any>([]) // eslint-disable-line @typescript-eslint/no-explicit-any

    useEffect(()=>{
        return ()=>{
            Store.unSubscribe( 404 )
        }
    },[])

    
    Store.subscribe({num : 404, type: "back", func: ()=>{
        Store.dispatch({type: "route", route: "back"})
    } })


    let items = <>
        <IonCard className="pb-1 v-card">
            <div className="ml-1 mt-1"> 
                <IonText class="fs-12 fs-bold cl-black"> Обращение</IonText>
            </div>
            <div className="flex fl-space">
                <div className="flex">
                    <IonButton
                        fill="clear"
                    >
                        <IonIcon icon = { sendOutline } slot = "icon-only"/>
                    </IonButton>
                    <div>
                        <IonText class="fs-11 fs-bold cl-black">Создать новое обращение</IonText>                        
                    </div>
                </div>
                <div>
                    <IonButton
                        fill="clear"
                    >
                        <IonIcon icon = { chevronForwardOutline } slot = "icon-only"/>
                    </IonButton>
                </div>
            </div>
        </IonCard>
    </>
    for(let i = 0; i < info.length; i){
        items = <>
            { items }
        </>
    }

    const elem = <>
        <IonLoading isOpen = { load } message={ "Подождите..." }/>

        <div className='ml-1 h-3'>
            <IonText>
                <h1 className="main-title ion-text-wrap ion-text-start">
                    { "Обращения" }
                </h1>
            </IonText>
        </div>

        <div>
            {
                items
            }
        </div>
    </>
    return elem
}