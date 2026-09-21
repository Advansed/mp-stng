import React from 'react';
import { Lics } from '../components/Lics';
import { News } from '../components/News';
import { Profile } from '../components/Profile/Profile';
import { Agzs } from '../components/AGZS/AGZS';
import { Apps } from '../components/Apps';
import { Queye } from '../components/Queye';
import { Services } from '../components/Services/Services';
import { Appeals } from '../components/Appeals';
import { Contacts } from '../components/Contacts';
import { Notifications } from '../components/Notificications';
import { AppVideoPage } from './VideoPage';

function EmptyScreen() {
  return <></>;
}

export interface AppScreen {
  Screen: React.FC;
  showRefresher?: boolean;
}

export const SCREEN_BY_NAME: Record<string, AppScreen> = {
  lics: { Screen: Lics, showRefresher: true },
  news: { Screen: News },
  profile: { Screen: Profile },
  agzs: { Screen: Agzs },
  apps: { Screen: Apps },
  queye: { Screen: Queye },
  bonuse: { Screen: EmptyScreen },
  services: { Screen: Services },
  appeals: { Screen: Appeals },
  contacts: { Screen: Contacts },
  push: { Screen: Notifications },
  video: { Screen: AppVideoPage },
};

export function getScreen(name?: string): AppScreen | undefined {
  if (!name) return undefined;
  return SCREEN_BY_NAME[name];
}
