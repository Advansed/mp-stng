# Independent referral QA

Scope: source changes based on mobile main `7c7aefaddafca27b133af41ca50b05d3185dd6db`; no Windows/SQL connections, production writes, real credentials, SMS or subscriber operations.

## Existing authentication audit

- `src/components/Login/authStore.ts`: `create` and `restore` store a token before completed authentication. `compare` compares the SMS value client-side. `password` sets `auth` after a profile response. None is independently sufficient server evidence of a new registration.
- `src/pages/RouterSync.tsx` / `src/utils/esiaAuth.ts`: ESIA hash parsing calls `setUser`; cached/client-supplied state cannot establish referral attribution.
- `src/components/Menu.tsx`: current logout changes `auth` and removes saved credentials, but retains token/user state. `_updateProfileFromUser` also merges existing fields. Referral capture must not bind a pending invite to cached profile/user/token. Existing authentication behavior is not refactored by this change.
- `src/components/Login/ESIALoginButton.tsx`: original cleanup used `App.removeAllListeners`, which could remove a root referral listener when the login screen unmounts. Scoped listener disposal is necessary; referral URLs must not enter the ESIA flow or close its browser.

The safe integration point is one application-root native URL listener, plus cold launch URL capture. It stores only the validated invitation reference. It does not call registration, login, profile, SMS, attribution, or analytics endpoints, and does not assert `PHONE_VERIFIED`, `APP_FIRST_OPEN`, `REGISTRATION_CONFIRMED` or `PERSONAL_ACCOUNT_LINKED`.

## Completed local regression

Command (reused installed development dependencies; no install or production process):

```sh
NODE_PATH=/opt/aostng-infra/mobile-registration-source/node_modules node --test tests/login-timeout.test.cjs tests/application-status.test.cjs
node --test scripts/referral-associations.test.cjs
```

- Existing login/status suite: **30 passed**, zero failed/skipped. Includes timeout, no automatic retry, duplicate login suppression, business failure, preserved historical status reasons, truthful Goskey presentation and no fabricated history.
- Native association/config suite: **5 passed**, zero failed/skipped. Android launcher remains, HTTPS host and `/r/` scope are restricted, push entitlement remains, Capacitor delegate forwarding remains, signing metadata is required before generating association files.
- React test-utils deprecation and optional canvas mock warnings observed; tests passed. They are not live-device verification.

## Release checks not yet established

- Signed Android/iOS builds, store release, physical-device Universal Links/App Links verification, and persistence across actual OS process death.
- Installed app versus not-installed QR journeys on physical iPhone/Android.
- Publication of valid `assetlinks.json` and `apple-app-site-association` for the **actual release signers**, with HTTPS and no redirects.
- Install referrer/deferred deep link transport through stores. Without this, after installing the subscriber must reopen the same invitation; store clicks do not prove installation.
- Server-validated account binding, first native launch, new registration, and linked personal account events. Current code deliberately performs none of these.

A captured invitation on a shared device is not evidence of a particular subscriber's consent or account. A future claim protocol needs explicit participation, fresh server-verified identity, first/last-touch policy, expiry, existing-user exclusion, idempotency and replay protection. It must not infer identity from an employee-entered phone or cached mobile token.

## Independent new referral tests

```sh
NODE_PATH=/opt/aostng-infra/mobile-registration-source/node_modules node --test tests/referral-mobile.test.cjs
```

**11 passed**, zero failed/skipped: exact host/path/token parsing; ESIA and malformed link isolation; minimal persistent record; restart read; concurrent duplicate/competing invitations; first capture wins without extending expiry; exact 30-day expiration; corrupt/future records; storage failure recovery; cold/warm URL handling; teardown during listener setup or launch lookup; failed subscription with independent cold lookup; no network/auth/status side effects; ESIA scoped cleanup.

Reviewed implementation is capture-only. It does not navigate away from an in-progress form or reset the existing account. A warm event arriving before cold-start lookup completes wins first-touch storage by receipt order. The local 30-day retention policy is not a promise of server invitation validity; a future backend claim must validate expiry again.

Total executed at this review: **46 local tests** (30 existing, 11 referral, 5 association/config). These are mocked/local source tests; no live registration, SMS, physical-device link association, or store-install attribution was tested.

## Main publication and build limitation

Executable commit: `16ab6717fb0779fc3e6b402bdaa426eb8799c2d6`.
GitHub Actions on main: [44690669735](https://github.com/Advansed/mp-stng/actions/runs/44690669735), SUCCESS, all 46 tests. Feature branch run 44690558035 also succeeded. Scoped strict TypeScript checking of all three new referral modules passed with local TypeScript 4.9.5.

Full CRA build was attempted with the previously installed development dependency tree and failed because `@capacitor-firebase/messaging` was missing there. Fresh `npm ci` rejected the existing lockfile during setup; a separate dependency-resolution attempt was stopped without changes to manifests/lockfiles or production. Therefore a complete current web/native build is **not certified** by this report. No Android SDK/Java or Xcode toolchain was available in this environment. Complete dependency installation and signed native builds are mandatory in the mobile release environment before publishing to stores. No APK/IPA or PWA was deployed.
