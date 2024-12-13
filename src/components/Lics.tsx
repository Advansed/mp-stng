import React, { useEffect, useState } from 'react'
import { Store, getData, getLics, getProfile } from './Store'
import './Lics.css'
import { IonButton, IonCard, IonCol, IonContent, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonLoading, IonModal, IonPopover, IonRow, IonText } from '@ionic/react'
import { chevronForwardOutline, documentTextOutline, ellipsisVerticalOutline, newspaperOutline, pencilOutline, trashBinOutline } from 'ionicons/icons'
import { PDFDoc } from './Files'
import { createWidget } from '@sber-ecom-core/sberpay-widget';

type WidgetParams = {
    bankInvoiceId: string;
    lifeTime?: number;
    expirationDate?: number;
    isFinishPage?: true;
    finishPageTimeOut?: 10;
};


function openWidget( info ){

    const widget = createWidget("PRODUCTION");    

    const params = {
        bankInvoiceId: info.orderId,
        backUrl: 'https://fhd.aostng.ru/paymentSuccess',
        isEmbedded: true
    };

    widget.open(params);
}

export function Lics() {
    const [ info,   setInfo ]   = useState<any>([])
    const [ upd,    setUpd ]    = useState( 0 )
    const [ page,   setPage ]   = useState( 0 )
    const [ item,   setItem ]   = useState<any>()

    Store.subscribe({num : 22, type: "lics", func: ()=>{
        setInfo( Store.getState().lics )
        setUpd( upd + 1)
    } })

    Store.subscribe({num : 21, type: "back", func: ()=>{

        switch (page) {

            case 0: Store.dispatch({type: "route", route: "back"}); break;
            case 1: setPage(0); break;
            case 2: setPage(0); break;
            case 3: setPage(0); break;
            case 4: setPage(0); break;
            case 5: setPage(0); break;
            case 6: setPage(0); break;
            case 7: setPage(0); break;
            case 8: setPage(0); break;
            case 9: setPage(6); break;
            default: Store.dispatch({type: "route", route: "back"})

        }    
    } })


    useEffect(()=>{

        setInfo( Store.getState().lics )

        return ()=>{ 
            Store.unSubscribe( 21 ) 
            Store.unSubscribe( 22 ) 
        }
    },[])


    let elem = <></>

    switch(page) {
        case 0: elem = <> <Items info = { info } setItem = { setItem } setPage = { setPage } /><AddLic setPage = { setPage } /> </>; break // main
        case 1: elem = <AddLic1 setPage={ setPage }/>; break // Добавить лицевой счет 1 способ
        case 2: elem = <AddLic2 setPage={ setPage }/>; break // Добавить лицевой счет 2 способ
        case 3: elem = <History item = { item }/>; break // История
        case 4: elem = <Payments item = { item } setPage = { setPage }/>; break // Оплата за газ
        case 5: elem = <PaymentsTO item = { item } setPage = { setPage }/>; break // Оплата за ТО
        case 6: elem = <Indices item = { item } setPage = { setPage }/>; break // Показания
        case 7: elem = <Equaring item = { item } setPage={ setPage }/>; break // Страница оплаты сайт
        case 8: elem = <SberPay  item =  { item } setPage = { setPage }/>; break // сберPay
        case 9: elem = <HistoryIndices item = { item } />; break // История показаний
        default: <></>
    }

    return elem
}

async function Add( params, setMessage, setPage ){
    const res = await getData("AddAccount", params )
    console.log( res )
    if(res.error){
        setMessage(res.message);
    } else {
        getLics({ token: Store.getState().login.token })
        getProfile({ token: Store.getState().login.token })
        setPage( 0 )
    }
}   

function Items(props: { info, setItem, setPage }) {

    const info = props.info

    let elem = <></>

    for(let i= 0;i < info.length;i++){
        elem = <>
            { elem }
            <Lic info = { info[i]} ind = { i } setItem = { props.setItem } setPage = { props.setPage } />
        </>
    }


    return elem 
}

function AddLic(props:{ setPage}) {

    return <>
        <IonCard>
            <div className='flex pl-1 pr-1 pt-1 mb-1'
                onClick={()=>{  props.setPage( 1 )  }}
            >
                <div className='flex pb-1'>
                    <div> <IonIcon icon = { pencilOutline }  className='w-2 h-2' color='primary'/></div>
                </div>
                <div className='flex fl-space w-100 pb-1 t-underline'> 
                    <div> <IonText className='fs-12 ml-1'><b>Добавить лицевой счет</b></IonText> </div>
                    <IonIcon icon = { chevronForwardOutline } className='w-2 h-2' color='primary'/>
                </div>
            </div>
            <div className='flex pl-1 pr-1 pt-1 mb-1'
                onClick={()=>{  props.setPage( 2 )  }}                
            >
                <div className='flex pb-1'>
                    <div> <IonIcon icon = { documentTextOutline }  className='w-2 h-2' color='primary'/></div>
                </div>
                <div className='flex fl-space w-100 pb-1'> 
                    <div> <IonText className='fs-12 ml-1'><b>Узнать лицевой счет</b></IonText> </div>
                    <IonIcon icon = { chevronForwardOutline } className='w-2 h-2' color='primary'/>
                </div>
            </div>
        </IonCard>
    </>
}

