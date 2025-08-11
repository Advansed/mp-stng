import React, { IonButton, IonCard, IonIcon, IonInput, IonLoading, IonModal, IonText } from "@ionic/react"
import { addCircleOutline, arrowBackCircleOutline, buildOutline, calculatorOutline, callOutline, closeOutline, documentTextOutline, gitBranchOutline, gitMergeOutline, removeCircleOutline } from "ionicons/icons"
import { useEffect, useRef, useState } from "react"
import { AddressSuggestions, FioSuggestions } from "react-dadata"
import { Store, getData } from "./Store"
import "./Services.css"
import "./react-dadata.css"
import MaskedInput from "../mask/reactTextMask"
import { Files, Filess, PDFDoc } from "./Files"
//import Select from 'react-select';
import Select from "react-tailwindcss-select";
import SignatureCanvas from 'react-signature-canvas'   

const icons = {

    gitMergeOutline:        gitMergeOutline,
    buildOutline:           buildOutline,
    documentTextOutline:    documentTextOutline,
    callOutline:            callOutline,
    gitBranchOutline:       gitBranchOutline,

}

export function Services(){
    const [ info, setInfo ]             = useState<any>( Store.getState().services )
    const [ order, setOrder ]           = useState<any>()
    const [ page, setPage ]             = useState(0)
    const [ load, setLoad ]             = useState( false )
    const [ messages, setMessages ]     = useState<any>([])
    const [ upd, setUpd]                = useState( 0 )

    let elem = <></>

    Store.subscribe({num: 404, type: "back", func: ()=>{
        console.log("subscibe 21")
        if( page > 0 ) {
            setMessages([])
            if( page > 9) setPage( 0 )
            else setPage( page - 1 )
        }
        else Store.dispatch({ type: "route", route: "back"})
    }})

    Store.subscribe({num: 22, type: "services", func: ()=>{
        console.log("subscibe 22")
        setInfo( Store.getState().services )
        setUpd( upd + 1)
    }})

    useEffect(()=>{
            console.log("useeffect services")
            console.log( Store.getState().services  )
            setInfo( Store.getState().services )
            setUpd( upd + 1)
            
            return ()=>{
                console.log("useeffect services dismount")
                Store.unSubscribe( 404 )
                Store.unSubscribe( 22 )
            }
    
    },[])

    async function Save()   {
        setLoad(true)
        order.token = Store.getState().login.token
        console.log(order)
        const res = await getData("Services", order )
        console.log(res)
        order.result = res
        if(res.error) setPage(98)
        else setPage(99)
        setLoad(false)

    }

    function Check(){
        const jarr: any  = []
        for(const [ key ] of Object.entries(order)){
            if(key === "Документ") continue
            if(key === "Заявка") continue
            if(key === "Описание") continue
            if(key === "Страниц") continue
            if(order[key].Страница === page ) {
                switch( key ){
                    case "ФИО"          : if( order[key].Фамилия[0] === "" ) jarr.push("Заполните ФИО"); break;
                    case "МЧРГ"         : if( order[key].ВеличинаМЧРГ[0] === 0 ) jarr.push("Заполните МЧРГ"); break;
                    case "Файлы"        : order[key].Файлы.forEach(elem => { 
                        if(elem.Проверка && elem.Файлы.length === 0) jarr.push("Прикрепите файл: " + elem.Описание)
                    }); break;
                    case "Подпись"      : if( order.Подпись.Подпись.length === 0) jarr.push("Поставьте подпись"); break;
                    default     : { 
                        for(const [ req ] of Object.entries(order[ key ])){
                            if(req === "Страница") continue
                            if(req === "Описание") continue
                            if(order[key][req].length > 4)
                                if(order[key][req][4])
                                    if(order[key][req][0] === "" || order[key][req][0] === 0 || order[key][req][0] === undefined){
                                        jarr.push( "Заполните " + order[key][req][2] )
                                    }
                                
                        }                        
                    }                    
                }
            }
        }
        return jarr 
    }

    if(info !== undefined)
        for(let i = 0; i < info.length; i++) {
            elem = <>
                { elem }
                <IonCard className="pt-2 pb-2">
                    <div className="flex"
                        onClick={()=>{
                            setOrder( info[i].order )
                            setPage( page + 1)
                        }}
                    >
                        <IonIcon icon = { icons[info[i].icon] }  className="h-2 w-20" color="tertiary"/>
                        <IonText className="cl-prim fs-12 w-80"><b>{ info[i].text }</b> </IonText>
                    </div>
                </IonCard>
            </>
        }

    elem = <>
        { elem }
    </>

    elem = <>
        <IonLoading message={ "Подождите..." } isOpen = { load }/>
        {   
            page === 0 ? elem 
            : <>
                {/* <div className="cl-white ml-1"><h1><b>{ order?.Описание }</b></h1></div> */}
                
                <IonCard className="pb-1 s-card">
                    <Service  info = { order } page = { page }/>    
                    {
                        messages.map((e, ind )=>{
                            return <>
                                <div className="flex ml-2 mt-1">
                                    <IonIcon icon = { closeOutline } color="danger"/>
                                    <p className="ml-05 cl-red1" key = { ind }>{ e }  </p>
                                </div>
                            </>                                
                        })
                    }
                    <IonButton
                        className="ml-1 mr-1 mt-2"
                        mode="ios"
                        color="tertiary"
                        expand="block"
                        onClick={()=>{
                            const jarr =  Check()
                            if(jarr.length === 0){
                                setMessages([])
                                if( order.Страниц > page)
                                    setPage( page + 1 )
                                else 
                                if( page > 97 ) Store.dispatch({ type: "route", route: "apps" })
                                else Save()
                            }
                            else setMessages( jarr )
                                
                        }}
                    >
                    <div>
                    </div>
                    
                        {
                            order.Страниц > page 
                                ? "Далее" 
                            : page > 97 
                                ? 'Перейти в "Договора, заявки"'
                            : order.Просмотр !== undefined ? "Заключить договор" : "Отправить заявку"
                        }
                    </IonButton>
                </IonCard>
            </>
                
        }
    </>

    return elem

}

