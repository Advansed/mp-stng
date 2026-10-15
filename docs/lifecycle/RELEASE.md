# Lifecycle review candidate — NOT DEPLOYED

Coordinated with NodeServer fix/application-attachment-lifecycle; authoritative plan and blockers: NodeServer docs/lifecycle/RELEASE.md. No production changes. Backend SQL migration and release require separate owner approval.

Preserves historical storage origins and hydrated raw keys during serialization; removes signed upload URLs/storage response bodies from logs. Existing delFileS3 becomes SQL unlink ONLY AFTER the new backend is released. This branch alone does not make deletion safe against the old backend. Tests cover pure reference serialization, not a full APK build or device E2E. Presigned PUT replay and web deletion/intent contracts remain coordinated release blockers.
