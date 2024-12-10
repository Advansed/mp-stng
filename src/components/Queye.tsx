import { IonButton, IonCard, IonModal, IonSelect, IonSelectOption, IonText } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { Store, getData } from "./Store";
import MaskedInput from "../mask/reactTextMask";
import Select from "react-tailwindcss-select";

export function Queye1(){
    const [ page, setPage ] = useState( 0 )
    const [ note, setNote ] = useState<any>(  ) // eslint-disable-line @typescript-eslint/no-explicit-any

    useEffect(()=>{
        return ()=>{
            Store.unSubscribe( 61 )
        }
    },[])
   
    Store.subscribe({num : 61, type: "back", func: ()=>{
        Store.dispatch({type: "route", route: "back"})
    } })

    function GazObject(){
        const [ info,   setInfo ]   = useState<any>( new Object())  // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ datas,  setDatas ]  = useState<any>([])             // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ times,  setTimes ]  = useState<any>([])             // eslint-disable-line @typescript-eslint/no-explicit-any
        const [ upd,    setUpd ]    = useState( 0 )
    
        useEffect(()=>{
            info.token  = Store.getState().login.token
            info.fio    = "mobile"
            info.phone  = Store.getState().login.phone
            info.email  = Store.getState().profile.email
            setUpd( upd + 1 )
        },[])
    
            const elem = <>
            <div>
                <p className="ml-2 cl-white">
                    С помощью данного сервиса физическим и юридическим лицам можно
                    предварительно записаться на прием в Службу «Единого окна» по адресу
                    г.Якутск, ул. Петра Алексеева, 64.
                </p>
                <p className="ml-2 cl-white">
                    На ваш номер телефона будет отправлен СМС с указанием номера брони,
                    а также даты и времени записи.
                </p>
                <p className="ml-2 cl-white">
                    Прием документов производится только при полном пакете документов.
                </p>
                <p className="ml-2 cl-white">
                    <b className="cl-red"> Внимание! </b>
                    Согласно п. 9 ПП РФ №549, при подаче заявления на заключение
                    договора на поставку газа, необходимо предоставить договор на
                    техническое обслуживание со специализированной организацией.
                </p>
            </div>
            <IonCard className="pb-1">
                <div className=" ml-1 mr-1 t-underline mt-1"> <b>Данные заявителя</b> </div>
                <div>
                    <div className='flex fl-space ml-2 mt-1 mr-1'>
                        <div> Телефон </div>
                        <div className="s-input">  
                            <MaskedInput
                                mask={[ /[1-9]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/]}
                                className="mr-1 m-input a-right cl-prim"
                                id='1'
                                value={ info?.phone }
                                placeholder = "_(___)___-__-__"
                                type='text'
                                onChange={(e) => {
                                    info.phone = e.target.value as string;
                                        setInfo( info )
                                }}
                            />
                        </div>
                    </div>
                    <div className='ml-2 mt-1 mr-1'>
                        <div> Предварительная запись </div>
                        <div className="s-input a-right ml-1 mt-05">  
                            <IonSelect placeholder="Выберите объект"  className='s-input-1 w-100'
                                value       = { info?.operation }
                                interface   = "popover"
                                mode        = "ios"
                                justify     = "end"
                                onIonChange = {(e)=>{

                                    info.operation  = e.detail.value
                                    info.date       = "-"
                                    info.slot       = "-"
                                    setInfo( info )
                                    
                                    async function load(){
                                        const res = await getData("elGetDatas", {
                                            operation: info.operation
                                        })
                                        setDatas( res.data )

                                    }

                                   load()

                                }}
                            >
                                <IonSelectOption value={ "12" } > { "Прием документов" } </IonSelectOption>
                                <IonSelectOption value={ "14" } > { "Заключение договора на поставку газа (квартира)" } </IonSelectOption>
                                <IonSelectOption value={ "16" } > { "Социальная газификация" } </IonSelectOption>
                            </IonSelect>
                        </div>
                    </div>
                    <div className='flex fl-space ml-2 mt-1 mr-1'>
                        <div> Дата </div>
                        <div className="s-input a-right ml-1 mt-05">  
                            <IonSelect placeholder="Выберите дату"  className='s-input-1 w-100'
                                value       = { info?.date }
                                interface   = "popover"
                                mode        = "ios"
                                justify     = "end"
                                onIonChange = {(e)=>{
                                    info.date = e.detail.value
                                    setInfo(info);

                                    async function load(){
                                        const res = await getData("elGetTimes", {
                                            operation:  info.operation,
                                            date:       info.date,
                                        })
                                        let jarr: any = []  // eslint-disable-line @typescript-eslint/no-explicit-any
                                        res.data.forEach(elem => {
                                            if(elem.is_available) jarr = [...jarr, elem.time ]
                                        });  
                                        setTimes( jarr )

                                    }

                                    load()

                                }}
                            >
                                <IonSelectOption value={ "-" } > { "-" } </IonSelectOption>
                                {   
                                    datas.map((e, i)=>{
                                        return <IonSelectOption value={ e }  key = { i } > <span className="ml-1 mr-1">{ e }</span> </IonSelectOption>   
                                    })

                                }
                            </IonSelect>
                        </div>
                    </div>
                    <div className='flex fl-space ml-2 mt-1 mr-1'>
                        <div> Время </div>
                        <div className="s-input a-right ml-1 mt-05">  
                            <IonSelect placeholder="Выберите дату"  className='s-input-1 w-100'
                                value       = { info?.slot }
                                interface   = "popover"
                                mode        = "ios"
                                justify     = "end"
                                onIonChange = {(e)=>{
                                    info.slot = e.detail.value
                                    setInfo(info);
                                }}
                            >
                                <IonSelectOption value={ "-" } > { "-" } </IonSelectOption>
                                {   
                                    times.map((e, i)=>{
                                        return <IonSelectOption value={ e }  key = { i } > <span className="ml-1 mr-1">{ e }</span> </IonSelectOption>   
                                    })

                                }
                            </IonSelect>
                        </div>
                    </div>
                    <div className=" ml-1 mr-1 mt-1">
                        <IonButton
                            expand="block"
                            mode = "ios"
                            color = "tertiary"
                            onClick={()=>{
                                async function load(){
                                    info.phone = info.phone.substring(1)
                                    const res = await getData("elReserve", info )
                                    res.data.date = info.date
                                    res.data.slot = info.slot
                                    setNote( res );setPage(1)
                                }
                                load()
                            }}
                        >
                            Оставить заявку
                        </IonButton>
                    </div>
                    <div className=" ml-1 mr-1 mt-1">
                        <IonButton
                            expand="block"
                            mode = "ios"
                            color = "tertiary"
                            onClick={()=>{
                                setPage( 2 )
                            }}
                        >
                            Заявки
                        </IonButton>
                    </div>
                </div>
            </IonCard>
        </>
        return elem
    }

    function Note(){
        let elem = <></>
        if(note.error){
            elem = <>
                <IonCard className="pb-1">
                    <div className=" ml-1 mt-1 mr-1 t-underline"> <h4>{ "Ошибка записи!" }</h4></div>
                    

                    <div className=" mt-2 ml-2 mr-2">
                        <div className="fs-13"><b>{ note?.message }</b></div>
                        <IonButton
                            className="mt-1"
                            expand="block"
                            mode="ios"
                            onClick={()=>{ 
                                setPage( 0 )
                            }}
                        >
                            Закрыть
                        </IonButton>
                    </div>
                </IonCard>
            </>
        } else 
        elem = <>
            <IonCard className="pb-1">
                <div className=" ml-1 mt-1 mr-1 t-underline"> <h4>Ваша заявка принята!</h4></div>
                
                <div className='flex fl-space ml-2 mt-1 mr-2'>
                    <div> На дату </div>
                    <div> <b> { note.date + " " + note.slot } </b> </div>
                </div>

                <div className=" mt-2 ml-2 mr-2">
                    <div className="fs-13">{ "Номер вашей брони: " } <b>{ note?.data.enrollment_pin}</b></div>
                    <IonButton
                        className="mt-1"
                        expand="block"
                        mode="ios"
                        onClick={()=>{ 
                            getData("elDelete", { id: note.data.enrollment_id })
                            setPage( 0 )
                        }}
                    >
                        Отменить запись
                    </IonButton>
                </div>
            </IonCard>
        </>
        return elem
    }

    function List(){
        const [ info, setInfo ] = useState<any>([]) // eslint-disable-line @typescript-eslint/no-explicit-any

        async function load(){
            const res = await getData("elList", {
                token: Store.getState().login.token
            })
            if(!res.error){
                setInfo( res.data)
            }
            
        }
        
        useEffect(()=>{
            load()
        },[])

        let elem = <></>
        for(let i = 0;i < info.length;i++){
            elem = <>
                { elem }
                <IonCard className="pb-1">
                    <div className=" ml-1 mt-1 mr-1 t-underline"> 
                        <h4> Заявка: { 
                                  parseInt(info[i].operation_id) === 12
                                    ? "Прием документов"     
                                : parseInt(info[i].operation_id) === 14
                                    ? "Заключение договора на поставку газа (квартира)"
                                : parseInt(info[i].operation_id) === 16
                                    ? "Социальная газификация"
                                : ""
                        }</h4>
                    </div>
                    
                    <div className='flex fl-space ml-2 mt-1 mr-2'>
                        <div> На дату </div>
                        <div> <b> { info[i].date_time } </b> </div>
                    </div>

                    <div className=" mt-2 ml-2 mr-2">
                        <div className="fs-13">
                            Номер брони:<b>{ info[i].pin }</b>
                        </div>
                        <IonButton
                            className="mt-1"
                            expand="block"
                            mode="ios"
                            onClick={()=>{ 
                                getData("elDelete", { id: info[i].id })
                                setPage( 0 )
                            }}
                        >
                            Отменить запись
                        </IonButton>
                    </div>
                </IonCard>

            </>
        }
        return elem
    }

    const elem = <>
        <div className='mt-2'>
            <IonText>
                <h4 className="main-title ion-text-wrap ion-text-start ml-2">
                    { "Предварительная запись" }
                </h4>
            </IonText>
        </div>
        {
            page === 0 
                ? <GazObject />
            : page === 1
                ? <Note />
            : page === 2
                ? <List />
            : <></>
        }
        
    </>
    return elem
}

