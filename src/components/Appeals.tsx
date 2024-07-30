import { IonCard, IonIcon, IonInput, IonLoading, IonText } from "@ionic/react"
import React, { useEffect, useState } from "react"
import { getAppeals, getData, Store } from "./Store"
import "./Appeals.css"
import { syncCircleOutline } from "ionicons/icons"

export function Appeals() {
    const [ info, setInfo ]     = useState<any>([])
    const [ load ]              = useState( false )
    const [ item, setItem ]     = useState<any>()
    const [ upd, setUpd]        = useState( 0 )
  
    Store.subscribe({num : 101, type: "back", func: ()=>{

        if(item !== undefined) {
            setItem( undefined )
            getAppeals()
        } else 
         Store.dispatch({type: "route", route: "back"}) 

    } })
    Store.subscribe({num : 102, type: "appeals", func: ()=>{
        setInfo( Store.getState().appeals )
    } })

    useEffect(()=>{
        getAppeals()
        return ()=>{ 
            Store.unSubscribe( 101 )
            Store.unSubscribe( 102 )
        }
    },[])

    function Panel(props: { info }){
        const [ info ] = useState<any>( props.info )
        const [ last ] = useState<any>( 
            props.info.Сообщения.length === 0 
                ? { Период: "пусто", Текст: "", }
                : props.info.Сообщения[0]
        )
        async function read() {
            await getData("readMessages", {
                token:      Store.getState().login.token,
                channel:    props.info.Код,
            })
        }

        const elem = <>
            <IonCard className="bg-3 pb-1"
                onClick={()=>{ 
                    setItem( props.info.Код )
                    if( props.info.Кнт > 0)
                        read()
                }}
            >
                <div className="flex fl-space ml-1 mr-1">
                    <div className="ml-1 mt-1 fs-12"> <b>{ info.Наименование }</b></div>           
                    <div>{ last.Период }</div>
                </div>
                
                <div className="flex fl-space mr-1 ml-1 mt-1 apl-string">
                    <div className="w-90 apl-string"> { last.Текст } </div>    
                    <div className="apl-cnt"> { info.Кнт } </div>    
                </div>
            </IonCard>
        </>

        return elem
    }

    function Messages() {
        
        let propsInfo: any = new Object()
        info.forEach(elem => {
            if(elem.Код === item )
                propsInfo = elem
        });
        
        async function Add( txt ) {
            await getData("sendMessage", {
                token:          Store.getState().login.token,
                Получатель:     propsInfo.Код,
                Текст:          txt,
            })
            getAppeals()
        }

        function Item1(props: { info }) {
            const elem = <>
                {
                    props.info.Отправлен 
                        ? <>
                            <div className="flex fl-space">
                                <div></div>
                                <div className="w-80 apl-bg mr-1">
                                    { props.info.Текст } 
                                    <div className="apl-date">{ props.info.Время }</div>
                                </div>
                            </div>
                        </>

                        : <>
                            <div className="flex">
                                <div className="w-80 apl-bg1 ml-1">
                                    { props.info.Текст } 
                                    <div className="apl-date">{ props.info.Время }</div>
                                </div>
                            </div>
                        </>
                }
            </>
            return elem
        }

        let period = ""
        let items = <></>
        let adds = <></>
        for (let i = 0; i < propsInfo.Сообщения.length;i++) {
            let per:string = propsInfo.Сообщения[i].Период
            if( per.includes(":") ) per = ""
            if( per !== period ) { 
                adds    = <><div className="ml-2 mt-1 pb-1"><b>{ per }</b></div></>
                period  = per
            }
            else adds = <></>
            items = <>
                { items }
                { adds }
                <Item1  info= { propsInfo.Сообщения[i] }/>     
            </>
        }

        const elem = <>
            <IonCard className="bg-3 pb-1 h-80 mr-1">
                <div className="ml-1 mt-1 fs-12"><b>{ propsInfo.Наименование + " - " + propsInfo.Кнт }</b></div>

                <div className="apl-borders ml-1 mr-1 pl-1 pr-1">
                    <IonInput 
                        placeholder="Введите текст"
                        onIonChange={(e)=>{
                            Add( e.detail.value )
                        }}
                    />
                </div>
                <div className="apl-card">
                    {
                        items
                    }
                </div>
            </IonCard>
        </>

        return elem
    }

    let items = <></>

    for( let i = 0; i < info.length; i++ ){
        items = <>
            { items }
            <Panel info = { info[i] } />
        </>
    }

    const elem = <>
        <div className='w-100 h-100'>
            <IonLoading isOpen = { load } message={ "Подождите..." }/>
            <div className='ml-1 h-3 flex fl-space'>
                <IonText>
                    <h1 className="main-title ion-text-wrap ion-text-start">
                        { "Обращения" }
                    </h1>
                </IonText>
                <IonIcon icon = { syncCircleOutline } className="w-2 h-2 mr-1" color="warning"
                    onClick={()=>{
                        getAppeals()
                        setItem( undefined )
                        setUpd(upd + 1)
                    }}
                />
            </div>

            <div
                className='l-content'
            >
                { 
                    item === undefined
                        ? items
                        : <Messages  />
                }
            </div>
        </div>
    </>
    return elem


}