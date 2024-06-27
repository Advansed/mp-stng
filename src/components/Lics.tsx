import React, { useEffect, useState } from 'react'
import { Store, getData, getLics } from './Store'
import './Lics.css'
import { IonButton, IonCard, IonContent, IonIcon, IonImg, IonInput, IonItem, IonLoading, IonPopover, IonText } from '@ionic/react'
import { chevronForwardOutline, documentTextOutline, ellipsisVerticalOutline, newspaperOutline, pencilOutline, trashBinOutline } from 'ionicons/icons'


export function Lics() {
    const [ info,       setInfo]        = useState<any>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ upd,        setUpd ]        = useState( 0 )
    const [ page,       setPage ]       = useState<any>( 0 ) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ message,    setMessage ]    = useState( "" )
    const [ load,       setLoad ]       = useState( false)
 
    useEffect(()=>{
        
        setInfo( Store.getState().lics)

        return ()=>{ 
            Store.unSubscribe( 21 )
            Store.unSubscribe( 22 )
        }
    },[page])

    async function Add( params ){
        const res = await getData("AddAccount", params )
        if(res.error){
            setMessage(res.message);
        } else {
            getLics({ token: Store.getState().login.token })
            setPage( 0 )
        }
    }   

    Store.subscribe({num : 21, type: "back", func: ()=>{

        if( page !== 0){
            setPage( 0 )
            getLics({ token: Store.getState().login.token })
        } else {
           Store.dispatch({type: "route", route: "back"}) 
        }

    } })

    Store.subscribe({num : 22, type: "lics", func: ()=>{
        console.log( "lics" )
        setInfo( Store.getState().lics )
        console.log( Store.getState().lics )
        setUpd( upd + 1)
    } })

    function Items(){
        let elem = <></>
        for(let i=0; i< info.length; i++){
            elem = <>
                { elem }
                <IonCard className='pb-1'>
                    <div className='flex fl-space mt-1 ml-1'>
                        <div className='cl-black'> <h4><b>{ "Лицевой счет №" + info[i].code }</b></h4></div>
                        <IonButton
                            fill    = "clear"
                            id      = { "trigger-" + i.toString() }
                        >
                            <IonIcon icon = { ellipsisVerticalOutline }  color="primary" slot='icon-only'/> 
                        </IonButton>
                        <IonPopover
                            trigger         = { "trigger-" + i.toString() }
                            triggerAction   = 'click'
                        >
                            <IonContent>
                                <div className='flex fl-space ml-2 t-underline mr-1 h-4'
                                    onClick={()=>{
                                        console.log(info[i].code)        
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
                                        async function load(){
                                            setLoad( true)
                                            const res = await  getData("DelAccount", {
                                                token: Store.getState().login.token,
                                                LC: info[i].code
                                            })
                                            if(!res.error){
                                                info.splice(i, 1);
                                                setUpd( upd + 1)    
                                            }
                                            setLoad(false)
                                        }
                                        load()
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
                        { info[i].name}
                    </div>    
                    <div className='ml-1 mr-1 t-underline pb-1 mt-1'>
                        { info[i].address}
                    </div>    
                    <div className='ml-1 mr-1 pb-1 mt-1 flex fl-space'>
                        <div>{ 
                                ( info[i].sum ) < 0 ? "Аванс за газ" : "Задолженность за газ" 
                            }
                        </div>
                        <div className='cl-prim fs-11'>
                            <b>
                            { 
                                 ( info[i].sum ) < 0 
                                     ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( -( info[i].sum ) )
                                     : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( ( info[i].sum ) )
                            }</b>
                        </div>                        
                    </div>    
                    <div className='ml-1 mr-1 pb-1 mt-1 flex fl-space'>
                        <div>{ 
                                ( info[i].sumto ) < 0 ? "Аванс за ТО" : "Задолженность за ТО" 
                            }
                        </div>
                        <div className='cl-prim fs-11'>
                            <b>
                            { 
                                 ( info[i].sumto ) < 0 
                                     ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( -( info[i].sumto ) )
                                     : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( ( info[i].sumto ) )
                            }</b>
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
                                    info[i].type = "Оплата за газ"
                                    setPage( info[i] )
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
                                    info[i].type = "Оплата за ТО"
                                    setPage( info[i] )
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
                                setPage( {
                                    type:       "Показания",
                                    token:      Store.getState().login.token,
                                    mode:       false,
                                    counters:   info[i].counters,
                                    code:       info[i].code,
                                    name:       info[i].name,
                                    address:    info[i].address,
                                })
                            }}
                        >
                            Внести показания
                        </IonButton>
                    </div>


                </IonCard>
            </>
        }
        return elem
    }

    function Page(){
        const elem = <>
            <Items />

            <IonCard>
                <div className='flex pl-1 pr-1 pt-1 mb-1'
                    onClick={()=>{  setPage( 1 )  }}
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
                    onClick={()=>{  setPage( 2 )  }}                
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

            <div className='mt-1'></div>

        </>
        return elem
    }

    function Page1(){
        const [ info ] = useState({
            token:      Store.getState().login.token,
            LC :        "",
            fio:        "",
        })
        const [ upd, setUpd] = useState( 0 )
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
                                    Add( info )
                                else setPage( 0 )
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

    function Page2(){
        const [ info,       setInfo]        = useState<any>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ ulus,       setUlus ]       = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ naspunkt,   setNaspunkt ]   = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ street,     setStreet ]     = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ house,      setHouse ]      = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ kv,         setKv ]         = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ lc,         setLc ]         = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ fio,        setFio ]        = useState("")

        useEffect(()=>{
            async function load(){
                const res = await getData("getSettlements", {
                    token : Store.getState().login.token,
                })
                setInfo( res.data)
            }
            load()
        },[])

        async function getStreets( e ){
            const res = await getData("getStreets", {
                token   : Store.getState().login.token,
                s_id    : e.s_id
            })
            console.log(res)
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
                                })
                            else setPage( 0 )
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

    function Payments(){
        const [ value, setValue ] = useState( page.sum > 0 ? page.sum : 0)

        const elem = <>
            <IonCard className='pb-1'>
                <div className='flex fl-space mt-1 ml-1'>
                    <div className='cl-black'> <h4><b>{ "Лицевой счет №" + page.code }</b></h4></div>
                </div>
                <div className='ml-2 mr-1'>
                    { page.name}
                </div>    
                <div className='ml-2 mr-1 pb-1 mt-1'>
                    { page.address}
                </div>    
                <div className='mt-1 ml-1 mr-1 t-underline'>
                    <b>{ "Задолженность" }</b>
                </div>
                {
                    page.debts.map((e)=>{
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
                                new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( page.sum  )
                            }
                        </b>
                    </div>
                </div>
            </IonCard>
            <IonCard className='pb-1'>
                <div className='ml-1 mt-1 pb-1 '>
                    <b>
                        {
                            page.sum >= 0
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
                    <div className='w-70'>
                        <IonButton
                            color = "tertiary"
                            expand='block'
                            mode = "ios"
                            onClick={()=>{
                                setMessage("")
                                setPage( {
                                    type:   "К оплате",
                                    token:  Store.getState().login.token,
                                    sum:    value,
                                    sumto:  0,
                                    LC:     page.code,
                                    email:  page.email,
                                    phone:  Store.getState().login.phone,
                                    ios:    false,
                                } )
                                setUpd(upd + 1)
                            }}
                        >   {
                                "Оплатить"
                            }
                        </IonButton>        
                    </div>
                    <IonButton
                        color = "tertiary"
                        expand='block'
                        mode = "ios"
                        fill = "clear"

                        onClick={()=>{
                            setMessage("")
                            setPage( {
                                type:   "SberPay",
                                token:  Store.getState().login.token,
                                sum:    value,
                                sumto:  0,
                                LC:     page.code,
                                email:  page.email,
                                phone:  Store.getState().login.phone,
                                ios:    false,
                            } )
                        }}
                    >   
                        <IonImg alt = "" src="assets/SberPay.png" className='h-3' />
                    </IonButton>               
                </div>

            </IonCard>
        </>
        
        return elem
    }

    function PaymentsTO(){
        const [ value, setValue ] = useState( page.sumto > 0 ? page.sumto : 0)

        const elem = <>
            <IonCard className='pb-1'>
                <div className='flex fl-space mt-1 ml-1'>
                    <div className='cl-black'> <h4><b>{ "Лицевой счет №" + page.code }</b></h4></div>
                </div>
                <div className='ml-2 mr-1'>
                    { page.name}
                </div>    
                <div className='ml-2 mr-1 pb-1 mt-1'>
                    { page.address}
                </div>    
                <div className='mt-1 ml-1 mr-1 t-underline'>
                    <b>{ "Задолженность" }</b>
                </div>
                {
                    page.debtsto.map((e)=>{
                        return <>
                            <div className='ml-2 mt-1 mr-1 flex fl-space'>
                                <div><b>{ e.label }</b></div>
                                <div className='cl-prim fs-11'>
                                    <b>
                                        { 
                                            new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( e.sum )
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
                                new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( page.sumto  )
                            }
                        </b>
                    </div>
                </div>
            </IonCard>
            <IonCard className='pb-1'>
                <div className='ml-1 mt-1 pb-1 '>
                    <b>
                        {
                            page.sumto >= 0
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
                    <div className='w-70'>
                        <IonButton
                            color = "tertiary"
                            expand='block'
                            mode = "ios"
                            onClick={()=>{
                                setMessage("")
                                setPage( {
                                    type:   "К оплате",
                                    token:  Store.getState().login.token,
                                    sum:    0,
                                    sumto:  value,
                                    LC:     page.code,
                                    email:  page.email,
                                    phone:  Store.getState().login.phone,
                                    ios:    false,
                                } )
                                setUpd(upd + 1)
                            }}
                        >   {
                                "Оплатить"
                            }
                        </IonButton>        
                    </div>
                    <IonButton
                        color = "tertiary"
                        expand='block'
                        mode = "ios"
                        fill = "clear"

                        onClick={()=>{
                            setMessage("")
                            setPage( {
                                type:   "SberPay",
                                token:  Store.getState().login.token,
                                sum:    0,
                                sumto:  value,
                                LC:     page.code,
                                email:  page.email,
                                phone:  Store.getState().login.phone,
                                ios:    false,
                            } )
                        }}
                    >   
                        <IonImg alt = "" src="assets/SberPay.png" className='h-3' />
                    </IonButton>               
                </div>

            </IonCard>
        </>
        
        return elem
    }

    function Equaring(){
        const [ load, setLoad ] = useState( false)
        const [ info, setInfo ] = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any

        useEffect(()=>{
            async function load(){
                setLoad( true)
                const res = await getData("SBOL", page )
                console.log(page)
                console.log(res)
                if(res.error){ 
                    setMessage( res.message)
                    setPage(0)
                } else {
                    if( page.type === "SberPay"){
                        window.open( res.data.externalParams.sbolDeepLink,  "_system" )
                    }
                    else setInfo( res.data )
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

    function Counter(props:{ info }){
        const [ mode, setMode ]         = useState( false )
        const [ avail, setAvail ]       = useState( 0 )
        const [ bord ]    = useState( Store.getState().login.borders )
        const [ upd1, setUpd1 ] = useState( 0 )

        function monthDiff(dateFrom, dateTo) {
            let months = dateTo.getMonth() - dateFrom.getMonth() + 
              (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
            
            if( dateFrom.getDate() > dateTo.getDate() ) months = months - 1

            return months
        }
           
        useEffect(()=>{

            console.log( "use")
            const date = new Date()
            let d     = date.getDate().toString(); if(d.length === 1) d =  "0" + d;
            let m     = (date.getMonth() + 1).toString(); if(m.length === 1) m =  "0" + m;
            const y   = date.getFullYear().toString()

            console.log(info)
            const pred = new Date( info.predPeriod.substring(6, 10)  + "-" + info.predPeriod.substring(3, 5) + "-" + info.predPeriod.substring(0, 2) )
            console.log(pred)
            console.log(date)

            if( pred.getFullYear() === date.getFullYear() && pred.getMonth() === date.getMonth() ) setAvail( 1 )     
            else if( monthDiff(pred, date) > 3 ) setAvail( 2 )
            else {
                if( bord.from < bord.to ){
                    if(date.getDate() < bord.from || date.getDate() > bord.to) setAvail(  3 )
                } else {
                    if(date.getDate() > bord.to || date.getDate() < bord.from ) setAvail(  3 )
                }
            }
        
            page.current = d + "." + m + "." + y
            
        },[])

        const info = props.info

        async function lload(){
            await getLics({ token: Store.getState().login.token })     
            info.predIndice = info.indice
            info.predPeriod = info.period
            info.indice = 0; info.period = ""
            console.log("lload")
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
                                    info.period = page.current
                                    if(info.indice >= info.predIndice && (info.indice - info.predIndice) < 3001 ) setMode(true);
                                    else setMode(false);

                                }}
                            />
                        </div>
                    </div>
                </>
            }
            {
                mode 
                    ? <>
                        <div className='mt-1'>
                            <IonButton
                                color = "tertiary"
                                expand='block'
                                mode = "ios"
                                onClick={()=>{
                                    async function load(){
                                        console.log( page )
                                        const res = await getData("setIndications", page )
                                        console.log(res)
                                        if(!res.error){
                                            lload()
                                        }
                                    }
                                    load()                                       
                                }}
                            >   
                                { "Отправить показания" }
                            </IonButton>        

                        </div>
                    </>
                    : <></>
                }

        </>

        return elem
    }

    function Indication(){
        const [ upd, setUpd ] =useState( 0 )
        let items = <></>
        for(let i = 0; i < page.counters.length; i++){

            items = <>
                { items }
                <Counter info  = { page.counters[i]} />
            </>
        }
        const elem = <>
            <IonCard className='pb-1'>
                <div className='flex fl-space mt-1 ml-1'>
                    <div className='cl-black'> <h4><b>{ "Лицевой счет №" + page.code }</b></h4></div>
                </div>
                <div className='ml-2 mr-1 cl-prim'>
                    { page.name}
                </div>    
                <div className='ml-2 mr-1 pb-1 mt-1 cl-prim'>
                    { page.address}
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

    function History(){
        const [ info, setInfo ] = useState<any>([])
        
        async function Load(){
            const res = await getData("GetPayments", { 
                token: Store.getState().login.token,
                LC: page.code 
            })  
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
                <div className='flex fl-space ml-2 mt-1 mr-2 cl-prim'>
                    <div>
                        { info[i].number + " от " + info[i].date }
                    </div>
                    <div>{ info[i].summ }</div>
                </div>
            </>
        }
    
        const elem = <>
          <IonCard className='pb-1'>
                <div className='flex fl-space mt-1 ml-1'>
                    <div className='cl-black'> <h4><b>{ "Лицевой счет №" + page.code }</b></h4></div>
                </div>
                <div className='ml-2 mr-1 cl-prim'>
                    { page.name}
                </div>    
                <div className='ml-2 mr-1 pb-1 mt-1 cl-prim'>
                    { page.address}
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

    const elem = <>
      <div className='w-100 h-100'>
        <IonLoading isOpen = { load } message={ "Подождите..." }/>
        <div className='ml-1 h-3'>
            <IonText>
                <h1 className="main-title ion-text-wrap ion-text-start">
                    { "Лицевые счета" }
                </h1>
            </IonText>
        </div>

        <div
            className='l-content'
        >
            {
                page === 0
                    ? <Page />
                : page === 1
                    ? <Page1 />
                : page === 2
                    ? <Page2 />
                : page !== undefined && page.type === "Оплата за газ"
                    ? <Payments/>
                : page !== undefined && page.type === "Оплата за ТО"
                    ? <PaymentsTO/>
                : page !== undefined && page.type === "К оплате"
                    ? <Equaring />
                : page !== undefined && page.type === "SberPay"
                    ? <Equaring />
                : page !== undefined && page.type === "Показания"
                    ? <Indication />
                : page !== undefined && page.type === "История"
                    ? <History />
                : <></>
            }
        </div>


      </div>
    </>
    return elem
}

