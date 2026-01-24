import React, { useEffect, useState } from 'react';
import { IonAlert, IonApp, IonPage, IonRouterOutlet, IonSplitPane, isPlatform, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, useLocation } from 'react-router-dom';
import Menu from './components/Menu';
import Page from './pages/Page';
import PropTypes from "prop-types";

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
import OneSignal from 'onesignal-cordova-plugin'
import './app.css'
import { ToastProvider } from './components/Toast';
import { useAuthStore, useAuthUser, AuthUser } from './components/Login/authStore';
import { AppInitializer } from './utils/appInitializer';

setupIonicReact();

const App: React.FC = () => {
  const  auth     = useAuthStore( state => state.auth )
  const  reg      = useAuthStore( state => state.reg )
  const  user     = useAuthUser()
  const  setReg   = useAuthStore( state => state.setReg )
  const  setUser  = useAuthStore( state => state.setUser )

  function OneSignalInit(): void {
    OneSignal.initialize( "daff2bee-e428-4bd3-9f47-ac3c914113d6" );

    const myClickListener = async function(event) {
          const notificationData = JSON.stringify(event);
      };
    OneSignal.Notifications.addEventListener("click", myClickListener);
    
    OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {
      console.log("notification permission", accepted)
    })

    OneSignal.login( user?.id || '' )
    OneSignal.User.addAlias("external_id", user?.id || '')
  }

  useEffect(() => {
    if (user !== null && auth) {
      try {
        OneSignalInit();
      } catch (error) {
        console.error('OneSignal initialization error:', error);
      }
    }
  }, [auth, user])
  
  return (
    <>
      <AppInitializer />
      {auth ? (
        <> 
          <IonApp>
            <ToastProvider>
              <IonReactRouter>
                <IonSplitPane contentId="main">
                  <Menu />
                  <IonRouterOutlet 
                    id="main"
                    animated = { false }
                    ionPage = { true }

                  >
                    <Route path="/" exact={true}>
                      <Redirect to="/page/lics" />
                    </Route>
                    <Route 
                      path="/page/:name" 
                      exact={true}
                    render={({match})=><>
                        <Page key = { match.params.name  }/>
                      </>}
                    >
                      
                    </Route>
                  </IonRouterOutlet>
                </IonSplitPane>
              </IonReactRouter>
            </ToastProvider>
          </IonApp>
        </>
      ) : reg ? (
        <Login reg={reg} />
      ) : (
        <>
          <IonApp>
            <ToastProvider>
              <IonReactRouter>
                <IonRouterOutlet id="lg-main">
                  <Route
                    path="/"
                    render={(props: { location: { hash: string } }) => {
                      if (props.location.hash === '') {
                        return <Login reg={false} />;
                      }
                      if (props.location.hash === '#/registr') {
                        setReg(true);
                        return <Login reg={false} />;
                      } else {
                        let jarr = props.location.hash.split('?');

                        //: "id=3B6C3787-B6E5-8C0C-11EE-463951FE3224
                        // &code=+79142227300
                        // &phone=+79142227300
                        // &name=%D0%90%D1%82%D0%BB%D0%B0%D1%81%D0%BE%D0%B2%20%D0%9D%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B9%20%D0%A0%D1%83%D1%81%D0%BB%D0%B0%D0%BD%D0%BE%D0%B2%D0%B8%D1%87
                        // &email=atlasov.n.r@gmail.com
                        // &token=71E32EA2-B25A-49FE-A67B-1313904F958E
                        // &consenttoemail=true
                        // &consenttosms=0
                        // &borders=[object%20Object]
                        // &monthes=0
                        // &login=79142227300"

                        if (jarr.length > 1) {
                          if (jarr[0] === '#/auth') {
                            jarr = jarr[1].split('&');
                            const loginData: any = {};
                            for (let i = 0; i < jarr.length; i++) {
                              const para = jarr[i].split('=');
                              const key = para[0];
                              const value = decodeURIComponent(para[1] || '');
                              loginData[key] = value;
                            }

                            // Разбиваем полное имя на части (если есть)
                            let surname = '';
                            let name = '';
                            let lastname = '';

                            if (loginData.name) {
                              const nameParts = loginData.name.trim().split(/\s+/);
                              if (nameParts.length >= 1) surname = nameParts[0];
                              if (nameParts.length >= 2) name = nameParts[1];
                              if (nameParts.length >= 3)
                                lastname = nameParts.slice(2).join(' ');
                            }

                            // Создаем объект AuthUser
                            const authUser: AuthUser = {
                              id: loginData.id || '',
                              email: loginData.email || '',
                              name: name || loginData.name || '',
                              surname: surname || '',
                              lastname: lastname || '',
                              phone:
                                loginData.phone ||
                                loginData.code ||
                                loginData.login ||
                                '',
                              token: loginData.token || '',
                              code: loginData.code || loginData.phone || '',
                              monthes: loginData.monthes
                                ? parseInt(loginData.monthes)
                                : undefined,
                              borders:
                                loginData.borders ||
                                (loginData.from && loginData.to
                                  ? {
                                      from: parseInt(loginData.from) || 20,
                                      to: parseInt(loginData.to) || 25,
                                    }
                                  : undefined),
                            };

                            setUser(authUser);

                            return <></>;
                          } else return <Login reg={false} />;
                        } else return <Login reg={false} />;
                      }
                    }}
                  />
                  <Route path="/login" exact={true}>
                    <Login reg={false} />
                  </Route>
                </IonRouterOutlet>
              </IonReactRouter>
            </ToastProvider>
          </IonApp>
        </>
      )}
    </>
  );
};

export default App;
