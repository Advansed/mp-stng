# Выпуск мобильной реферальной интеграции: три варианта сборки

Дата проверки: 20.11.2026. Это инструкция разработчику, **не разрешение загрузить/опубликовать приложение или включить production-интеграцию**. Windows/SQL не затрагиваются. SDK-тесты, локальная сборка и реальная установка из магазина — три разных результата.

## Проверенная идентичность iOS

Официальный публичный Apple lookup `https://itunes.apple.com/lookup?id=6445904988&country=ru` прочитан без авторизации 20.11.2026: `bundleId=aostng.stng`, версия `2.5.9`, minimum OS `15.6`, дата выпуска `2026-10-25T18:46:46Z`. Это совпадает с Xcode Debug/Release `PRODUCT_BUNDLE_IDENTIFIER=aostng.stng`. Не менять его на Android ID `io.ionic.stng` из capacitor.config.ts.

Team `U44HUUK428` — значение проекта, а не доказательство доступной подписи. Проверить Team/App ID и App ID prefix по разрешённому кабинету и подписанному артефакту. Associated Domains `applinks:referal.aostng.ru` и push entitlement сохранены. AppDelegate уже передаёт custom/universal links Capacitor. В Info.plist добавлена отсутствовавшая схема `mystnglk`, которую уже использует callback ESIA; логика авторизации не изменена.

Локально проверены разбор plist/XML, ссылки на ресурсы и схемы, оба bundle ID, entitlement, существование файлов ассетов. AppIcon — RGB 1024×1024, без alpha. Это **не Xcode build**: Mac/Xcode/CocoaPods в текущей Linux-среде отсутствуют.

### Подтверждённые препятствия для iOS-релиза