function Service(props: { info, page }){
    const [ info ] = useState( props.info  )
    const [ upd, setUpd] = useState( 0 )
    const [ load, setLoad] = useState( false)


    useEffect(()=>{
        for(const [ key ] of Object.entries(info)){
            if(key === "Заявка") continue
            if(key === "Описание") continue
            if(key === "Страниц") continue
            for(const [ req ] of Object.entries(info[ key ])){
                switch( req) {
                    case "Фамилия":                 info[key][req]      = Store.getState().profile?.surname; break;    
                    case "Имя":                     info[key][req]      = Store.getState().profile?.name; break;    
                    case "Отчество":                info[key][req]      = Store.getState().profile?.lastname; break;    
                    case "ПаспортСерия":            info[key][req][0]   = Store.getState().profile?.passport?.serial; break;    
                    case "ПаспортНомер":            info[key][req][0]   = Store.getState().profile?.passport?.number; break;    
                    case "ПаспортДатаВыдачи":       info[key][req][0]   = Store.getState().profile?.passport?.issuedDate; break;    
                    case "Доп6":                    info[key][req][0]   = Store.getState().profile?.passport?.codePodr; break;    
                    case "ПаспортКемВыдан":         info[key][req][0]   = Store.getState().profile?.passport?.issuedBy; break;    
                    case "Доп1":                    info[key][req][0]   = Store.getState().profile?.email; break;    
                    case "КонтактныйТелефон":       info[key][req][0]   = Store.getState().login?.phone; break;    
                }        
            }
        }
        setUpd( upd + 1)
        
        console.log( info )

        return ()=>{
            if( info.Просмотр !== undefined)
                info.Просмотр.Файл = ""
        }

    },[])

    useEffect(()=>{
        if( info.Просмотр !== undefined){
            if(info.Просмотр.Страница === props.page) 
                Preview();
        }        

        return ()=>{
            if( info.Просмотр !== undefined){
                if(info.Просмотр.Страница === props.page) {
                    info.Просмотр.Файл = ""
                }
            }

        }
    },[ props.page ])

    function Upd(){
        setUpd(upd + 1)
    }

    let elem = <></>

    async function Preview()   {
        setLoad(true)
        if( info.Просмотр.Файл === ""){
            info.token = Store.getState().login.token
            console.log("preview")
            console.log(info)
            const res = await getData("Preview", info )
            console.log(res)
            if(res.data.Файлы.length > 0 ){
                info.Просмотр.Файл = res.data.Файлы[0].Файлы[0].dataUrl;    
            }       
        }
        setLoad(false)
    }

    if( props.page === 98 ) 
        elem = <Fail />
    else
    if( props.page === 99)
        elem  = <Success info = { info } />
    else
    for(const [ key ] of Object.entries(info)){
        if(key === "Заявка") continue
        if(key === "Описание") continue
        if(key === "Страниц") continue
        if(info[key].Страница === props.page ) {
            if(key === "Просмотр") {
                elem = <>
                    {
                        info.Просмотр.Файл !== ""
                            ? <PDFDoc url = { info.Просмотр.Файл } name  = { "ДоговорНаТО" } title = { "Договор на тех/обслуживание" }/>                
                            : <></>
                    }
                    
                </>
            } else   
            switch( key ){
                case "ФИО"          : elem = <> { elem } <FIO       info = { info.ФИО }/> </>; break;
                case "МЧРГ"         : elem = <> { elem } <MCHRG     info = { info.МЧРГ }/> </>; break;
                case "Файлы"        : elem = <> { elem } <Filess    info = { info.Файлы.Файлы }/> </>; break;
                case "Помещения"    : elem = <> { elem } <Rooms     info = { info.Помещения }/> </>; break;
                case "Оборудования" : elem = <> { elem } <Equips    info = { info }/> </>; break;
                case "ПриборыУчета" : elem = <> { elem } <Meters    info = { info.ПриборыУчета }/> </>; break;
                case "Подпись"      : elem = <> { elem } <Sign      info = { info.Подпись }/> </>; break;
                default     : {
                    {
                        elem = <> 
                            { elem } 
                            <div className='ml-1 mr-1 mt-1 t-underline flex fl-space pb-05'> 
                                <div><b> { info[key].Описание } </b></div>
                            </div>
                        </>
                        for(const [ req ] of Object.entries(info[ key ])){
                            if(req === "Страница") continue
                            if(req === "Описание") continue
                            switch( info[key][req][1]){
                                case "textarea" : elem = <> { elem } <TextArea  info = {{ info: info[key], title: info[key][req][2], name: req }}  /> </>; break;
                                case "text"     : elem = <> { elem } <Text      info = {{ info: info[key], title: info[key][req][2], name: req }}  /> </>; break;
                                case "date"     : elem = <> { elem } <Date      info = {{ info: info[key], title: info[key][req][2], name: req }}  /> </>; break;
                                case "box"      : elem = <> { elem } <Box       info = {{ info: info[key], title: info[key][req][2], name: req, choice: Array.isArray(info[key][req][3]) ? info[key][req][3] : [] }}  /> </>; break;
                                case "lics"     : elem = <> { elem } <Box       info = {{ info: info[key], title: info[key][req][2], name: req, choice: Store.getState().profile.lics === undefined ? [] : Store.getState().profile.lics }}  /> </>; break;
                                case "address"  : elem = <> { elem } <Address   info = {{ info: info[key], title: info[key][req][2], name: req }} setUpd = { Upd } /> </>; break;
                                default         : elem = <> { elem } </>
                            }
                        }                        
                    }
                }
            }
                    
        }
    }

    return <>
        <IonLoading isOpen = { load } message={"Подождите..."}/>
        { elem }
    </>
}

