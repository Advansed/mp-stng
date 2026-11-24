> Дополнение текущего кандидата: [LOGIN-CONTEXT-FOLLOWUP.md](LOGIN-CONTEXT-FOLLOWUP.md). Прежний Android-пробел закрыт в исходниках совместимым контекстом входа; production-выпуск остаётся отдельным действием. Проверки f44dd03 ниже — исторические.

# Dedicated signed mobile login receipt — candidate contract

Source-only implementation: `src/login-receipt.js`. No issuer currently emits this receipt, no production public key is configured, and no existing API is called. Windows/IIS/SQL/mobile backend remain unchanged. This is a proposed additive contract for separate review, not an implemented production authentication integration.

## Client to Linux

Implemented, disabled-by-default endpoint: `POST /api/mobile/login-receipts` with JSON `{receipt, inviteToken?}`. `receipt` is the dedicated `referral_login_receipt` returned **only after successful authorization** by an approved issuer. It is not the existing bearer/session token, SMS PIN, password, or arbitrary profile JSON. Optional `inviteToken` is the Android install/deep-link token. iPhone uses the prior Linux phone claim and needs no returned browser session.

The exact route enforces a 6 KiB JSON limit before the general raw-body parser, 30 requests/minute per HMAC-protected IP and 600/minute globally, sanitized errors, and CORS restricted to `https://localhost` and `capacitor://localhost`. Cookie and Authorization headers are rejected; no cookies are issued. Preflight allows only POST and Content-Type; other origins/headers/methods are rejected. Existing employee/public APIs retain their original origin policy. CORS is not authorization: cryptographic verification is mandatory. Never log request bodies, receipt values, phone values or authorization headers. Never include a receipt in URL/query/analytics.

Library API:

```js
const receipts = createLoginReceiptService({ db, config, event, now });
receipts.ready();
await receipts.confirm({ receipt, inviteToken });
```

Requires all gates: `loginReceiptEnabled === true`, `mobileAttributionEnabled === true`, approved privacy/consent config, and `loginReceiptPublicJwk`. Defaults remain unavailable. A wrongly configured enabled key fails closed. The library does not fetch JWKS, access Windows or create a provider. `createApp` installs the guarded route. Configuration requires `LOGIN_RECEIPT_ENABLED=true`, `MOBILE_ATTRIBUTION_ENABLED=true`, approved privacy/consent and `REFERRAL_LOGIN_PUBLIC_JWK_FILE` pointing to a mode-0600 public JWK file (maximum 4096 bytes). Disabled mode does not open that file. The separate phase-A launcher rejects enabling these flags or supplying this key configuration.

## Issuer and pinned public key

JWS compact format, `alg: ES256`, `typ: JWT`, `kid` matching the pinned public EC JWK. JWK must be EC/P-256 with `x`, `y`, `kid`; private `d` is rejected. Algorithm substitution, additional JOSE key/URL headers, remote keys, unknown key IDs, invalid signatures and oversized/noncanonical encodings are rejected.

Use a dedicated server signing private key, not an existing session token/secret. Linux receives only the reviewed public key via protected deployment configuration. Key rotation must be planned with the short receipt lifetime; this initial validator pins one reviewed key. No production key has been generated, copied or installed by this change.

Required signed claims:

| Claim            | Rule                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `iss`            | Exactly `mobile-stng`                                                                                                            |
| `aud`            | Exactly `stng-referral`                                                                                                          |
| `iat`            | Integer Unix seconds, at most 5 seconds in the future                                                                            |
| `exp`            | Integer seconds, future and greater than `iat`, lifetime at most 120 seconds                                                     |
| `auth_time`      | Actual successful authentication time, no later than `iat`, no older than 120 seconds                                            |
| `jti`            | Unique immutable receipt ID, 20–128 URL-safe characters                                                                          |
| `sub`            | Stable server-derived subscriber ID, not a client-provided value                                                                 |
| `phone`          | Server-derived canonical `+7` and ten digits                                                                                     |
| `phone_verified` | `true` only if issuer can prove control; otherwise an existing unexpired Linux OTP claim for that exact signed phone is required |

