import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { createInstallReferrerCapture, InstallReferrerBridge } from './install';
import localforage from 'localforage';
import { createInvitationStore, invitationToken } from './invitation';
import { observeInvitationLinks } from './launch';

// Separate from credentials and profile storage; no personal data is stored here.
const storage = localforage.createInstance({ name: 'stng-referral', storeName: 'invitations' });
export const pendingInvitation = createInvitationStore(storage);
const installBridge = registerPlugin<InstallReferrerBridge>('StngInstallReferrer');
const collectInstallReferrer = createInstallReferrerCapture(installBridge, async url => {
  const result = await pendingInvitation.capture(url);
  const stored = await pendingInvitation.read();
  return stored?.token === invitationToken(url) ? result : 'ignored';
});

export function ReferralInitializer() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    void pendingInvitation.read().catch(() => undefined);
    const observer = observeInvitationLinks(App, pendingInvitation.capture);
    // Store SDKs exist only on Android. iOS phone matching is server-side and
    // deliberately cannot be inferred from a local profile or a client phone.
    if (Capacitor.getPlatform() !== 'android') return observer.stop;
    void collectInstallReferrer();
    let active = true;
    const foreground = App.addListener('appStateChange', state => {
      if (active && state.isActive) void collectInstallReferrer();
    }).catch(() => null);
    return () => {
      active = false;
      observer.stop();
      void foreground.then(handle => handle?.remove()).catch(() => undefined);
    };
  }, []);
  return null;
}
