import React, { useEffect, useState }        from 'react';
import { IonAlert, IonButton, IonButtons, IonContent, IonIcon, IonImg, IonMenuButton, IonPage, IonRefresher, IonRefresherContent, IonTabBar, IonTabButton, isPlatform, useIonRouter } from '@ionic/react';
import { useHistory, useParams, useLocation } from 'react-router';
import './Page.css';
import { Lics }     from '../components/Lics';
import { arrowBackOutline, chatboxEllipsesOutline, contractOutline, createOutline, documentTextOutline } from 'ionicons/icons';
import { Store, getApps, getData, getLics, getNotifications, getProfile, getServices, version }    from '../components/Store';
import { Profile }  from '../components/Profile';
import { Agzs }     from '../components/AGZS';
import { Apps }     from '../components/Apps';
import { Request }  from '../components/Request';
import { Services } from '../components/Services';
import { News }     from '../components/News';
import { Queye }    from '../components/Queye';
import { Bonuses }  from '../components/Bonuse';
import { Contacts } from '../components/Contacts';
import { Notifications } from '../components/Notifications';
import { Appeals } from '../components/Appeals';

const Page: React.FC = () => {
  const [ alert, setAlert ] = useState( false )
  const [ error, setError ] = useState("")

  const { name } = useParams<{ name: string; }>();

  const ionRouter = useIonRouter();

  console.log("page " + name)

  const lct = useLocation()

  async function check() {
    const res = await getData("getVersion", {})
    console.log(res)
    if( res.message !== version ){
      setAlert( true )
    }
  }

  Store.subscribe({ num: 3, type: "route", func: ()=>{

    const route = Store.getState().route;
    console.log( route)

    if( route === "back") {
      hist.goBack()
    }
    else {
        hist.push( route )
    }
  
  }})

  Store.subscribe({ num: 4, type: "error", func: ()=>{
    // setError( Store.getState().error )
    console.log(error)
  }})


  useEffect(()=>{
    if( !lct.pathname.includes("page")){
      Store.dispatch({ type: "auth", auth: false})
    } 

    
  },[name])

  useEffect(()=>{
    check()

    return ()=>{ Store.unSubscribe( 3 )}

  },[])

  const hist  = useHistory();
  
  function Main():JSX.Element {
    let elem = <></>
      switch ( name ) {

        case "":                  elem = <></>; break;
        case "lics":              elem = <Lics />; break;
        case "news":              elem = <News />; break;
        case "profile":           elem = <Profile />; break;
        case "agzs":              elem = <Agzs />; break;
        case "reqs":              elem = <Request />; break;
        case "apps":              elem = <Apps />; break;
        case "queye":             elem = <Queye />; break;
        case "bonuse":            elem = <Bonuses />; break;
        case "services":          elem = <Services />; break;
        case "appeals":           elem = <Appeals />; break;
        case "contacts":          elem = <Contacts />; break;
        case "push":              elem = <Notifications />; break;

        default: elem = <></>
      }

    return <>
      <div className={ isPlatform("ios") ? 'p-content-ios': "p-content"}>
        { elem }
      </div>
    </>
  }

    const handleRefresh = async (event: CustomEvent) => {
        // Здесь ваша логика обновления, например, запрос к API
        setTimeout(() => {
          console.log("refresh")
            getLics( { token: Store.getState().login.token } )
          event.detail.complete();
        }, 1500);
    };

  return (
    <IonPage>
        <div className={ isPlatform("ios") ? 'p-header flex fl-space mt-3' : "p-header flex fl-space" }>
          <IonButton
            fill = "clear"
            onClick = {()=>{ 
              if(name === "lics")
                Store.dispatch({ type: "back", back: Store.getState().back + 1})
              else 
                Store.dispatch({type: "route", route: "back"})
            }}
          >
            <IonIcon icon = { arrowBackOutline } slot = "icon-only" color="light"/>
          </IonButton>
          <div className='flex fl-center w-100 h-3'><IonImg class="p-menu" src="assets/img/logoSTNG.png" /></div>
          <IonButtons color='light' className='mr-05'>
            <IonMenuButton color= 'light' />
          </IonButtons>
        </div>

      <IonContent>
        {
          name === 'lics'
            ? <>
                <IonRefresher
                    slot="fixed" 
                    pullMin ={ 120 }              
                    onIonRefresh={handleRefresh}
                >
                    <IonRefresherContent
                      pullingIcon="arrow-down-outline"
                      pullingText="Потяните вниз для обновления"
                      refreshingSpinner="crescent"
                      refreshingText="Обновление..."
                    />
                </IonRefresher>        
            </>
            : <></>
        }
          
          <Main />

         <div className='p-footer'>
          <IonTabBar slot="bottom">

            <IonTabButton tab="services" href="/page/services"
              onClick={()=>{ hist.push('/page/services')}}
            >
              <IonIcon icon={ contractOutline } className='w-1 h-1'/>
              <div className='h-2'> Услуги </div>
            </IonTabButton>

            <IonTabButton tab="lics" href="/page/lics"
              onClick={()=>{ hist.push('/page/lics')}}
            >
                <IonIcon icon={ documentTextOutline } className='w-1 h-1'/>
              <div className='h-2'>Лицевые счета</div>
            </IonTabButton>
            
            <IonTabButton tab="news" href="/page/news"
              onClick={()=>{ hist.push('/page/news')}}
            >
              <IonIcon icon={ chatboxEllipsesOutline } className='w-1 h-1'/>
              <div className='h-2'>Новости объявления</div>
            </IonTabButton>
            
          </IonTabBar>
        </div> 
      </IonContent>
      <IonAlert
        header="Внимание!!!"
        message={"Вышло новое обновление приложения"}
        isOpen = { alert }
        onDidDismiss={()=> setAlert( false ) }
        buttons={[
          {
            text: 'Закрыть',
            role: 'cancel',
            handler: () => {
              console.log('Alert canceled');
            },
          },
          {
            text: 'Обновить',
            role: 'confirm',
            handler: () => {
              console.log('Обновить');
              if(isPlatform("android"))
                window.open("https://play.google.com/store/apps/details?id=io.ionic.stng")

              if(isPlatform("ios"))               
                window.open("itms-apps://apps.apple.com/ru/app/%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-%D1%81%D0%B0%D1%85%D0%B0%D1%82%D1%80%D0%B0%D0%BD%D1%81%D0%BD%D0%B5%D1%84%D1%82%D0%B5%D0%B3%D0%B0%D0%B7/id6445904988")

            },
          },
        ]}
      ></IonAlert>
      <IonAlert
        header="Ошибка"
        message={ error }
        isOpen = { error !== "" }
        onDidDismiss={()=> setError( "" ) }
        buttons={[
          {
            text: 'Закрыть',
            role: 'cancel',
            handler: () => {
              console.log('Alert canceled');
            },
          },
        ]}
      ></IonAlert>
    </IonPage>  
  );
};

export default Page;
