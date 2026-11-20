export interface LinkHandle { remove(): Promise<void> }
export interface LaunchSource {
  addListener(event: 'appUrlOpen', callback: (event: { url: string }) => void): Promise<LinkHandle>;
  getLaunchUrl(): Promise<{ url: string } | undefined>;
}
/** Owns only its listener. No navigation, authentication or network side effects. */
export function observeInvitationLinks(source: LaunchSource, capture: (url: unknown) => Promise<unknown>) {
  let stopped = false;
  let handle: LinkHandle | undefined;
  const receive = (url: unknown) => {
    if (!stopped) void capture(url).catch(() => undefined);
  };
  const ready = (async () => {
    // Subscribe first so a warm delivery is not lost during cold-start lookup.
    try {
      handle = await source.addListener('appUrlOpen', event => receive(event.url));
      if (stopped) { await handle.remove(); return; }
    } catch { /* A failed subscription must not block the independent cold-start read. */ }
    if (stopped) return;
    try { const launch = await source.getLaunchUrl(); if (launch) receive(launch.url); }
    catch { /* Referral capture must never break normal application startup. */ }
  })();
  return {
    ready,
    stop: () => {
      stopped = true;
      if (handle) void handle.remove().catch(() => undefined);
    },
  };
}
