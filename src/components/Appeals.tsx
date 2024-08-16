import { IonCard, IonIcon, IonInput, IonLoading, IonModal, IonText } from "@ionic/react"
import React, { useEffect, useState } from "react"
import { getAppeals, getData, getItem, setItem, Store } from "./Store"
import "./Appeals.css"
import { cameraOutline, imageOutline, syncCircleOutline } from "ionicons/icons"
import { takePicture } from "./Files"

export function Appeals() {
    const [ info, setInfo ]     = useState<any>([])
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
        console.log( "appeasl" )
    } })

    useEffect(()=>{
        console.log("useEffect")
        setInfo( Store.getState().appeals )
        getAppeals()
        return ()=>{ 
            Store.unSubscribe( 101 )
            Store.unSubscribe( 102 )
        }
    },[])

    let items = <></>

    for( let i = 0; i < info.length; i++ ){
        items = <>
            { items }
            <Panel info = { info[i] } setItem = { setItem } />
        </>
    }

    const elem = <>
        <div className='w-100 h-100'>
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
                        : <Messages info = { item }/>
                }
            </div>
        </div>
    </>
    return elem


}

function Panel(props: { info, setItem }){
    const [ info ] = useState<any>( props.info )

    const elem = <>
        <IonCard className="bg-3 pb-1"
            onClick={()=>{ 
                props.setItem( props.info )
            }}
        >
            <div className="flex fl-space ml-1 mr-1">
                <div className="ml-1 mt-1 fs-12"> <b>{ info.Наименование }</b></div>           
                <div>{ info.Период }</div>
            </div>
            
            <div className="flex fl-space mr-1 ml-1 mt-1 apl-string">
                <div className="w-90 apl-string"> { 
                        info.Картинка 
                            ? <div className="flex"><IonIcon icon={ imageOutline }  className="w-15 h-15"/> <span className="ml-05">Картинка</span> </div>
                            : info.Текст 
                    } 
                </div>    
                <div className={ info.Кнт === 0 ? "apl-cnt-1" : "apl-cnt" }> { info.Кнт } </div>    
            </div>
        </IonCard>
    </>

    return elem
}

function Messages(props: { info }) {
    const [ info, setInfo ] = useState<any>([])
    const [ load, setLoad ] = useState(false)
    const [ upd, setUpd ] = useState( 0 )
   
    async function Load(){
        const res = await getData("getMessages", {
            token:          Store.getState().login.token,   
            Канал:          props.info.Код
        })
        console.log( res.data )
        if(!res.error) setInfo( res.data )

        setUpd( upd + 1)
    }

    useEffect(()=>{
        Load()
    },[])

    async function Add( txt ) {
        setLoad(true)
        const res = await getData("sendMessage", {
            token:          Store.getState().login.token,
            Получатель:     props.info.Код,
            Текст:          txt,
        })
        console.log( res )
        Load();
        setLoad( false )
    }

    async function Size( source ) {
        const img = new Image();
        img.src = source.dataUrl;
        await img.decode();
        let wt = img.width;
        let ht = img.height; 

        let k = 1
        if(wt > 1000) k = 1000 / wt
        if(ht > 1000 && (1000 / ht) < k) k = 1000 / ht


        wt = Math.floor(wt * k)
        ht = Math.floor(ht * k)

        const canvas = document.createElement("canvas");
            
        const ctx = canvas.getContext("2d");

        canvas.width = wt;
        canvas.height = ht;
            
        ctx?.drawImage(img, 0, 0, wt, ht);

            // Show resized image in preview element
        const dataurl = canvas.toDataURL( 'image/jpeg' );
        source.dataUrl = dataurl;
    }

    async function getPhoto() {
        setLoad( true)
        const img = await takePicture()
        await Size( img )
        console.log( img)
        await getData("sendMessage", {
            token:          Store.getState().login.token,
            Получатель:     props.info.Код,
            Текст:          "",
            Картинка:       img,
        })
        Load()
        setLoad( false)
    }

    function Item1(props: { info }) {
        const elem = <>
            {
                props.info.Отправлен 
                    ? <>
                        <div className="flex fl-space">
                            <div></div>
                            <div className="w-80 apl-bg mr-1">
                                { 
                                   !props.info.Картинка
                                        ? props.info.Текст 
                                        : <Img info = { props.info }/>
                                } 
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
    for (let i = 0; i < info.length;i++) {
        let per:string = info[i].Период
        if( per.includes(":") ) per = ""
        if( per !== period ) { 
            adds    = <><div className="ml-2 mt-1 pb-1"><b>{ per }</b></div></>
            period  = per
        }
        else adds = <></>
        items = <>
            { items }
            { adds }
            <Item1  info= { info[i] }/>     
        </>
    }


    const elem = <>
        <IonLoading isOpen = { load } message={ "Подождите..." }/>
        <IonCard className="bg-4 pb-1 h-90 mr-1 ">
            <div className="apl-body">
                <div className="ml-1 mt-1 fs-12"><b>{ props.info.Наименование + " - " + props.info.Кнт }</b></div>

                <div className="apl-input ml-1 mr-1 pl-1 pr-1 flex">
                    <IonInput 
                        placeholder="Введите текст"
                        onIonChange={(e)=>{
                            console.log("Add")
                            Add( e.detail.value )
                        }}
                    />
                <div
                    className="s-photo-3"
                    onClick={()=>{
                        getPhoto()                            
                    }}
                >
                    <IonIcon icon = { cameraOutline } color="warning" slot="icon-only" className="w-3 h-3 "/>
                </div>    
            </div>
                <div className="apl-card">
                    {
                        items
                    }
                </div>
            </div>
            <div className="h-10 ml-1 mr-1 mt-1 fs-09">
                { props.info.Описание }
            </div>
        </IonCard>
    </>

    return elem
}

function Img(props:{ info }) {
    const [ img, setImg ] = useState("")
    const [ modal, setModal ] = useState( false )
    const info = props.info

    async function Load(){

        let res: any  = await getItem( info.Ссылка )
        if(res === null){
            res = await getData("get_message_image",{
                token:      Store.getState().login.token,   
                ГУИД:       info.Ссылка    
            })
            setItem( info.Ссылка, res.data.dataUrl )
            setImg( res.data.dataUrl )
        } else {
            setImg( res )
        }
    }

    useEffect(()=>{
        Load()
        console.log( "img")
    },[])

    const elem = <>
        {
            img === ""
                ? <IonIcon icon = { imageOutline } />
                : <img src= { img } alt = "Карт" loading="lazy" 
                    onClick={()=>{ setModal( true)}}    
                />
        }
        <IonModal
            className="w-100 h-100"
            isOpen = { modal }
            onDidDismiss={ () => setModal( false )}
        >
            <div className="w-100 h-100">
                {  
                    <img src={ img } alt = "" />
                }
            </div>
        </IonModal>
    </>
    
    return elem

}