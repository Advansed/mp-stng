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
import { useAuth, useReg, useSetReg, useSetUser, useUser } from './Store/loginStore';
import { version, getVersion } from './Store/api';
import { RegistrationForm } from './components/Login/RegistrationForm';

setupIonicReact();

const App: React.FC = () => {
  const  auth     = useAuth()
  const  reg      = useReg()
  const  user     = useUser()
  const  setReg   = useSetReg()
  const  setUser  = useSetUser()
  const [ alert, setAlert ]   = useState( false )
  
  console.log(auth, reg )

  function OneSignalInit(): void {
    console.log(" OneSignalInit start")

    OneSignal.initialize( "daff2bee-e428-4bd3-9f47-ac3c914113d6" );
    console.log(" OneSignalInit  initialized")

    const myClickListener = async function(event) {
          const notificationData = JSON.stringify(event);
          console.log( notificationData )
      };
    OneSignal.Notifications.addEventListener("click", myClickListener);
    
    OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {
      console.log("User accepted notifications: " + accepted);
    })

    console.log(" OneSignalInit  login")
    OneSignal.login( user?.id || '' )
    console.log(" OneSignalInit  addAlias")
    OneSignal.User.addAlias("external_id", user?.id || '')
    
    console.log( OneSignal.User )
  }

  async function check() {
    console.log("check")
    const res = await getVersion()
    console.log(res)
    if( res.message !== version ){
      console.log('alert')
      setAlert( true )
    }
  }

  useEffect(()=>{
   
    if( auth ) check
    
    if( !user ) 
      if( isPlatform("mobile") )
      try {
        OneSignalInit(); 
      } catch (error) {
        console.log( JSON.stringify( error ) );
      }
       
  },[auth, user])
  
  return (
    auth
      ? <> 
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

      </>
      : reg 
        ? <Login reg = { reg } />
        : <>
          <IonApp>
            <ToastProvider>
              <IonReactRouter>
                  <IonRouterOutlet id="lg-main">
                    <Route path="/" 
                      render={(props: { location: { hash: string } }) => { 
                        if(props.location.hash === ''){
                          return <Login reg = { false } />
                        }
                        if(props.location.hash === '#/registr'){
                          setReg( true )
                          return <Login  reg = { false}/>
                        } else {
                          let jarr  = props.location.hash.split("?");
                          
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

                          if(jarr.length > 1) {
                            if(jarr[0] === '#/auth'){
                              jarr = jarr[1].split("&")
                              console.log( jarr )
                              const login:any = new Object
                              for( let i = 0;i < jarr.length;i++){
                                const para = jarr[i].split("=")
                                login[ para[0] ] = para[1]
                              }

                              login.borders = { from: login?.from, to: login?.to }
                              console.log( login )

                              setUser( login )

                              return <></>    
                            } else return <Login reg = { false}/>
                          } else return <Login reg = { false } />
                        } 
                      }}
                    /> 
                    <Route path="/login" exact={true}>
                      <Login reg = { false }/>
                    </Route>
                  </IonRouterOutlet>
              </IonReactRouter>
            </ToastProvider>
          </IonApp>
        </>

  );
};

export default App;
