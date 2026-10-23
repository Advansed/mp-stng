export function deleteToken() {
  return Promise.resolve(false);
}

export function getMessaging() {
  return {};
}

export function getToken() {
  return Promise.reject(new Error('firebase/messaging is not configured for web'));
}

export function isSupported() {
  return Promise.resolve(false);
}

export function onMessage() {
  return function unsubscribe() {};
}