function Text( props: { info }){
    
    const info =  props.info.info

    const elem = <>
        <div className='ml-2 mt-1 mr-1'>
            <div className="flex fl-space mt-1">
                <div  className="w-40"> <b>{ props.info.title }</b> </div>
                <div className=' ml-1 s-input a-right pr-1 w-60'>
                    <IonInput
                        class='s-input-1'
                        value={ info[ props.info.name ] === undefined ? undefined : info[ props.info.name ][0] }
                        placeholder={ props.info.title }
                        onIonInput={(e: any) => {
                            info[ props.info.name ][0] = e.target.value  
                            if( props.info.onInput !== undefined ) 
                                props.info.onInput( e.target.value ) 
                        }}
                    />
                </div>
            </div>
        </div>
    </>
    return elem
}

function TextArea( props: { info }){
    const info = props.info.info

    const elem = <>
        <div className='ml-2 mt-1 mr-1'>
            <div className="mt-1">
                <div  className=""> <b>{ props.info.title }</b> </div>
                <div className=' ml-1 s-input a-right pr-1 w-100'>
                    <IonInput
                        class='s-input-1'
                        value={ info[ props.info.name ][0] }
                        placeholder={ props.info.title }
                        onIonInput={(e: any) => {
                            info[ props.info.name ][0] = e.target.value  
                            if( props.info.onInput !== undefined ) 
                                props.info.onInput( e.target.value ) 
                        }}
                    />
                </div>
            </div>
        </div>
    </>
    return elem
}

function Date( props: { info }) {
    const info = props.info.info
    const elem = <>
        <div className='ml-2 mt-1 mr-1'>
            <div className="flex fl-space mt-1">
                <div className="w-40"> <b>{ props.info.title }</b> </div>
                <div className=' ml-1 s-input a-right pr-1 w-60'>

                    <IonInput 
                        type = 'date'
                        mode = 'ios'
                        value={ info[ props.info.name ][0]  }
                        onInput={(e: any) => {
                            
                            info[ props.info.name ][0] = (e.target.value as string).substring(0, 10)
                            
                        }}
                    />
                </div>
            </div>
        </div>

    </>
    return elem
}

