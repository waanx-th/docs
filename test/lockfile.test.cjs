const test = require('node:test');
const assert = require('node:assert/strict');
const {checkLockfileRegistry} = require('../scripts/check-lockfile.cjs');

const lock = url => `example@1.0.0:\n  version "1.0.0"\n  resolved "${url}"\n`;

test('public npm and Yarn package downloads are accepted', () => {
  for (const host of ['registry.npmjs.org', 'registry.yarnpkg.com']) {
    assert.equal(checkLockfileRegistry(lock(`https://${host}/example/-/example-1.0.0.tgz`)), 1);
  }
});

test('private mirrors are rejected without printing their URLs', () => {
  const url = 'https://packages.example.invalid/example.tgz';
  assert.throws(() => checkLockfileRegistry(lock(url)), error => {
    assert.match(error.message, /yarn.lock:3 must resolve through a public npm registry/);
    assert.ok(!error.message.includes(url));
    return true;
  });
});

test('insecure and credential-bearing URLs are rejected', () => {
  for (const url of ['http://registry.npmjs.org/example.tgz',
    'https://test-user:test-password@registry.npmjs.org/example.tgz',
    'file:example.tgz']) {
    assert.throws(() => checkLockfileRegistry(lock(url)));
  }
});

test('empty lockfiles cannot silently bypass the registry check', () => {
  assert.throws(() => checkLockfileRegistry(''), /No resolved dependencies/);
});
