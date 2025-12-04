import {  IonCard, IonCheckbox, IonIcon, IonInput, IonLoading, IonText, IonTextarea } from "@ionic/react"
import React, { useState } from "react"
import { FioSuggestions } from "react-dadata"
import 'react-dadata/dist/react-dadata.css'
import { atOutline, barcodeOutline, businessOutline, calendarOutline, callOutline, codeWorkingOutline, ellipsisHorizontalOutline, eyeOffOutline, eyeOutline, saveOutline } from "ionicons/icons"
import { Maskito } from "../Classes"
import { useProfile } from "./useProfile"


export function Profile() {
    const { profile, isLoading, save } = useProfile()
    const [ info ] = useState<any>( profile )


    function Passport(props:{ info }) {
        const [ upd,    setUpd ]  = useState( 0 )
        const [ mode,   setMode ] = useState<any>({})
            
        const elem = <>
        <div className=" ml-1 mr-1 t-underline mt-1 flex fl-space"> 
            <b>Паспортные данные</b> 
            <IonIcon icon = { saveOutline } className="w-2 h-2 pb-05" color={ Object.keys(mode).length === 0 ? "medium" : "success" }
                onClick={()=>{
                    save({
                        passport:   info?.passport,
                        surname:    mode.surname || info.surname,
                        name:       mode.name || info.name,
                        lastname:   mode.lastname || info.lastname
                    })
                    setMode({});
                }}
            />
        </div>

        <div className={ "ml-1 mr-1 mt-1 cl-prim fs-bold" }>
            <FioSuggestions  token="50bfb3453a528d091723900fdae5ca5a30369832"
                value={{ 
                    value: (info?.surname || "" ) + " " + (info?.name || "") + " " + (info?.lastname || ""), 
                    unrestricted_value: info?.surname + " " + info?.name + " " + info?.lastname,
                    data: {
                        surname:            info?.surname || '',
                        name:               info?.name || '',
                        patronymic:         info?.lastname || '',
                        gender:             "MALE",
                        source:             null,
                        qc:                 "0"
                    }
                }}
                onChange={(e)=>{

                    if(info) {

                        info.surname            = e?.data.surname;  
                        info.name               = e?.data.name;  
                        info.lastname           = e?.data.patronymic;  

                    }

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
                            setUpd( upd + 1)
                        }}
                    />
                </div>                    
            </div>

        </>
        return elem 
    }

    function Contacts(props: { info }) {
        const [ upd,    setUpd ]  = useState( 0 )
        const [ mode,   setMode ] = useState<any>({})
        const [ show,   setShow ] = useState( false)

        const togglePasswordVisibility = () => {
            setShow( !show );
          };

        const elem = <>
            <div className=" ml-1 mr-1 t-underline mt-1 flex fl-space"> 
                <b>Настройки</b> 
                <IonIcon icon = { saveOutline } className="w-2 h-2 pb-05" color={ Object.keys(mode).length === 0 ? "medium" : "success" }
                    onClick={()=>{
                        save( mode )
                        setMode({});
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
                        { profile?.phone }     
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
        <IonLoading isOpen = { isLoading } message = { "Идет обновление..." }/>
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