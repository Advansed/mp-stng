
import { combineReducers  }         from 'redux'
import axios                        from 'axios'
import { Reducer, useEffect, useState }                  from 'react';
import localForage                  from "localforage";
import { createBrowserHistory }     from 'history';
const hist = createBrowserHistory();

export function setItem( key, value ){
    localForage.setItem( key, value )
}

interface respData {

    error:      boolean,
    data:       any,
    message:    string

}

export async function getItem( key ){
    try {
        const value = await localForage.getItem( key );
        return value
    } catch (err) {
        // This code runs if there were any errors.
        console.log(err);
        return null
    }

}

const reducers: Array<Reducer<any, any>> = [] // eslint-disable-line @typescript-eslint/no-explicit-any


export const listeners: Array<any>  = [] // eslint-disable-line @typescript-eslint/no-explicit-any


export const version = '2.3.8'


export const i_state = {

    auth:                               false,
    reg:                                false, 
    route:                              "",
    login:                              "",
    back:                               0,
    profile:                            "",
    lics:                               [],
    apps:                               [],   
    pred:                               [],
    notices:                            [],
    appeals:                            [],  
    services:                           [],  
    error:                              "",
    card:                               new Object()

}


for(const [key, value] of Object.entries(i_state)){
    reducers.push(
        function (state = i_state[key], action) {
            switch(action.type){
                case key: {
                    if(typeof(value) === "object"){
                        if(Array.isArray(value)) {
                            return action[key]
                        } else {
                            return action[key]
                        }

                    } else return action[key]
                }
                default: return state;
            }       
        }

    )
}


export async function   getData(method : string, params){

    // params.method = method;

    // try {
    //     const data: respData = await ky.post(URL + method, {
            
    //         json: params,

    //         timeout: 10000 // например, таймаут 10 секунд, можно убрать или настроить

    //     }).json();

    //     if (data.error) {

    //         Store.dispatch({ type: "error", error: data.message });

    //     }

    //     return data;

    // } catch (error: any) {

    //     console.log(error);

    //     Store.dispatch({ type: "error", error: "Сервер не отвечает (" + error.message + ")" });

    //     return { error: true, message: "Сервер не отвечает (" + error.message + ")" };

    // }

    params.method = method
    const res = await axios.post(
            URL + method, params
    ).then(response => response.data)
        .then((data) => {
            if(data.error)
                Store.dispatch({type: "error", error:  data.message })
            return data
        }).catch(error => {
          console.log(error)
          Store.dispatch({type: "error", error: "Cервер не отвечает (" + error.message + ")" })
          return {error: true, message: "Cервер не отвечает (" + error.message + ")" }
        })

    return res

}

export async function   getCameras(){

    const res = await axios.get(
            'https://aostng.ru/api/v2/camera/get'
    ).then(response => response.data)
        .then((data) => {
            if(data.error) console.log(data) 
            return data
        }).catch(error => {
          console.log(error)
          return {error: true, message: error}
        })
    return res

}

export async function   getData1C(method : string, params){

    const res = await axios.post(
            URL + method, params
    ).then(response => response.data)
        .then((data) => {
            if(data.Код === 200) console.log(data) 
            return data
        }).catch(error => {
          console.log(error)
          return {error: true, message: error}
        })
    return res

}

function                create_Store(reducer, initialState) {
    const currentReducer = reducer;
    let currentState = initialState;
    
    return {
        getState() {
            return currentState;
        },
        dispatch(action) {
            currentState = currentReducer(currentState, action);
            listeners.forEach((elem)=>{
                if(elem.type === action.type){
                    elem.func();
                }
            })
            return action;
        },
        subscribe(listen: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            const ind = listeners.findIndex(function(b) { 
                return b.num === listen.num; 
            });
            if(ind >= 0){
                listeners[ind] = listen;
            }else{
                listeners.push( listen )
            }
        },
        unSubscribe(index) {
           const ind = listeners.findIndex(function(b) { 
                return b.num === index; 
            });
            if(ind >= 0){
                listeners.splice(ind, 1)
            }   
            
        }
    };
}


const reduct: any = {}


Object.keys(i_state).map((e, i)=>{ reduct[e] = reducers[i]})


const                   rootReducer = combineReducers( reduct )


export const Store   =  create_Store(rootReducer, i_state)

//export const URL = "https://fhd.aostng.ru/vesta_storage/hs/API_STNG/V2/"
export const URL = "https://fhd.aostng.ru/inter_vesta/hs/API_STNG/V2/"
//export const URL = "https://fhd.aostng.ru/node/"