export function Box(props: { info }) {
    
    const info = props.info.info

    const [ value, setValue ] = useState( info[ props.info.name ][0] === "" ? { value: "Выберите..", label: "Выберите.." } : { value: info[ props.info.name ][0], label: info[ props.info.name ][0]} )
    
    const options: any = []
    props.info.choice.forEach(elem => {
        options.push(
            { value: elem, label: elem }
        )
    });

    const handleChange = value => {
        setValue(value);
        info[ props.info.name ][0] = value.value 
        if( props.info.onChange !== undefined ) props.info.onChange( value )
    };
    let elem = <></>

    elem = <>
        <div className='ml-2 mt-1 mr-1'>
            <div className="mt-1">
                <div  className="w-90"> <b>{ props.info.title }</b> </div>
                <div className=' ml-1 s-input pl-1 pr-1 w-60'>
                    <Select options={ options } value={ value } primaryColor="red" onChange={ handleChange } 
                         classNames={{
                            listItem: () => (
                                `sbl-item`
                            )
                        }}
                    />
                </div>
            </div>
        </div>

    </>
    return elem
}

function Address( props: { info, setUpd }){
    const info = props.info.info
    const [ value ] = useState<any>(
        { value: info[ props.info.name ][0] }
    )
    const [ modal, setModal ] = useState( false )

    function ModalForm(){
        const [ address ] = useState(
            {
                area:   [],
                city:   "",
                settl:  "",  
                street: "",
                house:  "",
                flat:   "",
            }
        )

        const elem = <>
            <div>
                <Text info = {{ info: address, title: "Улус",               name: "area"}} />
                <Text info = {{ info: address, title: "Город",              name: "city"}} />
                <Text info = {{ info: address, title: "Нас. пункт",         name: "settl"}} />
                <Text info = {{ info: address, title: "Улица",              name: "street"}} />
                <Text info = {{ info: address, title: "Дом",                name: "house"}} />
                <Text info = {{ info: address, title: "Квартира",           name: "flat"}} />
            </div>
        </>

        return elem
    }
    console.log("adddresss")
    async function load( arg){
        const res = await getData( arg[5], {
            token:  Store.getState().login.token,
            address: arg[0],
        })
        info[ arg[5] ] = res.data
        props.setUpd()
    }

    const elem = <>
        <div className='ml-2 mt-1 mr-1'>
            <div className=""> <b>{ props.info.title }</b>  </div>
            <div className="flex">
                <div className=" ml-1 cl-prim mt-05 w-100"> 
                    <AddressSuggestions token="50bfb3453a528d091723900fdae5ca5a30369832" 
                        value={ value } 
                        filterLocations={[{ region: "Саха /Якутия/" }]}
                        onChange={(e)=>{
                            console.log( e )
                            const hs : any = e?.data;
                            info[ props.info.name ][0] = ""
                            if( 
                                     hs?.fias_level === "9" 
                                || (    
                                        hs?.fias_level === "8" 
                                        && (hs?.house_flat_count === "0" || hs?.house_flat_count === null )
                                    ) 
                                || (    
                                        hs?.fias_level === "7" 
                                        && hs?.house !== null
                                    ) 
                            
                            ) {
                                info[ props.info.name ][0] = "" 
                                    + (e?.data.area_with_type                === null ? "" : e?.data.area_with_type)
                                    + ", " + (e?.data.city_with_type         === null ? "" : e?.data.city_with_type)
                                    + ", " + (e?.data.settlement_with_type   === null ? "" : e?.data.settlement_with_type)
                                    + ", " + (e?.data.street_with_type       === null ? "" : e?.data.street_with_type)
                                    + ", " + (e?.data.house                  === null ? "" : e?.data.house) + (e?.data.block === null ? "" : " " + e?.data.block_type + " " + e?.data.block )
                                    + ", " + (e?.data.flat                   === null ? "" : e?.data.flat)
                                    + ", " + (e?.data.house_fias_id          === null ? "" : e?.data.house_fias_id)
                                
                                if( info[ props.info.name ][5] !== undefined ) {
                                    load( info[ props.info.name ] )
                                }    
                            }

                        }} 
                    />
                </div>
            </div>
        </div>
        <IonModal
            isOpen = { modal }
            onDidDismiss={ ()=> setModal( false )}
        >
            <ModalForm />
        </IonModal>
    </>
    return elem
}

