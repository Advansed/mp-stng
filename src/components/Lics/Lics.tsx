import React, { useEffect, useState } from 'react'
import { Store, getApps, getData, getLics, getProfile } from '../Store'
import './Lics.css'
import { IonButton, IonCard, IonCol, IonContent, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonLoading, IonModal, IonPopover, IonRefresher, IonRefresherContent, IonRow, IonSegment, IonSegmentButton, IonSegmentContent, IonSegmentView, IonText } from '@ionic/react'
import { alertCircleOutline, cardOutline, chevronForwardOutline, codeWorkingOutline, documentAttachOutline, documentTextOutline, ellipsisVerticalOutline, locationOutline, newspaperOutline, pencilOutline, personCircleOutline, personOutline, trashBinOutline } from 'ionicons/icons'
import { PDFDoc } from '../Files'
import { createWidget } from '@sber-ecom-core/sberpay-widget';
import { Browser } from '@capacitor/browser'
import { useLics } from './useLics'
import { LicsPage } from './components/types'
import { DEBUG_PREFIXES } from './components/constants'

type WidgetParams = {
    bankInvoiceId: string;
    lifeTime?: number;
    expirationDate?: number;
    isFinishPage?: true;
    finishPageTimeOut?: 10;
};


function            openWidget( info ){

    const widget = createWidget("PRODUCTION");    

    const params = {
        bankInvoiceId: info.orderId,
        backUrl: 'https://fhd.aostng.ru',
        isEmbedded: true
    };

    widget.open(params);
}

const               openUrl = async (url) =>{
    await Browser.open({ url: url })
}

export function     Lics(): JSX.Element {
    // Используем кастомный хук вместо useState и useEffect
    const {
        info,
        upd,
        page,
        item,
        setPage,
        setItem,
        handleBackNavigation,
        refreshLics,
        getCurrentPageName
    } = useLics();

    // Рендеринг компонентов на основе текущей страницы
    const renderPageComponent = (): JSX.Element => {
        try {
            switch(page) {
                case LicsPage.MAIN:
                    return (
                        <>
                            <Items info={info} setItem={setItem} setPage={setPage} />
                            <AddLic setPage={setPage} />
                        </>
                    );
                case LicsPage.ADD_LIC_1:
                    return <AddLic1 setPage={setPage} />;
                case LicsPage.ADD_LIC_2:
                    return <AddLic2 setPage={setPage} />;
                case LicsPage.HISTORY:
                    return <History item={item} />;
                case LicsPage.PAYMENTS:
                    return <Payments item={item} setPage={setPage} />;
                case LicsPage.PAYMENTS_TO:
                    return <PaymentsTO item={item} setPage={setPage} />;
                case LicsPage.INDICES:
                    return <Indices item={item} setPage={setPage} />;
                case LicsPage.EQUARING:
                    return <Equaring item={item} setPage={setPage} />;
                case LicsPage.SBER_PAY:
                    return <SberPay item={item} setPage={setPage} />;
                case LicsPage.HISTORY_INDICES:
                    return <HistoryIndices item={item} />;
                case LicsPage.ALFA_BANK:
                    return <AlfaBank item={item} setPage={setPage} />;
                default:
                    console.warn(`${DEBUG_PREFIXES.LICS} Unknown page: ${page}`);
                    return <></>;
            }
        } catch (error) {
            console.error(`${DEBUG_PREFIXES.ERROR} Error rendering page component:`, error);
            return <></>;
        }
    };

    console.log(`${DEBUG_PREFIXES.LICS} Rendering page: ${getCurrentPageName()}`);

    return (
        <>
            {renderPageComponent()}
        </>
    );
}

async function      Add( params, setMessage, setPage ){

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

    return (
        <div className="cards-container">
            { elem }
        </div>
    )
}

