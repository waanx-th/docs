# Dependency maintenance

Use Node.js 22.22.0 and Yarn 1.22.22. Commit `package.json`, `yarn.lock` and any compatibility patches together. Keep `yarn.lock` as the only installation lockfile.

## Registry portability

All lockfile tarball URLs must use the public npm or Yarn registry over HTTPS without embedded credentials. A local package cache can hide an unreachable mirror URL, even when `.yarnrc` selects the public registry. The dependency-free `scripts/check-lockfile.cjs` runs before installation in CI, as the Yarn preinstall hook, and during security checks. When changing registry URLs, verify the public package integrity against the existing lockfile and validate with an empty package cache.

## Postman and Faker

`postman-collection@5.3.1` still pins `@faker-js/faker@5.5.3`. The advisory [GHSA-qxc2-j82w-r537](https://github.com/advisories/GHSA-qxc2-j82w-r537) lists Faker versions through 10.4.0 as affected. The Yarn resolution installs the patched 10.5.0 release; no advisory is suppressed.

`patches/postman-collection+5.3.1.patch` migrates the SDK's dynamic-variable generators to Faker 10's English locale export and renamed APIs. It retains all 118 Postman variable names, legacy phone/account/mask formats, and image categories. The removed company-suffix generator retains the SDK's four English suffix choices. Category image URLs use Faker's deprecated `urlLoremFlickr` API to preserve categories; image availability depends on the external provider, and Faker 11 will require revisiting these generators.

The patch does not modify SDK request parsing, serialization, substitution, code generators or the site's authentication logic. The postinstall script runs `patch-package --error-on-fail`; a patch mismatch fails the install. `yarn security:check` verifies the installed generator against the expected SHA-256 so an installation that skips the patch cannot pass validation.

When Postman releases native support for a patched Faker version, upgrade the SDK and remove the compatibility patch and Faker resolution together. Run `yarn test`, `yarn clear`, `yarn build` and `yarn security:audit`. Tests cover every dynamic variable, key output formats, the advisory's function-constructor access, request signing and all 35 snippet variants. Keep Node and browser build compatibility in the review.

## Code generator dependency trees

`postman-code-generators@2.1.1` runs its own installs inside 35 generator directories. These nested trees bypass the root Yarn resolutions and can reinstall vulnerable SDK and lodash versions. `scripts/postinstall.cjs` removes these generated `node_modules` directories after the upstream install hook completes. The source and language generators remain intact and resolve the patched SDK and lodash from the root lockfile.

The installer rejects unexpected generator dependencies so a future upgrade requires review. The security check verifies there are no nested generator trees and that each generator resolves the same audited root modules. All language variants are exercised by `yarn test`. Do not run the dependency's `deepinstall` script manually; rerun `yarn install` if it has been run.

## Other resolutions

- `serialize-javascript@7.0.5`: fixes vulnerable transitive 6.x releases in the build tools. Requires the pinned Node runtime.
- `openapi-to-postmanv2/js-yaml@4.3.2` and `yaml@1.10.3`: update pinned converter dependencies within their current major versions.
- `uuid@11.1.1`: replaces affected 8.x transitive versions; the SDK's UUID generation is exercised in tests and both locale bundles are built.
- `source-map-js@1.2.2`, `shell-quote@1.11.0`, `http-cache-semantics@4.3.0` and `tinypool@2.1.2`: replace vulnerable transitive releases; `tinypool` crosses a major version, so keep tests and both locale builds in CI.

Remove a resolution only after the upstream dependency tree resolves to safe versions without it. Yarn reports intentional version-range override warnings for these pins. Check the complete audit output; the audit command includes development dependencies and fails on high or critical findings.

## Temporary build-only audit exception

As of 2026-10-06, [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) affects `braces@3.0.3` and has no patched release. All nine observed dependency paths are through Docusaurus build tooling and `micromatch`; this static documentation site does not serve those Node.js tools to visitors. Deeply nested, attacker-controlled glob patterns could still crash a build process, so treat documentation/configuration changes and external build inputs as trusted-only pending an upstream fix. This is an accepted **build-time availability risk**, not a claim that the dependency is fixed.

`scripts/audit-exceptions.cjs` permits only this exact advisory, package, version, unpatched status and nine observed paths. The audit continues to print and record the high finding and exception. Any new path, changed version or available patch makes CI fail again for review. Upgrade/remove the exception when `braces` or its Docusaurus dependency chain is fixed; do not expand it to other advisories. The moderate `postcss-selector-parser` finding remains visible and should be addressed through a compatible upstream update rather than a forced major override.

## Credential cleanup

The request builder has empty key and secret defaults, matching the main documentation site. The theme consumes the source-controlled override, so reinstalling dependencies cannot restore embedded credentials. Prebuild and postbuild checks scan sources and generated assets against SHA-256 fingerprints of retired values.

Removing credentials from source and new bundles does not revoke a credential or erase historical copies. The credential owner must revoke or rotate the previously exposed pair and review its activity. Replacing published bundles requires a separate approved release; this repository's verification workflow does not deploy.