function AddLic1(props:{ setPage }){
    const [ info ] = useState({
        token:      Store.getState().login.token,
        LC :        "",
        fio:        "",
    })
    const [ upd, setUpd] = useState( 0 )
    const [ message, setMessage ] = useState("")

    const elem = <>
            <IonCard className='pb-1'>
                <div className='flex fl-space mt-1 ml-1'>
                    <div className='cl-black'> <h4><b>{ "Новый лицевой счет" }</b></h4></div>
                </div>
                <div className='ml-1 mr-1 t-underline s-input'>
                    <IonInput
                        className='s-input-1 ml-1'
                        placeholder='Номер л/с'
                        value={ info.LC }
                        mode = "ios"
                        onIonInput={(e)=>{
                            info.LC = e.detail.value as string;
                            setUpd(upd + 1)
                            setMessage("")
                        }}
                    >
                    </IonInput>   
                </div>    
                <div className='ml-1 mr-1 mt-1 t-underline s-input'>
                    <IonInput
                        className='s-input-1 ml-1'
                        placeholder='Первые три буквы фамилии'
                        value={ info.fio }
                        size={ 3 }
                        maxlength={ 3 }
                        onIonInput={(e)=>{
                            info.fio = e.detail.value as string;
                            setUpd(upd + 1)
                            setMessage("")
                        }}
                    >
                    </IonInput>   
                </div>    
                <div className='ml-1 mr-1'>
                    <p>
                        { message }
                    </p>
                </div>
                <div className='ml-1 mr-1'>
                    <IonButton
                        color = "tertiary"
                        expand='block'
                        mode = "ios"
                        onClick={()=>{
                            setMessage("")
                            if( info.LC !== "" && info.fio !== "")
                                Add( info, setMessage, props.setPage )
                            else props.setPage( 0 )
                        }}
                    >
                        {
                            info.LC !== "" && info.fio !== ""
                                ? "Добавить"
                                : "Закрыть"  
                        }
                    </IonButton>
                </div>


            </IonCard>
    </>
    return elem
}

