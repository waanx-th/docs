const test = require('node:test');
const assert = require('node:assert/strict');
const {isTemporaryBracesException} = require('../scripts/audit-exceptions.cjs');

const paths = [
  '@docusaurus/utils>micromatch>braces',
  '@docusaurus/utils-validation>@docusaurus/utils>micromatch>braces',
  '@docusaurus/utils>globby>fast-glob>micromatch>braces',
  '@docusaurus/utils-validation>@docusaurus/utils>globby>fast-glob>micromatch>braces',
  '@docusaurus/core>@docusaurus/babel>@docusaurus/utils>globby>fast-glob>micromatch>braces',
  '@docusaurus/preset-classic>@docusaurus/core>@docusaurus/babel>@docusaurus/utils>globby>fast-glob>micromatch>braces',
  '@docusaurus/preset-classic>@docusaurus/plugin-content-blog>@docusaurus/core>@docusaurus/babel>@docusaurus/utils>globby>fast-glob>micromatch>braces',
  '@docusaurus/preset-classic>@docusaurus/theme-classic>@docusaurus/plugin-content-blog>@docusaurus/core>@docusaurus/babel>@docusaurus/utils>globby>fast-glob>micromatch>braces',
  '@docusaurus/preset-classic>@docusaurus/theme-classic>@docusaurus/plugin-content-blog>@docusaurus/core>@docusaurus/bundler>@docusaurus/babel>@docusaurus/utils>globby>fast-glob>micromatch>braces',
];

const advisory = () => ({
  github_advisory_id: 'GHSA-vfj7-8cjw-p6xm',
  module_name: 'braces',
  severity: 'high',
  url: 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
  vulnerable_versions: '<=3.0.3',
  patched_versions: '<0.0.0',
  findings: [{version: '3.0.3', paths: [...paths]}],
});

test('only the unpatched braces advisory on known build paths is excepted', () => {
  assert.equal(isTemporaryBracesException(advisory()), true);
  for (const [field, value] of [
    ['github_advisory_id', 'GHSA-new'], ['module_name', 'other-package'],
    ['severity', 'critical'], ['url', 'https://example.invalid'],
    ['vulnerable_versions', '<=3.0.4'], ['patched_versions', '>=3.0.4'],
  ]) assert.equal(isTemporaryBracesException({...advisory(), [field]: value}), false, field);
});

test('version changes and new, missing, duplicate, or absent dependency paths block', () => {
  const changed = finding => ({...advisory(), findings: [finding]});
  assert.equal(isTemporaryBracesException(changed({version: '3.0.4', paths})), false);
  for (const altered of [
    [...paths, 'untrusted>micromatch>braces'], paths.slice(1),
    [...paths.slice(1), paths[1]], [...paths.slice(1), 'untrusted>micromatch>braces'],
  ]) assert.equal(isTemporaryBracesException(changed({version: '3.0.3', paths: altered})), false);
  assert.equal(isTemporaryBracesException({...advisory(), findings: []}), false);
});
