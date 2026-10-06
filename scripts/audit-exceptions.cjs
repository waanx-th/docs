const bracesBuildPaths = new Set([
  '@docusaurus/utils>micromatch>braces',
  '@docusaurus/utils-validation>@docusaurus/utils>micromatch>braces',
  '@docusaurus/utils>globby>fast-glob>micromatch>braces',
  '@docusaurus/utils-validation>@docusaurus/utils>globby>fast-glob>micromatch>braces',
  '@docusaurus/core>@docusaurus/babel>@docusaurus/utils>globby>fast-glob>micromatch>braces',
  '@docusaurus/preset-classic>@docusaurus/core>@docusaurus/babel>@docusaurus/utils>globby>fast-glob>micromatch>braces',
  '@docusaurus/preset-classic>@docusaurus/plugin-content-blog>@docusaurus/core>@docusaurus/babel>@docusaurus/utils>globby>fast-glob>micromatch>braces',
  '@docusaurus/preset-classic>@docusaurus/theme-classic>@docusaurus/plugin-content-blog>@docusaurus/core>@docusaurus/babel>@docusaurus/utils>globby>fast-glob>micromatch>braces',
  '@docusaurus/preset-classic>@docusaurus/theme-classic>@docusaurus/plugin-content-blog>@docusaurus/core>@docusaurus/bundler>@docusaurus/babel>@docusaurus/utils>globby>fast-glob>micromatch>braces',
]);

function isTemporaryBracesException(advisory) {
  if (advisory.github_advisory_id !== 'GHSA-vfj7-8cjw-p6xm' ||
      advisory.module_name !== 'braces' || advisory.severity !== 'high' ||
      advisory.url !== 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm' ||
      advisory.vulnerable_versions !== '<=3.0.3' || advisory.patched_versions !== '<0.0.0' ||
      advisory.findings?.length !== 1 || advisory.findings[0].version !== '3.0.3') return false;

  const paths = advisory.findings[0].paths;
  return Array.isArray(paths) && paths.length === bracesBuildPaths.size &&
    new Set(paths).size === bracesBuildPaths.size && paths.every(item => bracesBuildPaths.has(item));
}

module.exports = {isTemporaryBracesException};
