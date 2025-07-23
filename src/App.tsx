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
import { Store } from './components/Store';
import { Login } from './components/Login';
import OneSignal from 'onesignal-cordova-plugin'
import './app.css'
import { Registration } from './components/Registration';

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

  App.propTypes = {
    location: PropTypes.shape({
      hash: PropTypes.string.isRequired,
    }).isRequired,
  };
  
  App.defaultProps = {
    location: {
      hash: '',
    },
  };

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
      : <IonApp>
      <IonReactRouter>
          <IonRouterOutlet id="lg-main">
            <Route path="/" 
              render={(props) => { 
                if(props.location.hash === ''){
                  return <Login />
                }
                if(props.location.hash === '#/registr'){
                  Store.dispatch({type: "reg", reg: true })
                  return <Login />
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
                      Store.dispatch({type: "login", login: login })
                      Store.dispatch({type: "auth", auth: true })
                      return <></>    
                    } else return <Login />
                  } else return <Login />
                } 
              }}
            /> 
            <Route path="/login" exact={true}>
              <Login />
            </Route>
          </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>

  );
};

export default App;