function AddLic2(props:{ setPage }){
    const [ info,       setInfo]        = useState<any>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ ulus,       setUlus ]       = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ naspunkt,   setNaspunkt ]   = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ street,     setStreet ]     = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ house,      setHouse ]      = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ kv,         setKv ]         = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ lc,         setLc ]         = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ fio,        setFio ]        = useState("")
    const [ message,    setMessage ]    = useState("")


    useEffect(()=>{
        async function load(){
            const res = await getData("getSettlements", {
                token : Store.getState().login.token,
            })
            console.log(res)
            setInfo( res.data)
        }
        load()
    },[])

    async function getStreets( e ){
        const res = await getData("getStreets", {
            token   : Store.getState().login.token,
            s_id    : e.s_id
        })
        if(res.error) setMessage( res.message )
        else {
            e.streets = res.data;
            setNaspunkt( e )
        }
    }

    async function getHouses( e ){
        const res = await getData("getHouses", {
            token   : Store.getState().login.token,
            ids    : e.ids
        })
        console.log( res )
        if(res.error) setMessage( res.message )
        else {
            e.houses = res.data;
            setStreet( e )
        }
    }

    function Item1(props: { info }){
        const [ info  ]   = useState<any>( props.info ) // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ value,  setValue ]  = useState( ulus !== undefined ? ulus.ulus : ""  )
        const [ focus,  setFocus ]  = useState( false)


        const elem = <>
            <div className='s-input mr-1 pl-1 pr-1 ml-2'> 
                <IonInput
                    className='s-input-1'
                    placeholder='Улус (Район)'
                    value={ value }
                    onIonInput={(e)=>{
                        setValue(e.detail.value as string)
                        setUlus( undefined)
                        setNaspunkt( undefined)
                        setStreet( undefined)
                        setHouse( undefined)
                        setKv( undefined)
                        setLc( undefined)
                    }}       
                    onIonFocus={ ()=> setFocus(true)}
                    onIonBlur={ ()=> setFocus(false)}
                />
            </div>
            {   
                !focus
                    ? <></>
                    :<> 
                        <div className=' ml-1 mr-1'>
                            {
                                info.map((e, ind) =>{ 
                                    if(e.ulus.toUpperCase().includes(value.toUpperCase())){
                                        return <>
                                            <IonItem key = { ind }
                                                onClick={()=>{
                                                    setValue( e.ulus )
                                                    setUlus( e )
                                                }}
                                            >
                                                { e.ulus }
                                            </IonItem>
                                        </>
                                    } else return <></>
                                })
                            }
                        </div>
                    </>
            }
        </>
        return elem        
    }

    function Item2(props: { info }){
        const [ info  ]   = useState<any>( props.info ) // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ value,  setValue ]  = useState( naspunkt !== undefined ? naspunkt.settlement : "" )
        const [ focus,  setFocus ]  = useState( false)


        const elem = <>
            <div className='s-input mr-1 pl-1 pr-1 mt-1 ml-2'> 
                <IonInput
                    className='s-input-1'
                    placeholder='Населенный пункт'
                    value={ value }
                    onIonInput={(e)=>{
                        setValue(e.detail.value as string)
                        setNaspunkt(undefined)
                        setStreet( undefined)
                        setHouse( undefined)
                        setKv( undefined)
                        setLc( undefined)
                    }}       
                    onIonFocus={ ()=> setFocus(true)}
                    onIonBlur={ ()=> setFocus(false)}
                />
            </div>
            {   
                !focus
                    ? <></>
                    :<> 
                        <div className=' ml-1 mr-1'>
                            {
                                info.map((e, ind) =>{ 
                                    if(e.settlement.toUpperCase().includes(value.toUpperCase())){
                                        return <>
                                            <IonItem key = { ind }
                                                onClick={()=>{
                                                    setValue( e.settlement )
                                                    getStreets( e )
                                                }}
                                            >
                                                { e.settlement }
                                            </IonItem>
                                        </>
                                    } else return <></>
                                })
                            }
                        </div>
                    </>
            }
        </>
        return elem        
    }

    function Item3(props: { info }){
        const [ info ]   = useState<any>( props.info ) // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ value,  setValue ]  = useState( street !== undefined ? street.street : "" )
        const [ focus,  setFocus ]  = useState( false)


        const elem = <>
            <div className='s-input mr-1 pl-1 pr-1 mt-1 ml-2'> 
                <IonInput
                    className='s-input-1'
                    placeholder='Улица'
                    value={ value }
                    onIonInput={(e)=>{
                        setValue(e.detail.value as string)
                        setStreet( undefined)
                        setHouse( undefined)
                        setKv( undefined)
                        setLc( undefined)
                    }}       
                    onIonFocus={ ()=> setFocus(true)}
                    onIonBlur={ ()=> setFocus(false)}
                />
            </div>
            {   
                !focus
                    ? <></>
                    :<> 
                        <div className=' ml-1 mr-1'>
                            {
                                info.map((e, ind) =>{ 
                                    if(e.street.toUpperCase().includes(value.toUpperCase())){
                                        return <>
                                            <IonItem key = { ind }
                                                onClick={()=>{
                                                    setValue( e.street )
                                                    getHouses( e )
                                                }}
                                            >
                                                { e.street }
                                            </IonItem>
                                        </>
                                    } else return <></>
                                })
                            }
                        </div>
                    </>
            }
        </>
        return elem        
    }

    function Item4(props: { info }){
        const [ info ]   = useState<any>( props.info ) // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ value,  setValue ]  = useState( house !== undefined ? house.house : "" )
        const [ focus,  setFocus ]  = useState( false)


        const elem = <>
            <div className='s-input mr-1 pl-1 pr-1 mt-1 ml-2'> 
                <IonInput
                    className='s-input-1'
                    placeholder='Дом'
                    value={ value }
                    onIonInput={(e)=>{
                        setValue(e.detail.value as string)
                        setHouse( undefined)
                        setKv( undefined)
                        setLc( undefined )
                    }}       
                    onIonFocus={ ()=> setFocus(true)}
                    onIonBlur={ ()=> setFocus(false)}
                />
            </div>
            {   
                !focus
                    ? <></>
                    :<> 
                        <div className=' ml-1 mr-1'>
                            {
                                info.map((e, ind) =>{ 
                                    if(e.house.toUpperCase().includes(value.toUpperCase())){
                                        return <>
                                            <IonItem key = { ind }
                                                onClick={()=>{
                                                    setValue( e.house )
                                                    setHouse( e )
                                                }}
                                            >
                                                { e.house }
                                            </IonItem>
                                        </>
                                    } else return <></>
                                })
                            }
                        </div>
                    </>
            }
        </>
        return elem        
    }

    function Item5(props: { info }){
        const [ info ]   = useState<any>( props.info ) // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ value,  setValue ]  = useState( kv !== undefined ? kv.apartment : "" )
        const [ focus,  setFocus ]  = useState( false)


        const elem = <>
            <div className='s-input mr-1 pl-1 pr-1 mt-1 ml-2'> 
                <IonInput
                    className='s-input-1'
                    placeholder='Квартира'
                    value={ value }
                    onIonInput={(e)=>{
                        setValue(e.detail.value as string)
                        setKv( undefined)
                        setLc( undefined)
                    }}       
                    onIonFocus={ ()=> setFocus(true)}
                    onIonBlur={ ()=> setFocus(false)}
                />
            </div>
            {   
                !focus
                    ? <></>
                    :<> 
                        <div className=' ml-1 mr-1'>
                            {
                                info.map((e, ind) =>{ 
                                    if(e.apartment.toUpperCase().includes(value.toUpperCase())){
                                        return <>
                                            <IonItem key = { ind }
                                                onClick={()=>{
                                                    setValue( e.apartment )
                                                    setKv( e )
                                                }}
                                            >
                                                { e.apartment }
                                            </IonItem>
                                        </>
                                    } else return <></>
                                })
                            }
                        </div>
                    </>
            }
        </>
        return elem        
    }

    function Item6(props: { info }){
        const [ info  ]   = useState<any>( props.info ) // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ value,  setValue ]  = useState( lc !== undefined ? lc.code : "" )
        const [ focus,  setFocus ]  = useState( false)


        const elem = <>
            <div className='s-input mr-1 pl-1 pr-1 mt-1 ml-2'> 
                <IonInput
                    className='s-input-1'
                    placeholder='Лицевой счет'
                    value={ value }
                    onIonInput={(e)=>{
                        setValue(e.detail.value as string)
                        setLc( undefined)
                    }}       
                    onIonFocus={ ()=> setFocus(true)}
                    onIonBlur={ ()=> setFocus(false)}
                />
            </div>
            {   
                !focus
                    ? <></>
                    :<> 
                        <div className=' ml-1 mr-1'>
                            {
                                info.map((e, ind) =>{ 
                                    if(e.code.toUpperCase().includes(value.toUpperCase())){
                                        return <>
                                            <IonItem key = { ind }
                                                onClick={()=>{
                                                    setValue( e.code )
                                                    setLc( e )
                                                }}
                                            >
                                                { e.code }
                                            </IonItem>
                                        </>
                                    } else return <></>
                                })
                            }
                        </div>
                    </>
            }
        </>
        return elem        
    }

    const elem = <>
        <IonCard className='pb-1 mt-1'>
            <div className='flex fl-space mt-1 ml-1'>
                <div className='cl-black'> <h4><b>{ "Узнать свой лицевой счет" }</b></h4></div>
            </div>

            <Item1 info = { info } /> 
            { 
                ulus !== undefined
                    ? <Item2 info = { ulus.settlements } />
                    : <></>
            }
            { 
                naspunkt !== undefined
                    ? <Item3 info = { naspunkt.streets } />
                    : <></>
            }
            { 
                street !== undefined
                    ? <Item4 info = { street.houses } />
                    : <></>
            }
            { 
                house !== undefined
                    ? house.apartments !== undefined 
                        ? <Item5 info = { house.apartments } />
                    : house.lics !== undefined 
                        ? <Item6 info = { house.lics }/>
                        : <></>
                    : <></>
            }
            { 
                kv !== undefined
                    ? <Item6 info = { kv.lics } />
                    : <></>
            }
            { 
                lc !== undefined
                    ? <>
                        <div className='s-input mt-1 mr-1 ml-2'>
                            <IonInput
                                className='s-input-1 ml-1 mt-1'
                                placeholder='Первые три буквы фамилии'
                                value={ fio }
                                size={ 3 }
                                maxlength={ 3 }
                                onIonInput={(e)=>{
                                    setFio( e.detail.value  as string );
                                }}
                            >
                            </IonInput>   
                        </div>
                    </>
                    : <></>
            }
            <div className='ml-1 mr-1 mt-1'>
                <p> { message } </p>
            </div>

            <div className='mt-1 ml-1 mr-1'>
                <IonButton
                    color = "tertiary"
                    expand='block'
                    mode = "ios"
                    onClick={()=>{
                        setMessage("")
                        if(  lc !== undefined && fio !== "" ) 
                            Add( {
                                token:  Store.getState().login.token,
                                LC:     lc.code,
                                fio:    fio,    
                            }, setMessage, props.setPage )
                        else props.setPage( 0 )
                    }}
                >   {
                        lc !== undefined && fio !== ""
                            ? "Добавить л/с"
                            : "Закрыть"

                    }
                </IonButton>        
            </div>
        </IonCard>
    </>

    return elem
}

