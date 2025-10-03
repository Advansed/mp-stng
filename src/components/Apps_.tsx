import React, { useEffect, useState } from "react"
import { IonButton, IonCard, IonIcon, IonLabel, IonLoading } from "@ionic/react"
import { Store, getApps, getData } from "./Store"
import { Agrees, Filesss } from "./Files";


export function Apps():JSX.Element {
    const [ info, setInfo ] = useState<any>([])
    const [ upd, setUpd ] = useState( 0 )
    let elem = <></>

    useEffect(()=>{
        console.log("apps use effect")
        getApps({ token: Store.getState().login.token })
        setInfo( Store.getState().apps )
        return ()=>{
            Store.unSubscribe( 51 )
            Store.unSubscribe( 404 )
        }
    },[])

    Store.subscribe({num : 51, type: "apps", func: ()=>{
        setInfo( Store.getState().apps )
    } })

    Store.subscribe({num : 404, type: "back", func: ()=>{
        Store.dispatch({type: "route", route: "back"})
    } })


    function App(props: { info }):JSX.Element{
        const [ load, setLoad ]         = useState( false )
        const [ message, setMessage ]   = useState("")
        const [ mode, setMode ]         = useState(false)

        const info = props.info
        
        function onSetMode( mod ){
            setMode( mod )
        }        
        
        
        const elem = <>
            <IonCard className="pb-1 pr-1 s-card">
                <div className="mt-1 ml-1 t-underline"> <b> { info.service } </b></div>
                <div className="flex">
                    <div className="flex fl-space ml-1 mt-1 w-50"> 
                        <div className="cl-gray">Дата</div>
                        <div>{ info.date }</div>
                    </div>
                    <div className="flex fl-space ml-1 mt-1 w-50"> 
                        <div className="cl-gray">Номер</div>
                        <div>{ info.number }</div>
                    </div>
                </div>
                <div className="flex fl-space ml-1 mt-1"> 
                    <div className="cl-gray">Адрес</div>
                    <div>{ info.address }</div>
                </div>
                <div className="flex fl-space ml-1 mt-1"> 
                    <div className="cl-gray">Статус</div>
                    <div>{ info.status }</div>
                </div>
        

                {
                    info.agreements?.Файлы?.length > 0
                        ? <>
                            <Agrees    info = { info.agreements.Файлы }/> 
                        </>
                        : <></>
                }                
                {
                    info.files?.Файлы?.length > 0
                        ? <>
                            <Filesss    info = { info.files.Файлы } onMode = { onSetMode }/> 
                            <p className="ml-2">{ message }</p>
                            <div className="flex fl-space">
                                <div></div>
                                { 
                                    mode ? <>
                                        <div className="flex">
                                            <IonButton
                                                onClick={()=>{
                                                    getApps({ token: Store.getState().login.token })
                                                    setUpd( upd + 1)
                                                }}
                                            >
                                                Отмена
                                            </IonButton>
                                            <IonButton
                                                onClick={()=>{
                                                    setLoad( true)
                                                    async function upload(){
                                                        await getData("s_files", {
                                                            token:  Store.getState().login.token,
                                                            id:     info.id,
                                                            files:  info.files
                                                        })
                                                        
                                                        setMode( false )
                                                        setLoad( false )
                                                    }
                                                    upload()
                                                }}
                                            >
                                                Сохранить
                                            </IonButton>
                                        </div>
                                    </>
                                    : <></>
                                }
                            </div>
                        </>
                        : <></>
                }                
                 <IonLoading isOpen = { load } message={ "Подождите" }/>
            </IonCard>    
        </>
        return elem
    }
    

    for(let i = 0; i < info.length; i++) {
        elem = <>
            { elem }
            <App info = { info[i]} />
        </>
    }

    return <>
        <h1 className="main-title ion-text-wrap ml-1">
            { "Договора, заявки" }
        </h1>
        { elem }
    </>
}

