import React, { useEffect } from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Page from './pages/Page';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { Login } from './components/Login/Login';
import './app.css';
import { ToastProvider } from './components/Toast';
import { useAuthStore, useAuthUser } from './components/Login/authStore';
import { AppInitializer } from './utils/appInitializer';
import { ROUTES } from './routes';
import { RouterSync } from './pages/RouterSync';
import { getScreen } from './pages/screens';
import { Apps } from './components/Apps';
import { registerFcmToken, subscribeFcmTokenRefresh } from './utils/pushNotifications';

setupIonicReact();

const AuthenticatedApp: React.FC = () => {
  return (
    <IonSplitPane contentId="main">
      <Menu />
      <IonRouterOutlet id="main" animated={false} ionPage={true}>
        <Route exact path={ROUTES.root}>
          <Redirect to={ROUTES.lics} />
        </Route>
        <Route exact path={ROUTES.login}>
          <Redirect to={ROUTES.lics} />
        </Route>
        <Route exact path={ROUTES.registr}>
          <Redirect to={ROUTES.lics} />
        </Route>
        <Route
          path={ROUTES.appStatusPattern}
          exact={true}
          render={() => (
            <Page>
              <Apps />
            </Page>
          )}
        />
        <Route
          path="/page/:name"
          exact={true}
          render={({ match }) => {
            const name = match.params.name;
            const screen = getScreen(name);
            if (!screen) return <Redirect to={ROUTES.lics} />;
            const Screen = screen.Screen;
            return (
              <Page showRefresher={screen.showRefresher}>
                <Screen />
              </Page>
            );
          }}
        />
      </IonRouterOutlet>
    </IonSplitPane>
  );
};

const GuestApp: React.FC = () => {
  return (
    <IonRouterOutlet id="lg-main">
      <Route exact path={ROUTES.root} render={() => <Login reg={false} />} />
      <Route exact path={ROUTES.login} render={() => <Login reg={false} />} />
      <Route exact path={ROUTES.registr} render={() => <Login reg={true} />} />
    </IonRouterOutlet>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    document.documentElement.style.colorScheme = 'light';
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark');
  }, []);

  const auth = useAuthStore((state) => state.auth);
  const user = useAuthUser();

  useEffect(() => {
    if (user === null || !auth) return;
    const authToken = useAuthStore.getState().token;
    if (!authToken) return;

    let active = true;
    let removeRefreshListener: (() => void) | undefined;

    registerFcmToken(authToken).catch((error) => {
      console.error('FCM registration error:', error);
    });
    subscribeFcmTokenRefresh(() => useAuthStore.getState().token ?? '').then((remove) => {
      if (!active) {
        remove?.();
        return;
      }
      removeRefreshListener = remove;
    });

    return () => {
      active = false;
      removeRefreshListener?.();
    };
  }, [auth, user]);

  return (
    <>
      <AppInitializer />
      <IonApp>
        <ToastProvider>
          <IonReactRouter>
            <RouterSync />
            {auth ? <AuthenticatedApp /> : <GuestApp />}
          </IonReactRouter>
        </ToastProvider>
      </IonApp>
    </>
  );
};

export default App;
