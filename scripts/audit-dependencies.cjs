const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {isTemporaryBracesException} = require('./audit-exceptions.cjs');
const root = path.resolve(__dirname, '..');
const yarn = process.env.npm_execpath;
const command = yarn ? process.execPath : 'yarn';
const args = [...(yarn ? [yarn] : []), 'audit', '--json'];
const result = spawnSync(command, args, {cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024});
const advisories = new Map();
let summary;
let inconsistent = false;
for (const line of (result.stdout || '').split('\n')) {
  let record;
  try {record = JSON.parse(line);} catch {continue;}
  if (record.type === 'auditAdvisory') {
    const advisory = record.data.advisory;
    const previous = advisories.get(advisory.id);
    const item = {package: advisory.module_name, severity: advisory.severity, url: advisory.url, title: advisory.title};
    if (previous && (previous.package !== item.package || previous.severity !== item.severity || previous.url !== item.url)) inconsistent = true;
    item.exception = isTemporaryBracesException(advisory) && (!previous || previous.exception) ? 'unpatched-braces-build-only' : null;
    advisories.set(advisory.id, item);
  }
  if (record.type === 'auditSummary') summary = record.data;
}
if (!summary || result.error || result.signal || inconsistent) {
  console.error('Dependency audit could not complete. Check registry connectivity and rerun.');
  process.exitCode = 1;
} else {
  const findings = [...advisories.values()];
  const directory = path.join(root, '.security-reports');
  fs.mkdirSync(directory, {recursive: true});
  fs.writeFileSync(path.join(directory, 'dependency-audit.json'), JSON.stringify({generatedAt: new Date().toISOString(), findings}, null, 2) + '\n');
  for (const item of findings) console.log(`${item.severity}: ${item.package} ${item.url}${item.exception ? ' (temporary build-only exception; no upstream fix)' : ''}`);
  const blocking = findings.filter(item => ['high', 'critical'].includes(item.severity) && !item.exception);
  console.log(`${findings.length} distinct advisories; ${blocking.length} high or critical blockers; ${findings.filter(item => item.exception).length} temporary exception(s).`);
  process.exitCode = blocking.length ? 1 : 0;
}
