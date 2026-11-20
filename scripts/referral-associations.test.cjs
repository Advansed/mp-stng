'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { associations, generate } = require('./generate-referral-associations.cjs');
const fixture = () => ({ confirmReleaseIdentifiers: true, androidSha256: [Array.from({length: 32}, (_, i) => i.toString(16).padStart(2, '0')).join(':')], iosApplicationIdentifier: 'TESTTEAM01.aostng.stng' });
test('association payload scopes exact production app IDs and only invitation iOS paths', () => {
  const result = associations(fixture());
  assert.equal(result['assetlinks.json'][0].target.package_name, 'io.ionic.stng');
  assert.deepEqual(result['assetlinks.json'][0].relation, ['delegate_permission/common.handle_all_urls']);
  assert.deepEqual(result['apple-app-site-association'].applinks.details, [{ appID: 'TESTTEAM01.aostng.stng', paths: ['/r/*'] }]);
});
test('rejects missing confirmation, signing fingerprint and mismatched iOS bundle', () => {
  for (const value of [{}, {...fixture(), confirmReleaseIdentifiers: false}, {...fixture(), androidSha256: []}, {...fixture(), androidSha256: ['00:'.repeat(31)+'00']}, {...fixture(), androidSha256: ['invalid']}, {...fixture(), iosApplicationIdentifier: 'U44HUUK428.io.ionic.stng'}, {...fixture(), iosApplicationIdentifier: 'XXXXXXXXXX.aostng.stng'}]) assert.throws(() => associations(value));
});
test('deduplicates release fingerprints, permitting independently verified store signers', () => {
  const input = fixture(); input.androidSha256.push(input.androidSha256[0].toUpperCase());
  assert.equal(associations(input)['assetlinks.json'][0].target.sha256_cert_fingerprints.length, 1);
});
test('invalid metadata creates no artifacts; existing output cannot be overwritten', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'referral-association-test-'));
  try {
    const input = path.join(temp,'metadata.json'), out = path.join(temp,'output');
    fs.writeFileSync(input, '{}'); assert.throws(() => generate(input, out)); assert.equal(fs.existsSync(out), false);
    fs.writeFileSync(input, JSON.stringify(fixture())); generate(input, out);
    assert.equal(fs.readdirSync(out).length, 2);
    assert.throws(() => generate(input, out), {code:'EEXIST'});
  } finally { fs.rmSync(temp, {recursive:true, force:true}); }
});
test('native configurations preserve launcher, push entitlements and Capacitor forwarding', () => {
  const root = path.resolve(__dirname, '..');
  const manifest = fs.readFileSync(path.join(root,'android/app/src/main/AndroidManifest.xml'),'utf8');
  assert.match(manifest, /android.intent.category.LAUNCHER/);
  assert.match(manifest, /<intent-filter android:autoVerify="true">[\s\S]*android:scheme="https" android:host="referal.aostng.ru" android:pathPrefix="\/r\/"/);
  const entitlements = fs.readFileSync(path.join(root,'ios/App/App/App.entitlements'),'utf8');
  assert.match(entitlements,/applinks:referal\.aostng\.ru/); assert.match(entitlements, /aps-environment/);
  const delegate = fs.readFileSync(path.join(root,'ios/App/App/AppDelegate.swift'),'utf8');
  assert.match(delegate,/ApplicationDelegateProxy.shared.application\(app, open: url/);
  assert.match(delegate,/ApplicationDelegateProxy.shared.application\(application, continue: userActivity/);
});
