// URL базовый адрес API
export const URL = "https://fhd.aostng.ru/inter_vesta/hs/API_STNG/V2";

export const version = '2.4.2'

interface FetchResponse {
  error: boolean;
  data?: any;
  message: string;
}

export const api = async (endpoint: string, data: any) => {
    const res = await fetch(`${URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const getVersion = async() => {
    const res = await fetch('getVersion', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    return res.json()
};


// Для 1C API
export async function fetchData1C(
  method: string, 
  params: any
): Promise<any> {
  try {
    const res = await fetch(URL + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    
    if (data.Код === 200) console.log(data);
    
    return data;
  } catch (error) {
    console.log(error);
    return { Код: 200 };
  }
}


export async function getCameras() {
    try {
        const response = await fetch('https://aostng.ru/api/v2/camera/get');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.log(data);
        }
        
        return data;
    } catch (error) {
        console.log(error);
        return { error: true, message: error };
    }
}
