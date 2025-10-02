import { IonButton, IonCard, IonCardHeader, IonCardTitle, IonImg, IonLoading, IonText } from "@ionic/react"
import React, { useEffect, useState } from "react"
import './AGZS.css'
import { getCameras } from "../Store/api"

export function Agzs(){
    const [ load ] = useState( false)
    const [ info, setInfo ] = useState<any>([]) // eslint-disable-line @typescript-eslint/no-explicit-any

    useEffect(()=>{
        async function load(){
            const res = await getCameras();
            if(res.status)
                setInfo(res.data)
        }
        load()
    },[])

    function Card(props: { info }) :JSX.Element{
        const info = props.info
        const elem = <>
            <IonCard
                className="v-card"
            >
                {
                    info.status 
                        ? <>
                            <iframe 
                                // ref="iframeRef" 
                                id="iframe" 
                                className="video" 
                                height="100%" 
                                width="100%" 
                                src = { info.url }
                                allow="autoplay; fullscreen; picture-in-picture" 
                            ></iframe>
                        </>
                        : <>
                            <IonImg src = { info.preview } alt = ""/>
                        </>
                }
                <IonCardHeader>
                    <IonButton
                        color="tertiary"
                        expand="block"
                        mode = "ios"
                        onClick={()=>{
                            window.open(info.map, "_system");
                        }}
                    >
                        Посмотреть на карте
                    </IonButton>
                    <IonCardTitle>
                        { info.name }
                    </IonCardTitle>
                </IonCardHeader>            
            </IonCard>
        </>

        return elem
    }

    let items = <></>
    for(let i = 0; i < info.length;i++){
        items = <>
            { items }
            <Card info = { info[i] } />
        </>
    }
    const elem = <>
        <IonLoading isOpen = { load } message={ "Подождите..." }/>
        <div className='fone'>
            <div className="header">
                <IonImg class="pattern" src = 'assets/img/pattern2.png' />
                <IonText>
                    <h1 className="main-title ion-text-wrap ion-text-start">
                        { "Мониторинг АГЗС" }
                    </h1>
                </IonText>
            </div>
        </div>

        <div
            className='l-content'
        >
            {
                items
            }
        </div>
    </>
    return elem
}