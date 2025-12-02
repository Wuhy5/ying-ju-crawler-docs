import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'README',
      label: '📖 简介',
    },
    {
      type: 'category',
      label: '🚀 入门指南',
      items: [
        {
          type: 'doc',
          id: 'guide/getting-started',
          label: '快速开始',
        },
        {
          type: 'doc',
          id: 'guide/concepts',
          label: '核心概念',
        },
        {
          type: 'doc',
          id: 'guide/extraction',
          label: '字段提取',
        },
      ],
    },
    {
      type: 'category',
      label: '⚙️ 流程配置',
      items: [
        {
          type: 'doc',
          id: 'flows/search',
          label: '搜索流程',
        },
        {
          type: 'doc',
          id: 'flows/detail',
          label: '详情流程',
        },
        {
          type: 'doc',
          id: 'flows/discovery',
          label: '发现流程',
        },
        {
          type: 'doc',
          id: 'flows/content',
          label: '内容流程',
        },
        {
          type: 'doc',
          id: 'flows/login',
          label: '登录流程',
        },
      ],
    },
    {
      type: 'category',
      label: '📚 参考文档',
      items: [
        {
          type: 'doc',
          id: 'reference/steps',
          label: '提取步骤',
        },
        {
          type: 'doc',
          id: 'reference/filters',
          label: '过滤器',
        },
        {
          type: 'doc',
          id: 'reference/media-types',
          label: '媒体类型',
        },
        {
          type: 'doc',
          id: 'reference/http',
          label: 'HTTP 配置',
        },
        {
          type: 'doc',
          id: 'reference/scripting',
          label: '脚本配置',
        },
      ],
    },
    {
      type: 'category',
      label: '📋 Schema 定义',
      items: [
        {
          type: 'doc',
          id: 'schema/README',
          label: 'JSON Schema',
        },
      ],
    },
    {
      type: 'doc',
      id: 'disclaimer',
      label: '⚠️ 免责声明',
    },
  ],
};

export default sidebars;
