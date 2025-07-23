import React, { useState } from "react"
import { getData, Store } from "./Store"
import { IonButton, IonCheckbox, IonImg, IonInput, IonLoading, IonText } from "@ionic/react"
import MaskedInput from "../mask/reactTextMask"
import { isPlatform } from "@ionic/core"

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

    function Body(){
        const [ page,       setPage ]       = useState( 0 )
        const [ message,    setMessage ]    = useState("")
        const [ order,      setOrder ]      = useState( { call:   "", id:     "" } )
        const [ load,       setLoad ]       = useState( false )
        const [ upd,        setUpd ]        = useState( 0 )

        function Terms(){
            const elem = <>
                <div className="ml-1 mr-1 mt-1">
                    <IonText className="a-center login-text">
                        <h4>Соглашение на обработку персональных данных</h4>
                    </IonText>
                    <IonText className="login-text">
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
                    <div className="ml-1 mr-1 login-button"
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
    
        function Page1(){
            
           return <div>
                <IonText>
                    <p className="login-text a-center ml-1 mr-1">
                        Регистрация нового пользователя
                    </p>
                    <p className="login-text a-center ml-1 mr-1">
                        Для регистрации используйте номер вашего мобильного телефона
                    </p>
                </IonText>
                <div>
                    <IonText>
                        <p className="login-text a-center ml-1 mr-1">
                            * - Обязательное поле для заполнения
                        </p>
                    </IonText>
                </div>
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
                <div className="ml-1 mr-1 pt-1">
                    <IonCheckbox
                        justify="start"
                        labelPlacement="end"
                        mode="ios"
                        className="login-checkbox"
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

                <div className="ml-1 mr-1 login-button"
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
                <IonButton className="login-text-url ion-text-wrap" fill="clear"
                    onClick={()=>{ setPage( 4 )}}                
                >Пользовательское соглашение</IonButton>

                <div className="a-center">
                    <IonText className="login-text">Уже зарегистрированы? </IonText>        
                </div>
                    
                <IonButton fill="clear" className="login-text-url ion-text-wrap" 
                    onClick={()=>{ 
                        Store.dispatch({type: "reg", reg : false })
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
                    <p className="login-title">{ order.call }</p>
                </IonText>                
                <div className="ml-1 mr-1 login-button"
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
                    <p className="login-text a-center ml-1 mr-1">
                        Проверьте результат звонка 
                    </p>
                </IonText>
                <IonText>
                    <p className="login-title">{ order.call }</p>
                </IonText>      
                <IonText >
                    <p className="ion-text-start error ml-1 cl-red">
                        { message }
                    </p>
                </IonText>
                <div className="ml-1 mr-1 login-button"
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
                    <p className="login-text a-center ml-1 mr-1">
                        Для завершения регистрации введите пароль и подтвердите его
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
                        placeholder="Пароль" value={ info?.password } type="password"  
                        onIonChange={(e)=>{
                            info.password = e.target.value as string;
                            setInfo( info )
                        }}
                    />
                </div>
                <div className="login-input mt-1">
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
            <div className="login-header mt-1">
                <IonImg className="login-logo" src="assets/img/logoSTNG.png" alt="test"></IonImg>

                <IonText>
                    <p className="login-title">Регистрация</p>
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
                : page === 4
                    ? <Terms />
                : <></>
            }
            <div className=" ml-1 login-text">
                <p>{ error }</p>
            </div>


        </>

        return elem
    }

    const elem = <>
        <IonLoading isOpen = { load } message={"Подождите..."}/>
        <div className={ isPlatform("ios") ? "login-background w-100 h-100 mt-3" : 'login-background w-100 h-100'}>
            <div className="login-container">
                {
                    page === 0
                        ? <Body /> 
                    : <></>

                }
            </div>
        </div>
    </>
    return elem
}
