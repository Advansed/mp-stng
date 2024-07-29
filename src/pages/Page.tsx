import React, { useEffect, useState }        from 'react';
import { IonAlert, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonImg, IonMenuButton, IonPage, IonTabBar, IonTabButton, isPlatform } from '@ionic/react';
import { useHistory, useParams, useLocation } from 'react-router';
import './Page.css';
import { Lics }     from '../components/Lics';
import { arrowBackOutline, chatboxEllipsesOutline, contractOutline, createOutline, documentTextOutline } from 'ionicons/icons';
import { Store, getData, version }    from '../components/Store';
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

  const { name } = useParams<{ name: string; }>();

  const lct = useLocation()

  async function check() {
    const res = await getData("getVersion", {})
    console.log(res.message + " = " + version )
    if( res.message !== version ){
      setAlert( true )
    }
}


  useEffect(()=>{

    if( !lct.pathname.includes("page")){
      Store.dispatch({ type: "auth", auth: false})
    } 

    
  },[name])

  useEffect(()=>{
    
    check()

  },[])

const hist  = useHistory();

  Store.subscribe({ num: 3, type: "route", func: ()=>{

    const route = Store.getState().route;

    if( route === "back") {
      hist.goBack()
    }
    else {
        hist.push( route )
    }
  
  }})
  
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
      <div className='p-content'>
        { elem }
      </div>
    </>
  }


  return (
    <IonPage>
      <IonHeader>
        <div className='p-header flex fl-space'>
          <IonButton
            fill = "clear"
            onClick = {()=>{ 
                Store.dispatch({ type: "back", back: Store.getState().back + 1})
            }}
          >
            <IonIcon icon = { arrowBackOutline } slot = "icon-only" color="light"/>
          </IonButton>
          <div className='flex fl-center w-100 h-3'><IonImg class="p-menu" src="assets/img/logoSTNG.png" /></div>
          <IonButtons color='light' className='mr-05'>
            <IonMenuButton color= 'light' />
          </IonButtons>
        </div>
      </IonHeader>

      <IonContent className='p-content'>
        <Main />
        <div className='p-footer'>
          <IonTabBar slot="bottom">
            {/* <IonTabButton tab="home" href="/home">
              <IonIcon icon={ homeOutline } mode = "ios" />
              <IonLabel>Меню</IonLabel>
            </IonTabButton> */}

            <IonTabButton tab="services" href="/page/services">
              <IonIcon icon={ contractOutline } className='w-1 h-1'/>
              <div className='h-2'> Услуги </div>
            </IonTabButton>

            <IonTabButton tab="lics" href="/page/lics">
              <IonIcon icon={ documentTextOutline } className='w-1 h-1'/>
              <div className='h-2'>Лицевые счета</div>
            </IonTabButton>

            <IonTabButton tab="queye" href="/page/queye">
              <IonIcon icon={ createOutline } className='w-1 h-1'/>
              <div className='h-2'>E-запись</div>
            </IonTabButton>

            <IonTabButton tab="news" href="/page/news">
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
            },
          },
        ]}
      ></IonAlert>
    </IonPage>  );
};

export default Page;
