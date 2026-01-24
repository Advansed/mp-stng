import { IonCard, IonIcon, IonText } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { callSharp, chevronDownOutline, chevronUpOutline, homeSharp, mailOpenSharp } from "ionicons/icons";
import { api } from "../Store/api";

export function Contacts(){
    const [ info, setInfo ] = useState<any>()

    useEffect(()=>{
        async function load() {
            const res = await api("Contacts",{})
            if(!res.error)
            setInfo( res.data )
        }
        load()
    },[])

    function Items1(){
        function Item(props:{ info }){
            const [ open, setOpen ] = useState( false )
    
            const Данные = props.info.Данные
    
            let items = <></>
            for( let i = 0; i < Данные.length; i++){
                items = <>
                    { items }
                    {
                        Данные[i].Телефон !== ""
                            ? <>
                                <div className="flex ml-2 mt-1">
                                    <div className=""> <IonIcon icon = { callSharp } className="w-15 h-15 cl-prim"  /></div>
                                    <div className="ml-1 fs-15 cl-prim"> <b>{ Данные[i].Телефон }</b> </div>
                                </div>
                            </> 
                            : <></>    
                    }
                    {
                        Данные[i].элПочта !== ""
                            ? <>
                                <div className="flex ml-2 mt-1">
                                    <div> <IonIcon icon = { mailOpenSharp }  className="w-15 h-15 cl-prim"/></div>
                                    <div className="ml-1 fs-15 cl-prim"> { Данные[i].элПочта } </div>
                                </div>
                            </> 
                            : <></>    
                    }
                    {
                        Данные[i].Адрес !== ""
                            ? <>
                                <div className="flex ml-2 mt-1">
                                    <div> <IonIcon icon = { homeSharp }  className="w-15 h-15 cl-prim"/></div>
                                    <div className="ml-1 fs-15 cl-prim"> { Данные[i].Адрес } </div>
                                </div>
                            </> 
                            : <></>    
                    }
                    {
                        Данные[i].Наименование !== ""
                            ? <>
                                <div className="ml-2 mt-1 fs-12 cl-prim"> <p dangerouslySetInnerHTML={ { __html: Данные[i].Наименование }}/> </div>
                            </> 
                            : <></>    
                    }
                </>
            }
    
            const elem = <>
                <div className="flex fl-space ml-1 mt-1"
                    onClick={()=>{
                        setOpen( !open)    
                    }}
                >
                    <div className="fs-12 cl-black"> <b>{ props.info.Имя }</b> </div>
                    <div className="mr-1">
                        <IonIcon
                            icon = {  open ? chevronDownOutline : chevronUpOutline }
                        />
                    </div>
                </div>
                { 
                    open ? items : <></>
                }
            </>
            return elem
        }
    
        let items = <></>
    
        for(let i = 0; i < info?.Данные1.length; i++){
            items = <>
                { items }
                <Item info = { info.Данные1[i] } />
            </>
        }

        return items
    }

    function Items2(){

        function Item(props:{ info }){
    
            const Данные = props.info
            
            const items = <>
                    {
                        Данные.Телефон !== ""
                            ? <>
                                <div className="flex ml-2 mt-1">
                                    <div className=""> <IonIcon icon = { callSharp } className="w-15 h-15 cl-red1"  /></div>
                                    <div className="ml-1 fs-15 cl-red1"> <b>{ Данные.Телефон }</b> </div>
                                </div>
                            </> 
                            : <></>    
                    }
                    {
                        Данные.элПочта !== ""
                            ? <>
                                <div className="flex ml-2 mt-1">
                                    <div> <IonIcon icon = { mailOpenSharp }  className="w-15 h-15 cl-red1"/></div>
                                    <div className="ml-1 fs-15 cl-red1"> { Данные.элПочта } </div>
                                </div>
                            </> 
                            : <></>    
                    }
                    {
                        Данные.Адрес !== ""
                            ? <>
                                <div className="flex ml-2 mt-1">
                                    <div> <IonIcon icon = { homeSharp }  className="w-15 h-15 cl-red1"/></div>
                                    <div className="ml-1 fs-15 cl-red1"> { Данные.Адрес } </div>
                                </div>
                            </> 
                            : <></>    
                    }
                    {
                        Данные.Наименование !== ""
                            ? <>
                                <div className="ml-2 mt-1 fs-12 cl-red1 fs-bold"> <p dangerouslySetInnerHTML={ { __html: Данные.Наименование }}/> </div>
                            </> 
                            : <></>    
                    }
            </>
    
            return items
        }

        let elem = <></>
        for( let i = 0; i < info?.Данные2.length;i++){
            elem = <>
                { elem }
                <Item info = { info.Данные2[i] } />
            </>
        }
        return elem
    }

    const elem = <>
        <div className='mt-2'>
            <IonText>
                <h4 className="main-title ion-text-wrap ion-text-start ml-2">
                    { "Контакты" }
                </h4>
            </IonText>
        </div>

        <IonCard className="pb-1">
            <div className="mt-1 ml-1 fs-14 cl-black">
                <b>Как связаться с нами</b>
            </div>
            <div className="ml-2 fs-12 cl-prim">
                <p dangerouslySetInnerHTML={ { __html: info?.Текст }}/>
            </div>
            <Items1 />
            <Items2 />
        </IonCard>
    </>

    return elem
}