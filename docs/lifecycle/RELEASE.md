# Lifecycle review candidate — NOT DEPLOYED

Coordinated with NodeServer fix/application-attachment-lifecycle; authoritative plan and blockers: NodeServer docs/lifecycle/RELEASE.md. No production changes. Backend SQL migration and release require separate owner approval.

Preserves historical storage origins and hydrated raw keys during serialization; removes signed upload URLs/storage response bodies from logs. Existing delFileS3 becomes SQL unlink ONLY AFTER the new backend is released. This branch alone does not make deletion safe against the old backend. Tests cover pure reference serialization, not a full APK build or device E2E. Presigned PUT replay and web deletion/intent contracts remain coordinated release blockers.

## CAS deletion continuation

With REACT_APP_ATTACHMENTS_V2 enabled, all three image widgets supply document/group identity. The client reads the current SQL attachment revision, resolves only persisted keys or server-provided sealed preview aliases, and sends attachments_delete. SQL verifies owner/group and performs CAS; conflicts stay visible failures. Unbound confirmed files are discarded through SQL, not physically removed. Single-file widgets clear their value only after confirmation. Old-client behavior remains behind the existing default-off flag and the server compatibility bridge.

Validation: 14 isolated transport/reference tests and TypeScript pass. Installed APK/camera and every supported deployed version are not validated here; flag remains off. Never enable before backend/SQL compatibility release and acceptance. Production unchanged.
