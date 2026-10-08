# WaanX API Documentation

This website uses [Docusaurus 3](https://docusaurus.io/).

## Requirements and installation

Use Node.js 22.22.0 (see `.nvmrc`) and Yarn Classic 1.22.22. `yarn.lock` is the installation lockfile.

```sh
nvm install
nvm use
npm install --global yarn@1.22.22
yarn install --frozen-lockfile
```

Installation applies the versioned Postman compatibility patch. Do not skip install scripts.

## Local development

```sh
yarn start                  # English
yarn start --locale th   # th
```

Edit English pages in `docs/` and translations in `i18n/th/docusaurus-plugin-content-docs/current/`. Sidebar order is defined in `sidebars.js`; site settings are in `docusaurus.config.js`.

The WaanX theme uses the brand's royal blue palette, self-hosted Lato, and FC Vision for Thai pages (with Noto Sans Thai as a fallback). The supplied FC Vision files are marked **Non-commercial**; their usage memo is in `static/font/FCVision-License-and-Memo.txt`. Confirm the permitted scope before using these files for any commercial purpose. The Lato and Noto Sans Thai OFL licenses are also in `static/font/`.

## Validation and production preview

```sh
yarn build
yarn serve
yarn audit --level high
```

`yarn build` builds both locales; it does not scan generated assets for credentials. CI runs `yarn audit --level high` and fails on audit findings. Use `yarn clear` after dependency or theme changes to remove stale build caches.

The API explorer requires your own key and secret for authenticated requests. It provides no shared credentials. Use an IP allowlist and minimum permissions; never commit credentials or environment files. The local signing implementation is in `src/waanx_auth/buildPostmanRequest.js`, exposed through `src/theme/ApiExplorer/buildPostmanRequest.js`.

See [dependency maintenance](security/dependency-maintenance.md) before changing dependency resolutions or the Postman patch. Existing Docusaurus commands, including `yarn swizzle`, `yarn write-translations` and `yarn write-heading-ids`, remain available.

## Deployment

`yarn deploy` publishes the site using its Docusaurus deployment settings. Run it only through the approved release process. Local installation, validation and previews do not deploy the site.
