const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
test('store SDKs isolated into explicit variants with honest minimum API', () => {
 const gradle = read('android/app/build.gradle');
 assert.match(gradle, /playImplementation "com.android.installreferrer:installreferrer:2.2"/);
 assert.match(gradle, /rustoreImplementation "ru.rustore.sdk:installreferrer:10.6.1"/);
 assert.match(gradle, /rustore \{[\s\S]*?minSdkVersion 23/);
 assert.match(read('android/variables.gradle'), /minSdkVersion = 22/);
});
test('native capture contains no auth/account/network reporting and guards installer', () => {
 const plugin=read('android/app/src/main/java/io/ionic/stng/referral/StngInstallReferrerPlugin.java');
 assert.match(plugin,/INSTALLER\.equals\(installer\(\)\)/);
 assert.match(plugin,/commit\(\)/);
 assert.match(plugin,/TIMEOUT = 8000/);
 assert.match(plugin,/current\.equals\(token\)/);
 assert.doesNotMatch(plugin,/Log\.|sendAuthEvent|sendFsaEvent|authorization|REGISTRATION_CONFIRMED|PHONE_VERIFIED/);
});
test('referral native preferences excluded from cloud/device transfer backups', () => {
 for (const p of ['referral_backup_rules.xml','referral_data_extraction_rules.xml']) assert.match(read('android/app/src/main/res/xml/'+p), /stng_install_referral.xml/);
 const manifest=read('android/app/src/main/AndroidManifest.xml');
 assert.match(manifest,/android:fullBackupContent="@xml\/referral_backup_rules"/);
 assert.match(manifest,/android:dataExtractionRules="@xml\/referral_data_extraction_rules"/);
});
test('Google disconnects; RuStore does not send optional phone/auth advertising events', () => {
 const play=read('android/app/src/play/java/io/ionic/stng/referral/StoreReferrerFactory.java');
 const rustore=read('android/app/src/rustore/java/io/ionic/stng/referral/StoreReferrerFactory.java');
 assert.match(play,/client.endConnection\(\)/);
 assert.match(rustore,/getInstallReferrerV2\(\)/);
 assert.doesNotMatch(rustore,/sendAuthEvent|sendFsaEvent|PhoneNumber|getDebugInfo/);
});
test('launcher has brand resource and fallback below Android26', () => {
 for (const name of ['ic_launcher','ic_launcher_round']) {
  assert.match(read(`android/app/src/main/res/mipmap-nodpi/${name}.xml`), /@mipmap\/stng_launcher_mark/);
  assert.match(read(`android/app/src/main/res/mipmap-anydpi-v26/${name}.xml`), /@drawable\/stng_launcher_foreground/);
 }
 const brand=fs.readFileSync(path.join(root,'android/app/src/main/res/mipmap-nodpi/stng_launcher_mark.png'));
 assert.equal(brand.subarray(1,4).toString(),'PNG');
 assert.match(read('android/app/src/main/res/drawable/stng_launcher_foreground.xml'), /@mipmap\/stng_launcher_mark/);
});
