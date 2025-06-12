import { IonButton, IonCheckbox, IonHeader, IonIcon, IonImg, IonInput, IonLoading, IonText, isPlatform } from "@ionic/react"
import React, { useState, useEffect } from "react"
import { Phone, Store, getData, version } from "./Store"
import "./Login.css"
import MaskedInput from "../mask/reactTextMask"
import { arrowBackOutline, eyeOffOutline, eyeOutline } from "ionicons/icons"


export function Login() {
    
    const [ info,   setInfo]    = useState<any>({ phone: "", password: "", version: version, mode: "android"}) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ error,  setError]   = useState("")
    const [ upd,    setUpd]     = useState( 0 )
    const [ message, setMessage ] = useState( "" )
    const [ load,   setLoad ]   = useState( false)
    const [ page,   setPage ]   = useState( 0 )
    const [ order1, setOrder1 ] = useState({ call: "", id: "" })
    const [ namer,  setNamer ]  = useState( "Проверить" )

    useEffect(()=>{

        const login = localStorage.getItem("stngul.phone") 
        const pass = localStorage.getItem("stngul.pass") 

        if( login !== null && pass !== null){
            info.phone = login; info.password = pass
            setInfo( info )
            setUpd( upd + 1)
        }   
    },[])

    async function Auth() {
        setLoad( true)
        if (info?.password === "" || info?.phone === "") {

          setError("Заполните поля!");

        } else {

            const res = await getData("authorization", info)
            console.log(res)
            if(!res.error){

                localStorage.setItem( "stngul.phone", info.phone )
                localStorage.setItem( "stngul.pass", info.password )

                Store.dispatch({type: "login", login: res.data})    
                Store.dispatch({type: "auth", auth: true })


            } else {
                if(res.message === "Пароль не верен"){
                    info.password = ""
                } else { info.password = ""; info.phone = ""}
                
                setInfo( info )
                setError( res.message )
                setUpd(upd + 1)
            }
        }

        setLoad( false )
    }

    function Body(){
        const [ show, setShow ] = useState(false)

        const elem = <>
            <div className="login-header mt-1">
                <IonImg className="login-logo" src="assets/img/logoSTNG.png" alt="test"></IonImg>

                <IonText>
                    <p className="login-title">Авторизация</p>
                </IonText>
                <IonText>
                    <p className="login-text a-center ml-1 mr-1">
                        Если у Вас уже есть личный кабинет, пожалуйста авторизуйтесь.
                    </p>
                </IonText>
            </div>
            <div>
                <div className="login-input pl-1">
                    <MaskedInput
                        mask={['+', /[7]/, '(', /\d/, /\d/, /\d/, ')', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
                        className="m-input"
                        id='1'
                        value={ info?.phone }
                        placeholder = "Телефон"
                        type='text'
                        onChange={(e) => {
                            info.phone = e.target.value as string;
                                setInfo( info )
                        }}
                    />
                </div>
                <div className="login-input mt-1 flex">
                    <IonInput 
                        className="login-input-field ml-1"
                        placeholder="Пароль" 
                        value={ info?.password} 
                        type={ show ? "text" : "password" }
                        onIonChange={(e)=>{
                            info.password = e.target.value;
                            setInfo( info )
                        }}
                    />
                    <IonIcon icon = { show ? eyeOutline : eyeOffOutline } color="primary" className="w-15 h-15 mr-1"
                        onClick={()=>{
                            setShow(!show)
                        }}
                    />
                </div>

                <IonText >
                    <p className="ion-text-start error ml-1 cl-red">
                        { error }
                    </p>
                </IonText>

                <div className="ml-1 mr-1 login-button"
                    onClick={()=>{ Auth() }}
                >
                    Войти
                </div>        
            </div>

            <IonButton className="login-text-url ion-text-wrap" fill="clear"
                onClick={()=>{ setPage( 1 )}}
            > Забыли пароль? </IonButton>

            <div className="a-center">
                <IonText className="login-text"> Еще не зарегистрированы? </IonText>        
            </div>
                    
            <IonButton fill="clear" className="login-text-url ion-text-wrap" 
                onClick={()=>{ 
                    Store.dispatch({type: "reg", reg : true })
                }}
            > Пройдите регистрацию </IonButton>

            <div className="cl-white fs-09 ml-1 mt-4">
                { "Версия " + version }
            </div>
        </>     
        
        return elem
    }

    function Restore(){

        async function Restore(){
            setLoad( true)
            const res = await getData("Restore", info )        
            if(res.error) setError( res.message )
            else {
                setError("")
                setPage( 0 )
            }
            setLoad( false)
        }

        function Page1(){
            
            return <div>
                 <IonText>
                     <p className="login-text a-center ml-1 mr-1">
                         Для восстановления пароля используйте номер вашего мобильного телефона
                     </p>
                 </IonText>
                 <div className="login-input pl-1">
                     <MaskedInput
                         mask={['+', /[1-9]/, '(', /\d/, /\d/, /\d/, ')', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
                         className="m-input"
                         id='4'
                         value={ info?.phone }
                         placeholder = "Телефон"
                         type='text'
                         onChange={(e) => {
                             info.phone = e.target.value as string;
                                 setInfo( info )
                         }}
                     />
                 </div>
 
                 <IonText >
                     <p className="ion-text-start error ml-1 cl-red">
                         
                         { message }
                     </p>
                 </IonText>
 
                 <div className="ml-1 mr-1 login-button"
                     onClick={ async ()=>{
 
                         setLoad( true )
                         console.log( info )
                         const res = await getData("getPhone", {
                             phone:     info.phone,
                             type:      "restore",
                         })
                         console.log( res )
                         if(!res.error){
                            if( res.data.status_code === 100 ){
                                console.log( "call: " + res.data.call_phone )
                                console.log( "id: " + res.data.check_id )
                                setOrder1({ call: res.data.call_phone, id: res.data.check_id })
                                setPage( 2 )
                                setMessage("")
                            }
                            else {
                                setMessage( res.message )
                                setUpd( upd + 1)
                            }   
                         } else {
                            console.log("error message")
                            setMessage( res.message )
                            setUpd( upd + 1)
                         }
                             
                         setLoad( false)
 
                     }}
                 >
                     Запросить звонок
                 </div>        
                 <IonButton className="login-text-url ion-text-wrap" fill="clear"
                     onClick={()=>{ setPage( page + 1 )}}                
                 >Пользовательское соглашение</IonButton>
 
                 <div className="a-center">
                     <IonText className="login-text">Уже зарегистрированы? </IonText>        
                 </div>
                     
                 <IonButton fill="clear" className="login-text-url ion-text-wrap" 
                     onClick={()=>{ 
                         //Store.dispatch({type: "reg", reg : false })
                         setPage(0)
                     }}
                 > Авторизируйтесь </IonButton>
             </div>
 
        }
 
        function Page2(){
 
             const elem = <>
                 <IonText>
                     <p className="login-text a-center ml-1 mr-1">
                         Для подтверждения телефона позвоните по этому номеру
                     </p>
                 </IonText>
                 <IonText>
                     <p className="login-title">{ order1.call }</p>
                 </IonText>                
                 <div className="ml-1 mr-1 login-button"
                     onClick={ async ()=>{
                        console.log("Звонок")
                        console.log( order1 )
                        window.open('tel:' + order1.call )
                         setMessage("")
                         setPage( 3 )
                     }}
                 >
                     Звонок
                 </div>       

                 <IonButton className="login-text-url ion-text-wrap" fill="clear"
                     onClick={()=>{ setPage( page + 1 )}}                
                 >Пользовательское соглашение</IonButton>
 
                 <div className="a-center">
                     <IonText className="login-text">Уже зарегистрированы? </IonText>        
                 </div>
                     
                 <IonButton fill="clear" className="login-text-url ion-text-wrap" 
                     onClick={()=>{ 
                         //Store.dispatch({type: "reg", reg : false })
                         setPage(0)
                     }}
                 > Авторизируйтесь </IonButton>
 
             </>
             return elem
        }
 
        function Page3(){
 
             const elem = <>
                 <IonText>
                     <p className="login-text a-center ml-1 mr-1">
                         Чтобы проверить результат звонка нажмите кнопку проверить 

                     </p>
                 </IonText>
                 {/* <IonText>
                     <p className="login-title">{ order1.call }</p>
                 </IonText>       */}
                 <IonText >
                     <p className="ion-text-start error ml-1 cl-red">
                         { message }
                     </p>
                 </IonText>
                 <div className="ml-1 mr-1 login-button"
                     onClick={ async ()=>{

                         setLoad( true)

                         console.log( info )

                         const res = await getData("checkPhone", {
                            phone:  info.phone,
                            id:     order1.id,
                            type:   "restore"
                         })

                         console.log( res )

                         if(!res.error){
                            Store.dispatch({ type: "login", login: res.data })
                            // Store.dispatch({ type: "auth",  auth: true })
                            setPage( 4 )
                        } else {
                            setMessage( res.message )
                            setNamer( "Повторить" )
                        }

                         console.log( res )

                         setLoad( false)

                     }}
                 >
                     { namer }
                 </div>     
                 <IonButton className="login-text-url ion-text-wrap" fill="clear"
                     onClick={()=>{ setPage( page + 1 )}}                
                 >Пользовательское соглашение</IonButton>
 
                 <div className="a-center">
                     <IonText className="login-text">Уже зарегистрированы? </IonText>        
                 </div>
                     
                 <IonButton fill="clear" className="login-text-url ion-text-wrap" 
                     onClick={()=>{ 
                         //Store.dispatch({type: "reg", reg : false })
                         setPage(0)
                     }}
                 > Авторизируйтесь </IonButton>
   
             </>
             return elem
        }
 
        function Page4(){
            const [ mode, setMode ] = useState({
                token:      Store.getState().login.token,
                password:   "",    
                password1:  ""
            })

            const elem = <>
                <IonText>
                    <p className="login-text a-center ml-1 mr-1">
                        Для завершения восстановления пароля введите пароль и подтвердите его
                    </p>
                </IonText>
                <IonText >
                    <p className="ion-text-start error ml-1 cl-red">
                        { message }
                    </p>
                </IonText>
                <div className="login-input">
                    <IonInput 
                        className="ml-1"
                        placeholder="Пароль" value={ mode?.password } type="password"  
                        onIonChange={(e)=>{
                            mode.password = e.target.value as string;
                            setMode( mode )
                        }}
                    />
                </div>
                <div className="login-input mt-1">
                    <IonInput 
                        className="ml-1"
                        placeholder="Повторите пароль" value={ mode?.password1 } type="password"  
                        onIonChange={(e)=>{
                            mode.password1 = e.target.value as string;
                            setMode( mode )
                        }}
                    />
                </div>

                <div className="a-center mt-1">
                    <IonButton
                        expand  = "block"
                        mode    = "ios"
                        onClick={async ()=>{
                            setLoad( true)
                            setMessage("")
                            if(mode.password === mode.password1){

                                const res = await getData("profile", mode )

                                console.log( res )

                                if(!res.error){

                                    Store.dispatch({type: "auth", auth: true })    

                                }

                            } else setMessage( "Пароли не совпадают")
                            setLoad( false )
                        }}
                    >
                        Подтвердить   
                    </IonButton>
                </div>

            </>
            return elem
        }

        const elem = <>
            <div className="login-header mt-1">
                <IonImg className="login-logo" src="assets/img/logoSTNG.png" alt="test"></IonImg>

                <IonText>
                    <p className="login-title">Восстановление пароля</p>
                </IonText>
            </div>

            {
                page === 1 
                    ? <Page1 />
                : page === 2 
                    ? <Page2 />
                : page === 3
                    ? <Page3 />
                : page === 4
                    ? <Page4 />
                : <></>
            }

        </>
        return elem
    }

    const elem = <>
        <IonLoading isOpen= { load } message={"Подождите..."}/>
        <div className={ isPlatform("ios") ? "login-background w-100 h-100 mt-3" : 'login-background w-100 h-100'}>
            <div className="login-container">
                {
                    page === 0
                        ? <Body />
                    : <Restore />
                }
            </div>
        </div>
    </>

    return elem

}
