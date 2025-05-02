import React, { useEffect, useState } from "react"
import { Store, getNews, getNewsDetail, getNotice, getNoticeDetail } from "./Store"
import { IonButton, IonCard, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel, IonModal, IonText } from "@ionic/react";
import './News.css'

export function News(){
    const [ info, setInfo ]     = useState<any>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ page, setPage ]     = useState( 0 )
    const [ select, setSelect ] = useState( 0 )
    const [ modal, setModal ]   = useState<any>()   // eslint-disable-line @typescript-eslint/no-explicit-any

    useEffect(()=>{
      return ()=>{
          Store.unSubscribe( 81 )
      }
    },[])

  
    Store.subscribe({num : 404, type: "back", func: ()=>{
        Store.dispatch({type: "route", route: "back"})
    } })



    let scrollTop = 0
    let lastTop = 0;

    async function load(){
        const res = select === 0 ? await getNews( page + 1 ) : await getNotice( page + 1 )
      
      if(res.status) {
        if(res.data !== undefined) {
          res.data.forEach(elem => {
            if(typeof elem.image === "string")
              if(elem.image.substring(0, 1) === "/")
                elem.image = "https://aostng.ru" + elem.image          
          });
            const jarr = [...info, ...res.data]
            setInfo( jarr )
        }
      }
      setPage( page + 1 )
    }

    useEffect(()=>{
      load(  )
    },[select])

    const elem = <>
        <div className='ml-1 mt-1'>
          <div className="n-btn-wrapper">
            <IonButton className={ select === 0 ? "n-button lightBlue" : "n-button n-backgroundGrey" } fill="clear" expand="block" mode="ios"
              onClick={()=>{ setInfo([]);setPage(0);setSelect(  0 )}}
            >
                <IonText className="ml-2 mr-2"> Новости </IonText>  
            </IonButton>
            <IonButton className={ select === 0 ? "n-button n-backgroundGrey" : "n-button lightBlue" } fill="clear" expand="block" mode="ios"
              onClick={()=>{ setInfo([]);setPage(0);setSelect(  1 )}}
            >
                <IonText className="ml-1 mr-1"> Объявления </IonText>  
            </IonButton>
          </div>
        </div>
          <div className="ml-1">
              <IonText>
                  <h1 className="main-title ion-text-wrap ion-text-start">
                      { select === 0 ? "Новости" : "Объявления" }
                  </h1>
              </IonText>
          </div>
          <IonContent
              scrollEvents={ true }
              onIonScroll={e =>{
                scrollTop = (e.detail as any).currentY              // eslint-disable-line @typescript-eslint/no-explicit-any
                lastTop = (e.target.lastChild as any).offsetTop     // eslint-disable-line @typescript-eslint/no-explicit-any
              }}
              onIonScrollEnd={()=>{
                if(( lastTop - scrollTop) < 1000) load()
              }}
            >
            {
                info.map((e, i) =>{
                    return <>                
                        <IonCard className="pb-1" key = { i }
                          onClick={()=>{
                            async function load() {
                               const res = select === 0 ? await getNewsDetail( e.id ) : await getNoticeDetail( e.id )

                               if(typeof res.data.image === "string" )
                                  if(res.data.image.substring(0, 1) === "/")
                                    res.data.image = "https://aostng.ru" + res.data.image
                              console.log( res.data )
                               setModal(res.data)
                            }
                            load()
                          }}
                        >
                            {
                              e.image !== null 
                                ? <img src={ e.image } alt="Картинка" />
                                : <></>
                            }                            
                            <div className="mt-1 ml-1">
                                <IonLabel>{ e.date }</IonLabel>
                            </div>
                            <div className="mt-1 ml-1 fs-15 fs-bold cl-black">
                                { info[i].name}
                            </div>
                            <div className="mt-1 ml-1 mr-1 fs-12">
                                <p>
                                    { e.preview}
                                </p>                    
                            </div>
                        </IonCard>
                    </>
            })
            }
            <IonInfiniteScroll
                threshold="10%"
            >
                <IonInfiniteScrollContent loading-spinner= "bubbles"></IonInfiniteScrollContent>
            </IonInfiniteScroll>
          </IonContent>

          <IonModal
              className="w-100 h-100"
              isOpen = { modal !== undefined }
              onDidDismiss={ () => setModal( undefined )}
          >
            <IonContent 
                className="w-100 h-100"
                onClick= {()=>{ setModal( undefined )}}
            >
                {
                    modal?.image !== null 
                        ? <img src={ modal?.image } alt="Карт" />
                        : <></>
                }      
                <div className="mt-1 ml-1 fs-15 fs-bold fs-prim">
                    { modal?.preview }
                </div>
                <div className="mt-1 ml-1 mr-1 fs-12">
                    <p dangerouslySetInnerHTML={ { __html: modal?.detail }}>
                        
                    </p>                    
                </div>
            </IonContent>
          </IonModal>    </>

    return elem

}