function Lic(props: { info, ind, setItem, setPage } ){
    const [ load,   setLoad ]   = useState(false)
    const [ modal,  setModal ]  = useState<any>()
    const [ pop,    setPop ]    = useState( false )

    const info = props.info 
    
    async function delAccont() {
        setLoad( true)
        const res = await  getData("DelAccount", {
            token: Store.getState().login.token,
            LC: info.code
        })
        if(!res.error){
            getLics({
                token: Store.getState().login.token,
            })
        }
        setLoad(false)
    }

    async function  Quits() {
        setLoad( true )
        const res = await getData("getQuits", {
            token : Store.getState().login.token,
            LC :    info.code
        })
        console.log(res)
        if(!res.error) {
            setModal( res.data )
        }
        setLoad( false )
    }

    const elem = <>
        <IonLoading isOpen = { load } message = { "Подождите..." }/>
        <IonCard className='pb-1'>
            <div className='flex fl-space mt-1 ml-1'>
                <div className='cl-black'> <h4><b>{ "Лицевой счет №" + info.code }</b></h4></div>
                <IonButton
                    fill    = "clear"
                    onClick={()=>{ setPop( true )}}
                >
                    <IonIcon icon = { ellipsisVerticalOutline }  color="primary" slot='icon-only'/> 
                </IonButton>
                <IonPopover
                    isOpen = { pop }
                    onDidDismiss={ ()=> setPop( false) }
                >
                    <IonContent>
                        <div className='flex fl-space ml-2 t-underline mr-1 h-4'
                            onClick={()=>{
                                info.type = "История"
                                props.setItem( info )
                                props.setPage( 3 )

                            }}                                
                        >
                            <div>История</div>
                            <IonButton
                                fill = "clear"
                            >
                                <IonIcon icon = { newspaperOutline } slot='icon-only'/>
                            </IonButton>
                        </div>
                        <div className='flex fl-space ml-2  mr-1 h-4'
                            onClick={()=>{
                                delAccont()
                                setPop( false )
                            }}  
                        >
                            <div>Удалить</div>
                            <IonButton
                                fill = "clear"
                            >
                                <IonIcon icon = { trashBinOutline } slot='icon-only'/>
                            </IonButton>
                        </div>
                    </IonContent>
                </IonPopover>
            </div>
            <div className='ml-1 mr-1 t-underline pb-1'>
                { info.name}
            </div>    
            <div className='ml-1 mr-1 t-underline pb-1 mt-1'>
                { info.address}
            </div>    
            <div className='ml-1 mr-1 pb-1 mt-1 flex fl-space'>
                <div>
                    { 
                        ( info.sum ) < 0 ? "Аванс за газ" : "Задолженность за газ" 
                    }
                </div>
                <div className='cl-prim fs-11'>
                    <b>
                        { 
                            ( info.sum ) < 0 
                                ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( -( info.sum ) )
                                : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( ( info.sum ) )
                        }
                    </b>
                </div>                        
            </div>    
            <div className='ml-1 mr-1 pb-1 mt-1 flex fl-space'>
                <div>
                    { 
                        ( info.sumto ) < 0 ? "Аванс за ТО" : "Задолженность за ТО" 
                    }
                </div>
                <div className='cl-prim fs-11'>
                    <b>
                        { 
                            ( info.sumto ) < 0 
                                ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( -( info.sumto ) )
                                : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( ( info.sumto ) )
                        }
                    </b>
                </div>                        
            </div>    
            <div className='ml-1 mr-1'>
                <div className='flex fl-space'>
                    <IonButton
                        className='w-50'
                        color = "tertiary"
                        mode = "ios"
                        expand='block'
                        onClick={()=>{
                            props.setItem( info )
                            props.setPage( 4 )
                        }}
                    >
                        Оплата за газ
                    </IonButton>
                    <IonButton
                        className='w-50'
                        color = "tertiary"
                        mode = "ios"
                        expand='block'
                        onClick={()=>{
                            props.setItem( info )
                            props.setPage( 5 )
                        }}
                    >
                        Оплата за ТО
                    </IonButton>
                </div>
                <IonButton
                    className='mt-1'
                    mode = "ios"
                    color = "tertiary"
                    expand='block'
                    fill = "outline"
                    onClick={()=>{
                        Quits()   
                    }}
                >
                    Квитанция 
                </IonButton>
                {
                    info.counters.length !== 0
                        ? <>
                            <IonButton
                                className='mt-1'
                                mode = "ios"
                                color = "tertiary"
                                expand='block'
                                fill = "outline"
                                onClick={()=>{
                                    props.setItem( info )
                                    props.setPage( 6 )
                                }}
                            >
                                Внести показания
                            </IonButton>                        
                        </>
                        : <></>
                }

            </div>
        </IonCard>
        <IonModal
            className="w-100 h-100"
            isOpen = { modal !== undefined }
            onDidDismiss={ () => setModal( undefined )}
        >
            <div className="w-100 h-100">
                {  
                    modal?.format === "pdf" 
                        ? <PDFDoc url = { modal?.dataUrl } name  = { "Квитанция" } title = { "Квитанция" }/>
                        : <img src={ modal?.dataUrl } alt = "" />
                }
            </div>
        </IonModal>
    </>

    return elem 
}