function MCHRG( props: { info}){
    const [ info ] = useState( props.info)
    const [ modal, setModal ] = useState<any>()
    const [ upd1, setUpd1 ]  = useState(0)

    function Counted(){

        const qkof = {
            100: "0.839", 200: "0.722", 300: "0.662", 400: "0.622", 500: "0.593", 600: "0.57", 700: "0.552", 800: "0.536", 900: "0.523",
            1000: "0.511", 1100: "0.5", 1200: "0.491", 1300: "0.483", 1400: "0.475", 1500: "0.468", 1600: "0.462", 1700: "0.456", 1800: "0.45",
            1900: "0.445", 2000: "0.44", 2100: "0.436", 2200: "0.431", 2300: "0.427", 2400: "0.423", 2500: "0.42", 2600: "0.416", 2700: "0.413", 
            2800: "0.41", 2900: "0.407", 3000: "0.404", 3100: "0.4", 3200: "0.398", 3300: "0.395", 3400: "0.393", 3500: "0.39", 3600: "0.388",
        };

        const V = modal?.Высота *  modal?.Площадь;
        const Vok = Math.ceil(V / 100) * 100;
          
        const Qtab = parseFloat(qkof[Vok]);
        const traz = 20 - -54;
        const Q = (Qtab * V * traz * 1.3) / 860;
        const Qhd = (Q * 860 * 1.1) / 8500;
        modal.МЧРГ = parseFloat((Qhd + 1.2).toFixed(2));
        setUpd1( upd1 + 1)

    }

    const elem = <>
        <div className=" ml-1 mr-1 t-underline mt-1"> <b>Планируемая величина максимального часового расхода газа</b> </div>
        <div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> МЧРГ </div>
                <div className="s-input a-right flex">  
                    <IonInput
                        class='s-input-1 mr-1'
                        value={ info?.ВеличинаМЧРГ }
                        placeholder="Величина МЧРГ"
                        onIonInput={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            info.ВеличинаМЧРГ = e.target.value   
                            setUpd1(upd1 + 1) 
                        }}
                    />
                    <IonButton
                        onClick={()=> setModal({
                            Площадь:        0,
                            Высота:         0,
                            Плита:          0,
                            МЧРГ:           0,
                        })}
                    >
                        <IonIcon icon = { calculatorOutline } slot = "icon-only"/>
                    </IonButton>
                </div>
            </div>
        </div>
            {
                info?.ВеличинаМЧРГ >= 7
                    ? <Files info = { info?.Файлы } name = "ПланМЧРГ" check = { true } title = "Расчет максимального часового расхода газа"/>
                    : <></>
            }
            <IonModal
                isOpen= { modal !== undefined }
                onDidDismiss={ ()=>setModal( undefined )}
            >   
                <div>
                    <div className=" ml-1 mr-1 t-underline mt-3"> <b>Суммарная площадь всех помещений</b> </div>
                    <div className='flex fl-space ml-2 mt-1 mr-1'>
                        <div className="w-50"> Площадь (м2)</div>
                        <div className="s-input a-right">  
                            <IonInput
                                class='s-input-1 mr-1'
                                value={ modal?.Площадь }
                                placeholder="Площадь"
                                onIonInput={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                    modal.Площадь = (e.target.value as number)
                                    Counted()
                                    
                                }}
                            />
                        </div>
                    </div>
                    <div className=" ml-1 mr-1 t-underline mt-3"> <b>Высота здания без кровли</b> </div>
                    <div className='flex fl-space ml-2 mt-1 mr-1'>
                        <div className="w-50"> Высота (м) </div>
                        <div className="s-input a-right flex">  
                            <IonInput
                                class='s-input-1 mr-1'
                                value={ modal?.Высота }
                                placeholder="Высота"
                                onIonInput={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                    modal.Высота = (e.target.value as number)
                                    Counted()
                                }}
                            />
                        </div>
                    </div>
                    <div className=" ml-1 mr-1 t-underline mt-3"> <b>Расчетный МЧРГ</b> </div>
                    <div className='flex ml-2 mt-1 mr-1'>
                        <div className="w-50"> МЧРГ: </div>
                        <div className="">  
                            <IonText>{ isNaN(modal?.МЧРГ) ? "0.00" : modal?.МЧРГ }</IonText>
                        </div>
                    </div>
                    <div className="ml-1 mr-1 mt-1">
                        <IonButton
                            color = "tertiary"
                            expand='block'
                            mode = "ios"
                            onClick={()=>{
                                info.ВеличинаМЧРГ = modal.МЧРГ
                                setModal(undefined)
                            }}
                        >   {
                                "Установить значение"
                            }
                        </IonButton>

                    </div>
                </div>
                            
            </IonModal>
        </>
        return elem
}

