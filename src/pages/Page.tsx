import React, { useEffect, useState }        from 'react';
import { IonAlert, IonButton, IonButtons, IonContent, IonIcon, IonImg, IonMenuButton, IonPage, IonRefresher, IonRefresherContent, IonTabBar, IonTabButton, isPlatform, useIonRouter } from '@ionic/react';
import { useHistory, useParams, useLocation } from 'react-router';
import './Page.css';
import { Lics }           from '../components/Lics';
import { arrowBackOutline, chatboxEllipsesOutline, contractOutline, documentTextOutline } 
                          from 'ionicons/icons';
import { Profile }        from '../components/Profile/Profile';
import { Contacts }       from '../components/Contacts';
import { Appeals }        from '../components/Appeals';
import { useLicsStore }   from '../Store/licsStore';
import { useToken }       from '../Store/loginStore';
import { Apps }           from '../components/Apps';
import { Notifications }  from '../components/Notificications';
import { News }           from '../components/News';
import { Agzs }           from '../components/AGZS/AGZS';
import { Services }       from '../components/Services/Services';
import { useNavigation }  from './useNavigation';

const Page: React.FC = () => {
  const { goTo, goBack }  = useNavigation()

  const { name }          = useParams<{ name: string; }>();

  const getLics           = useLicsStore( state => state.getLics )

  const token             = useToken()

  console.log("page " + name)

  const lct = useLocation()

  function Main():JSX.Element {
    let elem = <></>
      switch ( name ) {

        case "":                  elem = <></>; break;
        case "lics":              elem = <Lics />; break;
        case "news":              elem = <News />; break;
        case "profile":           elem = <Profile />; break;
        case "agzs":              elem = <Agzs />; break;
        case "apps":              elem = <Apps />; break;
        // case "queye":             elem = <Queye />; break;
        case "bonuse":            elem = <></>; break; //<Bonuses name = { name }/>; break;
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
          getLics( token || '' )
          event.detail.complete();
        }, 1500);
    };

  return (
    <IonPage className='mt-2'>
        <div className={ isPlatform("ios") ? 'p-header flex fl-space mt-3' : "p-header flex fl-space" }>
          <IonButton
            fill = "clear"
            onClick = {()=>{ 
                goBack( name )
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
              onClick={()=>{ goTo('/page/services')}}
            >
              <IonIcon icon={ contractOutline } className='w-1 h-1'/>
              <div className='h-2'> Услуги </div>
            </IonTabButton>

            <IonTabButton tab="lics" href="/page/lics"
              onClick={()=>{ goTo('/page/lics')}}
            >
                <IonIcon icon={ documentTextOutline } className='w-1 h-1'/>
              <div className='h-2'>Лицевые счета</div>
            </IonTabButton>
            
            <IonTabButton tab="news" href="/page/push"
              onClick={()=>{ goTo('/page/push')}}
            >
              <IonIcon icon={ chatboxEllipsesOutline } className='w-1 h-1'/>
              <div className='h-2'>Уведомления</div>
            </IonTabButton>
            
          </IonTabBar>
        </div> 
      </IonContent>

    </IonPage>  
  );
};

export default Page;
