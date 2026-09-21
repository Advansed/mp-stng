export const ROUTES = {
  root: '/',
  login: '/login',
  registr: '/registr',
  lics: '/page/lics',
  news: '/page/news',
  profile: '/page/profile',
  agzs: '/page/agzs',
  apps: '/page/apps',
  appStatusPattern: '/page/apps/status/:appId',
  queye: '/page/queye',
  bonuses: '/page/bonuse',
  services: '/page/services',
  appeals: '/page/appeals',
  contacts: '/page/contacts',
  push: '/page/push',
  video: '/page/video',
  exit: '/page/exit',
} as const;

export function appStatusPath(appId: string): string {
  return `/page/apps/status/${encodeURIComponent(appId)}`;
}

/** Приводит 'lics' / 'page/lics' к '/page/lics'. Абсолютные пути не трогает. */
export function resolveAppPath(path: string): string {
  const trimmed = (path || '').trim();
  if (!trimmed) return ROUTES.lics;
  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('page/')) return `/${trimmed}`;
  return `/page/${trimmed}`;
}