function History(props: { item }){
    const [ info, setInfo ] = useState<any>([])

    const item = props.item
    
    async function Load(){
        console.log({
            token: Store.getState().login.token,
            LC: item.code 
        })
        const res = await getData("GetPayments", { 
            token: Store.getState().login.token,
            LC: item.code 
        })  
        console.log(res)
        if(!res.error){
            if(res.data.length > 0 ){
                setInfo( res.data[0].payments )
            }
        }
            
    }

    useEffect(()=>{
        Load()
    },[])
    
    let items = <></>
    for(let i = 0; i < info.length; i++ ){
        items = <>
            { items }
            <IonRow className='ml-2 mt-1 mr-2 cl-prim'>
                <IonCol size = "8" > { info[i].number + " от " + info[i].date } </IonCol>
                <IonCol size = "4"  className= "a-right"><b> { new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( info[i].summ )}</b> </IonCol>
            </IonRow>
        </>
    }

    const elem = <>
      <IonCard className='pb-1'>
            <div className='flex fl-space mt-1 ml-1'>
                <div className='cl-black'> <h4><b>{ "Лицевой счет №" + item.code }</b></h4></div>
            </div>
            <div className='ml-2 mr-1 cl-prim'>
                { item.name}
            </div>    
            <div className='ml-2 mr-1 pb-1 mt-1 cl-prim'>
                { item.address}
            </div>  
            <div className='mt-1 ml-1 mr-1 t-underline cl-prim'>
                <b>{ "История платежей" }</b>
            </div>

            {
                items
            }

        </IonCard>
    </>

    return elem

}