1. `ios/App/App/GoogleService-Info.plist` содержит `BUNDLE_ID=io.ionic.stng`, тогда как выпущенное приложение и target — `aostng.stng`. Получить корректный файл существующего Firebase iOS app для **aostng.stng** через разрешённый кабинет. Не исправлять только строку BUNDLE_ID вручную и не менять released app identity. Сопоставить проект и push/APNs; AppDelegate вызывает `FirebaseApp.configure()`.
2. Podfile.lock не содержит разрешённого графа FirebaseMessaging и всех его транзитивных зависимостей, хотя Podfile включает CapacitorFirebaseMessaging. Согласовать настоящий `pod install` на Mac, сохранить и проверить полученный lockfile. Не подделывать checksum и не делать массовый `pod update`.
3. Source marketing version `2.5.3`/build `1` устарели относительно публичной версии `2.5.9`. Release owner должен выбрать следующую допустимую версию и уникальный build number по App Store Connect. Автоматически числа не угадывались.
4. В app target нет собственного `PrivacyInfo.xcprivacy`. Перед выпуском собрать Xcode privacy report по фактическим pod/plugin версиям и required-reason API, добавить только подтверждённые декларации; наличие/содержание manifests сторонних SDK проверить в собранном archive. Не генерировать ложное «данные не собираются». Обновить App Privacy по фактическим данным авторизации/реферальной аналитики. Существующие общие purpose strings тоже требуют проверки на соответствие реальным функциям.
5. [Apple требует Xcode 26+ и iOS 26 SDK+ для загрузок с 28.04.2026](https://developer.apple.com/news/upcoming-requirements/?id=04282026a). Старое требование Capacitor 6 «Xcode 15» не означает возможность сегодняшнего upload. Совместимость именно этого Capacitor 6 проекта и pod-графа с актуальным Xcode требуется доказать сборкой; major-upgrade Capacitor автоматически не выполняется.

## Общая подготовка в отдельной рабочей копии

Не выполнять команды в production каталоге сайта или Windows. Использовать проверенный release commit и согласованный Node/npm; сохранять lockfile. Если `npm ci` отклоняет его, это build blocker, а не повод молча заменить весь dependency graph.

```sh
npm ci --legacy-peer-deps
npm run build
node --test scripts/referral-associations.test.cjs scripts/install-referrer-native.test.cjs
node --test tests/referral-mobile.test.cjs
```

Полный список дополнительных transport/receipt тестов берётся из текущей GitHub Actions конфигурации. Build-time переменные реферального API — только утверждённые публичные настройки; секреты и Windows credentials в JS bundle не допускаются. До готовности Linux verifier/receipt runtime включение отправки не разрешается одной лишь успешной сборкой.

## A. Google Play / Android

Flavour `play`, package `io.ionic.stng`. После готовой web-сборки:

```sh
npx --no-install cap sync android
cd android
./gradlew :app:testPlayDebugUnitTest :app:assemblePlayDebug
```

Перед release настроить **существующий разрешённый** процесс подписи в Android Studio/закрытом CI, с ключом из защищённого хранилища. Не вводить keystore passwords в shell arguments, Git или вывод команд. Проверить новый versionCode относительно обеих карточек магазинов; сохранённые source 2580/2.5.8 не являются утверждёнными числами следующего релиза.

```sh
./gradlew :app:bundlePlayRelease
```

Команда не гарантирует, что bundle подписан: проверить подпись, package, versionCode и fingerprint. Загрузка в согласованный internal/closed track — отдельное разрешённое действие владельца; production rollout не выполнять. Реальный referrer проверять установкой из Google Play после подключения тестового Google Account к track, не через `adb install`.

## B. RuStore / Android

Flavour `rustore`, package `io.ionic.stng`. Оба варианта нельзя считать разными приложениями; они устанавливаются как один package, поэтому тестовые устройства/чистые установки и подписи согласовать.

```sh
npx --no-install cap sync android
cd android
./gradlew :app:testRustoreDebugUnitTest :app:assembleRustoreDebug
```

После настройки защищённой release-подписи:

```sh
./gradlew :app:assembleRustoreRelease
```

Подпись и совпадение с существующей карточкой проверить отдельно. Для закрытого теста использовать [RuStore Alpha](https://www.rustore.ru/help/developers/publishing-and-verifying-apps/app-publication/testing/alpha-testing), не общедоступную beta. APK, установленный напрямую, не доказывает SDK referrer из RuStore. Не публиковать без разрешения владельца.

Android task names должны сверяться с `./gradlew :app:tasks`; фактическую совместимость SDK/minSdk/AGP/JDK фиксирует `ANDROID-INSTALL.md`. Не обходить ограничения minSdk через manifest overrideLibrary.

## C. iPhone / TestFlight

Только на Mac с актуальным поддерживаемым Xcode после исправления перечисленных iOS-блокеров:

```sh
npm ci --legacy-peer-deps
npm run build
npx --no-install cap sync ios
cd ios/App
pod install
xcodebuild -list -workspace App.xcworkspace
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO build
```

Открывать **App.xcworkspace**, не standalone xcodeproj. Podfile использует iOS13 как нижнюю границу pod-resolution, а app target уже15.6; это не обещание поддержки iOS13. Не менять deployment target вслепую ради успешной сборки.

После проверки Team, профиля, Associated Domains и разрешённой подписи release owner задаёт утверждённые version/build (это не секреты):

```sh
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$HOME/STNG-Release/App.xcarchive" \
  MARKETING_VERSION="${STNG_IOS_VERSION:?set approved marketing version}" \
  CURRENT_PROJECT_VERSION="${STNG_IOS_BUILD:?set approved build number}" archive
```

Просмотреть archive в Xcode Organizer: подпись, bundle ID, entitlements, Firebase config, privacy report, embedded web assets; выполнить Validate App. Экспорт/загрузка в TestFlight только после отдельного согласования. Внутренний TestFlight подтверждает тестовую установку, **не production App Store E2E**.

## Новый handoff после входа: реализован клиент, issuer ещё требуется

После `authorization` с `error:false` и данными пользователя клиент рассматривает **только** отдельное поле `referral_login_receipt`. При его отсутствии старый backend работает без дополнительных сетевых запросов. Ни `data.token`, ни пароль, ни произвольный телефон не подставляются вместо квитанции. Forwarder работает только в native Android/iOS, отправляет подписанную квитанцию и необязательный Android invite token на фиксированный Linux endpoint `/api/mobile/login-receipts`; cookies, Authorization и referrer не передаются. Ошибка доставки не меняет результат входа; автоматического retry нет. HTTP 200 не превращается в локальный зачёт.

Linux candidate проверяет pinned ES256 public key, issuer/audience, короткий TTL, auth_time, jti и привязку Android invitation hash. Он не получает JWKS по клиентскому URL и не вызывает Windows. **Криптографический validator уже написан, но production issuer такой квитанции не установлен и его ключ/контракт не согласованы.** Не выдавать synthetic-signed fixtures за настоящие auth events. Phase A по-прежнему запрещает включение LOGIN_RECEIPT_ENABLED/MOBILE_ATTRIBUTION_ENABLED.

Для iPhone доверенный phone из квитанции сопоставляется с прежним Linux OTP claim; никакого возврата на сайт после установки не требуется, если этот серверный контракт реально подключён. Для Android одного общего signed-login receipt недостаточно: Linux требует подписанное `participation.inviteTokenHash`. Текущий сохранённый процесс входа не передаёт приглашение/согласие issuer-у; способ получить добровольное участие и связать его с hash должен быть отдельно разработан и согласован. Не начинать передавать пароль/session token в Linux и не ослаблять проверку подписи ради демонстрации.

Сам receipt не подтверждает новую регистрацию или первый запуск. Для этих событий необходимы отдельные проверенные evidence и baseline, описанные в SESSION-VERIFICATION-PLAN.md и серверном контракте.

Проверка нового клиента выполняется дополнительно:

```sh
node --test tests/referral-receipt.test.cjs tests/login-timeout.test.cjs
```

## Общие release gates

- Подготовить `assetlinks.json` для фактических distribution signers и `apple-app-site-association` по подписанному iOS application-identifier; инструкции в NATIVE-RELEASE.md. Не включать debug fingerprint в production.
- Утверждённый Linux SMS API/отправитель, privacy text/retention и server-side session verifier должны работать на контролируемом стенде. Не включать старый Windows bridge ради прохождения демонстрации.
- Отдельно проверить существующего и нового абонента, сбой SMS, pending registration, отказ/отзыв session receipt, повторный вход/установку, смену учётной записи, конкурирующие приглашения, offline и восстановление.
- iPhone: номер подтверждается **до установки**; после входа app не должна требовать возвращения к QR. Серверное сопоставление не может опираться на переданный клиентом телефон.
- Проверить сохранность обычного входа, восстановления, ESIA, push и открытия заявок. Пользовательские данные и реальные заявки в тестах не создавать.
- Конечные показатели PHONE_VERIFIED / APP_LOGIN_CONFIRMED / REGISTRATION_CONFIRMED / APP_FIRST_OPEN не объединять; referrer и нажатие магазина не доказывают вход/регистрацию.
- Текущий пакет не является разрешением включить runtime, загрузить магазинную версию или менять Windows/SQL. Запуск согласуется по точным артефактам и результатам реальных тестов.
