# Native referral links: release gates

This source change is not a deployed referral service or published APK/IPA. It does not add Windows, SQL, SMS or registration calls. A native-only optional handoff posts a dedicated signed backend login receipt to the separate Linux API; the current backend does not issue this receipt, so no new request occurs today. Opening a link is not proof of registration, installation, first-ever launch or account ownership. Pending invitations are captured locally with the existing localforage storage. Only the separately gated Linux verifier may credit a server-confirmed login; local auth state cannot do so. Browser/OS storage eviction, clearing app data or uninstall can remove it. Durable retention across uninstall is not promised.

## Verified source identifiers

| Platform | Identifier | Source |
|---|---|---|
| Android | `io.ionic.stng` | `android/app/build.gradle` |
| iOS | `aostng.stng` | Debug and Release `PRODUCT_BUNDLE_IDENTIFIER` in `ios/App/App.xcodeproj/project.pbxproj` |
| iOS development team | `U44HUUK428` | Both Xcode build configurations; signed release prefix still needs verification |

`capacitor.config.ts` uses `io.ionic.stng`, but the existing native iOS target is `aostng.stng`. Do not silently rename the released iOS app. Both Xcode configurations already reference `App/App.entitlements`. Existing push entitlement and Capacitor AppDelegate URL/activity forwarding remain intact.

Android declares a separate verified VIEW intent for HTTPS host `referal.aostng.ru`, path prefix `/r/`. Launcher and file provider remain intact. iOS adds `applinks:referal.aostng.ru`. Application code must still validate the exact invitation URL/token; native path matching is not an authorization boundary.

## Association files (not published by this change)

Release administrator must obtain public signing metadata:

1. Android SHA-256 fingerprint of the **distribution** signing certificate. For Google Play App Signing use the app-signing certificate in Play Console, not automatically the upload certificate. For RuStore verify the certificate of the actual distributed release; include additional fingerprints only if they represent approved release signers. Never put a debug certificate in production associations.
2. iOS `application-identifier` from signed release entitlements, ending in `.aostng.stng`. Verify App ID prefix; it can differ from development team ID. Enable Associated Domains for the app identifier and regenerate provisioning profiles when required.

Prepare a JSON file containing `confirmReleaseIdentifiers: true`, `androidSha256` (array of colon-separated SHA-256 fingerprints), and `iosApplicationIdentifier` (actual signed identifier). These are public metadata; do not include any signing keys, passwords or tokens. No sample production files with invented fingerprints are checked in.

```sh
node scripts/generate-referral-associations.cjs /secure-review/verified-public-identifiers.json /tmp/stng-reviewed-associations
node --test scripts/referral-associations.test.cjs
```

The output directory must not exist. The generator rejects missing/malformed data, known placeholder formats and a mismatched iOS bundle ID. Structural validation cannot prove a supplied fingerprint is authentic: the release administrator's signed-build comparison is mandatory.

After separate domain-service approval, host both files with trusted HTTPS, HTTP 200 and `Content-Type: application/json`, without redirects or authentication:

- `https://referal.aostng.ru/.well-known/assetlinks.json`
- `https://referal.aostng.ru/.well-known/apple-app-site-association`

Do not route those requests to the SPA fallback, cache personal data, or add any credentials. Hosting must preserve existing PWA/other association entries; review and merge any pre-existing files instead of replacing them blindly. Android package association is domain-wide; its manifest constrains handled paths. iOS association restricts paths to `/r/*`.

## Subscriber flow and installation limits

- Updated app installed + OS association verified: invitation can open the installed app, including cold and warm launches. OS/user browser choices can still keep the link in the browser.
- App absent: invitation opens the public PWA page. That page can offer the correct store based on device, with explicit store choice/fallback.
- Target flow no longer requires reopening the invitation. Google Play/RuStore native Install Referrer source support is added; actual store installations remain unverified. See ANDROID-INSTALL.md. iOS uses a Linux verified-phone claim plus future trusted login receipt; the verifier is prepared but disabled and the existing backend does not issue the required proof.
- Intent/entitlement alone does not perform deferred attribution. Android store bridges now supply local context separately; iOS matching remains blocked on trusted server evidence. No attribution or `APP_FIRST_OPEN` server confirmation may be inferred from a store click.
- This requires a new signed Android/iOS release; existing installed binaries do not acquire native link handling from a Git push.

## Device acceptance before publication

Use a synthetic invitation and controlled account; no real registrations required:

1. Build/sync Capacitor plugins in the release environment, inspect signed app IDs and entitlements. Complete native Android/iOS compilation and signing checks; Node tests do not replace them.
2. Host reviewed associations and verify status/content/TLS. Apple CDN/device caches can delay adoption; verify on actual signed devices.
3. Android 12+: `adb shell pm verify-app-links --re-verify io.ionic.stng`, then `adb shell pm get-app-links io.ionic.stng`. Confirm `referal.aostng.ru: verified`.
4. Tap invitation from outside app (e.g. notes/message) on Android and iPhone: stopped app, foreground app, already signed in and signed out. Confirm pending invitation survives restart and ESIA login still works.
5. Invalid token/path, foreign host, expired invitation and unavailable referral service must not break normal app use.
6. Install from each intended store without reopening the invitation; confirm automatic reference delivery with the correct flavor. Record actual device evidence; a direct link or sideload is not this test.
7. Check push notifications and existing URL handlers on the same build.

No production Windows/SQL changes, domain publishing, store uploads or real SMS are needed for source-only checks. Release and hosting still require explicit approval.

## Sources

- [Capacitor v6 deep links](https://capacitorjs.com/docs/v6/guides/deep-links)
- [Android website associations](https://developer.android.com/training/app-links/configure-assetlinks)
- [Android verification](https://developer.android.com/training/app-links/verify-applinks)
- [Apple associated domains and application prefix](https://developer.apple.com/documentation/xcode/supporting-associated-domains)
