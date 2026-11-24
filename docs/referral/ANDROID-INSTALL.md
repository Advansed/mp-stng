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

The incompatible project baseline (AGP8.2.1 with Gradle9.0-milestone-1 and compile/targetSDK36) has been corrected to **AGP8.10.1 + Gradle8.11.1 + JDK17**, matching [official API36 compatibility](https://developer.android.com/build/releases/agp-8-10-0-release-notes). The Gradle wrapper pins the official distribution SHA-256. Compile/target36 and minimum APIs remain unchanged. Full build results are recorded below; release engineering must increase the stale versionCode2580/versionName2.5.8 against the actual store's latest release before publishing.

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

## Toolchain preparation follow-up

Prepared isolated JDK17, Android platform36 and build-tools35.0.0; official Android repository checksums verified before unpacking. Gradle8.11.1 official endpoints redirected to GitHub, returning HTTP403 in this environment. A mirror supplied the distribution; its complete SHA-256 exactly matched the independently retrieved official value `f397b287023acdba1e9f6fc5ea72d22dd63669d59ed4a289a29b1a76eee151c6` before execution. `gradle --version` successfully reports8.11.1/JDK17. The isolated JDK trusts the existing OS public CAs; certificate validation remains enabled. No global SDK/JDK or production service was changed. This is toolchain readiness, not an APK result.

## Actual final Android debug build — PASS

After the toolchain correction, a real Gradle build exposed a pre-existing missing `mipmap/ic_launcher_foreground` resource. Fixed using the **existing STNG iOS brand PNG**, not the Ionic/Android template artwork. Added legacy launcher resources for API22/23 and an adaptive foreground with the same logo. No signing identity or app ID changed.

Final Capacitor sync succeeded with all8 existing plugins. Final Gradle run completed successfully in22seconds:243 tasks,12 executed and231 up-to-date. Tasks included both flavor unit suites and both debug APKs. Each variant ran6 tests (5 referral parser tests plus1 existing example), zero failures/errors/skips. The native Node safety suite now has5 tests, including the legacy launcher fallback.

| APK | Actual package | Minimum / target API | Bytes | SHA-256 |
|---|---|---|---|---|
| `android/app/build/outputs/apk/play/debug/app-play-debug.apk` | `io.ionic.stng` | 22 /36 | 19908124 | `20d5cba3e546a0b35240d55e10419bf633868f07d40b710eb5cff2fa39612fa5` |
| `android/app/build/outputs/apk/rustore/debug/app-rustore-debug.apk` | `io.ionic.stng` | 23 /36 | 18956975 | `1a632de4c5d55904998443a898ece66bac635d9dc19879a78077230908d1c2a8` |

`apksigner verify` passed for both debug packages. All213 final React build files matched the embedded APK assets byte-for-byte. Evidence: `ANDROID-BUILD-EVIDENCE.json`. These are debug-signed artifacts with the pre-existing version2580/2.5.8; they are **not** authorized store releases and must not replace the installed production app for subscriber testing.

Actual merged RuStore manifest has one additional permission versus Play: `RECEIVE_BOOT_COMPLETED`. It includes the SDK metrics `SendMetricsEventJobService` in addition to the previously documented FSA/VKR services. Device traffic/privacy review remains required. No emulator, physical device, store installation, real login/SMS or attribution receipt was executed by these builds.

## Actual unsigned release packaging — PASS

`:app:bundlePlayRelease :app:assembleRustoreRelease` completed successfully in2minutes6seconds. Produced Google Play AAB and RuStore unsigned APK using the final sources/assets. Both contain all213 final React files byte-for-byte. `jarsigner` reports the AAB unsigned; `apksigner` confirms the APK lacks a signature. No production signing keys were used.

- Google Play: `android/app/build/outputs/bundle/playRelease/app-play-release.aab`.
- RuStore: `android/app/build/outputs/apk/rustore/release/app-rustore-release-unsigned.apk`.

Exact sizes/hashes are in `ANDROID-BUILD-EVIDENCE.json`. These are build artifacts only: approved release signing, version increment, console upload authorization and real store/device tests remain outstanding. Do not upload currentversion2580/2.5.8 as a new production release.