function Payments(props:{ item, setPage }){
    const item  = props.item
    const [ value, setValue ] = useState( item.sum > 0 ? item.sum : 0)


    
    const elem = <>
        <IonCard className='pb-1'>
            <div className='flex fl-space mt-1 ml-1'>
                <div className='cl-black'> <h4><b>{ "Лицевой счет №" + item.code }</b></h4></div>
            </div>
            <div className='ml-2 mr-1'>
                { item.name}
            </div>    
            <div className='ml-2 mr-1 pb-1 mt-1'>
                { item.address}
            </div>    
            <div className='mt-1 ml-1 mr-1 t-underline'>
                <b>{ "Задолженность" }</b>
            </div>
            {
                item.debts.map((e)=>{
                    return <>
                        <div className='ml-2 mt-1 mr-1 flex fl-space'>
                            <div><b>{ e.label }</b></div>
                            <div className='cl-prim fs-11'>
                                <b>
                                    { 
                                        new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( e.sum  )
                                    }
                                </b>
                            </div>
                        </div>
                    </>
                })
            }
            <div className='mt-1 ml-1 mr-1 t-underline'>
                <b>{ "Итого" }</b>
            </div>
            <div className='ml-2 mt-1 mr-1 flex fl-space'>
                <div></div>
                <div className='cl-prim fs-11'>
                    <b>
                        { 
                            new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( item.sum  )
                        }
                    </b>
                </div>
            </div>
        </IonCard>
        <IonCard className='pb-1'>
            <div className='ml-1 mt-1 pb-1 '>
                <b>
                    {
                        item.sum >= 0
                            ? "Оплатить сумму"
                            : "Внести аванс"
                    }
                </b>
            </div>
            <div className='s-input pl-1 pr-1 ml-1 mr-1'>
                <IonInput
                    className='s-input-1'
                    placeholder='Сумма'
                    type='number'
                    value = { value }
                    onIonInput={(e)=>{
                        setValue( parseFloat( e.detail.value as string ))
                    }}
                />
            </div>
            <div className='flex fl-space ml-1 mr-1'>
                <div className='w-70 mt-1'>
                    <div className='ls-item'
                        onClick={()=>{
                            item.order = new Object()
                            item.order.token    = Store.getState().login.token
                            item.order.sum      = value,
                            item.order.LC       = item.code,
                            item.order.sumto    = 0,
                            item.order.phone    = Store.getState().login.phone,
                            item.order.email    = Store.getState().login.email,
                            item.order.ios      = false
                            props.setPage( 7 )
                           
                        }}
                    >   
                        <img src="assets/Sbermobile.png" alt="sberEQ"  className='h-3'/>
                        <IonLabel className = " ml-05"><b>Оплата картой</b></IonLabel>
                    </div>        
                </div>
                <div
                    className='mt-1 w-50 ml-1'
                    onClick={()=>{
                        item.order = new Object()
                        item.order.token    = Store.getState().login.token
                        item.order.LC       = item.code,
                        item.order.sum      = value,
                        item.order.sumto    = 0,
                        item.order.phone    = Store.getState().login.phone,
                        item.order.email    = Store.getState().login.email,
                        item.order.ios      = false
                        props.setPage( 8 )
                }}
                >   
                    <IonImg alt = "" src="assets/sberPay.png" className='h-3' />
                    {/* <IonLabel className = "">СберМобайл</IonLabel> */}
                </div>               
            </div>

        </IonCard>
    </>
    
    return elem
}

function PaymentsTO(props:{ item, setPage }){
    const item  = props.item
    const [ value, setValue ] = useState( item.sumto > 0 ? item.sumto : 0)

    const elem = <>
        <IonCard className='pb-1'>
            <div className='flex fl-space mt-1 ml-1'>
                <div className='cl-black'> <h4><b>{ "Лицевой счет №" + item.code }</b></h4></div>
            </div>
            <div className='ml-2 mr-1'>
                { item.name}
            </div>    
            <div className='ml-2 mr-1 pb-1 mt-1'>
                { item.address}
            </div>    
            <div className='mt-1 ml-1 mr-1 t-underline'>
                <b>{ "Задолженность" }</b>
            </div>
            {
                item.debtsto.map((e)=>{
                    return <>
                        <div className='ml-2 mt-1 mr-1 flex fl-space'>
                            <div><b>{ e.label }</b></div>
                            <div className='cl-prim fs-11'>
                                <b>
                                    { 
                                        new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( e.sum  )
                                    }
                                </b>
                            </div>
                        </div>
                    </>
                })
            }
            <div className='mt-1 ml-1 mr-1 t-underline'>
                <b>{ "Итого" }</b>
            </div>
            <div className='ml-2 mt-1 mr-1 flex fl-space'>
                <div></div>
                <div className='cl-prim fs-11'>
                    <b>
                        { 
                            new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( item.sumto  )
                        }
                    </b>
                </div>
            </div>
        </IonCard>
        <IonCard className='pb-1'>
            <div className='ml-1 mt-1 pb-1 '>
                <b>
                    {
                        item.sum >= 0
                            ? "Оплатить сумму"
                            : "Внести аванс"
                    }
                </b>
            </div>
            <div className='s-input pl-1 pr-1 ml-1 mr-1'>
                <IonInput
                    className='s-input-1'
                    placeholder='Сумма'
                    type='number'
                    value = { value }
                    onIonInput={(e)=>{
                        setValue( parseFloat( e.detail.value as string ))
                    }}
                />
            </div>
            <div className='flex fl-space ml-1 mr-1'>
                <div className='w-50 mt-1'>
                    <div className='ls-item'
                        onClick={()=>{
                            item.order = new Object()
                            item.order.token    = Store.getState().login.token
                            item.order.sum      = 0,
                            item.order.LC       = item.code,
                            item.order.sumto    = value,
                            item.order.phone    = Store.getState().login.phone,
                            item.order.email    = Store.getState().login.email,
                            item.order.ios      = false
                            props.setPage( 7 )
                        }}
                    >   
                        <img src="assets/sberEQ.png" alt="sberEQ"  className='w-25 h-25'/>
                        <IonLabel className = "">Карта</IonLabel>
                    </div>        
                </div>
                <div
                    className='ls-item mt-1 w-50 ml-1'
                    onClick={()=>{
                        item.order = new Object()
                        item.order.token    = Store.getState().login.token
                        item.order.LC       = item.code,
                        item.order.sum      = 0,
                        item.order.sumto    = value,
                        item.order.phone    = Store.getState().login.phone,
                        item.order.email    = Store.getState().login.email,
                        item.order.ios      = false
                        props.setPage( 8 )
                }}
                >   
                    <IonImg alt = "" src="assets/sbermobile.png" className='h-25 w-25' />
                    <IonLabel className = "">СберМобайл</IonLabel>
                </div>               
            </div>

        </IonCard>
    </>
    
    return elem
}

