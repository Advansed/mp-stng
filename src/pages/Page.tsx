import React from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonMenuButton,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTabBar,
  IonTabButton,
  IonToolbar,
  isPlatform,
} from '@ionic/react';
import { useParams } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import './Page.css';
import { Lics } from '../components/Lics';
import {
  arrowBackOutline,
  chatboxEllipsesOutline,
  contractOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { Profile } from '../components/Profile/Profile';
import { Contacts } from '../components/Contacts';
import { Appeals } from '../components/Appeals';
import { useLicsStore } from '../Store/licsStore';
import { useToken } from '../components/Login/authStore';
import { Apps } from '../components/Apps';
import { Notifications } from '../components/Notificications';
import { News } from '../components/News';
import { Agzs } from '../components/AGZS/AGZS';
import { Queye } from '../components/Queye';
import { Services } from '../components/Services/Services';
import { useNavigation } from './useNavigation';
import VideoPage from './VideoPage';

const Page: React.FC = () => {
  const { goTo, goBack } = useNavigation();

  const { name } = useParams<{ name: string }>();
  const appStatusMatch = useRouteMatch<{ appId: string }>('/page/apps/status/:appId');

  const getLics = useLicsStore((state) => state.getLics);
  const token = useToken();

  function Main(): JSX.Element {
    if (appStatusMatch?.params.appId) {
      return (
        <div className={isPlatform('ios') ? 'p-content-ios' : 'p-content'}>
          <Apps />
        </div>
      );
    }

    let elem = <></>;
    switch (name) {
      case '':
        elem = <></>;
        break;
      case 'lics':
        elem = <Lics />;
        break;
      case 'news':
        elem = <News />;
        break;
      case 'profile':
        elem = <Profile />;
        break;
      case 'agzs':
        elem = <Agzs />;
        break;
      case 'apps':
        elem = <Apps />;
        break;
      case 'queye':
        elem = <Queye />;
        break;
      case 'bonuse':
        elem = <></>;
        break;
      case 'services':
        elem = <Services />;
        break;
      case 'appeals':
        elem = <Appeals />;
        break;
      case 'contacts':
        elem = <Contacts />;
        break;
      case 'push':
        elem = <Notifications />;
        break;
      case 'video':
        elem = <VideoPage onNavigate={() => goTo('lics')} />;
        break;
      default:
        elem = <></>;
    }

    return (
      <div className={isPlatform('ios') ? 'p-content-ios' : 'p-content'}>
        {elem}
      </div>
    );
  }

  const handleRefresh = async (event: CustomEvent) => {
    setTimeout(() => {
      getLics(token || '');
      event.detail.complete();
    }, 1500);
  };

  return (
    <IonPage>
      {/* IonHeader / IonToolbar сами учитывают safe-area сверху */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="p-toolbar">
          <IonButtons slot="start">
            <IonButton
              onClick={() => {
                goBack(name || (appStatusMatch ? 'apps' : undefined));
              }}
            >
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
        {name === 'lics' ? (
          <IonRefresher slot="fixed" pullMin={120} onIonRefresh={handleRefresh}>
            <IonRefresherContent
              pullingIcon="arrow-down-outline"
              pullingText="Потяните вниз для обновления"
              refreshingSpinner="crescent"
              refreshingText="Обновление..."
            />
          </IonRefresher>
        ) : null}

        <Main />

        <div className="p-footer">
          <IonTabBar slot="bottom">
            <IonTabButton
              tab="services"
              href="/page/services"
              onClick={() => {
                goTo('/page/services');
              }}
            >
              <IonIcon icon={contractOutline} className="w-1 h-1" />
              <div className="h-2"> Услуги </div>
            </IonTabButton>

            <IonTabButton
              tab="lics"
              href="/page/lics"
              onClick={() => {
                goTo('/page/lics');
              }}
            >
              <IonIcon icon={documentTextOutline} className="w-1 h-1" />
              <div className="h-2">Лицевые счета</div>
            </IonTabButton>

            <IonTabButton
              tab="news"
              href="/page/push"
              onClick={() => {
                goTo('/page/push');
              }}
            >
              <IonIcon icon={chatboxEllipsesOutline} className="w-1 h-1" />
              <div className="h-2">Уведомления</div>
            </IonTabButton>
          </IonTabBar>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Page;
