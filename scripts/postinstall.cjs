const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const root = path.resolve(__dirname, '..');
const patch = path.join(path.dirname(require.resolve('patch-package/package.json')), 'index.js');
const result = spawnSync(process.execPath, [patch, '--error-on-fail'], {cwd: root, stdio: 'inherit'});
if (result.error || result.signal || result.status !== 0) process.exit(1);

// Codegen's install hook creates private dependency trees outside the root lockfile.
// Its generators need only lodash and the SDK, both provided by our locked root tree.
const codegen = path.dirname(require.resolve('postman-code-generators/package.json'));
assert.equal(require(path.join(codegen, 'package.json')).version, '2.1.1');
const generators = path.join(codegen, 'codegens');
for (const entry of fs.readdirSync(generators, {withFileTypes: true})) {
  if (!entry.isDirectory()) continue;
  const directory = path.join(generators, entry.name);
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
  for (const dependency of Object.keys(manifest.dependencies || {})) {
    assert(['lodash', 'postman-collection'].includes(dependency),
      `Review new codegen dependency ${dependency} before updating the installer.`);
  }
  const nested = path.join(directory, 'node_modules');
  if (fs.existsSync(nested)) {
    assert(!fs.lstatSync(nested).isSymbolicLink(), 'Unexpected codegen dependency symlink.');
    fs.rmSync(nested, {recursive: true});
  }
}

require('./security-check.cjs').checkSource();