function SberPay(props: { item, setPage }){
    const [ load, setLoad ] = useState( false)

    const item = props.item

    useEffect(()=>{
        async function load(){
            setLoad( true)
            console.log(item.order)
            const res = await getData("SBOL", item.order )
            if(res.error){ 
                props.setPage( 4 )
            } else {
               //window.open( res.data.externalParams.sbolDeepLink,  "_system" )
                openWidget( res.data )

            }
            setLoad( false )
        }
        load()
    },[])

    const elem = <>
        <IonLoading isOpen = { load } message={"Подождите..."}/>
    </>
    
    return elem
}

function Equaring(props: { item, setPage }){
    const [ load, setLoad ] = useState( false)
    const [ info, setInfo ] = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any

    const item = props.item

    useEffect(()=>{
        async function load(){
            setLoad( true )
            console.log(item.order)
            const res = await getData("SBOL", item.order )
            console.log( res )
            if(res.error){ 

                props.setPage( 4 )

            } else {
                console.log( res.data )
               // setInfo( res.data )
               window.open( res.data.formUrl )

            }
            setLoad( false )
        }
        load()
    },[])

    const elem = <>
        <IonLoading isOpen = { load } message={"Подождите..."}/>
        {
            info !== undefined
                ? <>
                    <div className='w-100 h-100'>
                        <iframe 
                            // ref="iframeRef" 
                            id="iframe" 
                            // className="video" 
                            height="100%" 
                            width="100%" 
                            src = { info.formUrl }
                            allow="autoplay; fullscreen; picture-in-picture" 
                        ></iframe>
                    </div>
                </>
                : <></>
        }

    </>
    
    return elem
}