The issuer must not sign any data merely because the mobile client sends it. Existing `t_users` rows or client SMS comparison do not prove phone verification or registration. Receipt creation must be an additive consequence of actual successful authorization and must not alter passwords, existing login responses/errors, registration or ESIA. Clients without the optional receipt continue normal operation and receive no fabricated referral credit.

## Participation and separate event proofs

For Android without a prior Linux OTP claim, signed `participation` must contain `confirmed:true`, approved `consentVersion`, trustworthy `occurredAt`, and `inviteTokenHash` equal to SHA-256 of the exact invitation token. The issuer must have an authoritative consent/participation source; copying a client checkbox into a signed blob is insufficient. This binding prevents replacing a signed participant's invitation with another employee's token. A prior Linux phone claim has first-invitation precedence.

`APP_LOGIN_CONFIRMED` can follow a valid receipt plus attribution. It is not proof of a first installation or a new registration. Optional signed `registration` and `app_first_open` claims are passed to the separately reviewed rules in `phone-claim.js`; all their evidence gates still apply. New registration additionally requires an authoritative absent/pending baseline at the original participation time, and registration afterwards. A signed `isNew` flag without that baseline creates no registration credit. Native first-open needs separate trustworthy native evidence, not just the receipt, User-Agent or client platform field.

Later evidence requires a newly issued receipt with a new `jti`; do not mutate signed claims under an existing receipt ID. Original participation time and subject attribution remain unchanged.

## Replay and storage

`mobile_attributions` keeps transactional unique subject/phone/invitation credit. Existing `mobile_login_receipts` records the server evidence ID. Additional `signed_login_receipts(jti_hash,payload_hash)` stores only hashes to reject a different signed payload reusing the same `jti`. Exact retries within receipt lifetime are idempotent and do not duplicate activation. Expired receipts are rejected even if previously accepted. No raw receipt, phone or session proof is stored by this adapter.

The supplemental table is created only on an enabled validated call. A real release must rehearse schema creation/backup and agree evidence-hash retention before enabling traffic. No runtime migration was applied to production.

## Verified tests

11 synthetic cryptographic/SQLite tests and 8 HTTP/configuration checks passed under Node 22.23.5: disabled mode; valid signature/idempotence; no plaintext receipt/phone storage; tampering/wrong signer/algorithm/key URL; expiry/lifetime/auth freshness; client field injection; Linux OTP fallback and expiry; invitation substitution; changed-payload same-jti conflict; no inferred registration/first-open; rejection of private/wrong-curve JWK configuration.

HTTP checks additionally cover exact native CORS, no credentials/cookies, route isolation, disabled mode, method/content-type/body size enforcement, rate limits and protected-key configuration.

Tests generate ephemeral EC keys in memory and use synthetic accounts. They are not actual authorization, SMS, Android/iOS installations or a live backend integration. Production enabling still requires owner-approved issuer changes, real source audit, key custody, test-number consent and controlled end-to-end acceptance.

## Mobile response and current readiness

The optional field is `referral_login_receipt` at the top level of a successful
existing login response. Without it this mobile release makes no referral login
request. Never replace it with `data.token`, profile phone or local `auth=true`.
The native client posts only this dedicated receipt and, on Android, its saved
`inviteToken`; no Windows session credential is forwarded.

The existing login request is intentionally unchanged. Therefore Android's
signed `participation.inviteTokenHash` cannot currently be populated from a new
mobile request field. The backend/participation contract must be agreed before
Android credit can be enabled. Install Referrer capture can be built and tested
independently. iOS can match an already self-verified Linux phone claim without
an installation token. Neither flow is currently a proven live credited login.

Hook coverage is the ordinary successful `auth` login only. Client-side SMS
comparison, `registration` account creation, `profile` password save, cached
`setUser`, and ESIA URL/hash data do not issue referral evidence. ESIA exchange
in this source has its own legacy path and no proven receipt issuer; its normal
behavior is left intact. Do not mark those paths as tested live referral credit.
