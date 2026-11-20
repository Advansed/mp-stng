# Android deferred invitation capture — release candidate

Source-only implementation, 20 November 2026. No store publication, real install, Windows/API call, SMS or subscriber operation performed.

## Actual SDK verification

- Google Play: `com.android.installreferrer:installreferrer:2.2`, as listed by [Google documentation](https://developer.android.com/google/play/installreferrer/library).
- RuStore: `ru.rustore.sdk:installreferrer:10.6.1`, the current version listed on [RuStore's SDK index](https://www.rustore.ru/help/sdk/install-referrer/kotlin). Repository: `https://nexus-external.rustore.ru/repository/maven-rustore-exposed`, filtered to RuStore SDK groups.
- The [10.6.1 documentation](https://www.rustore.ru/help/sdk/install-referrer/kotlin/10-6-1) mixes version-11 retention statements and a model property which does not match the binary. Downloaded actual 10.6.1 AAR confirms `getInstallReferrerV2()` returns `InstallReferrerV2`, whose Java string getter is **`getInstallReferrer()`**, plus `isFromRuStore()`. Implementation uses those verified signatures. No promise of v11 retention/repeated-read behavior is made.

Downloaded public AAR SHA-256:

| Artifact | SHA-256 |
|---|---|
| Google installreferrer 2.2 | `7112e592c429949787c168c5ac62721144a73b649050684557fdbdba5dd3b66a` |
| RuStore installreferrer 10.6.1 | `188ebc1dbecd57f552b897b51b56af7f3f2049ed4b16b81556561e81db35b337` |
| RuStore core 10.5.0 | `fbaf6d719ad37c0ba5fb1112beb1195ae88c6d11ff90612614fa170933e9c1a5` |

Binaries remain outside Git. These hashes establish inspected artifacts, not successful device installation.

## Variant compatibility

Two explicit flavors avoid including both SDKs in every store build:

| Variant | SDK | Minimum Android API |
|---|---|---|
| `play` | Google Play 2.2 | Existing 22 |
| `rustore` | RuStore 10.6.1 | **23**, required by actual SDK and core manifests |

Both retain the existing application ID `io.ionic.stng`; no suffix or signing key change. Existing API22 support is preserved for Play. RuStore Android5.1/API22 users cannot update to the RuStore variant; this is a release decision requiring review. Do not bypass the manifest requirement with `overrideLibrary`.

Existing project baseline has AGP8.2.1, Gradle9.0-milestone-1 and compile/targetSDK36. This combination was not changed opportunistically and full Android packaging is not certified. Release engineering must reconcile/test the build toolchain and increase the stale versionCode2580/versionName2.5.8 against the actual store's latest release before publishing.

## Link and bridge contract

- Google Play link includes `referrer=stng_invite%3D<TOKEN>`; Play SDK returns exactly `stng_invite=<TOKEN>`.
- RuStore link includes `referrer=<TOKEN>` (documented alternative `referrerId` is unnecessary).
- Token is exactly 43 base64url characters, matching the existing unique PWA invitation token. URLs, extra fields, whitespace, arbitrary parameters and malformed values are rejected.
- Plugin `StngInstallReferrer.getPending()` returns `{status, source, token?}`. Sources are `google-play` or `rustore`. Only status `pending` has a token. Other outcomes: `none`, `busy`, `unavailable`, `error`.
- Each flavor requires the actual installer package to match (`com.android.vending` / `ru.vk.store`). Sideload and unknown installer return unavailable; no fabricated attribution.
- Native capture persists synchronously in private preferences **before** resolving JavaScript. Only a successful JS durable save/readback may call `acknowledge({token})`. It uses exact-match CAS and returns `acknowledged`, `mismatch` or `error`.
- Pending data expire after30days. A completed empty read is remembered; transient failures may retry after30seconds. Simultaneous calls cannot start two SDK queries. JavaScript waits at most8seconds; a delayed RuStore response can still be saved. If the SDK never completes, the pending request stays unique until process restart rather than issuing destructive concurrent reads.
- Google connection closes on completion/destroy. RuStore success is not cancelled before persistence, since older consume-on-read behavior may lose the reference. Multiple callbacks are ignored after the first completion.
- Native pending data are excluded from cloud backup and device transfer. Other app data remain under existing policies. WebView/localforage may still be restored separately; the JS consumer must not acknowledge a different pending token. Server-side unique-account rules remain mandatory for reinstall/relogin deduplication.

This proves only receipt of a store referrer. Installer identity and a client token are **not** proof of a subscriber's login, new registration, consent or entitlement to employee credit. No authentication or analytics endpoint is called by native code.

## SDK privacy/manifest review

Actual RuStore AAR includes `INTERNET`, `ACCESS_NETWORK_STATE`, `RECEIVE_BOOT_COMPLETED`, a non-exported content provider and non-exported FSA/VKR job services. Its core adds package visibility for RuStore. `InstallReferrerContentProvider.onCreate()` was inspected in bytecode and returns true without initialization; constructing the client initializes a service locator. Transitive SDK includes metrics10.5.1. Do not infer zero network telemetry from the absence of an explicit call in our code.

Our bridge never calls `sendFsaEvent`, phone/auth advertising APIs or `getDebugInfo`; it never logs referrer/auth/phone data. Device traffic and merged-manifest review remain release gates, especially for SDK metrics/background behavior. Do not remove opaque SDK components blindly or promise privacy characteristics not tested on-device.

## Tests actually completed

- Five executable JVM/JUnit token-validation tests passed on locally unpacked JDK17 (no system installation).
- Four Node native-config safety assertions passed (`node --test scripts/install-referrer-native.test.cjs`).
- Both actual Java factory/bridge source sets compiled with JDK17 against downloaded Google/RuStore/core AAR classes and official Android35 android.jar. Capacitor-facing classes were minimal compile fixtures checked against installed Capacitor source. This is **API-signature compilation**, not Gradle/APK build, emulator test or store E2E.
- Android manifest/backup XML parsing verified separately.

Expected release-environment commands after restoring a compatible complete toolchain:

```sh
npm run build
npx cap sync android
cd android
./gradlew :app:testPlayDebugUnitTest :app:testRustoreDebugUnitTest
./gradlew :app:assemblePlayDebug :app:assembleRustoreDebug
# Signed release bundles require separately authorized signing/release setup.
```

No signing passwords belong in commands or Git. Store-distributed builds must use the existing approved signing identity. Debug/sideload tests cannot replace Play/RuStore install-referrer tests.

## Real installation acceptance — NOT executed

Use controlled synthetic invitations and dedicated test accounts/numbers only. Required: Google Play Console app access to an internal testing track, opted-in tester/store account and physical Android device; RuStore Console app access and supported test distribution preserving RuStore as installer, with physical RuStore device. Upload/publication requires explicit approval; MFA must be completed by owner. Confirm exact testing workflow with the current console rather than assuming sideload referrer works.

For each store: unique link → store installation → first open → pending token readback → normal login → separately verified server result. Also test organic install, unsupported/outdated store, no network, late callback, storage failure, restart before JS ack, duplicate launch, existing user/new user, reinstall, repeated login, two invitations, and app update between stores. A result is credited only once by the Linux server after trusted login validation. This last integration is outside this native bridge and remains a blocker for full automatic credit.