function FIO(props: { info }) {
    const [ info, setInfo ] = useState<any>( props.info )
    const [ edit, setEdit ] = useState( false )

    const elem = <>


        <div className='ml-1 mr-1 mt-1 t-underline flex fl-space pb-05'> 
            <div><b>ФИО</b></div>
        </div>

        <div className={ edit ? "ml-1 mr-1 mt-1 cl-blue" : "hidden"}>
            <FioSuggestions  token="50bfb3453a528d091723900fdae5ca5a30369832"
                value={{ 
                    value: info?.Фамилия + " " + info?.Имя + " " + info?.Отчество, 
                    unrestricted_value: info?.Фамилия + " " + info?.Имя + " " + info?.Отчество,
                    data: {
                        surname:      info?.Фамилия,
                        name:         info?.Имя,
                        patronymic:   info?.Отчество,
                        gender:       "MALE",
                        source:       null,
                        qc:           "0"
                    }
                }}
                onChange={(e)=>{
                    info.Фамилия   = e?.data.surname;  
                    info.Имя       = e?.data.name;  
                    info.Отчество  = e?.data.patronymic;  
                    setInfo(info )
                    setEdit(false)
                }}/>
        </div>

        <div  onClick={()=>{ setEdit(!edit) }}  className="s-point">
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> <b>Фамилия </b></div>
                <div> { info?.Фамилия }</div>
            </div>
                
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> <b>Имя</b>  </div>
                <div> { info?.Имя }</div>
            </div>

            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> <b>Отчество</b> </div>
                <div> { info?.Отчество }</div>
            </div>
        </div>
   </>    

    return elem
}

function Rooms(props: { info }){
    const info = props.info.Массив
    const [ value, setValue ] = useState({ value: "Тип", label: "Тип помещения"})
    const [ vol, setVol ] = useState<number>(  )
    const [ squ, setSqu ] = useState<number>(  )
    const [ upd, setUpd ] = useState( 0 )
    let elem = <></>
    elem = <>
        <div className=" ml-1 mr-1 t-underline mt-1"> <b>Газифицируемые помещения</b> </div>
    </>

    const options = [
        { value: "Квартира",    label: "Квартира"},
        { value: "Частный дом", label: "Частный дом"},
        { value: "Дача",        label: "Дача"},
        { value: "Гараж",       label: "Гараж"},
        { value: "Котельная",   label: "Котельная"},
        { value: "Склад",       label: "Склад"},
        { value: "Баня",        label: "Баня"},
        { value: "Теплица",     label: "Теплица"},
        { value: "Иное",        label: "Иное"},
    ]

    const handleChange2 = (e)=>{
        setValue( e )
    }

    for( let i = 0;i < info.length;i++){
        elem = <>
            { elem }
            <div className="flex sl-space ml-2 mt-1 mr-1">
                <div className="w-50"><b>{ info[i]?.ТипПомещения }</b></div>
                <div className="w-20 a-right"><b>{ info[i]?.Площадь?.toFixed(2) + " м2" }</b></div>
                <div className="w-20 a-right"><b>{ info[i]?.Объем?.toFixed(2)  + " м3" }</b></div>
                <div>
                    <IonIcon icon = { removeCircleOutline } className="ml-1  w-2 h-2"
                        onClick={()=>{
                        info.splice(i, 1)
                        setUpd( upd + 1)
                        }}
                    />
                </div>
            </div>
        </>
    }

    elem = <>
        { elem }
        <div className="flex fl-space mt-1 ml-1 mr-1">
            <div className="w-90">
                <div className=' ml-1 s-input pl-1 pr-1 w-60'>
                    <Select options={ options } value={ value } primaryColor="red" onChange={ handleChange2 } 
                        classNames={{
                            listItem: () => (
                                `sbl-item`
                            )
                        }}
                    />
                </div>
                <div className="flex mt-1">
                    <div className='ml-1 s-input a-right pr-1'>
                        <IonInput
                            class='s-input-1'
                            value={ squ }
                            placeholder={ "Площадь м2" }
                            type= "number"
                            onIonInput={(e: any) => {
                                setSqu( parseFloat( e.detail.value ) );
                            }}
                        />
                    </div>
                    <div className='ml-1 s-input a-right pr-1'>
                        <IonInput
                            class='s-input-1'
                            value={ vol }
                            placeholder={ "Высота м3" }
                            onIonInput={(e: any) => {
                                setVol( parseFloat(e.detail.value) )
                            }}
                        />
                    </div>
                </div>
            </div>
            <IonIcon icon = { addCircleOutline } className="ml-1  w-2 h-2"
                onClick={()=>{
                  info.push({ ТипПомещения: value.value, Объем: vol,Площадь: squ} )
                  setValue( { value: "Тип", label: "Тип помещения"} );setSqu( undefined ); setVol( undefined );
                }}
            />
        </div>
    </>

    return elem
}

