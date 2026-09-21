// URL базовый адрес API
export const URL = "https://fhd.aostng.ru/inter_vesta/hs/API_STNG/V2";

export const version = '2.5.6'

interface RequestJsonOptions {
  method?: string;
  params?: unknown;
  headers?: HeadersInit;
}

export async function requestJson(
  name: string,
  url: string,
  options: RequestJsonOptions = {}
) {
  const method = options.method ?? 'GET';
  const init: RequestInit = {
    method,
    headers: options.headers ?? { 'Content-Type': 'application/json' },
  };

  if (method !== 'GET' && options.params !== undefined) {
    init.body = JSON.stringify(options.params);
  }

  console.log(`[API] ${name} request`, { url, method, params: options.params });

  try {
    const res = await fetch(url, init);
    const data = await res.json();
    console.log(`[API] ${name} response`, { status: res.status, data });
    return data;
  } catch (error) {
    console.error(`[API] ${name} error`, { url, params: options.params, error });
    throw error;
  }
}

export const api = async (endpoint: string, data: any) => {
  return requestJson(endpoint, `${URL}/${endpoint}`, {
    method: 'POST',
    params: data,
  });
};

export const getVersion = async () => {
  return requestJson('getVersion', `${URL}/getVersion`);
};


// Для 1C API
export async function fetchData1C(
  method: string,
  params: any
): Promise<any> {
  try {
    return await requestJson(method, URL + method, {
      method: 'POST',
      params,
    });
  } catch (error) {
    console.error('Error in fetchData1C:', error);
    return { Код: 200 };
  }
}


export async function getCameras() {
  try {
    const data = await requestJson('getCameras', 'https://aostng.ru/api/v2/camera/get');

    if (data.error) {
      console.error('Error in getCameras response:', data);
    }

    return data;
  } catch (error) {
    console.error('Error in getCameras:', error);
    return { error: true, message: error };
  }
}
