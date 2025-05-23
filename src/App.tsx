import React, { useEffect, useState } from 'react';
import { IonApp, IonPage, IonRouterOutlet, IonSplitPane, isPlatform, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, useLocation } from 'react-router-dom';
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
import { Store } from './components/Store';
import { Login, Registration } from './components/Login';
import OneSignal from 'onesignal-cordova-plugin'
import './app.css'

setupIonicReact();

const App: React.FC = () => {
  const [ auth, setAuth ] = useState( Store.getState().auth )
  const [ reg,  setReg ]  = useState( Store.getState().reg )

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
    OneSignal.login( Store.getState().login.id )
    console.log(" OneSignalInit  addAlias")
    OneSignal.User.addAlias("external_id", Store.getState().login.id)
    
    console.log( OneSignal.User )
  }

  useEffect(()=>{
    setAuth( Store.getState().auth ) 
  }, [])

  Store.subscribe({ num: 1, type: "auth", func: ()=>{
    setAuth( Store.getState().auth ) 
    if( Store.getState().auth)
     if( isPlatform("mobile") )
      try {
        OneSignalInit(); 
      } catch (error) {
        console.log( JSON.stringify( error ) );
      }
       
    
  }})

  Store.subscribe({ num: 2, type: "reg", func: ()=>{
    setReg( Store.getState().reg ) 
  }})
  
  return (
    auth
      ?  <IonApp>
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
      </IonApp>
      : reg 
      ? <Registration />
      : <Login />

  );
};

export default App;
