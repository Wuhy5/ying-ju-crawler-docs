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
      label: '简介',
    },
    {
      type: 'category',
      label: '核心概念',
      items: [
        {
          type: 'doc',
          id: 'core/concepts',
          label: '基本概念',
        },
        {
          type: 'doc',
          id: 'core/rule-file',
          label: '规则文件结构',
        },
      ],
    },
    {
      type: 'category',
      label: '规范定义',
      items: [
        {
          type: 'doc',
          id: 'spec/schema',
          label: 'JSON Schema',
        },
        {
          type: 'doc',
          id: 'spec/media-types',
          label: '媒体类型',
        },
        {
          type: 'doc',
          id: 'spec/field-mapping',
          label: '字段映射',
        },
        {
          type: 'doc',
          id: 'spec/pipeline',
          label: '流水线系统',
        },
      ],
    },
    {
      type: 'category',
      label: '配置指南',
      items: [
        {
          type: 'doc',
          id: 'config/cache',
          label: '缓存配置',
        },
        {
          type: 'doc',
          id: 'config/http',
          label: 'HTTP 配置',
        },
        {
          type: 'doc',
          id: 'config/scripting',
          label: '脚本配置',
        },
      ],
    },
    {
      type: 'category',
      label: '高级特性',
      items: [
        {
          type: 'doc',
          id: 'components/overview',
          label: '组件系统',
        },
        {
          type: 'doc',
          id: 'flows/overview',
          label: '流程系统',
        },
      ],
    },
    {
      type: 'category',
      label: 'Schema 定义',
      items: [
        {
          type: 'doc',
          id: 'schema/README',
          label: 'Schema 规范',
        },
      ],
    },
    {
      type: 'category',
      label: '实践示例',
      items: [
        {
          type: 'doc',
          id: 'examples/README',
          label: '示例概述',
        },
        {
          type: 'doc',
          id: 'examples/cache-example',
          label: '缓存示例',
        },
        {
          type: 'doc',
          id: 'examples/flow-example',
          label: '流程示例',
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