export function Phone(phone): string {
    if(phone === undefined) return ""
    if(phone === null) return ""
    let str = "+"
    for(let i = 0;i < phone.length;i++){
      const ch = phone.charCodeAt(i)
      if( ch >= 48 && ch <= 57) str = str + phone.charAt(i)
    }
    return str
}

export async function   KemVydan( str ){

    const res = await axios.post(
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fms_unit", {
            query: str
        }, {
            headers: {
                "Content-Type":     "application/json",
                "Accept":           "application/json",
                "Authorization":    "Token 50bfb3453a528d091723900fdae5ca5a30369832",
            }
        }
    ).then(response => response.data)
    .then((data) => {
        return data
    })
return res
}

export async function   FIO(query){
    const res = await axios.post(
        URL + "checkFIO", { fio: query }
).then(response => response.data)
    .then((data) => {
        if(data.Код === 200) console.log(data) 
        return data
    }).catch(error => {
      console.log(error)
      return {Код: 200}
    })
return res

}

export async function   getProfile( params){
    console.log( params )
    const res = await getData("profile", params)
    console.log(res)
    if(res.error) console.log(res.message)
    else Store.dispatch({ type: "profile", profile: res.data})
}

export async function   getLics( params){
    const res = await getData("getAccount", params)
    console.log(res)
    if(res.error) console.log(res.message)
    else res.data.forEach(elem => {
        elem.sum = elem.debts.reduce(function(a, b){
            return a + b.sum;
        }, 0);
        elem.sum = parseFloat( elem.sum.toFixed(2)) 
    }); 
    if(res.error) console.log(res.message)
    else Store.dispatch({ type: "lics", lics: res.data})
}

export async function   getApps( params){
    const res = await getData("ListServices", params)
    console.log(res)
    if(res.error) console.log(res.message)
    else Store.dispatch({ type: "apps", apps: res.data})
}

export async function   getNews( page ){
    const res = await axios.get(
        "https://aostng.ru/api/v2/news/all/page/" + page.toFixed(0)
    ).then(response => response.data)
        .then((data) => {
            return data
        }).catch(error => {
            console.log(error)
            return {status: true, message: error, data: undefined }
        })
    return res
}

export async function   getNewsDetail( id ){
    const res = await axios.get(
        "https://aostng.ru/api/v2/news/" + id.toFixed(0) + "/"
    ).then(response => response.data)
        .then((data) => {
            return data
        }).catch(error => {
            console.log(error)
            return {status: true, message: error, data: undefined }
        })
    return res
}

export async function   getNotice( page ){
    const res = await axios.get(
        "https://aostng.ru/api/v2/notice/all/page/" + page.toFixed(0) + "/"
    ).then(response => response.data)
        .then((data) => {
            return data
        }).catch(error => {
            console.log(error)
            return {status: true, message: error, data: undefined }
        })
    return res
}

export async function   getNoticeDetail( id ){
    const res = await axios.get(
        "https://aostng.ru/api/v2/notice/" + id.toFixed(0) + "/"
    ).then(response => response.data)
        .then((data) => {
            return data
        }).catch(error => {
            console.log(error)
            return {status: true, message: error, data: undefined }
        })
    return res
}

export async function   getNotifications( page ){
    const res = await getData("GetNotifications", {
        token: Store.getState().login.token,
        page : page
    })
    console.log("notification")
    console.log(res)
    if(!res.error) Store.dispatch({ type: "notices", notices: res.data})

}

export async function   getAppeals(){
    const res = await getData("getChannels", {
        token: Store.getState().login.token
    })
    if(!res.error) Store.dispatch({ type: "appeals", appeals: res.data})
}

export async function   getServices() {

    const res = await getData("S_Details", {
        token: Store.getState().login.token
    })
    console.log( res )
    if(!res.error) Store.dispatch({ type: "services", services: res.data })

}

export async function Client(){
    const res = await getData("spClient", {
        token: Store.getState().login.token
    })
    console.log( res )
    if(!res.error) Store.dispatch({ type: "card", card: res.data })
}


function goProfile(){
    hist.push("/page/profile")
    console.log("change")
}

Store.subscribe({ num: 1002, type: "auth", func: ()=>{
    const login = Store.getState().login
    const params = { token: Store.getState().login.token }

    if( login.change ) goProfile()

    getLics( params )
    getProfile( params )
    getApps( params )
    getServices(  );
    getNotifications( 0 )

}})