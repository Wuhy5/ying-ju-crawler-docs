# 媒体爬虫规则编写指南

## 版本: 1.0.0

欢迎使用媒体爬虫规范！本规范定义了一套统一、可扩展的多媒体数据采集规则格式，支持影视、音频、图书、漫画等多种媒体类型。

## 什么是爬虫规则

爬虫规则是一个配置文件（支持 **TOML** 和 **JSON** 格式），它告诉爬虫程序如何从特定网站提取数据。通过编写规则，你可以：

- 🔍 **搜索内容** - 根据关键词搜索影视、小说、漫画等
- 📋 **浏览分类** - 按类型、地区、年份等筛选内容
- 📖 **获取详情** - 提取标题、封面、简介等详细信息
- ▶️ **解析资源** - 获取播放地址、阅读内容等

## 快速开始

### 最小规则示例

```toml
# 元数据 - 描述规则的基本信息
[meta]
name = "示例视频站"
author = "your_name"
version = "1.0.0"
spec_version = "1.0.0"
domain = "example.com"
media_type = "video"

# 搜索流程 - 实现搜索功能
[search]
url = "https://example.com/search?q={{ keyword }}&page={{ page }}"

[search.fields]
title.steps = [{ css = ".item .title" }]
url.steps = [{ css = ".item a" }, { attr = "href" }]

# 详情页流程 - 获取内容详情
[detail]
url = "{{ detail_url }}"

[detail.fields]
media_type = "video"
title.steps = [{ css = "h1.title" }]
```

### 规则文件结构

一个完整的规则文件包含以下部分：

| 配置块 | 必需 | 说明 |
|--------|------|------|
| `[meta]` | ✅ | 规则元数据，包含名称、作者、版本等 |
| `[search]` | ✅ | 搜索流程，实现关键词搜索 |
| `[detail]` | ✅ | 详情页流程，获取内容详细信息 |
| `[discovery]` | ❌ | 发现页流程，支持分类浏览和筛选 |
| `[content]` | ❌ | 内容页流程，解析播放/阅读资源 |
| `[login]` | ❌ | 登录流程，处理需要认证的网站 |
| `[http]` | ❌ | HTTP 配置，自定义请求头、超时等 |
| `[scripting]` | ❌ | 脚本配置，处理复杂的数据提取逻辑 |

## 文档目录

### 📚 入门教程

- [快速开始](./guide/getting-started.md) - 5分钟创建你的第一个规则
- [核心概念](./guide/concepts.md) - 了解规则的基本组成
- [字段提取](./guide/extraction.md) - 学习如何从网页提取数据

### 🔧 流程配置

- [搜索流程](./flows/search.md) - 实现搜索功能
- [详情流程](./flows/detail.md) - 获取内容详情
- [发现流程](./flows/discovery.md) - 分类浏览与筛选
- [内容流程](./flows/content.md) - 解析播放/阅读资源
- [登录流程](./flows/login.md) - 处理用户认证

### 📖 参考手册

- [提取步骤](./reference/steps.md) - 所有可用的提取步骤
- [过滤器](./reference/filters.md) - 数据转换与处理
- [媒体类型](./reference/media-types.md) - 支持的媒体类型与字段
- [HTTP 配置](./reference/http.md) - 网络请求配置
- [脚本系统](./reference/scripting.md) - 自定义脚本扩展

### 📋 Schema 定义

- [Schema 规范](./schema/README.md) - JSON Schema 完整定义

### ⚠️ 其他

- [免责声明](./disclaimer.md) - 使用规范的法律声明

## 支持的媒体类型

| 类型 | 标识 | 适用场景 |
|------|------|----------|
| 视频 | `video` | 电影、电视剧、动漫、综艺等 |
| 音频 | `audio` | 音乐、播客、有声书等 |
| 书籍 | `book` | 小说、电子书等 |
| 漫画 | `manga` | 漫画、条漫等 |

## 设计理念

1. **声明式配置** - 使用 TOML 描述"做什么"，而非"怎么做"
2. **步骤管道** - 通过组合简单步骤完成复杂提取
3. **类型安全** - 完整的 JSON Schema 验证
4. **灵活扩展** - 支持脚本处理特殊场景

## 版本历史

- **1.0.0** (2025-11-14)
  - 全新的规则结构设计
  - 支持四种媒体类型
  - 完整的 JSON Schema 定义
  - 新增登录流程支持
