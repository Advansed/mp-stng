import React, { useEffect, useState } from 'react'
import './Lics.css'
import { IonCard, IonIcon, IonImg, IonInput, IonLoading }     from '@ionic/react'
import { documentTextOutline, pencilOutline }                           from 'ionicons/icons'
import { createWidget }                                                 from '@sber-ecom-core/sberpay-widget';
import { Browser }                                                      from '@capacitor/browser'
import { LicsItem, LicsPage }                                           from './components/types'
import { useLics }                                                      from './useLics'
import { AddLic }                                                       from './components/AddLic'
import { FindLic }                                                      from './components/FindLic/FindLic'
import { Indices }                                                      from './components/Indices/Indices'
import { useNavigation }                                                from '../../pages/useNavigation';
import { LicItem }                                                      from './components/LicItem/LicItem';
import History                                                          from './components/History';
import HistoryIndices                                                   from './components/HistoryIndice';
import { useToast }                                                     from '../Toast';


type WidgetParams = {
    bankInvoiceId:          string;
    lifeTime?:              number;
    expirationDate?:        number;
    isFinishPage?:          true;
    finishPageTimeOut?:     10;
};


function            openWidget( info ){

    const widget = createWidget("PRODUCTION");    

    const params = {

        bankInvoiceId:  info.orderId,
        
        backUrl:        'https://fhd.aostng.ru',
        
        isEmbedded:     true

    };

    widget.open(params);
}

const               openUrl = async (url) =>{
    await Browser.open({ url: url })
}

export function     Lics(): JSX.Element {

    const { info, addLic, delLic, setIndice, sberPAY, equaring, sbp } = useLics()
    const { page, setPage, item, setItem } = useNavigation()


    // Рендеринг компонентов на основе текущей страницы
    const renderPageComponent = (): JSX.Element => {
        try {
            switch(page) {
                case LicsPage.MAIN:             return <Items           info = { info } setItem={setItem} setPage={setPage} delAccount = { delLic }  addLic = { addLic }/>
                case LicsPage.ADD_LIC_1:        return <AddLic          setPage = {setPage}  addLic = { addLic } />;
                case LicsPage.FIND_LIC:         return <FindLic         setPage = { setPage } />; 
                case LicsPage.HISTORY:          return <History         item = { item } />;
                case LicsPage.PAYMENTS:         return <Payments        item = { item } setPage={setPage} />;
                case LicsPage.PAYMENTS_TO:      return <PaymentsTO      item = { item } setPage={setPage} />;
                case LicsPage.INDICES:          return <Indices         item = { item as LicsItem} setPage ={ setPage } setIndice = { setIndice }/>
                case LicsPage.EQUARING:         return <Equaring        item = { item } setPage={setPage} equairing={ equaring }/>;
                case LicsPage.SBER_PAY:         return <SberPay         item = { item } setPage={setPage} SBOL = { sberPAY } />;
                case LicsPage.HISTORY_INDICES:  return <HistoryIndices  item = { item } />;
                // case LicsPage.ALFA_BANK:        return <AlfaBank item={item} setPage={setPage} />;
                case LicsPage.SBP:              return <SBP             item={item} setPage={setPage} sbp = { sbp } />;
                default:                        return <></>;
            }
        } catch (error) {
                return <></>;
        }
    };


    return (
        <>
            {renderPageComponent()}
        </>
    );
}

function            Items( props: { info, setItem, setPage, delAccount, addLic }) {
    const info = props.info

    let elem = <></>

    for(let i= 0;i < info.length;i++){
        elem = <>
            { elem }
            <LicItem info = { info[i]} ind = { i } setItem = { props.setItem } setPage = { props.setPage } delAccount = { props.delAccount } />
        </>
    }

    return (
        <>
            <div className="cards-container">
                { elem }
            </div>                                    
            <AddLics setPage={ props.setPage}  addLic = { props.addLic }/>
        </>
    )
}

