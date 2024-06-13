import { IonButton, IonCard, IonCardContent, IonCardHeader } from "@ionic/react";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Store, getData } from "./Store";
import "./Bonuse.css"

 export function Bonuses(){
    const [ info, setInfo ] = useState<any>(new Object())
    const [ upd, setUpd ]  = useState( 0 )

    async function Client(){
        const res = await getData("spClient", {
            token: Store.getState().login.token
        })
        console.log(res)

        if(res.error) setInfo( new Object())
        else {
            setInfo( res.data )
            setUpd( upd + 1 )
        } 
    }
    async function CreateClient(){
        const res = await getData("spCreateClient", {
            token: Store.getState().login.token
        })
        if(res.error) setInfo( new Object())
        else setInfo( res.data )
    }

    useEffect(()=>{

            Client()
            
        return ()=>{
            Store.unSubscribe( 91 )
        }
    },[])

    
    Store.subscribe({num : 91, type: "back", func: ()=>{
        Store.dispatch({type: "route", route: "back"})
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

        console.log(st)
        const jarr = st.split("")
        const key = "AOSTNG"
        st = ""
        let i = 0;
        jarr.forEach(elem => {
            if( i >= key.length ) i = 0;
            st = st + String.fromCharCode( elem.charCodeAt(0) + (key.charCodeAt(i) - key.charCodeAt(0)) )
            i = i + 1;
        });
        console.log(st)
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


    let elem = <></>

    if( info?.owner_id === undefined )
        elem = <>
            <IonCard>
                <IonCardHeader className=" t-underline ml-1 mr-1">
                    Бонусы АГЗС
                </IonCardHeader>
                <IonCardContent>
                    <div className="mt-1">
                        <IonButton
                            expand="block"
                            mode="ios"
                            color="tertiary"
                            onClick={()=>{
                                CreateClient()    
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