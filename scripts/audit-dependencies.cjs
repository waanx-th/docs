const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const yarn = process.env.npm_execpath;
const command = yarn ? process.execPath : 'yarn';
const args = [...(yarn ? [yarn] : []), 'audit', '--json'];
const result = spawnSync(command, args, {cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024});
const advisories = new Map();
let summary;
for (const line of (result.stdout || '').split('\n')) {
  let record;
  try {record = JSON.parse(line);} catch {continue;}
  if (record.type === 'auditAdvisory') {
    const advisory = record.data.advisory;
    advisories.set(advisory.id, {package: advisory.module_name, severity: advisory.severity, url: advisory.url, title: advisory.title});
  }
  if (record.type === 'auditSummary') summary = record.data;
}
if (!summary || result.error || result.signal) {
  console.error('Dependency audit could not complete. Check registry connectivity and rerun.');
  process.exitCode = 1;
} else {
  const findings = [...advisories.values()];
  const directory = path.join(root, '.security-reports');
  fs.mkdirSync(directory, {recursive: true});
  fs.writeFileSync(path.join(directory, 'dependency-audit.json'), JSON.stringify({generatedAt: new Date().toISOString(), findings}, null, 2) + '\n');
  for (const item of findings) console.log(`${item.severity}: ${item.package} ${item.url}`);
  const blocking = findings.filter(item => ['high', 'critical'].includes(item.severity));
  console.log(`${findings.length} distinct advisories; ${blocking.length} high or critical blockers.`);
  process.exitCode = blocking.length ? 1 : 0;
}
