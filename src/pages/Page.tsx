import React from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonMenuButton,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonToolbar,
  isPlatform,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import './Page.css';
import {
  arrowBackOutline,
  chatboxEllipsesOutline,
  contractOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { useLicsStore } from '../Store/licsStore';
import { useToken } from '../components/Login/authStore';
import { useNavigation } from './useNavigation';
import { ROUTES } from '../routes';

interface PageProps {
  children: React.ReactNode;
  showRefresher?: boolean;
}

const tabs = [
  { path: ROUTES.services, label: 'Услуги', icon: contractOutline },
  { path: ROUTES.lics, label: 'Лицевые счета', icon: documentTextOutline },
  { path: ROUTES.push, label: 'Уведомления', icon: chatboxEllipsesOutline },
];

const Page: React.FC<PageProps> = ({ children, showRefresher }) => {
  const { goBack, goTo } = useNavigation();
  const location = useLocation();
  const getLics = useLicsStore((state) => state.getLics);
  const token = useToken();

  const handleRefresh = async (event: CustomEvent) => {
    setTimeout(() => {
      getLics(token || '');
      event.detail.complete();
    }, 1500);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="p-toolbar">
          <IonButtons slot="start">
            <IonButton onClick={() => goBack()}>
              <IonIcon icon={arrowBackOutline} slot="icon-only" color="light" />
            </IonButton>
          </IonButtons>

          <div className="p-toolbar-logo">
            <IonImg className="p-menu" src="assets/img/logoSTNG.png" />
          </div>

          <IonButtons slot="end">
            <IonMenuButton color="light" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {showRefresher ? (
          <IonRefresher slot="fixed" pullMin={120} onIonRefresh={handleRefresh}>
            <IonRefresherContent
              pullingIcon="arrow-down-outline"
              pullingText="Потяните вниз для обновления"
              refreshingSpinner="crescent"
              refreshingText="Обновление..."
            />
          </IonRefresher>
        ) : null}

        <div className={isPlatform('ios') ? 'p-content-ios' : 'p-content'}>
          {children}
        </div>
      </IonContent>

      <IonFooter className="ion-no-border p-footer">
        <nav className="p-tabbar">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              type="button"
              className={
                location.pathname === tab.path ? 'p-tabbtn selected' : 'p-tabbtn'
              }
              onClick={() => goTo(tab.path)}
            >
              <IonIcon icon={tab.icon} className="w-1 h-1" />
              <div className="h-2">{tab.label}</div>
            </button>
          ))}
        </nav>
      </IonFooter>
    </IonPage>
  );
};

export default Page;
