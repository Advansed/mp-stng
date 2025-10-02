import React, { useEffect, useState } from 'react'
import './Lics.css'
import { IonCard, IonCol, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonLoading, IonRow } from '@ionic/react'
import { documentTextOutline, pencilOutline } from 'ionicons/icons'
import { createWidget } from '@sber-ecom-core/sberpay-widget';
import { Browser } from '@capacitor/browser'
import { LicsItem, LicsPage } from './components/types'
import { DEBUG_PREFIXES } from './components/constants'
import { useLics } from './useLics'
import { useNavigation } from './useNavigation'
import { AddLic } from './components/AddLic'
import { FindLic } from './components/FindLic/FindLic'
import { LicItem } from './components/LicItem'
import { Indices } from './components/Indices/Indices'


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

    const { info, addLic, delLic, setIndice, sberPAY, equaring, getpayments, getIndices } = useLics()
    const { page, setPage, item, setItem, getCurrentPageName } = useNavigation()

    useEffect(()=>{
        console.log( info )
    },[ info ])

    // Рендеринг компонентов на основе текущей страницы
    const renderPageComponent = (): JSX.Element => {
        try {
            switch(page) {
                case LicsPage.MAIN:             return <Items info={info} setItem={setItem} setPage={setPage} delAccount = { delLic }  addLic = { addLic }/>
                case LicsPage.ADD_LIC_1:        return <AddLic setPage = {setPage}  addLic = { addLic } />;
                case LicsPage.FIND_LIC:         return <FindLic setPage = { setPage } />; 
                case LicsPage.HISTORY:          return <History item={item} getpayments = { getpayments }/>;
                case LicsPage.PAYMENTS:         return <Payments item={item} setPage={setPage} />;
                case LicsPage.PAYMENTS_TO:      return <PaymentsTO item={item} setPage={setPage} />;
                case LicsPage.INDICES:          return <Indices item = { item as LicsItem} setPage ={ setPage } setIndice = { setIndice }/>
                case LicsPage.EQUARING:         return <Equaring item={item} setPage={setPage} equairing={ equaring }/>;
                case LicsPage.SBER_PAY:         return <SberPay item={item} setPage={setPage} SBOL = { sberPAY } />;
                case LicsPage.HISTORY_INDICES:  return <HistoryIndices item={item}  getIndices={ getIndices }/>;
                // case LicsPage.ALFA_BANK:        return <AlfaBank item={item} setPage={setPage} />;
                // case LicsPage.SBP:              return <SBP item={item} setPage={setPage} />;
                default:                        return <></>;
            }
        } catch (error) {
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

function            History(props: { item, getpayments }){
    const [ info, setInfo ] = useState<any>([])
    const [ load, setLoad] = useState( false )

    const item = props.item
    
    async function Load(){
        setLoad( true)
        console.log('getPayments', item.code )
        const res = await props.getpayments( item.code )  
        console.log(res)
        if(!res.error){
            if(res.data.length > 0 ){
                setInfo( res.data[0].payments )
            }
        }
        setLoad( false )            
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
        <IonLoading isOpen = { load } message = {"Подождите"} />
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

    function Lines() {

        let elem = <>
            <div className='mt-1 ml-1 cl-black fs-09'> <b>Начисления</b></div>
        </>
        console.log('lines')
        console.log( item.debts)
        for( let i = 0; i < item.debts.length; i++ ){
            elem = <>
                { elem }
                <div className='flex fl-space ml-2 mt-1 mr-1 fs-09'>
                    <div><b>{ item.debts[i].label }</b></div>
                    <div className='cl-black'>
                        <b>
                            { new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( item.debts[i].sum ) }
                        </b>
                    </div>
                </div>
            </>
        }        

        elem = <>
            <IonCard className='pb-1'>
                { elem }
            </IonCard>
        </>

        return elem
    }

    let items = <>
        <div className='ml-1 mt-1 fs-09 cl-black'>
            <b>
                {
                    item.sum > 0
                        ? "Оплатить"
                        : "Внести аванс"
                }
            </b>
        </div>
    </>
    
    for( let i = 0; i < item.debts.length; i++ ){
        if( item.debts[i].pay === undefined ) item.debts[i].pay = item.debts[i].sum > 0 ? item.debts[i].sum : 0
        if( (item.debts[i].pay > 0) || ( item.debts[i].label === 'Газоснабжение природным газом') || ( item.debts[i].label === 'Техническое обслуживание')) {
            console.log( item.debts[i] )
            items = <>
                { items }
                <div className='flex fl-space ml-2 fs-09 mr-1 mt-05'>
                    <div className='w-50'><b>{ item.debts[i].label }</b></div>      
                    <div className='w-50 ls-input a-right'>
                        <IonInput
                            className       = 'custom-input'
                            value           = { item.debts[i].pay }
                            placeholder     = { '0.00' }
                            inputMode       = "numeric"
                            debounce        = { 1000 }
                            onIonInput      = {(e)=>{

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
            <div className='fs-09 cl-black'><b>Итого к оплате</b></div>
            <div className='mr-1 cl-black'><b>{ 
                new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( item.debts.reduce((total, item) => total + item.pay, 0) ) 
           }</b></div>
        </div>
    </>

    
    const elem = <>

        <Lines />
        
        <IonCard className='pb-1'>
            
            { items }

            <div className='mt-2 ml-1 fs-09'>Способы оплаты</div>
            <div className='flex fl-space ml-1 mr-1'>

                {/* НОВАЯ КНОПКА АЛЬФА-БАНКА */}
                {/* <div className='ls-item3 ml-05 w-30'>
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
                        <img src="assets/gazprom.webp" alt="ГазПромБанк" />
                        
                    </div>               
                </div> */}

               <div className='ls-item3 ml-05 w-50'>
                    <div
                        className=''
                        onClick={()=>{
                            item.order = new Object()
                            item.order.LC       = item.code,
                            item.order.sum      = item.debts,
                            item.order.sumto    = [],
                            item.order.ios      = false
                            props.setPage( 7 )
                    }}
                    >   
                        <IonImg alt = "" src="assets/cards1.webp" className='h-3' />
                        {/* <IonLabel className = "">СберМобайл</IonLabel> */}
                    </div>               
                </div>

               <div className='ls-item3 ml-05 w-50'>
                    <div
                        className=''
                        onClick={()=>{
                            item.order = new Object()
                            item.order.LC       = item.code,
                            item.order.sum      = item.debts,
                            item.order.sumto    = [],
                            item.order.ios      = false
                            props.setPage( 8 )
                    }}
                    >   
                        <IonImg alt = "" src="assets/sberpay.png" className='h-2' />
                        {/* <IonLabel className = "">СберМобайл</IonLabel> */}
                    </div>               
                </div>
                
                {/* НОВАЯ КНОПКА АЛЬФА-БАНКА */}
                {/* <div className='ls-item3 ml-05 w-30'>
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
                            props.setPage(11) // НОВАЯ СТРАНИЦА ДЛЯ АЛЬФА-БАНКА
                        }}
                    >   
                        <img src="assets/sbp.webp" alt="ГазПромБанк" />
                    </div>               
                </div> */}
 
            </div>

        </IonCard>
    </>
    
    return elem
}

function            PaymentsTO(props:{ item, setPage }){
    const item  = props.item
    const [ upd, setUpd ] = useState( 0 )


    function Lines() {

        let elem = <>
            <div className='mt-1 ml-1 cl-black fs-09'> <b>Начисления</b></div>
        </>
        console.log('lines')
        console.log( item.debts)
        for( let i = 0; i < item.debts.length; i++ ){
            elem = <>
                { elem }
                <div className='flex fl-space ml-2 mt-1 mr-1 fs-09'>
                    <div><b>{ item.debts[i].label }</b></div>
                    <div className='cl-black'>
                        <b>
                            { new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( item.debts[i].sum ) }
                        </b>
                    </div>
                </div>
            </>
        }        

        elem = <>
            <IonCard className='pb-1'>
                { elem }
            </IonCard>
        </>

        return elem
    }

    let items = <>
        <div className='ml-1 mt-1 fs-09 cl-black'>
            <b>
                {
                    item.sum > 0
                        ? "Оплатить"
                        : "Внести аванс"
                }
            </b>
        </div>
    </>
    
    for( let i = 0; i < item.debts.length; i++ ){
        if( item.debts[i].pay === undefined ) item.debts[i].pay = item.debts[i].sum > 0 ? item.debts[i].sum : 0
    }


    items = <>
        { items }
        <div className='ml-1 mr-1 t-upperline mt-05 pt-05 flex fl-space' >
            <div className='fs-09 cl-black'><b>К оплате</b></div>
            <div className='mr-1 cl-black'><b>{ 
                new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( item.debts.reduce((total, item) => total + item.pay, 0) ) 
            }</b></div>
        </div>
    </>

    
    const elem = <>
        <Lines />
        <IonCard className='pb-1'>
            
            { items }

            <div className='mt-2 ml-1 fs-09'>Спос обы оплаты</div>
            <div className='flex fl-space ml-1 mr-1'>
                <div className='ls-item3 w-50'>
                    <div className=''
                        onClick={()=>{
                            item.order = new Object()
                            item.order.LC       = item.code,
                            item.order.sum      = item.debts,
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
                            item.order.LC       = item.code,
                            item.order.sum    = item.debts,
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

function            SberPay({ item, setPage, SBOL }:{ item: any, setPage: any, SBOL: any }){
    const [ load, setLoad ] = useState( false)


    useEffect(()=>{
        async function load(){
            setLoad( true)
            console.log('sberPay', item.order)
            const res = await SBOL( item.order )
            console.log('sberPay', res )
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


    useEffect(()=>{
        async function load(){
            setLoad( true )
            console.log(item.order)
            const res = await equairing( item.order )
            console.log( res )
            if(res.error){ 

                setPage( 4 )

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

function            HistoryIndices(props: { item, getIndices }){
    const [ info, setInfo ] = useState<any>([])

    const item = props.item
    
    async function Load(){

        const res = await props.getIndices( item.selected.counterId )  
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

// function            AlfaBank(props: { item, setPage }) {
//     const [load, setLoad] = useState(false)
//     const item = props.item

//     useEffect(() => {
//         async function load() {
//             setLoad(true)
//             console.log('GPB order:', item.order)
            
//             try {
//                 const res = await getData("GAZPROM", item.order)
//                 console.log('GPB response:', res)
                
//                 if (res.error) { 
//                     props.setPage(4) // Возвращаемся к странице оплаты
//                 } else {
//                     // Открываем форму оплаты Альфа-банка
//                     console.log( res.data )
//                     openUrl(res.data.formUrl)
//                 }
//             } catch (error) {
//                 console.error('GPB payment error:', error)
//                 props.setPage(4)
//             }
            
//             setLoad(false)
//         }
//         load()
//     }, [])

//     const elem = <>
//         <IonLoading isOpen={load} message={"Переход к оплате через Альфа-Банк..."}/>
//     </>
    
//     return elem
// }

// function            SBP(props: { item, setPage }) {
//     const [load, setLoad] = useState(false)
//     const item = props.item

//     useEffect(() => {
//         async function load() {
//             setLoad(true)
//             console.log('SBP order:', item.order)
            
//             try {
//                 const res = await api("GAZPROMSBP", item.order)
//                 console.log('SBP response:', res)
                
//                 if (res.error) { 
//                     props.setPage(4) // Возвращаемся к странице оплаты
//                 } else {
//                     // Открываем форму оплаты Альфа-банка
//                     console.log( res.data )
//                     openUrl(res.data.formUrl)
//                 }
//             } catch (error) {
//                 console.error('SBP payment error:', error)
//                 props.setPage(4)
//             }
            
//             setLoad(false)
//         }
//         load()
//     }, [])

//     const elem = <>
//         <IonLoading isOpen={load} message={"Переход к оплате через Альфа-Банк..."}/>
//     </>
    
//     return elem
// }