function Indices(props: { item, setPage}){

    const item = props.item

    function Counter(props:{ info, setPage }){
        const [ mode, setMode ]         = useState( false )
        const [ avail, setAvail ]       = useState( 0 )
        const [ bord ]    = useState( Store.getState().login.borders )
    
        function monthDiff(dateFrom, dateTo) {
            let months = dateTo.getMonth() - dateFrom.getMonth() + 
              (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
            
            if( dateFrom.getDate() > dateTo.getDate() ) months = months - 1
    
            return months
        }
           
        useEffect(()=>{
    
            const date = new Date()
            let d     = date.getDate().toString(); if(d.length === 1) d =  "0" + d;
            let m     = (date.getMonth() + 1).toString(); if(m.length === 1) m =  "0" + m;
            const y   = date.getFullYear().toString()
    
            const pred = new Date( info.predPeriod.substring(6, 10)  + "-" + info.predPeriod.substring(3, 5) + "-" + info.predPeriod.substring(0, 2) )
    
            if( pred.getFullYear() === date.getFullYear() && pred.getMonth() === date.getMonth() ) setAvail( 1 )     
            else if( monthDiff(pred, date) > 3 ) setAvail( 2 )
            else {
                if( bord.from < bord.to ){
                    if(date.getDate() < bord.from || date.getDate() > bord.to) setAvail(  3 )
                } else {
                    if(date.getDate() > bord.to || date.getDate() < bord.from ) setAvail(  3 )
                }
            }
        
            item.current = d + "." + m + "." + y
            
        },[])
    
        const info = props.info
    
        async function lload(){
            await getLics({ token: Store.getState().login.token })     
            info.predIndice = info.indice
            info.predPeriod = info.period
            info.indice = 0; info.period = ""
            setAvail( 4 )
        }
    
        const elem = <>
            <div className='flex fl-space cl-prim'>
                <div> <b> { info.name  } </b></div>
            </div>
            <div className='flex fl-space mt-1 ml-1 cl-prim'>
                <div> { "Дата показания"  }</div>
                <div> <b>{ info.predPeriod }</b> </div>
            </div>
            <div className='flex fl-space mt-1 ml-1 cl-prim'>
                <div> { "Показание"  }</div>
                <div className='fs-11'> <b>{ info.predIndice }</b> </div>
            </div>
            {
                avail === 1
                    ? <>
                        <div className='ml-1 mt-2 fs-09 pb-1'>
                            <b>Показания уже приняты</b>                            
                        </div>
                    </>
                : avail === 2
                    ? <>
                        <div className='ml-1 mt-2 fs-09 pb-1'
                            onClick={()=>{
                                Store.dispatch({type: "route", route: "services"})
                            }}
                        >
                            <b>Нарушен срок подачи показаний, в разделе услуги вам необходимо оформить</b>                            
                            <b className='cl-prim fs-11'>{ " Вызов инспектора" }</b>                            
                        </div>
                    </>
                : avail === 3 
                    ? <>
                        <div className='ml-1 mt-2 fs-09 pb-1'>
                            <b>В настоящее время прием показаний недоступен. Показания принимаются с 20 по 25 число каждого месяца.</b>                            
                        </div>
                    </>
                : avail === 4
                    ? <>
                        <div className='ml-1 mt-2 fs-09 pb-1'>
                            <b>Показания приняты</b>                            
                        </div>
                    </>
                : <>
                    <div className='flex fl-space mt-1 ml-1 cl-prim'>
                        <div> { "Передать"  }</div>
                        <div className='s-input a-right'> 
                            <IonInput
                                className='s-input-1'
                                placeholder='Показание'
                                onIonInput={(e)=>{
                                    info.indice = parseInt(e.detail.value as string)
                                    info.period = item.current
                                    if(info.indice >= info.predIndice && (info.indice - info.predIndice) < 3001 ) setMode(true);
                                    else setMode(false);
    
                                }}
                            />
                        </div>
                    </div>
                </>
            }
            <div className='mt-1'>
                {
                    mode 
                        ? <>
                            <IonButton
                                color = "tertiary"
                                expand='block'
                                mode = "ios"
                                onClick={()=>{
                                    async function load(){
                                        item.token = Store.getState().login.token;
                                        const order = {
                                            token:      Store.getState().login.token,
                                            counters:   [ info ]
                                        }
                                        const res = await getData("setIndications", order )
                                        if(!res.error){
                                            lload()
                                        }
                                    }
                                    load()                                       
                                }}
                            >   
                                { "Отправить показания" }
                            </IonButton>        
                        </>
                        :<></>
                }
                <IonButton
                    color   = "tertiary"
                    expand  = "block"
                    mode    = "ios"
                    onClick = {()=>{
                        item.selected = info
                        props.setPage( 9 )
                    }}
                >
                    { "История" }
                </IonButton>
    
            </div>
        </>
    
        return elem
    }

    let items = <></>
    for(let i = 0; i < item.counters.length; i++){

        items = <>
            { items }
            <Counter info  = { item.counters[i]} setPage = { props.setPage } />
        </>
    }
    const elem = <>
        <IonCard className='pb-1'>
            <div className='flex fl-space mt-1 ml-1'>
                <div className='cl-black'> <h4><b>{ "Лицевой счет №" + item.code }</b></h4></div>
            </div>
            <div className='ml-2 mr-1 cl-prim'>
                { item.name}
            </div>    
            <div className='ml-2 mr-1 pb-1 mt-1 cl-prim'>
                { item.address}
            </div>  
            <div className='mt-1 ml-1 mr-1 t-underline cl-prim'>
                <b>{ "Счетчики" }</b>
            </div>

            <div className='ml-2 mr-1 mt-1'>
                {   
                    
                    items 
                }
            </div>

        </IonCard>
    </>
    return elem
}

function HistoryIndices(props: { item }){
    const [ info, setInfo ] = useState<any>([])

    const item = props.item
    
    async function Load(){
        console.log({
            token: Store.getState().login.token,
            counterId: item.selected.counterId 
        } )
        const res = await getData("GetIndices", { 
            token: Store.getState().login.token,
            counterId: item.selected.counterId 
        })  
        console.log(res )
        if(!res.error){
            if(res.data.length > 0 ){
                setInfo( res.data[0].indications )
            }
        }
            
    }

    useEffect(()=>{
        console.log( 'useeffect')
        Load()
    },[])
    
    let items = <></>
    for(let i = 0; i < info.length; i++ ){
        items = <>
            { items }
            <IonRow className='ml-2 mt-1 mr-2 cl-prim'>
                <IonCol size = "8"> { info[i].date } </IonCol>
                <IonCol size = "4" className="a-right"> <b>{ info[i].indication }</b> </IonCol>
            </IonRow>
        </>
    }

    const elem = <>
      <IonCard className='pb-1'>
            <div className='flex fl-space mt-1 ml-1'>
                <div className='cl-black'> <h4><b>{ "Лицевой счет №" + item.code }</b></h4></div>
            </div>
            <div className='ml-2 mr-1 cl-prim'>
                { item.name}
            </div>    
            <div className='ml-2 mr-1 pb-1 mt-1 cl-prim'>
                { item.address}
            </div>  
            <div className='mt-1 ml-1 mr-1 t-underline cl-prim'>
                <b>{ "История показаний" }</b>
            </div>

            {
                items
            }

        </IonCard>
    </>

    return elem

}