function Equips(props: { info }){
    const info  = props.info.Оборудования.Массив
    const [ value, setValue ]       = useState({ value: "Тип", label: "Оборудование"})
    const [ options, setOptions ]   = useState<any>([])
    const [ tip, setTip ]           = useState<string>(  )
    const [ amount, setAmount]      = useState<number>(  )
    const [ upd, setUpd ]           = useState<number>( 0 )

    useEffect(()=>{
        async function load(){
            const res = await getData("G_Equips", { 
                token:  Store.getState().login.token,
                tip:    props.info.ОбъектГазификации.Строение[ 0 ] 
            })
            if(!res.error) setOptions(res.data)
        }

        load()
    },[])

    let elem = <></>
    elem = <>
        <div className=" ml-1 mr-1 t-underline mt-1"> <b>Имеющееся оборудование</b> </div>
    </>

    // const options = [
    //     { value: "Плита",           label: "Плита" },
    //     { value: "Котел",           label: "Котел" },
    //     { value: "Конвектор",       label: "Конвектор" },
    //     { value: "Водонагреватель", label: "Водонагреватель" },
    //     { value: "Другое",          label: "Другое" },
    // ]

    const handleChange = (e)=>{
        setValue( e )
    }

    for( let i = 0;i < info.length;i++){
        elem = <>
            { elem }
            <div className="flex fl-space ml-2 mt-1 mr-1">
                <div className="w-90">
                    <div><b>{ info[i]?.Оборудование }</b></div>
                    <div className="flex fl-space">
                        <div className="w-20"><b>{ info[i]?.Тип }</b></div>
                        <div className="w-20 a-right"><b>{ info[i]?.Количество + " шт" }</b></div>
                    </div>
                    
                </div>
                <div>
                    <IonIcon icon = { removeCircleOutline } className="ml-1  w-2 h-2"
                        onClick={()=>{
                            info.splice(i, 1)
                            setUpd( upd + 1)
                        }}
                    />
                </div>
            </div>
        </>
    }

    elem = <>
        { elem }
        <div className="flex mt-1 ml-1 mr-1">
            <div className="w-90">
                <div className=' ml-1 s-input-2 pl-1 pr-1'>
                    <Select options={ options } value={ value } primaryColor="red" onChange={ handleChange } 
                        classNames={{
                            listItem: ( ) => (
                                `sbl-item`
                            )
                        }}
                    />
                </div>
                <div className="flex mt-1">
                <div className='ml-1 pl-1 s-input-2 pr-1 w-70'>
                        <IonInput
                            class='s-input-1'
                            value={ tip }
                            placeholder={ "Марка" }
                            onIonInput={(e: any) => {
                                setTip( e.detail.value )
                            }}
                        />
                    </div>
                    <div className='ml-1 s-input-2 a-right pr-1 w-30'>
                        <IonInput
                            class='s-input-1'
                            value={ amount }
                            placeholder={ "Колво шт" }
                            onIonInput={(e: any) => {
                                setAmount( parseInt(e.detail.value) )
                            }}
                        />
                    </div>
                </div>
            </div>
            <IonIcon icon = { addCircleOutline } className="ml-1  w-2 h-2"
                onClick={()=>{
                  info.push( { Оборудование: value.value, Тип: tip, Количество: amount} )  
                  setValue( { value: "Тип", label: "Оборудование"} );setTip( undefined ); setAmount( undefined );
                }}
            />
        </div>
    </>

    return elem
}

