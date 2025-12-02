# 快速开始

本教程将带你在 5 分钟内创建一个完整的爬虫规则。

## 准备工作

1. 确定目标网站的 URL 结构
2. 使用浏览器开发者工具分析页面结构
3. 选择 TOML 或 JSON 格式编写规则

## 创建第一个规则

假设我们要为一个视频网站编写规则，该网站有以下特点：
- 搜索 URL：`https://example.com/search?wd=关键词&page=1`
- 搜索结果列表使用 `.video-item` 类名
- 详情页 URL：`https://example.com/video/12345.html`

### TOML 格式

```toml
# ===== 元数据 =====
[meta]
name = "示例视频站"
author = "your_name"
version = "1.0.0"
spec_version = "1.0.0"
domain = "example.com"
media_type = "video"
description = "这是一个示例规则"

# ===== 搜索流程 =====
[search]
url = "https://example.com/search?wd={{ keyword }}&page={{ page }}"

# 分页配置
[search.pagination]
pagination_type = "page_number"
start_page = 1

# 搜索结果字段提取
[search.fields]
# 标题：选择 .video-item 下的 .title 元素
title.steps = [
    { css = { selector = ".video-item", all = true } },
    { css = ".title" },
    { filter = "trim" }
]

# URL：提取链接地址
url.steps = [
    { css = { selector = ".video-item", all = true } },
    { css = "a" },
    { attr = "href" },
    { filter = "absolute_url" }
]

# 封面图
cover.steps = [
    { css = { selector = ".video-item", all = true } },
    { css = "img" },
    { attr = "src" }
]

# ===== 详情页流程 =====
[detail]
url = "{{ detail_url }}"

[detail.fields]
media_type = "video"

# 片名
title.steps = [
    { css = "h1.title" },
    { filter = "trim" }
]

# 封面
cover.steps = [
    { css = ".poster img" },
    { attr = "src" },
    { filter = "absolute_url" }
]

# 简介
intro.steps = [
    { css = ".description" },
    { filter = "trim" }
]

# 导演
director.steps = [
    { css = ".info-director" },
    { filter = "trim" }
]

# 演员
actors.steps = [
    { css = ".info-actors" },
    { filter = "trim" }
]
```

### JSON 格式

```json
{
  "meta": {
    "name": "示例视频站",
    "author": "your_name",
    "version": "1.0.0",
    "spec_version": "1.0.0",
    "domain": "example.com",
    "media_type": "video",
    "description": "这是一个示例规则"
  },
  "search": {
    "url": "https://example.com/search?wd={{ keyword }}&page={{ page }}",
    "pagination": {
      "pagination_type": "page_number",
      "start_page": 1
    },
    "fields": {
      "title": {
        "steps": [
          { "css": { "selector": ".video-item", "all": true } },
          { "css": ".title" },
          { "filter": "trim" }
        ]
      },
      "url": {
        "steps": [
          { "css": { "selector": ".video-item", "all": true } },
          { "css": "a" },
          { "attr": "href" },
          { "filter": "absolute_url" }
        ]
      },
      "cover": {
        "steps": [
          { "css": { "selector": ".video-item", "all": true } },
          { "css": "img" },
          { "attr": "src" }
        ]
      }
    }
  },
  "detail": {
    "url": "{{ detail_url }}",
    "fields": {
      "media_type": "video",
      "title": {
        "steps": [
          { "css": "h1.title" },
          { "filter": "trim" }
        ]
      },
      "cover": {
        "steps": [
          { "css": ".poster img" },
          { "attr": "src" },
          { "filter": "absolute_url" }
        ]
      },
      "intro": {
        "steps": [
          { "css": ".description" },
          { "filter": "trim" }
        ]
      }
    }
  }
}
```

## 理解提取流程

规则的核心是**字段提取**，每个字段通过一系列**步骤（steps）** 来提取数据：

```
网页内容 → 步骤1 → 步骤2 → 步骤3 → 最终值
```

### 常用步骤类型

| 步骤 | 作用 | 示例 |
|------|------|------|
| `css` | CSS 选择器 | `{ css = ".title" }` |
| `xpath` | XPath 表达式 | `{ xpath = "//div[@class='title']" }` |
| `json` | JSONPath 表达式 | `{ json = "$.data.title" }` |
| `attr` | 获取属性值 | `{ attr = "href" }` |
| `regex` | 正则匹配 | `{ regex = "id=(\\d+)" }` |
| `filter` | 数据过滤/转换 | `{ filter = "trim" }` |

### 示例：提取电影标题

假设 HTML 结构如下：

```html
<div class="movie-info">
    <h1 class="title">  复仇者联盟  </h1>
</div>
```

提取步骤：

```toml
title.steps = [
    { css = ".movie-info h1.title" },  # 选择元素
    { filter = "trim" }                 # 去除空白
]
# 结果: "复仇者联盟"
```

## 模板变量

URL 和其他字符串中可以使用 `{{ variable }}` 语法插入变量：

| 变量 | 说明 | 使用场景 |
|------|------|----------|
| `{{ keyword }}` | 搜索关键词 | search.url |
| `{{ page }}` | 当前页码 | search.url, discovery.url |
| `{{ category }}` | 分类标识 | discovery.url |
| `{{ detail_url }}` | 详情页 URL | detail.url |
| `{{ play_url }}` | 播放页 URL | content.url |
| `{{ chapter_url }}` | 章节 URL | content.url |

## 下一步

- 📖 [核心概念](./concepts.md) - 深入了解规则结构
- 🔧 [字段提取](./extraction.md) - 掌握数据提取技巧
- 📋 [搜索流程](../flows/search.md) - 完整的搜索配置
