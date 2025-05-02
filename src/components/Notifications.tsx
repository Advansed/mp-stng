import React, { useEffect, useState } from "react"
import { Store } from "./Store"
import { IonCard, IonText } from "@ionic/react"


export function Notifications(){
    const [ info, setInfo ] = useState<any>([])

    Store.subscribe({num : 404, type: "back", func: ()=>{
        Store.dispatch({type: "route", route: "back"})
    }})

    Store.subscribe({num : 92, type: "notices", func: ()=>{
        setInfo(Store.getState().notices)
    }})

    useEffect(()=>{ 
            setInfo(Store.getState().notices)
        return ()=>{
            Store.unSubscribe( 404 )
        }
    },[])

    let elem = <>
    </>

    for(let i = 0; i < info.length; i++){
        elem = <>
            { elem }
            <IonCard className="pb-1">
                <div className="ml-1 mt-1 flex fl-space mr-1 cl-prim">
                    <div>
                        <b>{ info[i].Шапка }</b>
                    </div>
                    <div className="fs-10">{ info[i].Период }</div>
                </div>
                <div className="ml-2 mt-1">
                    <IonText>{ info[i].Текст }</IonText>
                </div>
                
            </IonCard>
        </>    
    }

    elem = <>
        <div className="">
            { elem }
        </div>
    </>

    return elem
}


export function Chats(){
    const [ info ] = useState<any>([])

    let elem = <></>

    for (let i = 0; i < info.length; i++) {
        elem = <>
            { elem }
        </>
    }

    return elem
}