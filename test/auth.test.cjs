const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const sdk = require('postman-collection');
const cloneDeep = require('lodash/cloneDeep');
const cryptoJsMin = require('crypto-js');
const {findRetiredValues} = require('../scripts/security-check.cjs');

const directory = fs.readdirSync(path.join(__dirname, '../src')).find(name => name.endsWith('_auth'));
const source = fs.readFileSync(path.join(__dirname, `../src/${directory}/buildPostmanRequest.js`), 'utf8');
const executable = source.replace(/^import .*;\r?\n/gm, '').replace('export default buildPostmanRequest;', 'buildPostmanRequest;');
const timestamp = '1789992000000';
const build = vm.runInNewContext(executable, {sdk, cloneDeep, cryptoJsMin, window: {location: {origin: 'https://example.invalid'}}, Date: {now: () => Number(timestamp)}});

for (const input of [
  {name: 'missing credentials use empty defaults'},
  {name: 'explicit empty credentials', key: '', secret: ''},
  {name: 'missing secret has no shared fallback', key: 'test-only-key'},
  {name: 'missing key has no shared fallback', secret: 'test-only-secret'},
  {name: 'GET signs encoded query', key: 'test-only-key', secret: 'test-only-secret'},
  {name: 'POST signs exact JSON body', key: 'test-only-key', secret: 'test-only-secret', method: 'POST'},
  {name: 'public requests have no authentication headers', public: true},
]) {
  test(input.name, () => {
    const method = input.method || 'GET';
    const raw = '{"category":"spot","symbol":"BTCUSDT","qty":"0.01"}';
    const body = method === 'POST' ? {type: 'raw', content: {type: 'string', value: raw}} : {type: 'empty'};
    const headerParams = input.public ? [] : ['apiKey', 'secret'].map((name, index) => {
      const value = index ? input.secret : input.key;
      return value === undefined ? {name} : {name, value};
    });
    const request = new sdk.Request({method, url: 'https://example.invalid/v5/example', body: {mode: 'raw', raw: ''}});
    const result = build(request, {queryParams: [{name: 'symbol', value: 'BTCUSDT'}, {name: 'cursor', value: 'a+b/c='}], pathParams: [], cookieParams: [], contentType: 'application/json', accept: 'application/json', headerParams, body, server: {url: 'https://example.invalid'}, auth: {}});
    if (input.public) {
      assert.equal(result.headers.has('X-BAPI-SIGN'), false);
      assert.equal(result.headers.has('X-BAPI-API-KEY'), false);
    } else {
      const payload = method === 'POST' ? raw : result.url.query.toString();
      const signature = crypto.createHmac('sha256', input.secret ?? '').update(timestamp + (input.key ?? '') + '20000' + payload).digest('hex');
      assert.equal(result.headers.get('X-BAPI-API-KEY'), input.key ?? '');
      assert.equal(result.headers.get('X-BAPI-SIGN'), signature);
      assert.equal(result.headers.has('secret'), false);
    }
  });
}

test('asset scanner detects retired values inside minified JavaScript', () => {
  const synthetic = 'SYNTHETIC_TEST_CREDENTIAL_123456';
  const banned = new Set([crypto.createHash('sha256').update(synthetic).digest('hex')]);
  assert.equal(findRetiredValues(`const a="${synthetic}";`, banned), true);
  assert.equal(findRetiredValues('const a="";', banned), false);
});
