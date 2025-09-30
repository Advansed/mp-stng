// URL базовый адрес API
export const URL = "https://fhd.aostng.ru/inter_vesta/hs/API_STNG/V2";

export const version = '2.3.8'

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