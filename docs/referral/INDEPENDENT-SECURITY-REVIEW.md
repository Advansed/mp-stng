# Independent referral security review — 20 November 2026

Local source review only: `referral-service/src/phone-claim.js`, `src/smsru-provider.js`, and this repository's `src/referral/install.ts`. No production API, Windows/SQL, real SMS or store request occurred.

## Findings and correction

The first reviewed login projector checked registration time against invitation creation only. That could count an account created after an employee generated the invitation but **before the subscriber participated** as newly referred. This was reported and corrected in the current candidate:

- Attribution stores the original participation timestamp, consent version and source.
- iPhone uses the server OTP claim's `verified_at`; Android requires a timestamp from trusted participation evidence.
- Registration must occur after participation and have an authoritative absent/pending baseline for that participation instant. Missing/unknown/existing baseline does not qualify.
- Late evidence uses the stored original participation timestamp, not the time of a later login.

Independent in-memory synthetic counterexample against the corrected code: invitation created first, account registration next, phone participation later → `registrationConfirmed:false`; only `APP_LOGIN_CONFIRMED` emitted. No real account was used. The producer of the baseline/participation evidence remains unimplemented/unapproved; these checks are not live registration proof.

## Checks supported by code review

- OTP digest is keyed and challenge-bound; no plaintext OTP/telephone in SQLite. Code is necessarily present briefly in memory during SMS construction and provider submission.
- Five attempts per challenge are updated atomically; per-phone SMS limits prevent resetting the visitor cookie from creating unlimited guesses. A timed-out send retains its challenge and does not automatically resend.
- One attribution per subject/phone/invitation is enforced by unique database constraints. Late verified evidence is separately gated; client-supplied phone is not accepted as identity.
- Default SMS provider approval is false; factory construction/import does not call the network. The provider uses fixed HTTPS, refuses redirects, bounds response size and time, sanitizes failures and has no automatic retry.
- Provider acceptance is not handset delivery or PHONE_VERIFIED.
- Native receipt acknowledgement occurs only after JS storage reports captured/duplicate. Storage failure or competing first invitation retains native state for reconciliation and does not interrupt login.

## Remaining launch gates / behavior to approve

- Session verifier and native/registration evidence remain trusted injected contracts, not implemented authoritative production integrations. An arbitrary client `verified:true` object must never reach this boundary.
- Expired phone claims currently fail closed and are not recycled. A retention/re-consent/reassignment policy is needed before launch; silently deleting them could allow a second employee credit.
- Explicitly rejected SMS delivery currently reuses the same challenge until expiry. UI must not claim a new SMS was sent by a repeated start call. This is a delivery recovery UX limitation, not an OTP bypass.
- Existing development attribution tables without the newly required evidence columns fail closed; no invented history/backfill is performed. A reviewed migration is required for such a database before enabling the candidate.
- `APP_FIRST_OPEN` still needs authoritative native evidence; client platform/referrer does not supply it.

## Actual verification and environment limitation

Seven isolated SMS-provider tests passed against injected fetch implementations. No real provider was called.

The shared development `node_modules` contains better-sqlite3 ABI137. Running it with Node22 (ABI127) fails module loading. Running the phone suite under default Node24 reproduced the previously documented native teardown assertion `RemoveEnvironmentCleanupHook`; this is a local test-runtime failure, not an API incident. A single in-memory counterexample completed under Node24, but the full suite is **not certified on that runtime**. Use the separately prepared Node22/native-ABI127 validation environment; do not replace production or shared dependencies to hide the mismatch. Parent release evidence must identify the runtime used for its passing suite.
