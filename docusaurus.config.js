// @ts-check
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'WaanX API Documentation',
  tagline: '',
  url: 'https://waanx-th.github.io',
  baseUrl: '/docs-waanx/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/waanx_icon.svg',
  themes: ['docusaurus-theme-openapi-docs'],

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
          docLayoutComponent: "@theme/DocPage",
          docItemComponent: "@theme/ApiItem"
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
              {
                type: 'doc',
                docId: 'v5/copytrade',
                label: 'Copy Trading',
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
