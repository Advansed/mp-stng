# Проверки кандидата 20.11.2026

Изменения выполнены в изолированном checkout. Windows, SQL, существующий backend,
production PWA, SMS и магазины в этой задаче не изменялись.

- Чистая `npm ci --legacy-peer-deps --ignore-scripts` на Node22: PASS. Исправлена
  отсутствовавшая запись локального vendor/firebase в npm lock, без обновления зависимостей.
- TypeScript4.9.5 `tsc --noEmit`: PASS. Удалён несовместимый параметр ignoreDeprecations6.0.
- React production build: PASS, `CI=false GENERATE_SOURCEMAP=false npm run build`.
  Старые ESLint warnings (console/unused/etc.) остаются видимыми; strict CI=true
  превращает их в ошибку. Это не проверка отсутствия всех предупреждений.
- Совокупная регрессия native links/referrer/receipt/auth/status/associations:
  **63 теста PASS**. Независимая перепроверка auth+receipt: 19 PASS (входят в63).
- Linux отдельный verifier: **170 серверных тестов PASS**, Vite build PASS;
  операционные проверки11 PASS, усиленные phase-A gates8 PASS.
  Коммиты Linux: ba12f21, da8de3a; репозиторий локальный, remote не настроен.
- iOS: plist, entitlements, URL scheme, app identity/resources проверены.
  Xcode archive не выполнялся на Linux. Требуется корректный Firebase plist
  для aostng.stng, настоящий pod install на Mac и подпись существующей команды.
- Android: оба debug APK собраны; по6 JVM-тестов на вариант PASS (всего12).
  `bundlePlayRelease` и `assembleRustoreRelease` также PASS без рабочей подписи.
  SHA-256, minSdk22/23, target36 и сверка213 web-assets — ANDROID-BUILD-EVIDENCE.json.
  Это локальные артефакты, не разрешённые магазинные релизы.

Никакие синтетические тесты не являются установками из Google Play/RuStore,
реальным входом абонента или подтверждённой новой регистрацией. Автоматический
зачёт требует согласованного issuer подписанного receipt и доказанного участия.
События PHONE_VERIFIED, APP_LOGIN_CONFIRMED, REGISTRATION_CONFIRMED и APP_FIRST_OPEN
не взаимозаменяемы. Для Android остаётся отдельный контракт подписанной связи
приглашения с участием; текущий login request намеренно не изменён.

Проверены официальные карточки приложений: Google Play
https://play.google.com/store/apps/details?id=io.ionic.stng и RuStore
https://www.rustore.ru/catalog/app/io.ionic.stng. Apple identity подтверждена
публичным lookup id6445904988: aostng.stng. Актуальную максимальную build/version
и права подписи нужно получить из кабинетов, а не угадывать по карточкам.
