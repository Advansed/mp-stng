#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');

// Public signing metadata only. Never accepts keystores, credentials or private keys.
function associations(input) {
  if (!input || input.confirmReleaseIdentifiers !== true) {
    throw new Error('Confirm identifiers from the signed release, not debug/upload signing credentials');
  }
  if (!Array.isArray(input.androidSha256) || !input.androidSha256.length) {
    throw new Error('At least one verified Android release SHA-256 fingerprint is required');
  }
  const fingerprints = [...new Set(input.androidSha256.map(value => {
    if (typeof value !== 'string' || !/^(?:[0-9A-Fa-f]{2}:){31}[0-9A-Fa-f]{2}$/.test(value)) {
      throw new Error('Invalid Android SHA-256 fingerprint');
    }
    if (new Set(value.toUpperCase().split(':')).size === 1) throw new Error('Placeholder fingerprint rejected');
    return value.toUpperCase();
  }))];
  // Use application-identifier from the signed iOS release. App ID prefix can differ from Team ID.
  if (typeof input.iosApplicationIdentifier !== 'string' || !/^[A-Z0-9]{10}\.aostng\.stng$/.test(input.iosApplicationIdentifier)
      || /^(XXXXXXXXXX|TEAMIDHERE|0123456789)\./.test(input.iosApplicationIdentifier)) {
    throw new Error('Verified iOS application-identifier ending in .aostng.stng is required');
  }
  return {
    'assetlinks.json': [{ relation: ['delegate_permission/common.handle_all_urls'], target: {
      namespace: 'android_app', package_name: 'io.ionic.stng', sha256_cert_fingerprints: fingerprints
    }}],
    'apple-app-site-association': { applinks: { apps: [], details: [{
      appID: input.iosApplicationIdentifier, paths: ['/r/*']
    }] }}
  };
}
function generate(inputFile, outputDirectory) {
  const result = associations(JSON.parse(fs.readFileSync(inputFile, 'utf8')));
  // New output directory only: do not overwrite deployed association documents.
  fs.mkdirSync(outputDirectory, { recursive: false });
  for (const [name, value] of Object.entries(result)) {
    fs.writeFileSync(path.join(outputDirectory, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o644 });
  }
}
if (require.main === module) {
  try {
    if (process.argv.length !== 4) throw new Error('Usage: node scripts/generate-referral-associations.cjs <verified-public-identifiers.json> <NEW-output-directory>');
    generate(process.argv[2], process.argv[3]);
    process.stdout.write('Association files prepared locally; nothing published. Verify against signed release before deployment.\n');
  } catch (error) {
    // Never echo supplied data or parse errors which might contain file contents.
    process.stderr.write(error instanceof SyntaxError ? 'Invalid JSON metadata file\n' : error.code ? `Filesystem error: ${error.code}\n` : `${error.message}\n`);
    process.exitCode = 1;
  }
}
module.exports = { associations, generate };
