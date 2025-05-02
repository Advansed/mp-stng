import { IonButton, IonCard, IonCheckbox, IonIcon, IonInput, IonLabel, IonText, IonTextarea } from "@ionic/react"
import React, { useEffect, useState } from "react"
import { FioSuggestions } from "react-dadata"
import '../../node_modules/react-dadata/dist/react-dadata.css'
import { KemVydan, Store, getData } from "./Store"
import MaskedInput from "../mask/reactTextMask"
import { atOutline, barcodeOutline, businessOutline, calendarOutline, callOutline, codeWorkingOutline, ellipseOutline, ellipsisHorizontalOutline, eyeOffOutline, eyeOutline, saveOutline } from "ionicons/icons"
import { Maskito } from "./Classes"


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
                <IonIcon icon = { saveOutline } className="w-2 h-2 pb-05" color={ Object.keys(mode).length === 1 ? "medium" : "success" }
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
                    <div><b> ФИО</b> </div>
                    <div> { info?.surname  + ' ' + info?.name + ' ' + info?.lastname }</div>
                </div>
            </div>
        </>
        return elem
    }

    function Passport(props:{ info }) {
        const [ upd,    setUpd ]  = useState( 0 )
        const [ mode,   setMode ] = useState<any>({ token: Store.getState().login.token })


        async function Save(){
            const res = await getData("profile", {
                token:      Store.getState().login.token,
                passport:   info?.passport,
                surname:    mode.surname,
                name:       mode.name,
                lastname:   mode.lastname,
            })
            console.log( {
                token: Store.getState().login.token,
                passport: info?.passport
            })
            console.log( res )
            if(res.error){ console.log(res.message)}
            else Store.dispatch({ type: "profile", profile: res.data })
        }
            const elem = <>
            <div className=" ml-1 mr-1 t-underline mt-1 flex fl-space"> 
                <b>Паспортные данные</b> 
                <IonIcon icon = { saveOutline } className="w-2 h-2 pb-05" color={ Object.keys(mode).length === 1 ? "medium" : "success" }
                    onClick={()=>{
                        Save()
                        setMode( { token: Store.getState().login.token } );
                    }}
                />
            </div>

            <div className={ "ml-1 mr-1 mt-1 cl-prim fs-bold" }>
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

                        console.log( Object.keys(mode).length )

                }}/>
            </div>  

            <div className=" flex cl-black">
                <IonIcon icon = { barcodeOutline } className="w-15 h-15 ml-1" color="primary"/>
                <div className="ml-1 w-80 mr-1 t-underline">
                    <div className="flex">
                        <div className="w-30">
                            <Maskito
                                mask = { [ /\d/, /\d/, /\d/, /\d/ ] }
                                placeholder="Серия"
                                value={ info?.passport?.serial }
                                onIonInput = {(e)=>{
                                    info.passport.serial = e.detail.value;
                                    mode.serial = e.target.value  
                                    setUpd( upd + 1)      
                                }}
                            />
                        </div>
                        <div className="w-10">{ " № " }</div>
                        <div>
                            <Maskito
                                mask = { [ /\d/, /\d/, /\d/, /\d/, /\d/, /\d/ ] }
                                placeholder="Номер"
                                value={ info?.passport?.number }
                                onIonInput = {(e)=>{
                                    info.passport.number = e.detail.value;
                                    mode.number = e.target.value  
                                    setUpd( upd + 1)      
                                }}
                            />
                        </div>
                    </div>
                </div>                    
            </div>

            <div className=" flex cl-black">
                <IonIcon icon = { calendarOutline } className="w-15 h-15 ml-1" color="primary"/>
                <div className="ml-1 w-80 mr-1 t-underline">
                    <IonInput
                        type = "date"
                        placeholder="Когда выдан"
                        value={ info?.passport?.issuedDate }
                        onIonInput = {(e)=>{
                            info.passport.issuedDate = e.detail.value;
                            mode.issuedDate = e.target.value  
                            setUpd( upd + 1)      
                        }}
                    />
                </div>                    
            </div>

            <div className=" flex cl-black">
                <IonIcon icon = { codeWorkingOutline } className="w-15 h-15 ml-1" color="primary"/>
                <div className="ml-1 w-80 mr-1 t-underline">
                    <Maskito
                        mask = { [ /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/ ] }
                        placeholder="Код подразделения"
                        value={ info?.passport?.codePodr }
                        onIonInput = {(e)=>{
                            info.passport.codePodr = e.detail.value;
                            mode.codePodr = e.target.value  
                            setUpd( upd + 1)      
                        }}
                    />
                </div>                    
            </div>

            <div className=" flex cl-black">
                <IonIcon icon = { businessOutline } className="w-15 h-15 ml-1" color="primary"/>
                <div className="ml-1 w-80 mr-1 t-underline">
                    <IonTextarea
                        placeholder="Кем выдан"
                        value={ info?.passport?.issuedBy }
                        onIonInput = {(e)=>{
                            info.passport.issuedBy = e.detail.value;
                            mode.issuedBy = e.target.value  
                        }}
                    />
                </div>                    
            </div>

        </>
        return elem 
    }

    function Contacts(props: { info }) {
        const [ upd,    setUpd ]  = useState( 0 )
        const [ mode,   setMode ] = useState<any>({ token: Store.getState().login.token })
        const [ show,   setShow ] = useState( false)

        const togglePasswordVisibility = () => {
            setShow( !show );
          };

        const elem = <>
            <div className=" ml-1 mr-1 t-underline mt-1 flex fl-space"> 
                <b>Настройки</b> 
                <IonIcon icon = { saveOutline } className="w-2 h-2 pb-05" color={ Object.keys(mode).length === 1 ? "medium" : "success" }
                    onClick={()=>{
                        Save( mode )
                        setMode( { token: Store.getState().login.token } );
                    }}
                />
            </div>

            <div className=" flex cl-black">
                <IonIcon icon = { atOutline } className="w-15 h-15 ml-1" color="primary"/>
                <div className="ml-1 w-80 mr-1 t-underline">
                    <IonInput
                        type = "text"
                        placeholder="Когда выдан"
                        value={ info?.email }
                        onIonInput = {(e)=>{
                            info.email = e.detail.value;
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

            <div className=" flex cl-black">
                <IonIcon icon = { callOutline } className="w-15 h-15 ml-1" color="primary"/>
                <div className="ml-1 w-80 mr-1 t-underline">
                    <div className="mt-05 pb-05 ml-1">
                        { Store.getState().login.phone }     
                    </div>
                </div>                    
            </div>

            

            <div className=" flex cl-black">
                <IonIcon icon = { ellipsisHorizontalOutline } className="w-15 h-15 ml-1" color="primary"/>
                <div className="ml-1 w-80 mr-1 t-underline flex">
                    <IonInput
                        type = { show ? "text" : "password" }
                        placeholder="Пароль"
                        value={ info?.password }
                        onIonInput = {(e)=>{
                            info.password = e.detail.value;
                            mode.password = e.target.value  
                            setUpd( upd + 1)      
                        }}
                    >
                    </IonInput>
                    <IonIcon icon = { show ? eyeOutline : eyeOffOutline }  slot = 'icon-only' className="w-15 h-15" color = "primary"
                        onClick={ togglePasswordVisibility}
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