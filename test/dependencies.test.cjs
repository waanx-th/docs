const test = require('node:test');
const assert = require('node:assert/strict');
const sdk = require('postman-collection');
const generators = require('postman-collection/lib/superstring/dynamic-variables');
const codegen = require('postman-code-generators');
const {faker} = require('@faker-js/faker/locale/en');

const scope = new sdk.VariableScope();
const resolve = name => scope.replaceIn(`{{${name}}}`);

test('all 118 Postman dynamic variables remain available with patched Faker', () => {
  assert.equal(Object.keys(generators).length, 118);
  faker.seed(42);
  for (const name of Object.keys(generators)) {
    for (let i = 0; i < 3; i++) {
      const value = resolve(name);
      assert.ok(value.length > 0, `${name} returned an empty value`);
      assert.ok(!value.includes('{{'), `${name} was not resolved`);
      assert.ok(!['undefined', 'NaN', '[object Object]'].includes(value), `${name} returned ${value}`);
    }
  }
});

test('dynamic variable formats retain Postman compatibility', () => {
  assert.match(resolve('$randomPhoneNumber'), /^\d{3}-\d{3}-\d{4}$/);
  assert.match(resolve('$randomPhoneNumberExt'), /^\d{1,2}-\d{3}-\d{3}-\d{4}$/);
  assert.match(resolve('$randomBankAccount'), /^\d{8}$/);
  assert.match(resolve('$randomCreditCardMask'), /^\d{4}$/);
  assert.match(resolve('$randomAlphaNumeric'), /^[a-z0-9]$/i);
  assert.match(resolve('$randomUUID'), /^[a-f0-9-]{36}$/i);
  assert.match(resolve('$randomHexColor'), /^#[a-f0-9]{6}$/i);
  assert.match(resolve('$randomBoolean'), /^(true|false)$/);
  assert.match(resolve('$randomCompanySuffix'), /^(Inc|and Sons|LLC|Group)$/);
  assert.ok(Number.isFinite(Date.parse(resolve('$randomDatePast'))));
  assert.ok(Number.isFinite(Date.parse(resolve('$randomDateFuture'))));
  const words = resolve('$randomWords').split(' ');
  assert.ok(words.length >= 2 && words.length <= 5);
  for (const category of ['Abstract', 'Animals', 'Business', 'Cats', 'City', 'Food', 'Nightlife', 'Fashion', 'People', 'Nature', 'Sports', 'Transport']) {
    const url = new URL(resolve(`$random${category}Image`));
    assert.equal(url.protocol, 'https:');
    assert.ok(url.pathname.endsWith(`/${category.toLowerCase()}`));
  }
});

test('patched Faker rejects function-constructor template access', () => {
  // A harmless marker checks the advisory's template access boundary without executing code.
  assert.throws(() => faker.helpers.fake('{{person.firstName.constructor("return 123")}}'));
  faker.rawDefinitions.test = () => () => {};
  try {
    assert.throws(() => faker.helpers.fake('{{test.constructor(return 123)}}'));
  } finally {
    delete faker.rawDefinitions.test;
  }
});

for (const {key: language, variants} of codegen.getLanguageList()) for (const {key: variant} of variants) {
  test(`${language} ${variant} snippets still generate from signed SDK requests`, async () => {
    const request = new sdk.Request({method: 'POST', url: 'https://example.invalid/v5/order/create', header: [
      {key: 'X-BAPI-API-KEY', value: 'test-only-key'},
      {key: 'X-BAPI-SIGN', value: 'test-only-signature'},
      {key: 'Content-Type', value: 'application/json'},
    ], body: {mode: 'raw', raw: '{"category":"spot","symbol":"BTCUSDT"}'}});
    const snippet = await new Promise((resolve, reject) => codegen.convert(language, variant, request, {}, (error, result) => error ? reject(error) : resolve(result)));
    for (const expected of ['example.invalid', 'X-BAPI-SIGN', 'test-only-signature', 'BTCUSDT']) assert.ok(snippet.includes(expected), expected);
  });
}
