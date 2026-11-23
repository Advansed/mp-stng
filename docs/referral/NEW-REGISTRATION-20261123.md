# Server-confirmed first registration — 23 November 2026

The native app now negotiates the additive Windows registration capability. Unsupported/offline capability keeps the legacy registration, with no fabricated referral credit. Web and Android without a saved invite keep their existing flow. iOS uses the previously phone-verified Linux participation; the phone alone never earns credit.

For the supported path, the four existing SMS inputs send the entered code to Windows. Windows checks the server challenge (5 minutes, 5 attempts), then commits the first account creation/password via existing SQL procedures. Only its successful response opens the cabinet and offers the separate signed receipt immediately. No extra authorization call or QR scan is required. The ordinary session/password/mobile SMS are never sent to Linux. A broken receipt consumer cannot prevent cabinet access.

Android Play/RuStore referrer bridge, flavors, minSdk and package `io.ionic.stng` are unchanged. iOS remains `aostng.stng`, including Firebase plist. ESIA and ordinary login/recovery endpoints are unchanged; real ESIA/provider acceptance still needs a controlled device test. Do not call synthetic tests store installations.

## Kolya

Use current main after its CI passes:

```
npm ci --legacy-peer-deps
npx tsc --noEmit
npm run build
npx cap sync android
cd android
./gradlew :app:testPlayDebugUnitTest :app:testRustoreDebugUnitTest
./gradlew :app:bundlePlayRelease :app:assembleRustoreRelease
```

Use the existing production signing keys and approved next versionCode. No signing secrets in CLI arguments/Git. Local AAB/APK checks do not imply store signing or publication.

On macOS: `npx cap sync ios`, `cd ios/App && pod install`, open `App.xcworkspace`, keep bundle ID `aostng.stng`, select the authorized team/provisioning and archive. Xcode/CocoaPods/signing cannot be verified on this Linux host.

Release server changes separately before promising +1. Without the approved Windows + Linux candidate, this mobile build deliberately falls back to normal registration and gives no referral credit. After rollout, test one controlled new account from each store, an existing account (+0), repeated login/reinstall (+0), and immediate cabinet entry. No store publication was performed here.

Network ambiguity after completion is not automatically retried: an account may already exist. The UI instructs normal login; neither another password write nor an invented +1 is allowed. Previously pending rows without reliable history are +0 because an empty password is not proof they were never completed.
