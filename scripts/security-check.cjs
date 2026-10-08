const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const fingerprintFile = path.join(root, 'security/retired-credential-fingerprints.json');
const fingerprints = new Set(JSON.parse(fs.readFileSync(fingerprintFile, 'utf8')).sha256);

function findRetiredValues(content, banned = fingerprints) {
  return (content.match(/[A-Za-z0-9_+/=-]{16,}/g) || []).some(value =>
    banned.has(crypto.createHash('sha256').update(value).digest('hex')));
}

function filesUnder(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? filesUnder(file) : [file];
  });
}

function checkSource() {
  assert(!fs.existsSync(path.join(root, 'package-lock.json')), 'Use yarn.lock as the only installation lockfile.');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.packageManager, 'yarn@1.22.22');
  const lock = require('@yarnpkg/lockfile').parse(fs.readFileSync(path.join(root, 'yarn.lock'), 'utf8'));
  assert.equal(lock.type, 'success', 'Cannot parse yarn.lock.');
  for (const [name, version] of Object.entries({...pkg.dependencies, ...pkg.devDependencies})) {
    assert(lock.object[`${name}@${version}`], `Lockfile is missing ${name}@${version}.`);
  }
  assert.equal(pkg.scripts.postinstall, 'node scripts/postinstall.cjs');
  assert.equal(require('@faker-js/faker/package.json').version, '10.5.0');
  const generators = fs.readFileSync(require.resolve('postman-collection/lib/superstring/dynamic-variables'));
  assert.equal(crypto.createHash('sha256').update(generators).digest('hex'),
    '5fb3df54c424d0ff18681570f4876921bc5e66258818e8aad6116a01d594321c',
    'Postman compatibility patch is missing or changed. Run yarn install with scripts enabled.');
  const codegen = path.dirname(require.resolve('postman-code-generators/package.json'));
  for (const entry of fs.readdirSync(path.join(codegen, 'codegens'), {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(codegen, 'codegens', entry.name);
    assert(!fs.existsSync(path.join(directory, 'node_modules')),
      `Untracked dependency tree in codegen ${entry.name}. Run yarn install with scripts enabled.`);
    const localRequire = require('node:module').createRequire(path.join(directory, 'package.json'));
    for (const dependency of ['lodash', 'postman-collection']) {
      assert.equal(localRequire.resolve(dependency), require.resolve(dependency),
        `Codegen ${entry.name} must use the audited root ${dependency}.`);
    }
  }
  const authDirectories = fs.readdirSync(path.join(root, 'src')).filter(name => name.endsWith('_auth'));
  assert.equal(authDirectories.length, 1);
  const relative = `src/${authDirectories[0]}/buildPostmanRequest.js`;
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  for (const name of ['apiKey', 'secret']) {
    const values = [...source.matchAll(new RegExp(`var ${name} = "([^"\\n]*)";`, 'g'))];
    assert.equal(values.length, 1, `Expected one ${name} default.`);
    assert.equal(values[0][1], '', `${name} must have an empty default.`);
  }
  assert(source.includes('from "crypto-js"'), 'Use the managed crypto dependency.');
  assert(!fs.existsSync(path.join(root, `src/${authDirectories[0]}/crypto-js.min.js`)), 'Remove the unmanaged crypto bundle.');
  const override = fs.readFileSync(path.join(root, 'src/theme/ApiExplorer/buildPostmanRequest.js'), 'utf8');
  assert(override.includes(`../../${authDirectories[0]}/buildPostmanRequest`), 'Authentication override is not connected.');
  const theme = path.dirname(require.resolve('docusaurus-theme-openapi-docs/package.json'));
  for (const consumer of ['Request', 'CodeSnippets']) {
    const code = fs.readFileSync(path.join(theme, 'lib/theme/ApiExplorer', consumer, 'index.js'), 'utf8');
    assert(code.includes('@theme/ApiExplorer/buildPostmanRequest'), `Theme ${consumer} no longer supports the override.`);
  }
  const files = ['src', 'docs', 'i18n', 'yml-folder', 'static'].flatMap(dir => filesUnder(path.join(root, dir)));
  const hits = files.filter(file => findRetiredValues(fs.readFileSync(file, 'utf8')));
  assert.equal(hits.length, 0, `Retired credentials found in: ${hits.map(file => path.relative(root, file)).join(', ')}`);
  console.log(`Source security checks passed (${files.length} files scanned).`);
}

function checkBuild() {
  const directory = path.join(root, 'build');
  assert(fs.existsSync(directory), 'Build output is missing.');
  const files = filesUnder(directory).filter(file => /\.(?:js|map|html|json)$/.test(file));
  assert(files.length > 0, 'No build assets found.');
  const hits = files.filter(file => findRetiredValues(fs.readFileSync(file, 'utf8')));
  assert.equal(hits.length, 0, `Retired credentials found in: ${hits.map(file => path.relative(root, file)).join(', ')}`);
  console.log(`Build security scan passed (${files.length} files scanned).`);
}

module.exports = {findRetiredValues, checkSource, checkBuild};
if (require.main === module) {
  try {
    checkSource();
    if (process.argv.includes('--build')) checkBuild();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
