const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function checkLockfileRegistry(content) {
  const entries = [...content.matchAll(/^ {2}resolved "([^"]+)"$/gm)];
  assert(entries.length > 0, 'No resolved dependencies found in yarn.lock.');
  for (const entry of entries) {
    const line = content.slice(0, entry.index).split('\n').length;
    let url;
    try { url = new URL(entry[1]); } catch { /* Report the line without exposing its URL. */ }
    assert(url && url.protocol === 'https:' &&
      ['registry.npmjs.org', 'registry.yarnpkg.com'].includes(url.hostname) &&
      !url.username && !url.password,
    `yarn.lock:${line} must resolve through a public npm registry without credentials.`);
  }
  return entries.length;
}

function checkFile() {
  const lockfile = path.join(__dirname, '../yarn.lock');
  const count = checkLockfileRegistry(fs.readFileSync(lockfile, 'utf8'));
  console.log(`Lockfile registry checks passed (${count} package entries).`);
}

module.exports = {checkLockfileRegistry, checkFile};
if (require.main === module) {
  try { checkFile(); } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
