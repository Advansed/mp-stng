
import { combineReducers  } from 'redux'
import axios from 'axios'
import { Reducer } from 'react';

const reducers: Array<Reducer<any, any>> = [] // eslint-disable-line @typescript-eslint/no-explicit-any

const listeners: Array<any>  = [] // eslint-disable-line @typescript-eslint/no-explicit-any

export const version = '2.1.3'

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
    params.method = method
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

export async function   getCameras(){

    const res = await axios.get(
            'https://api.aostng.ru/api/v2/camera/get'
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

const                   rootReducer = combineReducers({

    auth:                      reducers[0],
    reg:                       reducers[1],
    route:                     reducers[2],
    login:                     reducers[3],
    back:                      reducers[4],
    profile:                   reducers[5],
    lics:                      reducers[6],
    apps:                      reducers[7],
    pred:                      reducers[8],
    notices:                   reducers[9],

})

export const Store   =  create_Store(rootReducer, i_state)

//export const URL = "https://fhd.aostng.ru/vesta_storage/hs/API_STNG/V2/"
export const URL = "https://fhd.aostng.ru/inter_vesta/hs/API_STNG/V2/"


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
    const res = await getData("profile", params)
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
        elem.sumto = elem.debtsto.reduce(function(a, b){
            return a + b.sum;
        }, 0);
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

export async function getNotifications( page ){
    const res = await getData("GetNotices", {
        token: Store.getState().login.token,
        page : page
    })
    console.log(res)
    if(!res.error) Store.dispatch({ type: "notices", notices: res.data})
}

Store.subscribe({ num: 1001, type: "login", func: ()=>{

    getLics({ token: Store.getState().login.token })
    getProfile({ token: Store.getState().login.token })
    getApps({ token: Store.getState().login.token })
    getNotifications( 0 )

}})