function            AddLic(props:{ setPage}) {

    return <>
        <IonCard>
        <div className='ml-05 mr-05'>
                <div className='ls-item1'
                   onClick={()=>{  props.setPage( 1 )  }} 
                >
                    <div> <IonIcon icon = { pencilOutline }  className='w-15 h-15 ml-05' color='tertiary' mode = "ios" /></div>
                    <div> 
                        <div className='fs-09 ml-1'><b>Добавить лицевой счет</b></div> 
                        <div className='fs-08 ml-1'>Добавление лицевого счета по коду </div>
                    </div>
                </div>
            </div>
            <div className='ml-05 mr-05'
                onClick={()=>{  props.setPage( 2 )  }}                
            >
                <div className='ls-item1'>
                    <div> <IonIcon icon = { documentTextOutline }  className='w-15 h-15 ml-05' color='tertiary' mode = "ios" /></div>
                    <div> 
                        <div className='fs-09 ml-1'><b>Узнать лицевой счет</b></div> 
                        <div className='fs-08 ml-1'>Добавить лицевой счет по адресу </div>
                    </div>
                </div>
            </div>
        </IonCard>
    </>
}

function            AddLic1(props:{ setPage }){
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

function            AddLic2(props:{ setPage }){
    const [ info,       setInfo]        = useState<any>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ ulus,       setUlus ]       = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ naspunkt,   setNaspunkt ]   = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ street,     setStreet ]     = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ house,      setHouse ]      = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ kv,         setKv ]         = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ lc,         setLc ]         = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ fio,        setFio ]        = useState("")
    const [ message,    setMessage ]    = useState("")
    const [ load,       setLoad ]       = useState( false )

    async function      Add1( params ){
        setLoad( true )
        const res = await getData("AddAccount", params )
        console.log( res )
        if(res.error){
            setMessage(res.message);
        } else {
            getLics({ token: Store.getState().login.token })
            getProfile({ token: Store.getState().login.token })
            props.setPage( 0 )
        }
        setLoad(false)
    }   

    useEffect(()=>{
        async function load(){
            setLoad(true)
            const res = await getData("getSettlements", {
                token : Store.getState().login.token,
            })
            console.log(res)
            setInfo( res.data)
            setLoad(false)
        }
        load()
    },[])

    async function getStreets( e ){
        setLoad(true)
        const res = await getData("getStreets", {
            token   : Store.getState().login.token,
            s_id    : e.s_id
        })
        if(res.error) setMessage( res.message )
        else {
            e.streets = res.data;
            setNaspunkt( e )
        }
        setLoad(false)
    }

    async function getHouses( e ){
        setLoad(true)
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
        setLoad(false)
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
            <IonLoading isOpen = {load} message={"Подождите"}/>
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
                            Add1( {
                                token:  Store.getState().login.token,
                                LC:     lc.code,
                                fio:    fio,    
                            })
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

function            Lic(props: { info, ind, setItem, setPage } ){
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
                <div className='cl-black fs-12'> <b>{ "л/с № " + info.code }</b></div>
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
            <div className='ml-1 mr-1 t-underline pb-05 fs-09 flex'>
                <div className=''>
                    <IonIcon icon = { personOutline }  className='h-15 w-15' color='tertiary'/>
                </div>
                
                <div className=' ml-1'>
                    { info.name}
                </div>    
            </div>
            <div className='ml-1 mr-1 t-underline pb-05 mt-1 flex fs-09'>
                <div className=''>
                    <IonIcon icon = { locationOutline }  className='h-15 w-15' color='tertiary'/>
                </div>
                
                <div className=' ml-1'>
                    { info.address}
                </div>    
            </div>   
            <div className='pl-1 pr-1 pt-1'>
                <IonSegment value="first" mode = "ios">
                    <IonSegmentButton value="first" contentId={ "first" + info.id }>
                    <IonLabel>Счета</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="second" contentId={ "second" + info.id }>
                    <IonLabel>Действия</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
                <IonSegmentView>
                    <IonSegmentContent id={ "first" + info.id }>
                        <div className='flex mt-05'>
                            <div className='ls-panel'
                                onClick={()=>{
                                    props.setItem( info )
                                    props.setPage( 4 )
                                }}
                            >
                                <div className='a-center fs-09'>
                                    {
                                        info.sum < 0 ? "Аванс за газ" : "Долг за газ" 
                                    }
                                    
                                </div>
                                <div className='cl-prim fs-11 mt-05 mb-05 ml-1'>
                                    <b>
                                        { 
                                            info.sum < 0 
                                                ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( ( -info.sum ) ) 
                                                : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( ( info.sum ) ) 
                                        }
                                    </b>
                                </div>
                                <div className='ls-button1 mt-05'>
                                    <IonIcon icon = { cardOutline } className='pr-05'/>
                                    <IonLabel className='fs-09'>
                                        {
                                            info.sum > 0 ? "Оплатить" : "Внести аванс" 
                                        }
                                    </IonLabel>

                                </div>
                            </div>
                            <div className='ls-panel ml-05'
                                onClick={()=>{
                                    props.setItem( info )
                                    props.setPage( 5 )
                                }}
                            >
                                <div className='a-center fs-09'>
                                    {
                                        info.sumto < 0 ? "Аванс за ТО" : "Долг за ТО"
                                    }
                                </div>
                                <div className='cl-prim fs-11 mt-05 mb-05 ml-1'><b>{ new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( ( info.sumto ) ) }</b></div>
                                <div className='ls-button1 mt-05'>
                                    <IonIcon icon = { cardOutline } className='pr-05'/>
                                    <IonLabel className='fs-09'>
                                        {
                                            info.sum > 0 ? "Оплатить" : "Внести аванс" 
                                        }
                                    </IonLabel>

                                </div>
                            </div>
                        </div>
                        {
                            info.counters.length > 0
                                ? <>
                                    <div className='ls-item2'
                                        onClick={()=>{
                                            Quits()
                                        }}
                                    >
                                        <div className='ml-05'>
                                            <IonIcon icon = { alertCircleOutline }  className='h-15 w-15' color="primary"/>
                                        </div>
                                        <div className='ml-1'>
                                            <div className='fs-09'><b>Напоминание: </b> Пожалуйста, вносите показания счетчика ежемесячно  </div>
                                        </div>
                                    </div> 
                                </>
                                : <></>
                        }
                    </IonSegmentContent>
                    <IonSegmentContent id={ "second" + info.id }>
                        <div>
                            {
                                info.counters.length > 0
                                    ? <>
                                        <div className='ls-item1'
                                            onClick={()=>{
                                                props.setItem( info )
                                                props.setPage( 6 )                                   
                                            }}
                                        >
                                            <div className='ml-05'>
                                                <IonIcon icon = { codeWorkingOutline }  className='h-15 w-15' color="primary"/>
                                            </div>
                                            <div className='ml-1'>
                                                <div className='fs-09'><b>Внести показания </b>  </div>
                                                <div className='fs-08'>Передать текущие показания счетчика</div>
                                            </div>

                                        </div> 
                                    </>
                                    : <>
                                    </>
                            }
                            <div className='ls-item1'
                                onClick={()=>{
                                    Quits()
                                }}
                            >
                                <div className='ml-05'>
                                    <IonIcon icon = { documentAttachOutline }  className='h-15 w-15' color="primary"/>
                                </div>
                                <div className='ml-1'>
                                    <div className='fs-09'><b>Квитанция </b>  </div>
                                    <div className='fs-08'>Просмотр, скачивание квитанции</div>
                                </div>

                            </div> 
                        </div>
                    </IonSegmentContent>
                </IonSegmentView>            
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

function            History(props: { item }){
    const [ info, setInfo ] = useState<any>([])

    const item = props.item
    
    async function Load(){
        console.log({
            token: Store.getState().login.token,
            LC: item.code 
        })
        const res = await getData("GetPayments1", { 
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


    function Items(props:{ info }){

        let elem = <></>

        for(let i = 0; i < props.info.length; i++){
            elem = <>
                { elem }
                <div className='flex fl-space ml-2 mr-2 mt-05'>
                    <div className='fs-09'>{ props.info[i].number }</div>
                    <div className='fs-1'>
                        <b>
                            { 
                                new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( props.info[i].summ )    
                            }
                        </b>
                    </div>
                </div>
            </>
        }


        return elem
    }
    
    let items = <></>
    for(let i = 0; i < info.length; i++ ){
        
        items = <>
            { items }
            <div className='ml-1 cl-prim'>
                <div className='mt-1 '> <b>{ info[i].date }</b> </div>
                <Items info = { info[i].pays }/>
                <div className='flex fl-space ml-2 mr-2 t-upperline pt-05'>
                    <div className='fs-09'> <b>Итого</b></div>
                    <div><b>{ new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( info[i].summ )  }</b></div>
                </div>
            </div>
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

function            Payments(props:{ item, setPage }){
    const item  = props.item
    const [ upd, setUpd ] = useState( 0 )

    let items = <>
        <div className='ml-1 mt-1 fs-09 cl-black'>
            <b>
                {
                    item.sum >= 0
                        ? "Оплатить"
                        : "Внести аванс"
                }
            </b>
        </div>
    </>
    
    console.log(item.debts)
    for( let i = 0; i < item.debts.length; i++ ){
        if( item.debts[i].pay === undefined ) item.debts[i].pay = item.debts[i].sum > 0 ? item.debts[i].sum : 0
        if( item.debts[i].sum >= 0) {
            console.log( item.debts[i] )
            items = <>
                { items }
                <div className='flex fl-space ml-2 fs-09 mr-1 mt-05'>
                    <div className='w-50'><b>{ item.debts[i].label }</b></div>      
                    <div className='w-50 ls-input a-right'>
                        <IonInput
                            className='custom-input'
                            value={ item.debts[i].pay }
                            placeholder= { '0.00' }
                            inputMode = "numeric"
                            debounce={ 1000 }
                            onIonInput={(e)=>{
                                 let val = (e.detail.value as string)
                                 if( val === '') val = '0'
                                item.debts[i].pay = parseFloat( val )
                                setUpd( upd + 1)
                            }}
                            
                        >

                        </IonInput>
                    </div>
                </div>
            </>
        }
    }

    items = <>
        { items }
        <div className='ml-1 mr-1 t-upperline mt-05 pt-05 flex fl-space' >
            <div className='fs-09 cl-black'><b>Итого</b></div>
            <div className='mr-1 cl-black'><b>{ 
                new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( item.debts.reduce((total, item) => total + item.pay, 0) ) 
           }</b></div>
        </div>
    </>

    
    const elem = <>
        <IonCard className='pb-1'>
            
            { items }

            <div className='mt-2 ml-1 fs-09'>Способы оплаты</div>
            <div className='flex fl-space ml-1 mr-1'>

                <div className='ls-item3 w-30'>
                    <div className=''
                        onClick={()=>{
                            item.order = new Object()
                            item.order.token    = Store.getState().login.token
                            item.order.sum      = item.debts,
                            item.order.LC       = item.code,
                            item.order.sumto    = [],
                            item.order.phone    = Store.getState().login.phone,
                            item.order.email    = Store.getState().login.email,
                            item.order.ios      = false
                            props.setPage( 7 )
                           
                        }}
                    >   
                        <img src="assets/cards1.webp" alt="sberEQ"  className='w-3'/>
                        <IonLabel className = " ml-05"></IonLabel>
                    </div>        
                </div>

                <div className='ls-item3 ml-05 w-30'>
                    <div
                        className=''
                        onClick={()=>{
                            item.order = new Object()
                            item.order.token    = Store.getState().login.token
                            item.order.LC       = item.code,
                            item.order.sum      = item.debts,
                            item.order.sumto    = [],
                            item.order.phone    = Store.getState().login.phone,
                            item.order.email    = Store.getState().login.email,
                            item.order.ios      = false
                            props.setPage( 8 )
                    }}
                    >   
                        <IonImg alt = "" src="assets/sberpay.png" className='h-2' />
                        {/* <IonLabel className = "">СберМобайл</IonLabel> */}
                    </div>               
                </div>
                
                {/* НОВАЯ КНОПКА АЛЬФА-БАНКА */}
                <div className='ls-item3 ml-05 w-30'>
                    <div className=''
                        onClick={() => {
                            item.order = new Object()
                            item.order.token = Store.getState().login.token
                            item.order.LC = item.code,
                            item.order.sum = item.debts,
                            item.order.sumto = [],
                            item.order.phone = Store.getState().login.phone,
                            item.order.email = Store.getState().login.email,
                            item.order.ios = false
                            props.setPage(10) // НОВАЯ СТРАНИЦА ДЛЯ АЛЬФА-БАНКА
                        }}
                    >   
                        <img src="assets/alfabank.png" alt="Альфа-Банк" className='h-2'/>
                        {/* <IonLabel className="ml-05 fs-08">Альфа-Банк</IonLabel> */}
                    </div>               
                </div>

            </div>

        </IonCard>
    </>
    
    return elem
}

function            PaymentsTO(props:{ item, setPage }){
    const item  = props.item
    const [ upd, setUpd ] = useState( 0 )

    let items = <>
        <div className='ml-1 mt-1 fs-09 cl-black'>
            <b>
                {
                    item.sumto >= 0
                        ? "Оплатить"
                        : "Внести аванс"
                }
            </b>
        </div>
    </>
    
    for( let i = 0; i < item.debtsto.length; i++ ){
        if( item.debtsto[i].pay === undefined ) item.debtsto[i].pay = item.debtsto[i].sum > 0 ? item.debtsto[i].sum : 0
        if( item.debtsto[i].sum >= 0) {
            items = <>
                { items }
                <div className='flex fl-space ml-2 fs-09 mr-1 mt-05'>
                    <div className='w-50'><b>{ item.debtsto[i].label }</b></div>      
                    <div className='w-50 ls-input a-right'>
                        <IonInput
                            className='custom-input'
                            value={ item.debtsto[i].pay }
                            placeholder= { '0.00' }
                            inputMode = "numeric"
                            debounce={ 1000 }
                            onIonInput={(e)=>{
                                 let val = (e.detail.value as string)
                                 if( val === '') val = '0'
                                item.debtsto[i].pay = parseFloat( val )
                                setUpd( upd + 1)
                            }}
                            
                        >

                        </IonInput>
                    </div>
                </div>
            </>
        }
    }

    items = <>
        { items }
        <div className='ml-1 mr-1 t-upperline mt-05 pt-05 flex fl-space' >
            <div className='fs-09 cl-black'><b>Итого</b></div>
            <div className='mr-1 cl-black'><b>{ 
                new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( item.debtsto.reduce((total, item) => total + item.pay, 0) ) 
            }</b></div>
        </div>
    </>

    
    const elem = <>
        <IonCard className='pb-1'>
            
            { items }

            <div className='mt-2 ml-1 fs-09'>Способы оплаты</div>
            <div className='flex fl-space ml-1 mr-1'>
                <div className='ls-item3 w-50'>
                    <div className=''
                        onClick={()=>{
                            item.order = new Object()
                            item.order.token    = Store.getState().login.token
                            item.order.sum      = [],
                            item.order.LC       = item.code,
                            item.order.sumto    = item.debtsto,
                            item.order.phone    = Store.getState().login.phone,
                            item.order.email    = Store.getState().login.email,
                            item.order.ios      = false
                            props.setPage( 7 )
                           
                        }}
                    >   
                        <img src="assets/cards1.webp" alt="sberEQ"  className='w-3'/>
                        <IonLabel className = " ml-05"></IonLabel>
                    </div>        
                </div>
                <div className='ls-item3 ml-05 w-50'>
                    <div
                        className=''
                        onClick={()=>{
                            item.order = new Object()
                            item.order.token    = Store.getState().login.token
                            item.order.LC       = item.code,
                            item.order.sum      = [],
                            item.order.sumto    = item.debtsto,
                            item.order.phone    = Store.getState().login.phone,
                            item.order.email    = Store.getState().login.email,
                            item.order.ios      = false
                            props.setPage( 8 )
                    }}
                    >   
                        <IonImg alt = "" src="assets/sberpay.png" className='h-2' />
                        {/* <IonLabel className = "">СберМобайл</IonLabel> */}
                    </div>               
                </div>
            </div>

        </IonCard>
    </>
    
    return elem
}

function            SberPay(props: { item, setPage }){
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

function            Equaring(props: { item, setPage }){
    const [ load, setLoad ] = useState( false)
    const [ info, setInfo ] = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any

    const item = props.item

    useEffect(()=>{
        async function load(){
            setLoad( true )
            console.log(item.order)
            const res = await getData("SBOL1", item.order )
            console.log( res )
            if(res.error){ 

                props.setPage( 4 )

            } else {
                console.log( res.data )
               // setInfo( res.data )
              // window.open( res.data.formUrl, '_blank' )
              openUrl( res.data.formUrl )
  
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

function            Indices(props: { item, setPage}){

    const item = props.item

    function Counter(props:{ info, setPage }){
        const [ mode,   setMode ]   = useState( false )
        const [ avail,  setAvail ]  = useState( 0 )
        const [ delta,  setDelta ]  = useState( -1 )

        const login    = Store.getState().login
    
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
            else if( monthDiff(pred, date) >  ( login.monthes === 0 ? 999 : login.monthes ) ) setAvail( 2 )
            else {
                if( login.borders.from < login.borders.to ){
                    if(date.getDate() < login.borders.from || date.getDate() > login.borders.to) setAvail(  3 )
                } else {
                    if(date.getDate() > login.borders.to || date.getDate() < login.borders.from ) setAvail(  3 )
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
                                <b>Нарушен срок подачи показаний, в разделе услуги вам необходимо обратиться в </b>                            
                                <b className='cl-prim fs-11'>{ " Единый контакт-центр 509-555" }</b>                            
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
                            <b>Ваши показания приняты, сумму начислений Вы увидите после 01 числа следующего месяца</b>                            
                        </div>
                    </>
                : <>
                    <div className='flex fl-space mt-1 ml-1 cl-prim'>
                        <div className='w-40'> { "Передать"  }</div>
                        <div className=' w-50 s-input a-right '> 
                            <IonInput
                                className='s-input-1'
                                placeholder='Показание'
                                onIonInput={(e)=>{
                                    info.indice = parseInt(e.detail.value as string)
                                    info.period = item.current
                                    if(info.indice >= info.predIndice && (info.indice - info.predIndice) < 3001 ) setMode(true);
                                    else setMode(false);

                                    setDelta( info.indice - info.predIndice )
                                }}
                            />
                        </div>
                    </div>
                    <p className={ 'a-right fs-09' }> <b>{ 
                        delta === 0 ? ""
                        : delta > 0 ? "Разность показаний " + delta.toString()
                        : delta < 0 ? ""
                        : <></>
                    } </b> </p>
                    <p className={ 'a-right fs-08' }> <b>{ 
                        delta === 0  ? "Передать нулевое показание"
                        : delta > 3000 ? "Нельзя передать слишком большое показание"
                        : delta < 0 ? ""
                        : <></>
                    } </b> </p>
                    <p className='fs-09'>
                        { "С 20 марта 2025 года показания должны быть введены не более 5 знаков, а также разница не должна превышать объем в 10 000 м3, в противном случае Вам необходимо вызвать инспекторов для снятия показаний" }
                    </p>
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

function            HistoryIndices(props: { item }){
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

function            AlfaBank(props: { item, setPage }) {
    const [load, setLoad] = useState(false)
    const item = props.item

    useEffect(() => {
        async function load() {
            setLoad(true)
            console.log('Alfa order:', item.order)
            
            try {
                const res = await getData("GAZPROM", item.order)
                console.log('Alfa response:', res)
                
                if (res.error) { 
                    props.setPage(4) // Возвращаемся к странице оплаты
                } else {
                    // Открываем форму оплаты Альфа-банка
                    openUrl(res.data.formUrl)
                }
            } catch (error) {
                console.error('Alfa payment error:', error)
                props.setPage(4)
            }
            
            setLoad(false)
        }
        load()
    }, [])

    const elem = <>
        <IonLoading isOpen={load} message={"Переход к оплате через Альфа-Банк..."}/>
    </>
    
    return elem
}
