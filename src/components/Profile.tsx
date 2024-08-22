import { IonCard, IonCheckbox, IonIcon, IonInput, IonText } from "@ionic/react"
import React, { useEffect, useState } from "react"
import { FioSuggestions } from "react-dadata"
import '../../node_modules/react-dadata/dist/react-dadata.css'
import { KemVydan, Store, getData } from "./Store"
import MaskedInput from "../mask/reactTextMask"
import { saveOutline } from "ionicons/icons"


export function Profile() {
    const [ info, setInfo ] = useState<any>() 

    Store.subscribe({num: 31, type: "back", func:()=>{
        Store.dispatch({type:"route", route: "back"})
    }})

    Store.subscribe({num: 32, type: "profile", func:()=>{
        setInfo( Store.getState().profile )
    }})

    useEffect(()=>{

        setInfo( Store.getState().profile )        

        return ()=>{
            Store.unSubscribe(31);
            Store.unSubscribe(32);
        }

    },[])

    async function Save( params ){
        const res = await getData("profile", params)
        console.log( res )
        if(res.error){ console.log(res.message)}
        else Store.dispatch({ type: "profile", profile: res.data })
    }

    function FIO(props:{ info }){
        const [ edit,   setEdit ] = useState( false)
        const [ upd,    setUpd ]  = useState( 0 )
        const [ mode,   setMode ] = useState<any>({ token: Store.getState().login.token })
        const info = props.info

        const elem = <>
            <div className=" ml-1 mr-1 t-underline mt-1 cl-prim flex fl-space"> 
                <b>ФИО</b> 
                <IonIcon icon = { saveOutline } className="w-2 h-2" color={ Object.keys(mode).length === 1 ? "medium" : "success" }
                    onClick={()=>{
                        Save( mode )
                        setMode( { token: Store.getState().login.token } );
                    }}
                />
            </div>
            <div className={ edit ? "ml-1 mr-1 mt-1 cl-prim fs-bold" : "hidden"}>
                <FioSuggestions  token="50bfb3453a528d091723900fdae5ca5a30369832"
                    value={{ 
                        value: info?.surname + " " + info?.name + " " + info?.lastname, 
                        unrestricted_value: info?.surname + " " + info?.name + " " + info?.lastname,
                        data: {
                            surname:            info?.surname,
                            name:               info?.name,
                            patronymic:         info?.lastname,
                            gender:             "MALE",
                            source:             null,
                            qc:                 "0"
                        }
                    }}
                    onChange={(e)=>{
                        info.surname            = e?.data.surname;  
                        info.name               = e?.data.name;  
                        info.lastname           = e?.data.patronymic;  

                        mode.surname            = e?.data.surname;  
                        mode.name               = e?.data.name;  
                        mode.lastname           = e?.data.patronymic;  

                        setUpd( upd + 1)
                        setEdit( edit )

                        console.log( Object.keys(mode).length )

                    }}/>
            </div>
            <div className="cl-prim"  onClick={()=>{ setEdit(!edit); console.log( mode ) }} >
                <div className='flex fl-space ml-2 mt-1 mr-1'>
                    <div><b> Фамилия</b> </div>
                    <div> { info?.surname }</div>
                </div>
                <div className='flex fl-space ml-2 mt-1 mr-1'>
                    <div> <b>Имя</b>  </div>
                    <div> { info?.name }</div>
                </div>
                <div className='flex fl-space ml-2 mt-1 mr-1'>
                    <div> <b>Отчество</b> </div>
                    <div> { info?.lastname }</div>
                </div>
            </div>
        </>
        return elem
    }

    function Passport(props:{ info }) {
        const [ upd,    setUpd ]  = useState( 0 )
        const [ mode,   setMode ] = useState<any>({ token: Store.getState().login.token })

        const elem = <>
            <div className=" ml-1 mr-1 t-underline mt-1 flex fl-space"> 
                <b>Паспортные данные</b> 
                <IonIcon icon = { saveOutline } className="w-2 h-2" color={ Object.keys(mode).length === 1 ? "medium" : "success" }
                    onClick={()=>{
                        Save( mode )
                        setMode( { token: Store.getState().login.token } );
                    }}
                />
            </div>
            <div className='flex fl-space ml-2 mt-1 mr-1 cl-prim'>
                <div> <b>Серия </b> </div>
                <div className='s-input a-right pr-1'>
                    <IonInput
                        class='s-input-1'
                        value={ info?.passport?.serial }
                        placeholder="Серия"
                        onIonInput={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            info.passport.serial = e.target.value    
                            if(mode.passport === undefined) mode.passport = new Object
                            mode.passport.serial = e.target.value  
                            setUpd( upd + 1)      
                        }}
                    />
                </div>
            </div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> <b>Номер</b> </div>
                <div className='s-input a-right pr-1'>
                    <IonInput
                        class='s-input-1'
                        value={ info?.passport?.number }
                        placeholder="Номер"
                        onIonInput={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            if(mode.passport === undefined) mode.passport = new Object
                            info.passport.number = e.target.value   
                            mode.passport.number = e.target.value   
                            setUpd( upd + 1)    
                        }}
                    />
                </div>
            </div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> <b>Когда выдан</b> </div>
                <div className='s-input a-right pr-1'>
                    <MaskedInput
                        mask={[ /[0-9]/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/]}
                        className="m-input-1 a-right"
                        id='10'
                        value={ info?.passport.issuedDate }
                        placeholder = "__.__.____"
                        type='text'
                        onChange={(e) => {
                            info.passport.issuedDate = e.target.value    
                            if(mode.passport === undefined) mode.passport = new Object
                            mode.passport.issuedDate = e.target.value    
                            setUpd( upd + 1)    
                        }}
                    />

                </div>
            </div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> <b>Код подразделения</b> </div>
                <div className='s-input a-right pr-1'>
                    <IonInput
                        class='s-input-1'
                        value={ info?.passport?.codePodr }
                        placeholder="Код подразделения"
                        onIonInput={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            if(mode.passport === undefined) mode.passport = new Object
                            info.passport.codePodr = e.target.value    
                            if(mode.passport === undefined) mode.passport = new Object
                            mode.passport.codePodr = e.target.value   
                            setUpd( upd + 1)     
                        }}
                        onIonChange={(e)=>{
                            async function load(){
                                const res: any = await KemVydan( e.detail.value ) // eslint-disable-line @typescript-eslint/no-explicit-any
                                
                                if(res?.suggestions !== undefined ){
                                    if(mode.passport === undefined) mode.passport = new Object
                                    info.passport.issuedBy = res?.suggestions[0]?.value
                                    if(mode.passport === undefined) mode.passport = new Object
                                    mode.passport.issuedBy = res?.suggestions[0]?.value
                                    setUpd( upd + 1)
                                }
                            }
                            load()
                        }}
                    />
                </div>
            </div>
            <div className="ml-2 mt-1 mr-1">
               { info?.passport?.issuedBy }
            </div>
        </>
        return elem 
    }

    function Contacts(props: { info }) {
        const [ upd,    setUpd ]  = useState( 0 )
        const [ mode,   setMode ] = useState<any>({ token: Store.getState().login.token })

        const elem = <>
            <div className=" ml-1 mr-1 t-underline mt-1 flex fl-space"> 
                <b>Настройки</b> 
                <IonIcon icon = { saveOutline } className="w-2 h-2" color={ Object.keys(mode).length === 1 ? "medium" : "success" }
                    onClick={()=>{
                        Save( mode )
                        setMode( { token: Store.getState().login.token } );
                    }}
                />
            </div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> <b>Эл. почта</b> </div>
                <div className='s-input a-right pr-1'>
                    <IonInput
                        class='s-input-1'
                        value={ info?.email }
                        placeholder="email"
                        onIonInput={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            info.email = e.target.value    
                            mode.email = e.target.value    
                            setUpd( upd + 1)
                        }}
                        onIonChange={()=>{
                            if(info.email === ""){
                                info.consenttoemail = false
                            }
                            setUpd( upd + 1)
                        }}
                    />
                </div>
            </div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> <b>Телефон</b> </div>
                <div className='s-input a-right pr-1'>
                    <div className="mt-05 pb-05 ml-1">
                        { Store.getState().login.phone }     
                    </div>
                </div>
            </div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> <b>Пароль</b> </div>
                <div className='s-input a-right pr-1'>
                    <IonInput
                        class='s-input-1'
                        value={ info?.password }
                        placeholder="Пароль"
                        type="password"
                        onIonInput={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            info.password = e.target.value    
                            mode.password = e.target.value    
                            setUpd( upd + 1 )
                        }}
                    />
                </div>
            </div>
            {
                info?.email === undefined || info?.email === ""
                    ?<></>
                    : <>
                        <div className='flex fl-space ml-2 mt-1 mr-1'>
                            <IonCheckbox
                                justify="start"
                                labelPlacement="end"
                                mode="ios"
                                checked = { info?.consenttoemail }
                                onIonChange={(e)=>{
                                    info.consenttoemail = e.detail.checked
                                    mode.consenttoemail = e.detail.checked
                                    setUpd(upd + 1)
                                }}
                            >   
                                <span className="wrap">
                                    Согласие на получение квитанций на электронную почту    
                                </span>                    
                            </IonCheckbox>
                        </div>
                    </>
            }
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <IonCheckbox
                    justify="start"
                    labelPlacement="end"
                    mode="ios"
                    checked = { info?.consenttosms }
                    onIonChange={(e)=>{
                        info.consenttosms = e.detail.checked
                        mode.consenttosms = e.detail.checked
                        setUpd(upd + 1)
                    }}
    >   
                    <span className="wrap">
                        Согласие на получение СМС
                    </span>                    
                </IonCheckbox>
            </div>
        </>
        return elem 
    }


    const elem = <>
        <div>
            <div className='ml-1 h-3'>
                <IonText>
                    <h1 className="main-title ion-text-wrap ion-text-start">
                        { "Личные данные" }
                    </h1>
                </IonText>
            </div>

            <div
                className='l-content'
            >
                <IonCard className="pb-1">
                    <FIO info = { info }/>
                </IonCard>

                <IonCard className="pb-1 cl-prim">
                    <Passport info = { info }/>
                </IonCard>

                <IonCard className="pb-1 cl-prim">
                    <Contacts info = { info }/>
                </IonCard>
            </div>    
        </div>
    </>
    
    return elem
}