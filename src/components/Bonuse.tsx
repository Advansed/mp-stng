import { IonButton, IonCard, IonCardContent, IonCardHeader, IonIcon, IonLoading } from "@ionic/react";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Store, getData } from "./Store";
import "./Bonuse.css"
import { saveOutline } from "ionicons/icons";
import { FioSuggestions } from "react-dadata";

 export function Bonuses(){
    const [ info, setInfo ] = useState<any>(new Object())
    const [ upd, setUpd ]  = useState( 0 )
    const [ message, setMessage ] = useState("")
    const [ load, setLoad] = useState( false)

    async function CreateClient(){
        setLoad( true)
        const res = await getData("spCreateClient", {
            token: Store.getState().login.token
        })
        if(res.error){
            setInfo( new Object())
            Store.dispatch({type: "error", error: res.message })
        }
        else setInfo( res.data )

        setLoad(false)
    }

    useEffect(()=>{

            setInfo( Store.getState().card )
            
        return ()=>{
            Store.unSubscribe( 404 )
            Store.unSubscribe( 92 )
        }
    },[])

    
    Store.subscribe({num : 404, type: "back", func: ()=>{
        Store.dispatch({type: "route", route: "back"})
    } })

    Store.subscribe({num : 92, type: "card", func: ()=>{
        setInfo( Store.getState().card )
    } })

    function BonusCard(){
        let elem = <></>
        elem = <>
            <div className="b-card">
            <div className="cl-white ml-1 pt-1">
                    <h1> <b>Бонусная карта</b></h1>
                </div>
                <div className="cl-white ml-1 mt-2">
                    <h2> <b>{ info?.name }</b></h2>
                </div>
                <div className="b-number cl-white">
                    <h1> <b> { info?.card_id } </b></h1>
                </div>
            </div>
        </>
        return elem;
    }

    function Cipher(){
        let st = info.card_id + ";" + (new Date()).toISOString()

        const jarr = st.split("")
        const key = "AOSTNG"
        st = ""
        let i = 0;
        jarr.forEach(elem => {
            if( i >= key.length ) i = 0;
            st = st + String.fromCharCode( elem.charCodeAt(0) + (key.charCodeAt(i) - key.charCodeAt(0)) )
            i = i + 1;
        });
        return st
    }
    
    function deCipher( st ){
        const jarr = st.split("")
        const key = "AOSTNG"
        st = ""
        let i = 0;
        jarr.forEach(elem => {
            if( i >= key.length ) i = 0;
            st = st + String.fromCharCode( elem.charCodeAt(0) - (key.charCodeAt(i) - key.charCodeAt(0)) )
            i = i + 1;
        });

        return st
    }

    function FIO(){
        const info = Store.getState().profile
        const [ upd, setUpd ] = useState( 0 )

        async function Save(){
            const res = await getData("profile",{
                token: Store.getState().login.token,
                surname:    info.surname, 
                name:       info.name,
                lastname:   info.lastname
            })
            console.log( res )
            if(res.error){ console.log(res.message)}
            else Store.dispatch({ type: "profile", profile: res.data })
        }

        const elem = <>

            <div className={ "ml-1 mr-1 mt-1 cl-prim fs-bold"}>
                <div>ФИО</div>
                <div className="ml-1">
                    <FioSuggestions  token="50bfb3453a528d091723900fdae5ca5a30369832"
                        value={ 
                            { 
                                value: 
                                      info?.surname + " "
                                    + info?.name + " " 
                                    + info?.lastname, 
                                unrestricted_value: info?.surname + " " + info?.name + " " + info?.lastname,
                                data: {
                                    surname:            info?.surname,
                                    name:               info?.name,
                                    patronymic:         info?.lastname,
                                    gender:             "MALE",
                                    source:             null,
                                    qc:                 "0"
                                }
                            }
                
                        }
                        onChange={(e)=>{
                            info.surname            = e?.data.surname;  
                            info.name               = e?.data.name;  
                            info.lastname           = e?.data.patronymic;  

                            setUpd( upd + 1)

                            Save()

                        }}/>
                </div>
            </div>
        </>
        return elem
    }


    let elem = <></>

    if( info?.owner_id === undefined )
        elem = <>
            <IonCard>
                <IonCardHeader className=" t-underline ml-1 mr-1">
                    Бонусы АГЗС
                </IonCardHeader>
                <IonCardContent>
                    <FIO />
                    
                    <p>{ message }</p>
                    <div className="mt-1">
                        <IonButton
                            expand="block"
                            mode="ios"
                            color="tertiary"
                            onClick={()=>{
                                setMessage( "" )
                                const info = Store.getState().profile
                                if((info.surname + info.name + info.lastname).length > 0){
                                    CreateClient()    
                                }
                                else 
                                    setMessage( "Заполните ФИО" )
                            }}
                        >
                            Создать бонусную карту
                        </IonButton>
                    </div>
                </IonCardContent>                
            </IonCard>
        </>
    else
        elem = <>
            <IonCard>
                <IonCardHeader className=" t-underline ml-1 mr-1">
                    Бонусы АГЗС
                </IonCardHeader>
                <IonCardContent>
                    <div className="flex fl-center mt-1 cl-prim">
                        <div>Накоплено</div>
                        <div className="ml-1"><h1><b> { info.balance } </b></h1></div>
                        <div className="ml-1">баллов</div>
                    </div>
                    <div className="flex fl-center mt-1">
                        <div>
                            <QRCode value={ info.QRCode } />
                        </div>
                    </div>
                    <BonusCard />
                </IonCardContent>
            </IonCard>
        </>

    return <>
        <IonLoading isOpen={load} message={"Подождите"}/>
        {/* <IonCard className="pb-2">
            <IonCardHeader>QR-code</IonCardHeader>
            <div className="flex fl-center">
                <div>
                    <QRCode value="Орг:УГРС;АГЗС:03;Билет:41155412" />
                </div>
            </div>
        </IonCard> */}
        { elem }
    </>
 }