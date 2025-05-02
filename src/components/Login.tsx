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
            <div className="l-header mt-1">
                <IonImg className="logo" src="assets/img/logoSTNG.png" alt="test"></IonImg>

                <IonText>
                    <p className="l-title">Авторизация</p>
                </IonText>
                <IonText>
                    <p className="l-text a-center ml-1 mr-1">
                        Если у Вас уже есть личный кабинет, пожалуйста авторизуйтесь.
                    </p>
                </IonText>
            </div>
            <div>
                <div className="l-input pl-1">
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
                <div className="l-input mt-1 flex">
                    <IonInput 
                        className="l-input-1 ml-1"
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

                <div className="ml-1 mr-1 l-button"
                    onClick={()=>{ Auth() }}
                >
                    Войти
                </div>        
            </div>

            <IonButton className="l-textURL ion-text-wrap" fill="clear"
                onClick={()=>{ setPage( 1 )}}
            > Забыли пароль? </IonButton>

            <div className="a-center">
                <IonText className="l-text"> Еще не зарегистрированы? </IonText>        
            </div>
                    
            <IonButton fill="clear" className="l-textURL ion-text-wrap" 
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
                     <p className="l-text a-center ml-1 mr-1">
                         Для восстановления пароля используйте номер вашего мобильного телефона
                     </p>
                 </IonText>
                 <div className="l-input pl-1">
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
 
                 <div className="ml-1 mr-1 l-button"
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
                 <IonButton className="l-textURL ion-text-wrap" fill="clear"
                     onClick={()=>{ setPage( page + 1 )}}                
                 >Пользовательское соглашение</IonButton>
 
                 <div className="a-center">
                     <IonText className="l-text">Уже зарегистрированы? </IonText>        
                 </div>
                     
                 <IonButton fill="clear" className="l-textURL ion-text-wrap" 
                     onClick={()=>{ 
                         Store.dispatch({type: "reg", reg : false })
                     }}
                 > Авторизируйтесь </IonButton>
             </div>
 
        }
 
        function Page2(){
 
             const elem = <>
                 <IonText>
                     <p className="l-text a-center ml-1 mr-1">
                         Для подтверждения телефона позвоните по этому номеру
                     </p>
                 </IonText>
                 <IonText>
                     <p className="l-title">{ order1.call }</p>
                 </IonText>                
                 <div className="ml-1 mr-1 l-button"
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
             </>
             return elem
        }
 
         function Page3(){
 
             const elem = <>
                 <IonText>
                     <p className="l-text a-center ml-1 mr-1">
                         Проверьте результат звонка 
                     </p>
                 </IonText>
                 <IonText>
                     <p className="l-title">{ order1.call }</p>
                 </IonText>      
                 <IonText >
                     <p className="ion-text-start error ml-1 cl-red">
                         { message }
                     </p>
                 </IonText>
                 <div className="ml-1 mr-1 l-button"
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
                            res.data.change = true
                            Store.dispatch({ type: "login", login: res.data })
                            Store.dispatch({ type: "auth",  auth: true })
                            setPage( 3 )
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
             </>
             return elem
         }
 

        const elem = <>
            <div className="l-header mt-1">
                <IonImg className="logo" src="assets/img/logoSTNG.png" alt="test"></IonImg>

                <IonText>
                    <p className="l-title">Восстановление пароля</p>
                </IonText>
                {/* <IonText>
                    <p className="l-text a-center ml-1 mr-1">
                        Если Вы забыли пароль введите номер телефона. Контрольная строка для пароля, а также регистрационные данные будут высланы по SMS. На Ваш номер телефона придет пароль
                    </p>
                </IonText> */}
            </div>

            {
                page === 1 
                    ? <Page1 />
                : page === 2 
                    ? <Page2 />
                : page === 3
                    ? <Page3 />
                : <></>
            }

        </>
        return elem
    }

    const elem = <>
        <IonLoading isOpen= { load } message={"Подождите..."}/>
        <div className={ isPlatform("ios") ? "l-background w-100 h-100 mt-3" : 'l-background w-100 h-100'}>
            <div className="l-container">
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


