import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import localforage from 'localforage';
import { createInvitationStore } from './invitation';
import { observeInvitationLinks } from './launch';

// Separate from credentials and profile storage; no personal data is stored here.
const storage = localforage.createInstance({ name: 'stng-referral', storeName: 'invitations' });
export const pendingInvitation = createInvitationStore(storage);

export function ReferralInitializer() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    void pendingInvitation.read().catch(() => undefined);
    const observer = observeInvitationLinks(App, pendingInvitation.capture);
    return observer.stop;
  }, []);
  return null;
}
