/** The only accepted handoff is a dedicated server receipt, never an auth token. */
const listeners = new Set<(receipt: string) => void>();
export function isLoginReceipt(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 4096
    && /^[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{32,}$/.test(value);
}
export function offerLoginReceipt(value: unknown): void {
  if (!isLoginReceipt(value)) return;
  for (const listener of Array.from(listeners)) {
    // Observers cannot change the result or timing of the completed login.
    void Promise.resolve().then(() => listener(value)).catch(() => undefined);
  }
}
export function subscribeLoginReceipts(listener: (receipt: string) => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export interface ReceiptForwarderOptions {
  platform: () => string;
  loadInvitation: () => Promise<{ token: string } | null>;
  prepareAndroid?: () => Promise<unknown>;
  fetchImpl?: typeof fetch;
}
export function createReceiptForwarder(options: ReceiptForwarderOptions) {
  const recent = new Map<string, number>();
  return async (receipt: string): Promise<void> => {
    const platform = options.platform();
    if (!['android', 'ios'].includes(platform) || !isLoginReceipt(receipt)) return;
    const now = Date.now();
    for (const [key, time] of Array.from(recent)) if (time + 120000 < now) recent.delete(key);
    if (recent.has(receipt)) return;
    if (recent.size >= 16) recent.delete(recent.keys().next().value as string);
    recent.set(receipt, now);
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (platform === 'android') await options.prepareAndroid?.();
      const invite = platform === 'android' ? await options.loadInvitation() : null;
      const payload: { receipt: string; inviteToken?: string } = { receipt };
      if (invite && /^[A-Za-z0-9_-]{43}$/.test(invite.token)) payload.inviteToken = invite.token;
      const controller = new AbortController();
      timer = setTimeout(() => controller.abort(), 8000);
      // This is NOT the Windows bearer. Cookies and referrer are explicitly omitted.
      await (options.fetchImpl || fetch)('https://referal.aostng.ru/api/mobile/login-receipts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer',
        signal: controller.signal, body: JSON.stringify(payload),
      });
      // A network response is never projected into local registration/credit state.
    } catch { /* No login error, no credential logging, no automatic retry. */ }
    finally { if (timer !== undefined) clearTimeout(timer); }
  };
}
