// URL базовый адрес API
export const URL = "https://fhd.aostng.ru/inter_vesta/hs/API_STNG/V2/";

interface FetchResponse {
  error: boolean;
  data?: any;
  message: string;
}

export async function fetchData(
  method: string, 
  params: any
): Promise<FetchResponse> {
  try {
    const res = await fetch(URL + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, method })
    });

    const data = await res.json();

    if (data.error) {
      // Диспатч ошибки в Store если нужно
      // Store.dispatch({ type: "error", error: data.message });
      return { error: true, message: data.message, data: data.data };
    }

    return { error: false, message: '', data: data.data };
  } catch (error) {
    const msg = `Сервер не отвечает (${(error as Error).message})`;
    // Store.dispatch({ type: "error", error: msg });
    return { error: true, message: msg };
  }
}

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