function            AddLics(props:{ setPage, addLic }) {

    return <>
        <IonCard>
        <div className='ml-05 mr-05'>
                <div className='ls-item1'
                   onClick={()=>{  props.setPage( LicsPage.ADD_LIC_1 )  }} 
                >
                    <div> <IonIcon icon = { pencilOutline }  className='w-15 h-15 ml-05' color='tertiary' mode = "ios" /></div>
                    <div> 
                        <div className='fs-09 ml-1'><b>Добавить лицевой счет</b></div> 
                        <div className='fs-08 ml-1'>Добавление лицевого счета по коду </div>
                    </div>
                </div>
            </div>
            <div className='ml-05 mr-05'
                onClick={()=>{ props.setPage( LicsPage.FIND_LIC) }}                
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

function            Payments(props:{ item, setPage }){
    const item  = props.item
    const [ upd, setUpd ] = useState( 0 )
    item.debts.forEach((d) => {
        if (d.pay === undefined) d.pay = d.sum > 0 ? d.sum : 0
    })
    const totalPay = item.debts.reduce((total, d) => total + (d.pay || 0), 0)
    const money = (n: number) =>
        new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(n)

    const openPay = (page: number) => {
        item.order = new Object()
        item.order.LC = item.code
        item.order.sum = item.debts
        item.order.sumto = []
        item.order.ios = false
        props.setPage(page)
    }

    return (
        <div className="pay-page">
            <div className="pay-hero">
                <div className="pay-hero-kicker">Оплата</div>
                <div className="pay-hero-title">л/с № {item.code}</div>
                {item.address ? (
                    <div className="pay-hero-sub">{item.address}</div>
                ) : null}
            </div>

            <IonCard className="pay-card">
                <div className="pay-card-title">Начисления</div>
                <div className="pay-rows">
                    {item.debts.map((d, i) => (
                        <div className="pay-row" key={`debt-${i}`}>
                            <span className="pay-row-label">{d.label}</span>
                            <span className="pay-row-value">{money(d.sum)}</span>
                        </div>
                    ))}
                </div>
            </IonCard>

            <IonCard className="pay-card">
                <div className="pay-card-title">
                    {item.sum > 0 ? 'Сумма к оплате' : 'Внести аванс'}
                </div>
                <div className="pay-rows">
                    {item.debts.map((d, i) => {
                        const show = d.sum >= 0
                            // d.pay > 0 ||
                            // d.label === 'Газоснабжение природным газом' ||
                            // d.label === 'Техническое обслуживание'
                        if (!show) return null
                        return (
                            <div className="pay-row pay-row-input" key={`pay-${i}`}>
                                <span className="pay-row-label">{d.label}</span>
                                <div className="pay-input-wrap">
                                    <IonInput
                                        className="pay-input"
                                        value={d.pay}
                                        placeholder="0.00"
                                        inputMode="numeric"
                                        debounce={1000}
                                        onIonInput={(e) => {
                                            let val = e.detail.value as string
                                            if (val === '') val = '0'
                                            d.pay = parseFloat(val)
                                            setUpd(upd + 1)
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="pay-total">
                    <span>Итого к оплате</span>
                    <strong>{money(totalPay)}</strong>
                </div>

                <div className="pay-methods-title">Способы оплаты · без комиссии</div>
                <div className="pay-methods">
                    <button type="button" className="pay-method" onClick={() => openPay(7)}>
                        <IonImg alt="Банковская карта" src="assets/cards1.webp" className="pay-method-img" />
                        <span className="pay-method-caption">Карта</span>
                    </button>
                    <button type="button" className="pay-method" onClick={() => openPay(8)}>
                        <IonImg alt="SberPay" src="assets/sberpay.png" className="pay-method-img pay-method-img--sber" />
                        <span className="pay-method-caption">SberPay</span>
                    </button>
                    <button type="button" className="pay-method" onClick={() => openPay(11)}>
                        <img src="assets/sbp.webp" alt="СБП" className="pay-method-img" />
                        <span className="pay-method-caption">СБП</span>
                    </button>
                </div>
            </IonCard>
        </div>
    )
}

function            PaymentsTO(props:{ item, setPage }){
    const item  = props.item
    item.debts.forEach((d) => {
        if (d.pay === undefined) d.pay = d.sum > 0 ? d.sum : 0
    })
    const totalPay = item.debts.reduce((total, d) => total + (d.pay || 0), 0)
    const money = (n: number) =>
        new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(n)

    const openPay = (page: number) => {
        item.order = new Object()
        item.order.LC = item.code
        item.order.sum = item.debts
        item.order.ios = false
        props.setPage(page)
    }

    return (
        <div className="pay-page">
            <div className="pay-hero">
                <div className="pay-hero-kicker">Оплата ТО</div>
                <div className="pay-hero-title">л/с № {item.code}</div>
                {item.address ? (
                    <div className="pay-hero-sub">{item.address}</div>
                ) : null}
            </div>

            <IonCard className="pay-card">
                <div className="pay-card-title">Начисления</div>
                <div className="pay-rows">
                    {item.debts.map((d, i) => (
                        <div className="pay-row" key={`debt-to-${i}`}>
                            <span className="pay-row-label">{d.label}</span>
                            <span className="pay-row-value">{money(d.sum)}</span>
                        </div>
                    ))}
                </div>
            </IonCard>

            <IonCard className="pay-card">
                <div className="pay-card-title">
                    {item.sum > 0 ? 'Сумма к оплате' : 'Внести аванс'}
                </div>

                <div className="pay-total">
                    <span>К оплате</span>
                    <strong>{money(totalPay)}</strong>
                </div>

                <div className="pay-methods-title">Способы оплаты</div>
                <div className="pay-methods">
                    <button type="button" className="pay-method" onClick={() => openPay(7)}>
                        <img src="assets/cards1.webp" alt="Банковская карта" className="pay-method-img" />
                        <span className="pay-method-caption">Карта</span>
                    </button>
                    <button type="button" className="pay-method" onClick={() => openPay(8)}>
                        <IonImg alt="SberPay" src="assets/sberpay.png" className="pay-method-img pay-method-img--sber" />
                        <span className="pay-method-caption">SberPay</span>
                    </button>
                </div>
            </IonCard>
        </div>
    )
}

function            SberPay({ item, setPage, SBOL }:{ item: any, setPage: any, SBOL: any }){
    const [ load, setLoad ] = useState( false)


    useEffect(()=>{
        async function load(){
            setLoad( true)
            const res = await SBOL( item.order )
            if(res.error){ 
                setPage( 4 )
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

function            Equaring({ item, setPage, equairing }:{ item: any, setPage: any, equairing: any }){
    const [ load, setLoad ] = useState( false)
    const [ info, setInfo ] = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ iframeLoading, setIframeLoading ] = useState( true )


    useEffect(()=>{
        async function load(){
            setLoad( true )
            const res = await equairing( item.order )
            if(res.error){ 

                setPage( 4 )

            } else {
               setInfo( res.data )
               setIframeLoading( true )
               //window.open( res.data.formUrl, '_blank' )
               //openUrl( res.data.formUrl )
  
            }
            setLoad( false )
        }
        load()
    },[])

    const handleIframeLoad = () => {
        setIframeLoading( false )
    }

    const elem = <>
        <IonLoading isOpen = { load } message={"Подождите..."}/>
        {
            info !== undefined
                ? <>
                    <div className='w-100 h-100' style={{ position: 'relative' }}>
                        { iframeLoading && (
                            <div className="iframe-skeleton">
                                <div className="skeleton-content">
                                    <div className="skeleton-line skeleton-line-1"></div>
                                    <div className="skeleton-line skeleton-line-2"></div>
                                    <div className="skeleton-line skeleton-line-3"></div>
                                    <div className="skeleton-line skeleton-line-4"></div>
                                    <div className="skeleton-line skeleton-line-5"></div>
                                </div>
                            </div>
                        )}
                        <iframe 
                            // ref="iframeRef" 
                            id="iframe" 
                            // className="video" 
                            height="100%" 
                            width="100%" 
                            src = { info.formUrl }
                            allow="autoplay; fullscreen; picture-in-picture"
                            onLoad={ handleIframeLoad }
                            style={{ 
                                opacity: iframeLoading ? 0 : 1,
                                transition: 'opacity 0.3s ease-in-out'
                            }}
                        ></iframe>
                    </div>
                </>
                : <></>
        }

    </>
    
    return elem
}

function            SBP({ item, setPage, sbp }:{ item: any, setPage: any, sbp: any }){
    const [ load, setLoad ] = useState( false)
    const [ info, setInfo ] = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
    const toast = useToast()


    useEffect(()=>{
        async function load(){
            setLoad( true )
            const res = await sbp( item.order )
            if(res.error){ 

                setPage( 4 )

                toast.error( res.message )

            } else {
               setInfo( res.data )
              // window.open( res.data.formUrl, '_blank' )
              //openUrl( res.data.formUrl )
  
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
                            id      = "iframe" 
                            // className="video" 
                            height  = "100%" 
                            width   = "100%" 
                            src     = { info.qr.payload }
                            allow   = "autoplay; fullscreen; picture-in-picture" 
                        ></iframe>
                    </div>
                </>
                : <></>
        }

    </>
    
    return elem
}
