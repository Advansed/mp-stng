import { IonButton, IonCard, IonCardHeader, IonCardTitle, IonImg, IonLoading, IonText } from "@ionic/react"
import React, { useEffect, useState } from "react"
import styles from "./AGZS.module.css"
import { getCameras } from "../../Store/api"

export function Agzs(){
    const [ load ] = useState( false)
    const [ info, setInfo ] = useState<any>([]) // eslint-disable-line @typescript-eslint/no-explicit-any

    useEffect(()=>{
        async function loadData(){
            const res = await getCameras();
            if(res.status)
                setInfo(res.data)
        }
        loadData()
    },[])

    function Card(props: { info }) :JSX.Element{
        const info = props.info
        const elem = <>
            <IonCard className={styles.vCard}>
                {
                    info.status 
                        ? <div className={styles.videoWrap}>
                            <iframe 
                                id="iframe" 
                                className={styles.video} 
                                height="100%" 
                                width="100%" 
                                src={info.url}
                                allow="autoplay; picture-in-picture" 
                                title="Камера"
                            />
                        </div>
                        : <div className={styles.previewWrap}>
                            <IonImg src={info.preview} alt="" />
                        </div>
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
            {
                items
            }
        </div>
    </>
    return elem
}