export function Registration():JSX.Element {
    const [ info, setInfo] = useState<any>({ id: "", phone: "", password: "", password1: "", terms: false, token: "", SMS: ""}) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ error, setError] = useState("")
    const [ upd, setUpd] = useState( 0 )
    const [ page, setPage] = useState( 0 )
    const [ load, setLoad] = useState( false) 

    async function Reg(){
        setLoad( true)
        setError("")
        if( info.token === "" ) {
            console.log(info)
            const res = await getData("registration", info )
            console.log(res)
            if(res.error) {
                setError( res.message)
                
            } else {
                info.token  = res.data.token;
                info.id     = res.data.guid;
                setUpd(upd + 1)
            }    
        } else {
            console.log(info)
            const res = await getData("registration", info )
            console.log(res)
            if(res.error) { info.SMS = "";setError(res.message) }
            else {
                if(res.message === "СМС верен") setUpd(upd + 1)
                else 
                if(res.message === "Пользователь создан") {
                    console.log( info )
                    Store.dispatch({ type: "login", login:  info })
                    Store.dispatch({ type: "auth",  auth:   true })
                }
                else {
                    info.SMS = "";
                    setUpd( upd + 1)
                }
            }
        }
        setLoad( false )
    }

    function Terms(){
        const elem = <>
            <div className="ml-1 mr-1 mt-1">
                <IonText className="a-center l-text">
                    <h4>Соглашение на обработку персональных данных</h4>
                </IonText>
                <IonText className="l-text">
                    <p>
                        Я, согласно ФЗ «О персональных данных» от 27.07.2006 г. № 152-ФЗ, даю согласие на обработку оператору персональных данных: АО «Сахатранснефтегаз», ИНН 1432172972, находящему по адресу: 677027, Республика Саха(Якутия),
                        г. Якутск, ул. Кирова, д. 18, корпус В, офис 501 и даю СОГЛАСИЕ на обработку своих персональных данных, то есть совершение, в том числе, следующих действий (сбор, запись, систематизацию, накопление, хранение, 
                        уточнение, обновление, изменение, извлечение, использование, передачу, предоставление, доступ, обезличивание, блокирование, удаление, уничтожение, трансграничную передачу) с целью оказания Оператором услуг 
                        в соответствии с заключенным(и) договором(ами), а так же оказания Оператором иных услуг, на исполнение которых заключение договоров не требуется, путем совершения действий с персональными данными с использованием 
                        средств автоматизации или без использования таких средств в информационных системах и вне этих систем.
                    </p>
                    <p>Я уведомлен и согласен с тем, что для оказания Оператором услуг и улучшения их качества мои 
                        персональные данные могут быть переданы работникам Оператора в рамках исполнения их служебных обязанностей, иным организациям, учреждениям, органам, если это необходимо для исполнения заключенного(ых) 
                        договора(ов), и в иных установленных законодательством Российской Федерации случаях в течение 5 лет после прекращения договора(ов).
                    </p>
                    <p>Настоящее Согласие действует с даты его подписания в 
                        течение всего срока обработки персональных данных и оказания Оператором услуг. Согласие может быть отозвано путем письменного уведомления, подписываемого в присутствии уполномоченного представителя Оператора, 
                        либо с нотариальным засвидетельствованием подлинности подписи, и считается отозванным с даты получения такого уведомления Оператором.
                    </p>
                    <p>Я извещен, что предоставление мною неполной, неточной и недостоверной информации и отзыв Согласия могут повлечь невозможность оказания услуг Оператором.</p>
                    <p>Я согласен на получение смс (sms) и иных сообщений от Оператора, а также на проведение телефонного обзвона в целях контроля качества услуг Оператора и работы его представителей.</p>
                    <p>Я извещен о том, что по письменному запросу имею право на получение информации, касающейся обработки его персональных данных (в соответствии с п. 4 ст. 14 Федерального закона от 27.07.2006 г. № 152 –ФЗ).
                    </p>
                </IonText>
                <div className="ml-1 mr-1 l-button"
                    onClick={()=>{
                        setPage( 0 )
                    }}
                >
                    Закрыть
                </div>    
            </div>
        </>
        return elem
    }

    function Body(){
        const [ page,       setPage ]       = useState( 0 )
        const [ message,    setMessage ]    = useState("")
        const [ order,      setOrder ]      = useState( { call:   "", id:     "" } )
        const [ load,       setLoad ]       = useState( false )
        const [ upd,        setUpd ]        = useState( 0 )

        function Page1(){
            
           return <div>
                <IonText>
                    <p className="l-text a-center ml-1 mr-1">
                        Регистрация нового пользователя
                    </p>
                    <p className="l-text a-center ml-1 mr-1">
                        Для регистрации используйте номер вашего мобильного телефона
                    </p>
                </IonText>
                <div>
                    <IonText>
                        <p className="l-text a-center ml-1 mr-1">
                            * - Обязательное поле для заполнения
                        </p>
                    </IonText>
                </div>
                <div className="l-input pl-1">
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
                <div className="ml-1 mr-1 pt-1">
                    <IonCheckbox
                        justify="start"
                        labelPlacement="end"
                        mode="ios"
                        className="l-checkbox"
                        value={ info.terms }
                        onIonChange={(e)=>{
                            info.terms = e.detail.checked
                            setInfo(info)                            
                        }}
                    >
                        <span className="wrap">Согласен(-на) на обработку персональных данных</span>
                    </IonCheckbox>
                </div>

                <IonText >
                    <p className="ion-text-start error ml-1 cl-red">
                        
                        { message }
                    </p>
                </IonText>

                <div className="ml-1 mr-1 l-button"
                    onClick={ async ()=>{

                        setLoad( true )
                        console.log( info )
                        const res = await getData("getPhone", {
                            phone:      info.phone,
                            type:     "registration"
                        })
                        console.log(res)
                        if(!res.error){
                            if( res.data.status_code === 100 ){
                                setOrder({ call: res.data.call_phone, id: res.data.check_id })
                                setPage( 1 )
                                setMessage("")
                            }
                            else {
                                setMessage( res.message )
                                setUpd( upd + 1)
                            }
                                
                        } else {
                            setMessage( res.message )
                            setUpd( upd + 1)
                        }
                        setLoad( false)

                    }}
                >
                    Запросить звонок
                </div>        
                <IonButton className="l-textURL ion-text-wrap" fill="clear"
                    onClick={()=>{ setPage( page + 1 )}}                
                >Пользовательское соглашение</IonButton>

                <div className="a-center">
                    <IonText className="l-text">Уже зарегистрированы? </IonText>        
                </div>
                    
                <IonButton fill="clear" className="l-textURL ion-text-wrap" 
                    onClick={()=>{ 
                        Store.dispatch({type: "reg", reg : false })
                    }}
                > Авторизируйтесь </IonButton>
            </div>

        }

        function Page2(){

            const elem = <>
                <IonText>
                    <p className="l-text a-center ml-1 mr-1">
                        Для подтверждения телефона позвоните по этому номеру
                    </p>
                </IonText>
                <IonText>
                    <p className="l-title">{ order.call }</p>
                </IonText>                
                <div className="ml-1 mr-1 l-button"
                    onClick={ async ()=>{
                        console.log(order )
                        console.log("Звонок")
                        window.open('tel:' + order.call )
                        setMessage("")
                        setPage( 2 )
                    }}
                >
                    Звонок
                </div>        
            </>
            return elem
        }

        function Page3(){

            const elem = <>
                <IonText>
                    <p className="l-text a-center ml-1 mr-1">
                        Проверьте результат звонка 
                    </p>
                </IonText>
                <IonText>
                    <p className="l-title">{ order.call }</p>
                </IonText>      
                <IonText >
                    <p className="ion-text-start error ml-1 cl-red">
                        { message }
                    </p>
                </IonText>
                <div className="ml-1 mr-1 l-button"
                    onClick={ async ()=>{
                        setLoad( true)
                        console.log( order )
                        const res = await getData("checkPhone", {
                            id:     order.id,
                            type:   "registration"
                        })
                        console.log( res )
                        if( res.status_code === 100){
                            if( res.check_status === 401){
                                setMessage("")
                                setPage( 3 )
                            } else 
                                setMessage( res.check_status_text)
                        } else {
                            setMessage( "Ошибка связи... проверьте еще раз через некоторое время")
                        }

                        console.log( res )
                        setLoad( false)
                    }}
                >
                    Проверить
                </div>        
            </>
            return elem
        }

        function Page4(){

            const elem = <>
                <IonText>
                    <p className="l-text a-center ml-1 mr-1">
                        Для завершения регистрации введите пароль и подтвердите его
                    </p>
                </IonText>
                <IonText >
                    <p className="ion-text-start error ml-1 cl-red">
                        { message }
                    </p>
                </IonText>
                <div className="l-input">
                    <IonInput 
                        className="ml-1"
                        placeholder="Пароль" value={ info?.password } type="password"  
                        onIonChange={(e)=>{
                            info.password = e.target.value as string;
                            setInfo( info )
                        }}
                    />
                </div>
                <div className="l-input mt-1">
                    <IonInput 
                        className="ml-1"
                        placeholder="Повторите пароль" value={ info?.password1 } type="password"  
                        onIonChange={(e)=>{
                            info.password1 = e.target.value as string;
                            setInfo( info )
                        }}
                    />
                </div>
                <IonText >
                    <p className="ion-text-start error ml-1 cl-red">
                        { message }
                    </p>
                </IonText>

                <div className="a-center mt-1">
                    <IonButton
                        expand  = "block"
                        mode    = "ios"
                        onClick={async ()=>{
                            setLoad( true)
                            setMessage("")
                            if(info.password === info.password1){
                                const res = await getData("registration1", info )
                                if(!res.error){
                                    Store.dispatch({type: "login", login : res.data })
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
            <IonLoading isOpen = { load } message={ "Подождите..." }/>
            <div className="l-header mt-1">
                <IonImg className="logo" src="assets/img/logoSTNG.png" alt="test"></IonImg>

                <IonText>
                    <p className="l-title">Регистрация</p>
                </IonText>
            </div>
            {
                  page === 0
                    ? <Page1 />
                : page === 1
                    ? <Page2 />
                : page === 2
                    ? <Page3 />
                : page === 3
                    ? <Page4 />
                : <></>
            }
            <div className=" ml-1 l-text">
                <p>{ error }</p>
            </div>


        </>

        return elem
    }

    const elem = <>
        <IonLoading isOpen = { load } message={"Подождите..."}/>
        <div className={ isPlatform("ios") ? "l-background w-100 h-100 mt-3" : 'l-background w-100 h-100'}>
            <div className="l-container">
                {
                    page === 0
                        ? <Body /> 
                    : page === 1 
                        ? <Terms />
                    : <></>

                }
            </div>
        </div>
    </>
    return elem
}


export function Registration1():JSX.Element {
    const [ info, setInfo] = useState<any>({ id: "", phone: "", password: "", password1: "", terms: false, token: "", SMS: ""}) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ error, setError] = useState("")
    const [ upd, setUpd] = useState( 0 )
    const [ page, setPage] = useState( 0 )
    const [ load, setLoad] = useState( false) 

    async function Reg(){
        setLoad( true)
        setError("")
        if( info.token === "" ) {
            console.log(info)
            const res = await getData("registration", info )
            console.log(res)
            if(res.error) {
                setError( res.message)
                
            } else {
                info.token  = res.data.token;
                info.id     = res.data.guid;
                setUpd(upd + 1)
            }    
        } else {
            console.log(info)
            const res = await getData("registration", info )
            console.log(res)
            if(res.error) { info.SMS = "";setError(res.message) }
            else {
                if(res.message === "СМС верен") setUpd(upd + 1)
                else 
                if(res.message === "Пользователь создан") {
                    console.log( info )
                    Store.dispatch({ type: "login", login:  info })
                    Store.dispatch({ type: "auth",  auth:   true })
                }
                else {
                    info.SMS = "";
                    setUpd( upd + 1)
                }
            }
        }
        setLoad( false )
    }

    function Terms(){
        const elem = <>
            <div className="ml-1 mr-1 mt-1">
                <IonText className="a-center l-text">
                    <h4>Соглашение на обработку персональных данных</h4>
                </IonText>
                <IonText className="l-text">
                    <p>
                        Я, согласно ФЗ «О персональных данных» от 27.07.2006 г. № 152-ФЗ, даю согласие на обработку оператору персональных данных: АО «Сахатранснефтегаз», ИНН 1432172972, находящему по адресу: 677027, Республика Саха(Якутия),
                        г. Якутск, ул. Кирова, д. 18, корпус В, офис 501 и даю СОГЛАСИЕ на обработку своих персональных данных, то есть совершение, в том числе, следующих действий (сбор, запись, систематизацию, накопление, хранение, 
                        уточнение, обновление, изменение, извлечение, использование, передачу, предоставление, доступ, обезличивание, блокирование, удаление, уничтожение, трансграничную передачу) с целью оказания Оператором услуг 
                        в соответствии с заключенным(и) договором(ами), а так же оказания Оператором иных услуг, на исполнение которых заключение договоров не требуется, путем совершения действий с персональными данными с использованием 
                        средств автоматизации или без использования таких средств в информационных системах и вне этих систем.
                    </p>
                    <p>Я уведомлен и согласен с тем, что для оказания Оператором услуг и улучшения их качества мои 
                        персональные данные могут быть переданы работникам Оператора в рамках исполнения их служебных обязанностей, иным организациям, учреждениям, органам, если это необходимо для исполнения заключенного(ых) 
                        договора(ов), и в иных установленных законодательством Российской Федерации случаях в течение 5 лет после прекращения договора(ов).
                    </p>
                    <p>Настоящее Согласие действует с даты его подписания в 
                        течение всего срока обработки персональных данных и оказания Оператором услуг. Согласие может быть отозвано путем письменного уведомления, подписываемого в присутствии уполномоченного представителя Оператора, 
                        либо с нотариальным засвидетельствованием подлинности подписи, и считается отозванным с даты получения такого уведомления Оператором.
                    </p>
                    <p>Я извещен, что предоставление мною неполной, неточной и недостоверной информации и отзыв Согласия могут повлечь невозможность оказания услуг Оператором.</p>
                    <p>Я согласен на получение смс (sms) и иных сообщений от Оператора, а также на проведение телефонного обзвона в целях контроля качества услуг Оператора и работы его представителей.</p>
                    <p>Я извещен о том, что по письменному запросу имею право на получение информации, касающейся обработки его персональных данных (в соответствии с п. 4 ст. 14 Федерального закона от 27.07.2006 г. № 152 –ФЗ).
                    </p>
                </IonText>
                <div className="ml-1 mr-1 l-button"
                    onClick={()=>{
                        setPage( 0 )
                    }}
                >
                    Закрыть
                </div>    
            </div>
        </>
        return elem
    }

    function Body(){

        function Page1(){
            
           return <div>
                <div>
                    <IonText>
                        <p className="l-text a-center ml-1 mr-1">
                            * - Обязательное поле для заполнения
                        </p>
                    </IonText>
                </div>
                <div className="l-input pl-1">
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
                <div className="ml-1 mr-1 pt-1">
                    <IonCheckbox
                        justify="start"
                        labelPlacement="end"
                        mode="ios"
                        className="l-checkbox"
                        value={ info.terms }
                        onIonChange={(e)=>{
                            info.terms = e.detail.checked
                            setInfo(info)                            
                        }}
                    >
                        <span className="wrap">Согласен(-на) на обработку персональных данных</span>
                    </IonCheckbox>
                </div>

                <IonText >
                    <p className="ion-text-start error ml-1 cl-red">
                        { error }
                    </p>
                </IonText>

                <div className="ml-1 mr-1 l-button"
                    onClick={()=>{
                        Reg()
                    }}
                >
                    Зарегистрироваться
                </div>        
                <IonButton className="l-textURL ion-text-wrap" fill="clear"
                    onClick={()=>{ setPage( page + 1 )}}                
                >Пользовательское соглашение</IonButton>

                <div className="a-center">
                    <IonText className="l-text">Уже зарегистрированы? </IonText>        
                </div>
                    
                <IonButton fill="clear" className="l-textURL ion-text-wrap" 
                    onClick={()=>{ 
                        Store.dispatch({type: "reg", reg : false })
                    }}
                > Авторизируйтесь </IonButton>
            </div>

        }

        function Page2(){

            const elem = <>
                <div className="l-input">
                    <IonInput 
                        className="ml-1"
                        placeholder="SMS" value={ info?.SMS } type="text"  
                        onIonInput={(e)=>{
                            info.SMS = e.detail.value
                            if( info.SMS.length > 3 ) Reg()
                        }}
                    />
                </div>
            </>
            return elem
        }

        function Page3(){

            const elem = <>
                <div className="l-input">
                    <IonInput 
                        className="ml-1"
                        placeholder="Пароль" value={ info?.password } type="password"  
                        onIonChange={(e)=>{
                            info.password = e.target.value as string;
                            setInfo( info )
                        }}
                    />
                </div>
                <div className="l-input mt-1">
                    <IonInput 
                        className="ml-1"
                        placeholder="Повторите пароль" value={ info?.password1 } type="password"  
                        onIonChange={(e)=>{
                            info.password1 = e.target.value as string;
                            setInfo( info )
                        }}
                    />
                </div>

                <div className="a-center mt-1">
                    <IonButton
                        onClick={()=>{
                            setError("")
                            if(info.password === info.password1){
                                Reg();
                                Store.dispatch({type: "login", login : info })
                                Store.dispatch({type: "auth", auth: true })
                            } else setError( "Пароли не совпадают")
                        }}
                    >
                        Подтвердить   
                    </IonButton>
                </div>

            </>
            return elem
        }

        const elem = <>
            <div className="l-header mt-1">
                <IonImg className="logo" src="assets/img/logoSTNG.png" alt="test"></IonImg>

                <IonText>
                    <p className="l-title">Регистрация</p>
                </IonText>
                <IonText>
                    <p className="l-text a-center ml-1 mr-1">
                        Регистрация нового пользователя
                    </p>
                    <p className="l-text a-center ml-1 mr-1">
                        Для регистрации используйте номер вашего мобильного телефона
                    </p>
                </IonText>
            </div>
            {
                info.token === ""
                    ? <Page1 />
                : info.SMS !== ""
                    ? <Page3 />
                    : <Page2 />
            }
            <div className=" ml-1 l-text">
                <p>{ error }</p>
            </div>


        </>

        return elem
    }

    const elem = <>
        <IonLoading isOpen = { load } message={"Подождите..."}/>
        <div className={ isPlatform("ios") ? "l-background w-100 h-100 mt-3" : 'l-background w-100 h-100'}>
            <div className="l-container">
                {
                    page === 0
                        ? <Body /> 
                    : page === 1 
                        ? <Terms />
                    : <></>

                }
            </div>
        </div>
    </>
    return elem
}