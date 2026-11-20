/** Capture is NOT proof of registration, installation or account ownership. */
export const INVITATION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const INVITATION_KEY = 'pending-invitation-v1';
export interface PendingInvitation {
  version: 1;
  token: string;
  capturedAt: number;
  expiresAt: number;
}
export interface InvitationStorage {
  getItem(key: string): Promise<unknown>;
  setItem(key: string, value: PendingInvitation): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
}
// Exact match also rejects URL-normalization tricks, credentials and extra parameters.
export function invitationToken(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  return /^https:\/\/referal\.aostng\.ru\/r\/([A-Za-z0-9_-]{43})$/.exec(url)?.[1] ?? null;
}
function validRecord(value: unknown, now: number): value is PendingInvitation {
  if (!value || typeof value !== 'object') return false;
  const v = value as PendingInvitation;
  return v.version === 1 && typeof v.token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(v.token)
    && Number.isSafeInteger(v.capturedAt) && v.capturedAt > 0 && v.capturedAt <= now
    && v.expiresAt === v.capturedAt + INVITATION_TTL_MS && now < v.expiresAt;
}
export function createInvitationStore(storage: InvitationStorage, now = Date.now) {
  let queue: Promise<unknown> = Promise.resolve();
  function serial<T>(operation: () => Promise<T>): Promise<T> {
    const result = queue.then(operation);
    queue = result.catch(() => undefined);
    return result;
  }
  async function read(): Promise<PendingInvitation | null> {
    const value = await storage.getItem(INVITATION_KEY);
    if (validRecord(value, now())) {
      // Return only the allowlisted fields, never inherited data from a malformed record.
      return { version: 1, token: value.token, capturedAt: value.capturedAt, expiresAt: value.expiresAt };
    }
    if (value != null) await storage.removeItem(INVITATION_KEY);
    return null;
  }
  return {
    read: () => serial(read),
    capture: (url: unknown) => serial(async () => {
      const token = invitationToken(url);
      if (!token) return 'ignored' as const;
      const existing = await read();
      if (existing) return existing.token === token ? 'duplicate' as const : 'kept-first' as const;
      const capturedAt = now();
      await storage.setItem(INVITATION_KEY, {
        version: 1, token, capturedAt, expiresAt: capturedAt + INVITATION_TTL_MS,
      });
      return 'captured' as const;
    }),
  };
}
