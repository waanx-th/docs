// @ts-check
const {themes: prismThemes} = require('prism-react-renderer');
const lightCodeTheme = prismThemes.github;
const darkCodeTheme = prismThemes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'WaanX API Documentation',
  tagline: '',
  url: 'https://waanx-th.github.io',
  baseUrl: '/docs-waanx/',
  onBrokenLinks: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'warn'}},
  favicon: 'img/waanx_icon.svg',
  themes: ['docusaurus-theme-openapi-docs'],
  plugins: ['docusaurus-plugin-sass'],

  organizationName: 'waanx-th',
  projectName: 'docs-waanx',
  trailingSlash: false,

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'th'],
    localeConfigs: {
      en: { label: 'English' },
      'th': { label: 'ไทย' },
    },
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          docItemComponent: "@theme/ApiItem",
          exclude: [
            ...require('@docusaurus/utils').GlobExcludeDefault,
            'v5/copytrade.mdx',
            'v5/demo.mdx',
            'v5/bot/**',
            'v5/strategy/**',
            'v5/finance/earn/**',
            'v5/asset/fiat-convert/**',
            'v5/affiliate/**',
            'v5/order/spot-borrow-quota.mdx',
            'v5/account/{batch-set-collateral,borrow,borrow-history,coin-greeks,collateral-info,get-mmp-state,get-user-setting-config,no-convert-repay,pay-info,repay,repay-liability,reset-mmp,set-collateral,set-delta-mode,set-margin-mode,set-price-limit,set-spot-hedge,upgrade-unified-account}.mdx',
            'v5/asset/deposit/submit-info.mdx',
            'v5/asset/withdraw/{questionnaire,vasp-list}.mdx',
            'v5/rate-limit/rules-for-pros/**',
          ],
        },
        blog: false,
        theme: {
          customCss: [
            require.resolve('./src/css/waanx.css'),
            require.resolve('./src/css/custom.css'),
          ],
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      api: {authPersistence: false},
      colorMode: {
        defaultMode: 'dark',
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 5,
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      navbar: {
        title: '',
        logo: {
          alt: 'WaanX Logo',
          src: 'img/waanx_logo_color.svg',
          srcDark: 'img/waanx_logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'v5/guide',
            position: 'left',
            label: 'V5 API',
          },
          {
            type: 'dropdown',
            position: 'right',
            label: 'Extras',
            items: [
              {
                type: 'doc',
                docId: 'changelog/v5',
                label: 'Changelog',
              },
              {
                to: '/faq',
                label: 'FAQ',
              },
            ]
          },
          {
            type: 'localeDropdown',
            position: 'right',
            dropdownItemsBefore: [],
            dropdownItemsAfter: [],
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'WaanX',
            items: [
              {
                label: 'Website',
                href: 'https://www.waanx.com',
              },
              {
                label: 'Help Centre',
                href: 'https://support.waanx.com/en/support/home',
              },
            ],
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ["ruby", "csharp", "php", "http", "json", "n4js", "java"],
      },
    }),
};

module.exports = config;