export function Queye(){
    const [ modal,      setModal ]  = useState( 0 )

    useEffect(()=>{
        return ()=>{
            Store.unSubscribe( 61 )
        }
    },[])
   
    Store.subscribe({num : 61, type: "back", func: ()=>{
        Store.dispatch({type: "route", route: "back"})
    } })

    const elem = <>
        <div className='mt-2'>
            <IonText>
                <h4 className="main-title ion-text-wrap ion-text-start ml-2">
                    { "Предварительная запись" }
                </h4>
            </IonText>
        </div>

        <div className="mr-1">
                <p className="ml-2 cl-white">
                    С помощью данного сервиса физическим и юридическим лицам можно
                    предварительно записаться на прием в Службу «Единого окна» по адресу
                    г.Якутск, ул. Петра Алексеева, 64.
                </p>
                <p className="ml-2 cl-white">
                    На ваш номер телефона будет отправлен СМС с указанием номера брони,
                    а также даты и времени записи.
                </p>
                <p className="ml-2 cl-white">
                    Прием документов производится только при полном пакете документов.
                </p>
                <p className="ml-2 cl-white">
                    <b className="cl-red"> Внимание! </b>
                    Согласно п. 9 ПП РФ №549, при подаче заявления на заключение
                    договора на поставку газа, необходимо предоставить договор на
                    техническое обслуживание со специализированной организацией.
                </p>
        </div>

        <div className="ml-2 mr-2"> 
            <IonButton
                expand="block"
                onClick={()=>{
                    setModal( 2 )
                }}
            >
                Заявки 
            </IonButton>
        </div>

        <div className="ml-2 mr-2"> 
            <IonButton
                expand="block"
                onClick={()=>{
                    setModal( 1 )
                }}
            >
                Записаться
            </IonButton>
        </div>

        <IonModal
            className="w-100 h-100"
            isOpen = { modal !== 0 }
            onDidDismiss={ () => setModal( 0 )}
        >
            <div className="w-100 h-100 scroll">
                <IonCard className="bg-1 pb-1">
                    <div className="ml-1 mt-1">
                        Предварительная запись
                    </div>

                {
                      modal == 1
                        ? <Note />
                    : modal == 2 
                        ? <Notes setModal = { setModal }/>
                    : <></>
                }
                    
                    
                    
                </IonCard>

            </div>
        </IonModal>
 
       
        
    </>
    return elem
}


