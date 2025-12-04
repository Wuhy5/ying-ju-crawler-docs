import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '媒体爬虫规范',
  tagline: '统一、可扩展的多媒体数据采集规则格式',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://wuhy5.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/ying-ju-crawler-docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Wuhy5', // Usually your GitHub org/user name.
  projectName: 'ying-ju-crawler-docs', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // 启用版本管理
          includeCurrentVersion: true,
          lastVersion: 'current',
          versions: {
            current: {
              label: '1.0.0',
              path: '/',
            },
          },
        },
        blog: {
          showReadingTime: true,
          blogTitle: '版本发布',
          blogDescription: '媒体爬虫规范版本发布记录',
          postsPerPage: 'ALL',
          blogSidebarTitle: '所有版本',
          blogSidebarCount: 'ALL',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    announcementBar: {
      id: 'schema_doc_notice',
      content: '⚠️ 文档内容可能未及时更新，如有疑问请以 <a href="/ying-ju-crawler-docs/docs/schema/">schema.json</a> 为准',
      backgroundColor: '#fff3cd',
      textColor: '#856404',
      isCloseable: true,
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '媒体爬虫规范',
      logo: {
        alt: 'Crawler Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '文档',
        },
        {
          to: '/blog',
          label: '版本发布',
          position: 'left',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/Wuhy5/ying-ju-crawler-docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: '快速开始',
              to: '/docs/',
            },
            {
              label: '核心概念',
              to: '/docs/guide/concepts',
            },
          ],
        },
        {
          title: '资源',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Wuhy5/ying-ju-crawler-docs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Ying Ju Project. Built with Docusaurus.<br/><br/>⚠️ <strong>免责声明</strong>: 本规范仅供学习研究使用，请遵守相关法律法规和网站服务条款。使用者应尊重版权，合理控制爬取频率，所有使用后果由使用者自行承担。`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