function Meters(props: { info }){
    const info  = props.info.Массив
    const [ value, setValue ]   = useState<any>( new Object() )
    const [ upd, setUpd ]       = useState( 0 )

    let elem = <></>
    elem = <>
        <div className=" ml-1 mr-1 t-underline mt-1"> <b>Имеющееся оборудование</b> </div>
    </>

    for( let i = 0;i < info.length;i++){
        elem = <>
            { elem }
            <div className="flex sl-space ml-2 mt-1 mr-1">
                <div className="w-40"><b>{ info[i]?.Марка + ":"+ info[i].Номер }</b></div>
                <div className="w-60 a-right"><b>{ info[i]?.Пломба + ", "  + info[i]?.Поверка }</b></div>
                <div>
                    <IonIcon icon = { removeCircleOutline } className="ml-1  w-2 h-2"
                        onClick={()=>{
                            info.splice(i, 1)
                            setUpd( upd + 1)
                        }}
                    />
                </div>
            </div>
        </>
    }

    function Date (props:{ info, name, title }){
        const info = props.info;
        const [ value, setValue ] = useState<any>()

        const elem = <>
            <MaskedInput
                className='m-input a-right'
                mask={[ /[1-9]/, /\d/, '.', /\d/, /\d/,'.', /\d/, /\d/, /\d/, /\d/]}
                value={ value }
                placeholder={ props.title}
                onInput={(e: any) => {
                            
                    info[ props.name ] = (e.target.value as string).substring(0, 10)
                    setValue ( (e.target.value as string).substring(0, 10) )
                                
                }}
            />
        </>

        return elem
    }

    elem = <>
        { elem }
        <div className="flex mt-1 ml-1 mr-1">
            <div className="w-90">
                <div className="flex mt-1">
                    <div className=' ml-1 s-input pl-1 pr-1 w-60'>
                        <IonInput
                            class='s-input-1'
                            value={ value.Марка }
                            placeholder={ "Марка, тип ПУ" }
                            type= "text"
                            onIonInput={(e: any) => {
                                value.Марка =  e.detail.value 
                            }}
                        />
                    </div>
                    <div className='ml-1 s-input a-right pr-1'>
                        <IonInput
                            class='s-input-1'
                            value={ value.Номер }
                            placeholder={ "Зав. номер ПУ" }
                            type= "text"
                            onIonInput={(e: any) => {
                                value.Номер = e.detail.value
                            }}
                        />
                    </div>
                </div>
                <div className="flex mt-1">
                    <div className='ml-1 s-input a-right pr-1 cl-prim'>
                        <Date info = { value } name = "Пломба" title = "Дата пломб. ПУ" />
                    </div>
                    <div className='ml-1 s-input a-right pr-1'>
                        <Date info = { value } name = "Поверка" title = "Срок очер. поверки" />
                    </div>
                </div>
            </div>
            <IonIcon icon = { addCircleOutline } className="ml-1  w-2 h-2"
                onClick={()=>{
                  info.push( value )  
                  setValue( new Object );
                  setUpd( upd + 1 )
                }}
            />
        </div>
    </>

    return elem
}

function Sign(props: { info }) {
    const [ sig, setSig ] = useState<any>()

    const elem = <>
        <div>
            <div className="ml-1 mt-1 flex fl-space">
                <div className="fs-14">Поставьте подпись</div>
                <div>
                    <IonIcon icon = { arrowBackCircleOutline } className="w-3 h-3 mr-1"
                        onClick={()=>{
                            sig.clear()
                        }}
                    />
                </div>
            </div>
            <SignatureCanvas 
                penColor='blue' 
                canvasProps={ {width: 500, height: 200, className: 'sigCanvas'} } 
                ref = {(ref)=>{ setSig(ref) }}
                onEnd = {()=>{
                    props.info.Подпись = [ { dataUrl: sig.toDataURL(), format: "png" } ]
                }}
            />
        </div>               

    </>

    return elem
}

function Success( props: { info }){
    const elem = <>
        {
            props.info.Просмотр !== undefined 
                ? <>
                    <div>
                        <div className="ml-1 mt-1 flex fl-space">
                            <div className="fs-14">Договор заключен!</div>
                        </div>
                        <div className="ml-2 mr-2">
                            <p>
                                Спасибо, теперь у Вас есть Договор о техническом обслуживании ВКГО. Он в течение нескольких минут появится в разделе  <span onClick={()=>{ Store.dispatch({type: "route", route: "apps"})}}><b> #Договора, Заявки#</b></span>.
                            </p>
                        </div>
                    </div>               
                </> 
                : <>
                    <div>
                        <div className="ml-1 mt-1 flex fl-space">
                            <div className="fs-14">Ваша заявка принята!</div>
                        </div>
                        <div className="ml-2 mr-2">
                            <p>
                                Спасибо, Ваша заявка принята в обработку. В течение нескольких минут ваша заявка появится в разделе  <span onClick={()=>{ Store.dispatch({type: "route", route: "apps"})}}><b> #Договора, Заявки#</b></span>.
                            </p>
                        </div>
                    </div>               
                </>
        }
    </>

    return elem
}

function Fail(){
    const elem = <>
        <div>
            <div className="ml-1 mt-1 flex fl-space">
                <div className="fs-14">Ошибка при подачи заявки!</div>
            </div>
            <div className="ml-2 mr-2">
                <p>
                    Что то пошло не так...
                </p>
                <p>
                    Попробуйте подать заявку еще раз
                </p>
            </div>
        </div>               
    </>

    return elem
}