function Note() {
    const [ info,   setInfo ]   = useState<any>([])
    const [ value,  setValue ]  = useState<any>({value: "0", label: "Выберите услугу..."})
    const [ value1, setValue1 ] = useState<any>({value: "0", label: "Выберите дату..."})
    const [ value2, setValue2 ] = useState<any>({value: "0", label: "Выберите время..."})
    const [ datas,  setDatas ]  = useState<any>([])
    const [ times,  setTimes ]  = useState<any>([])
    const [ note,   setNote ]   = useState<any>()
    const [ mess,   setMess ]   = useState<any>("")

    async function load1(){
        
        const res = await getData('elGetOperations', {})
        if(!res.error)
            setInfo(res.data)
    }
    
    async function load2( e ){
        
        const res = await getData('elGetDatas', {
            operation: e.value
        })
        const jarr:any = []
        res.data.forEach(elem => {
            jarr.push({value: elem, label: elem})
        });
            setDatas( jarr)
    }

    async function load3( e ){
        
        const res = await getData('elGetTimes', {
            operation: value.value,
            date: e.value,
        })
        const jarr:any = []
        res.data.forEach(elem => {
            jarr.push({value: elem.time, label: elem.time, disabled: !elem.is_available })
        });
            setTimes( jarr)
    }
    
    useEffect(()=>{
        load1()
    },[])

    let elem = <> </>

    if( info.length > 0) {
        elem = <>
            <div className="s-input ml-1 mr-1 mt-1 pl-1">
                <Select options={ info } value={ value } primaryColor="red" onChange={ ( e )=>{
                    setValue( e )
                    setValue1({value: "0", label: "Выберите дату..."})
                    setValue2({value: "0", label: "Выберите время..."})
                    setTimes([])
                    setNote( undefined )
                    setMess("")
                    load2( e )

                } } 
                    classNames={{
                        listItem: ( ) => (
                            `sbl-item`
                        )
                    }}
                />
            </div>
            {
                datas.length > 0 
                    ? <>
                        <div className="s-input ml-1 mr-1 mt-1 pl-1">
                            <Select options={ datas } value={ value1 } primaryColor="red" onChange={ ( e )=>{
                                setValue1( e )
                                setValue2({value: "0", label: "Выберите время..."})
                                setNote( undefined )
                                setMess("")
                                load3( e )
                            } } 
                                classNames={{
                                    listItem: ( ) => (
                                        `sbl-item`
                                    )
                                }}
                            />
                        </div>
                    </> 
                    : <></>
            }
            {
                times.length > 0 
                    ? <>
                        <div className="s-input ml-1 mr-1 mt-1 pl-1">
                            <Select options={ times } value={ value2 } primaryColor="red" onChange={ ( e )=>{
                                setValue2( e )
                                setNote( undefined )
                                setMess("")
                            } } 
                                classNames={{
                                    menu: 'sbl-disabled',
                                    listItem: ( ) => (
                                        `sbl-item a-right mr-2`
                                    )
                                }}
                            />
                        </div>
                    </> 
                    : <></>
            }
            <p className="ml-1 mr-1"> { mess } </p>
            {
                note !== undefined 
                    ? <>
                        <div className=" ml-1 mt-1 mr-1 t-underline"> <h4>Ваша заявка принята!</h4></div>
                        
                        <div className='flex fl-space ml-2 mt-1 mr-2'>
                            <div> На дату </div>
                            <div> <b> { note.date + " " + note.slot } </b> </div>
                        </div>                    
                        <div className="fs-13 ml-1 mt-1 mr-2">{ "Номер вашей брони: " } <b>{ note.pin }</b></div>
                    </>
                    : <></>
                }
            {
                value2.value !== "0" 
                    ? <>
                        <div className=" mt-1 ml-1 mr-1">
                            <IonButton
                                expand="block"
                                onClick={()=>{
                                    async function load(){
                                        const res = await getData("elReserve", {
                                            token:      Store.getState().login.token,
                                            operation:  value.value,
                                            date:       value1.value,
                                            slot:       value2.value,
                                            fio:        Store.getState().profile.surname + " " + Store.getState().profile.name + Store.getState().profile.lastname,
                                            phone:      Store.getState().login.phone.substring(1),
                                            email:      Store.getState().profile.email,
                                        } )
                                        if(!res.error) {
                                            setNote({ 
                                                date:   value1.value, 
                                                slot:   value2.value,
                                                id:     res.data.enrollment_id, 
                                                pin:    res.data.enrollment_pin, 
                                            })
                                            setMess("")                                            
                                        }
                                        else 
                                            setMess(res.message)
                                    }
                                    
                                    if( note !== undefined) {
                                        getData("elDelete", { id: note.id })
                                        setValue({value: "0", label: "Выберите услугу..."})
                                        setValue1({value: "0", label: "Выберите дату..."})
                                        setValue2({value: "0", label: "Выберите время..."})
                                        setDatas([])
                                        setTimes([])
                                        setNote( undefined )
                                        setMess("")
                                    
                                    } else load()

    
                                }}
                            >
                                { note !== undefined ? "Омена записи" : "Записаться на очередь" } 
                                
                            </IonButton>        
                        </div>
                    </>
                    :<></>
            }
        </>
    } 

    return elem
}

