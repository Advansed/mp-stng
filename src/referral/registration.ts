// Dedicated registration capability. No Windows credentials are sent to Linux.
// This state is deliberately ephemeral: no OTP/password/session in local storage.
export function createReferralRegistration({ call, platform, context, offer }: {
  call: (endpoint: string, body: any) => Promise<any>;
  platform: () => string;
  context: () => Promise<{ referral_invite_token?: string }>;
  offer: (receipt: unknown) => void;
}) {
  let challenge: string | null = null;
  return {
    active: () => challenge !== null,
    clear: () => { challenge = null; },
    async start(phone: string, terms: boolean) {
      challenge = null;
      const device = platform();
      if (!['ios', 'android'].includes(device)) return false;
      let capability;
      try { capability = await call('referral_registration_capabilities', {}); } catch { return false; }
      if (capability?.error !== false || capability?.enabled !== true || capability?.version !== 1) return false;
      const invitation = await context();
      if (device === 'android' && !invitation.referral_invite_token) return false;
      const digits = phone.replace(/\D/g, '');
      const canonical = '+7' + digits.slice(-10);
      if (!/^[78]\d{10}$/.test(digits)) return false;
      // Only a definitive unavailable response permits legacy fallback. An ambiguous
      // SMS send is shown as an error, never automatically sent a second time.
      const result = await call('referral_registration_start', { phone: canonical, terms, ...(invitation.referral_invite_token ? { inviteToken: invitation.referral_invite_token } : {}) });
      if (result?.code === 'REFERRAL_REGISTRATION_DISABLED' || result?.eligible === false) return false;
      if (result?.error !== false || result?.eligible !== true || !/^[A-Za-z0-9_-]{43}$/.test(result.challenge || '')) throw Error('Не удалось начать подтверждение. Попробуйте позже.');
      challenge = result.challenge;
      return true;
    },
    async verify(code: string) {
      if (!challenge || !/^\d{4}$/.test(code)) return false;
      const result = await call('referral_registration_verify', { challenge, code });
      return result?.error === false && result?.verified === true;
    },
    async complete(password: string) {
      if (!challenge) throw Error('Подтвердите номер телефона заново.');
      if (!/^[\x21-\x7e]{6,18}$/.test(password)) throw Error('Используйте от 6 до 18 латинских букв, цифр или символов без пробелов.');
      const result = await call('referral_registration_complete', { challenge, password });
      if (result?.error !== false || !result.data?.token) throw Error('Не удалось подтвердить завершение регистрации. Попробуйте войти с указанным паролем.');
      challenge = null;
      // The dedicated signed server receipt is optional; account access never waits for Linux.
      try { offer(result.referral_login_receipt); } catch { /* Receipt forwarding must not block access to the new account. */ }
      return result;
    },
  };
}
