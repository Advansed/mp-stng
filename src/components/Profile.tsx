import { IonCard, IonCheckbox, IonInput, IonText } from "@ionic/react"
import React, { useEffect, useState } from "react"
import { FioSuggestions } from "react-dadata"
import '../../node_modules/react-dadata/dist/react-dadata.css'
import { KemVydan, Store, getData } from "./Store"
import MaskedInput from "../mask/reactTextMask"

export function Profile(){
    const [ info, setInfo ] = useState<any>() 
    const [ mode, setMode ] = useState<any>({ 
        token : Store.getState().login.token
    })
    const [ upd, setUpd] = useState( 0 )

    Store.subscribe({num: 31, type: "back", func:()=>{
        Store.dispatch({type:"route", route: "back"})
    }})

    Store.subscribe({num: 32, type: "profile", func:()=>{
        setInfo( Store.getState().profile )
    }})

    useEffect(()=>{
        async function load(){
            const res = await getData("profile", {
                token: Store.getState().login.token
            })
            if(res.error){ console.log(res)}
            else {
                const jarr = res.data

                Store.dispatch({ type: "profile", profile: jarr })
            }
        } 

        const jarr = Store.getState().profile 
        if( jarr !== "") setInfo( jarr )

        load();
        
        return ()=>{
            Store.unSubscribe(31);
            Store.unSubscribe(32);
            if( Object.keys( mode ).length > 1) {
                Save( mode )
            }
        }

    },[])

    async function Save( params ){
        const res = await getData("profile", params)
        if(res.error){ console.log(res.message)}
    }

    function FIO () {
        const [ edit, setEdit ] = useState( false)
        const elem = <>
            <div className=" ml-1 mr-1 t-underline mt-1"> <b>ФИО</b> </div>
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

                        setEdit( edit )

                    }}/>
            </div>
            <div  onClick={()=>{ setEdit(!edit) }} >
                <div className='flex fl-space ml-2 mt-1 mr-1'>
                    <div> Фамилия </div>
                    <div> { info?.surname }</div>
                </div>
                <div className='flex fl-space ml-2 mt-1 mr-1'>
                    <div> Имя  </div>
                    <div> { info?.name }</div>
                </div>
                <div className='flex fl-space ml-2 mt-1 mr-1'>
                    <div> Отчество </div>
                    <div> { info?.lastname }</div>
                </div>
            </div>
        
        </>
        return elem
    }

    function Contacts() {
        const elem = <>
            <div className=" ml-1 mr-1 t-underline mt-1"> <b>Настройки</b> </div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> элПочта </div>
                <div className='s-input a-right pr-1'>
                    <IonInput
                        class='s-input-1'
                        value={ info?.email }
                        placeholder="email"
                        onIonInput={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            info.email = e.target.value    
                            mode.email = e.target.value    
                            setMode( mode )
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
                <div> Телефон </div>
                <div className='s-input a-right pr-1'>
                    <div className="mt-05 pb-05 ml-1">
                        { Store.getState().login.phone }     
                    </div>
                </div>
            </div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> Пароль </div>
                <div className='s-input a-right pr-1'>
                    <IonInput
                        class='s-input-1'
                        value={ info?.password }
                        placeholder="Пароль"
                        type="password"
                        onIonInput={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            info.password = e.target.value    
                            mode.password = e.target.value    
                            setMode( mode )
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

    function Passport() {
        const [ upd, setUpd ] = useState( 0 )
        const elem = <>
            <div className=" ml-1 mr-1 t-underline mt-1"> <b>Паспортные данные</b> </div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> Серия </div>
                <div className='s-input a-right pr-1'>
                    <IonInput
                        class='s-input-1'
                        value={ info?.passport?.serial }
                        placeholder="Серия"
                        onIonInput={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            info.passport.serial = e.target.value    
                            if(mode.passport === undefined) mode.passport = new Object
                            mode.passport.serial = e.target.value    
                        }}
                    />
                </div>
            </div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> Номер </div>
                <div className='s-input a-right pr-1'>
                    <IonInput
                        class='s-input-1'
                        value={ info?.passport?.number }
                        placeholder="Номер"
                        onIonInput={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            if(mode.passport === undefined) mode.passport = new Object
                            info.passport.number = e.target.value   
                            mode.passport.number = e.target.value   
                        }}
                    />
                </div>
            </div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> Когда выдан </div>
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
                        }}
                    />

                </div>
            </div>
            <div className='flex fl-space ml-2 mt-1 mr-1'>
                <div> Код подразделения </div>
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
                    <FIO  />
                    <Passport />
                    <Contacts/>
                </IonCard>
            </div>
        </div>
    </>
    
    return elem
}