function Notes(props:{ setModal }) {
    const [ info,   setInfo ]   = useState<any>([])

    async function load1(){
        
        const res = await getData('elQueye', {
            token: Store.getState().login.token
        })
        console.log( res )
        if(!res.error)
            setInfo(res.data)
    }
    
    useEffect(()=>{
        load1()
    },[])

    let elem = <> </>

    for( let i = 0; i < info.length; i++) {
        elem = <>
            { elem }
            <div className=" ml-1 mt-1 mr-1 t-underline"> 
                <h4> 
                    Заявка: { info[i].operation }
                </h4>
            </div>
                    
            <div className='flex fl-space ml-2 mt-1 mr-2'>
                <div> На дату </div>
                <div> <b> { info[i].slot } </b> </div>
            </div>

            <div className=" mt-2 ml-2 mr-2">
                <div className="fs-13">
                    Номер брони:<b>{ info[i].PINCode }</b>
                </div>
                <IonButton
                    className="mt-1"
                    expand="block"
                    mode="ios"
                    onClick={()=>{ 
                        async function load() {
                            await getData("elDelete", { id: info[i].ID })    
                            props.setModal( 0 )
                        }
                        load()
                    }}
                >
                    Отменить запись
                </IonButton>
            </div>
       </>
    } 

    elem = <>
        <IonCard>
            { elem }
        </IonCard>
    </>

    return elem
}