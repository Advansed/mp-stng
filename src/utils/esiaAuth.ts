import { AuthUser } from '../components/Login/authStore';

export type EsiaHashResult =
  | { kind: 'registr' }
  | { kind: 'user'; user: AuthUser }
  | null;

function parseQuery(query: string): Record<string, string> {
  const data: Record<string, string> = {};
  for (const part of query.split('&')) {
    const eq = part.indexOf('=');
    const key = eq === -1 ? part : part.slice(0, eq);
    const raw = eq === -1 ? '' : part.slice(eq + 1);
    if (!key) continue;
    try {
      data[key] = decodeURIComponent(raw);
    } catch {
      data[key] = raw;
    }
  }
  return data;
}

export function parseEsiaHash(hash: string): EsiaHashResult {
  if (!hash || hash === '#' || hash === '#/') return null;
  if (hash === '#/registr') return { kind: 'registr' };

  const qIndex = hash.indexOf('?');
  const path = qIndex === -1 ? hash : hash.slice(0, qIndex);
  const query = qIndex === -1 ? '' : hash.slice(qIndex + 1);

  if (path !== '#/auth' || !query) return null;

  const loginData = parseQuery(query);

  let surname = '';
  let name = '';
  let lastname = '';

  if (loginData.name) {
    const nameParts = loginData.name.trim().split(/\s+/);
    if (nameParts.length >= 1) surname = nameParts[0];
    if (nameParts.length >= 2) name = nameParts[1];
    if (nameParts.length >= 3) lastname = nameParts.slice(2).join(' ');
  }

  const user: AuthUser = {
    id: loginData.id || '',
    email: loginData.email || '',
    name: name || loginData.name || '',
    surname: surname || '',
    lastname: lastname || '',
    phone: loginData.phone || loginData.code || loginData.login || '',
    token: loginData.token || '',
    code: loginData.code || loginData.phone || '',
    monthes: loginData.monthes ? parseInt(loginData.monthes, 10) : undefined,
    borders:
      loginData.from && loginData.to
        ? {
            from: parseInt(loginData.from, 10) || 20,
            to: parseInt(loginData.to, 10) || 25,
          }
        : undefined,
  };

  return { kind: 'user', user };
}
