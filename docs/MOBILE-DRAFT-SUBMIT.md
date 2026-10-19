# Explicit mobile submission

Source change only; Android/iOS have not been built or published.

Both Services/Order (`services_set`) and Apps/AppOrder (`upd_details1`) send `Проведен=0, intent=submit` on the final button. Draft save uses `Проведен=2, intent=draft`. Passive edits of submitted documents use `intent=edit`, preserving posted state. Closing the legacy AppOrder remains navigation only. Draft-save button in AppOrder is offered only for a confirmed `Тип=Черновик`.

The form validates all visible steps before final submission, prevents concurrent clicks, and stays open on refusal. Both hooks reject `error=true`, `success=false` and ambiguous responses. No automatic final-request retry. Passport fields, SNILS, existing attachments and application ID retain the current serializer.

Server prerequisite: the reviewed `dbo.p_upd_details1` patch must be approved and deployed before native release. It applies posted state inside protected transaction/finalization, returns success after commit, preserves legacy missing-field semantics and all existing attachment/revision guards. Node error handling must include both failure flags.

Old APK/iOS editors omitting posted state still cannot finalize a stored draft through this endpoint. Do not infer submit from missing flag. New mobile binaries are required for this fix; backend-rendered field templates do not update compiled handlers.

## Verification

- `node --experimental-strip-types --test test/lifecycle/*.test.mjs`: transport/reference/action contracts, also in isolated source CI.
- `node test/lifecycle/submission-handlers.cjs`: executes both actual TS handler bodies with isolated callbacks, including rejection and exit (requires installed TypeScript).
- `npm test -- --watchAll=false --runInBand --runTestsByPath src/components/DataEditor/submission.test.tsx`: actual form buttons in jsdom; document field widgets and network mocked.
- `npx tsc --noEmit`: source typecheck.
- NodeServer package: 15 isolated SQL scenarios and actual HTTP-to-SQL checks across three routes. Storage check is mocked; no production submissions.

Native device acceptance and signing/publication are a separate authorized release task. No native publish/deploy job is added.
