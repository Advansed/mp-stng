import React from 'react';
import {
  IonContent,
  IonIcon,
  IonImg,
  IonMenu,
  IonMenuToggle,
  isPlatform,
} from '@ionic/react';

import { callOutline, callSharp, contractOutline, contractSharp, documentSharp, documentTextOutline, exitOutline, exitSharp, 
    notificationsCircleOutline, 
    notificationsCircleSharp, 
    notificationsOutline, notificationsSharp, pencilOutline, pencilSharp, personOutline, personSharp, ribbonOutline, 
    ribbonSharp, videocamOutline, videocamSharp } from 'ionicons/icons';
    
import './Menu.css';
import { version } from '../Store/api';
import { useNavigation } from '../pages/useNavigation';
import { useAuthStore } from './Login/authStore';
import { ROUTES } from '../routes';
import { useNavigateStore } from '../Store/navigateStore';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Личные данные',
    url: ROUTES.profile,
    iosIcon: personOutline,
    mdIcon: personSharp
  },
  {
    title: 'Лицевые счета',
    url: ROUTES.lics,
    iosIcon: documentTextOutline,
    mdIcon: documentSharp
  },
  {
    title: 'Услуги',
    url: ROUTES.services,
    iosIcon: contractOutline,
    mdIcon: contractSharp
  },
  {
    title: 'Договора, заявки',
    url: ROUTES.apps,
    iosIcon: pencilOutline,
    mdIcon: pencilSharp
  },
  {
    title: 'Мониторинг эл. очередь',
    url: ROUTES.queye,
    iosIcon: notificationsCircleOutline,
    mdIcon: notificationsCircleSharp
  },
  {
    title: 'Мониторинг АГЗС',
    url: ROUTES.agzs,
    iosIcon: videocamOutline,
    mdIcon: videocamSharp
  },
  {
    title: 'Уведомления',
    url: ROUTES.push,
    iosIcon: notificationsOutline,
    mdIcon: notificationsSharp
  },
  {
    title: 'Видео инструкция',
    url: ROUTES.video,
    iosIcon: callOutline,
    mdIcon: callSharp
  },
  {
    title: 'Контакты',
    url: ROUTES.contacts,
    iosIcon: callOutline,
    mdIcon: callSharp
  },
  {
    title: 'Выйти',
    url: ROUTES.exit,
    iosIcon: exitOutline,
    mdIcon: exitSharp
  }

];

const Menu: React.FC = () => {
  const { setAuth } = useAuthStore()
  const clearHistory = useNavigateStore((state) => state.clearHistory)
  const { goTo } = useNavigation();

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <div className={ isPlatform("ios") ? 'layer-1 mt-3' : "layer-1"}>
          <IonImg  src="assets/img/pattern2.png" />
        </div>
        <div className={ isPlatform("ios") ? 'layer-2 mt-3' : 'layer-2'}>
          <div className='m-header flex fl-space'>
              <div className='flex fl-center w-100 h-3'><IonImg class="p-menu" src="assets/img/logoSTNG.png" /></div>
          </div>
            {appPages.map((appPage, index) => {
              return (
                <IonMenuToggle key={index} autoHide={false}>
                  <div className='flex ml-1 mr-1 mt-1'
                    onClick={()=>{ 
                      if( appPage.url === ROUTES.exit ){

                        localStorage.removeItem( "stngul.phone" )
                        localStorage.removeItem( "stngul.pass" )
                        clearHistory()
                        setAuth( false )
                      } 
                        
                      else goTo( appPage.url )
                    }}
                  >
                     <div >
                        <IonIcon icon = { appPage.iosIcon } className='w-15 h-15' color="light"/>
                     </div>
                     <div className='ml-1 cl-white'>
                        <b>{ appPage.title }</b>
                     </div>
                  </div>
                </IonMenuToggle>
              );
            })}
          <div className='mt-3 cl-white ml-1'>
            { "Версия " + version }
          </div>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
