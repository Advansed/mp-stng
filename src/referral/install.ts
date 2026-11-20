export interface InstallReferrerBridge {
  getPending(): Promise<{ status: string; source?: string; token?: string }>;
  acknowledge(options: { token: string }): Promise<unknown>;
}
/** A store receipt is context only, never identity, consent, or a conversion event. */
export function createInstallReferrerCapture(
  bridge: InstallReferrerBridge,
  capture: (url: unknown) => Promise<'captured' | 'duplicate' | 'kept-first' | 'ignored'>,
) {
  let running: Promise<void> | null = null;
  return function collect(): Promise<void> {
    if (running) return running;
    running = (async () => {
      try {
        const pending = await bridge.getPending();
        if (pending.status !== 'pending' || !['google-play', 'rustore'].includes(pending.source || '')
          || typeof pending.token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(pending.token)) return;
        const result = await capture(`https://referal.aostng.ru/r/${pending.token}`);
        // Native storage remains intact if JS storage fails. First-touch policy wins
        // over a competing store receipt; retain that native receipt for later reconciliation.
        if (['captured', 'duplicate'].includes(result))
          await bridge.acknowledge({ token: pending.token });
      } catch { /* Retry on next foreground/launch; never block authentication. */ }
    })().finally(() => { running = null; });
    return running;
  };
}
