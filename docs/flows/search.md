# 搜索流程

搜索流程（SearchFlow）实现关键词搜索功能，是规则的必需部分。

## 基本结构

```toml
[search]
url = "https://example.com/search?q={{ keyword }}&page={{ page }}"
description = "搜索视频内容"

# 列表选择器（必需）
[search.list]
steps = [{ css = { selector = ".video-item", all = true } }]

[search.pagination]
pagination_type = "page_number"
start_page = 1

[search.fields]
title.steps = [{ css = ".title" }]
url.steps = [{ css = "a" }, { attr = "href" }]
```

## 列表选择器（必需）

`list` 字段定义如何选择搜索结果列表中的每个项目，是 SearchFlow 的必需配置。

```toml
# HTML 列表
[search.list]
steps = [{ css = { selector = ".search-item", all = true } }]

# JSON 列表
[search.list]
steps = [{ json = { selector = "$.data.list[*]", all = true } }]
```

:::important
`list` 字段必须返回一个数组，后续的 `fields` 中的每个字段规则都会在此数组的每个元素上执行。
:::

## URL 模板

搜索 URL 支持以下模板变量：

| 变量 | 说明 | 示例 |
|------|------|------|
| `{{ keyword }}` | 搜索关键词 | `q={{ keyword }}` |
| `{{ page }}` | 当前页码 | `page={{ page }}` |

### 示例

```toml
# 基本搜索
url = "https://example.com/search?q={{ keyword }}"

# 带分页
url = "https://example.com/search?q={{ keyword }}&page={{ page }}"

# 路径式分页
url = "https://example.com/search/{{ keyword }}/{{ page }}.html"

# 带编码的关键词
url = "https://example.com/search?wd={{ keyword | urlencode }}"
```

## 分页配置

```toml
[search.pagination]
pagination_type = "page_number"  # 分页类型
start_page = 1                   # 起始页码
page_param = "page"              # 页码参数名
page_size = 20                   # 每页数量（可选）
max_pages = 100                  # 最大页数限制（可选）
```

### 分页类型

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| `page_number` | 页码分页 | `?page=1`, `?page=2` |
| `offset` | 偏移量分页 | `?offset=0`, `?offset=20` |
| `cursor` | 游标分页 | `?cursor=xxx` |

### 页码分页示例

```toml
[search.pagination]
pagination_type = "page_number"
start_page = 1

# URL: /search?q=关键词&page=1
```

### 偏移量分页示例

```toml
[search.pagination]
pagination_type = "offset"
start_page = 0
page_size = 20

# URL: /search?q=关键词&offset=0
# URL: /search?q=关键词&offset=20
```

## 字段定义

搜索结果使用 `ItemFields` 结构，包含列表项的基本信息。

### 必需字段

| 字段 | 说明 |
|------|------|
| `title` | 标题 |
| `url` | 详情页 URL |

### 可选字段

| 字段 | 说明 |
|------|------|
| `cover` | 封面图 URL |
| `summary` | 简介/摘要 |
| `author` | 作者（书籍、漫画常用） |
| `category` | 分类/标签 |
| `score` | 评分 |
| `status` | 状态（连载中/已完结等） |
| `latest` | 最新章节/更新信息 |
| `extra` | 扩展字段 |

### 字段示例

```toml
# 列表选择器（必需）
[search.list]
steps = [{ css = { selector = ".video-item", all = true } }]

[search.fields]
# 标题（必需）
title.steps = [
    { css = ".title" },
    { filter = "trim" }
]

# URL（必需）
url.steps = [
    { css = "a" },
    { attr = "href" },
    { filter = "absolute_url" }
]

# 封面
cover.steps = [
    { css = "img" },
    { attr = "data-src" },
    { filter = "absolute_url" }
]
cover.fallback = [
    [
        { css = "img" },
        { attr = "src" }
    ]
]

# 评分
score.steps = [
    { css = ".score" },
    { filter = "trim" }
]
score.nullable = true

# 简介
summary.steps = [
    { css = ".desc" },
    { filter = "trim | strip_html" }
]
summary.nullable = true

# 状态（连载/完结）
status.steps = [
    { css = ".status" },
    { filter = "trim" }
]
status.nullable = true

# 最新更新
latest.steps = [
    { css = ".latest" },
    { filter = "trim" }
]
latest.nullable = true
```

## 完整示例

### HTML 网站搜索

```toml
[search]
url = "https://example.com/search?wd={{ keyword }}&page={{ page }}"
description = "搜索影视内容"

[search.list]
steps = [{ css = { selector = ".search-item", all = true } }]

[search.pagination]
pagination_type = "page_number"
start_page = 1

[search.fields]
title.steps = [
    { css = ".name a" },
    { filter = "trim" }
]

url.steps = [
    { css = ".name a" },
    { attr = "href" },
    { filter = "absolute_url" }
]

cover.steps = [
    { css = ".cover img" },
    { attr = "data-original" },
    { filter = "absolute_url" }
]

summary.steps = [
    { css = ".intro" },
    { filter = "trim" }
]
summary.nullable = true

category.steps = [
    { css = ".type" },
    { filter = "trim" }
]
category.nullable = true

score.steps = [
    { css = ".score em" },
    { filter = "trim" }
]
score.nullable = true
```

### JSON API 搜索

```toml
[search]
url = "https://api.example.com/search?keyword={{ keyword }}&page={{ page }}"
description = "API 搜索"

[search.list]
steps = [{ json = { selector = "$.data.list[*]", all = true } }]

[search.pagination]
pagination_type = "page_number"
start_page = 1
page_size = 20

[search.fields]
title.steps = [
    { json = "$.title" }
]

url.steps = [
    { json = "$.id" },
    { filter = "template('https://example.com/video/{{ value }}.html')" }
]

cover.steps = [
    { json = "$.cover" },
    { filter = "absolute_url" }
]

summary.steps = [
    { json = "$.description" }
]
summary.nullable = true

score.steps = [
    { json = "$.score" }
]
score.nullable = true
```

### 书籍/小说搜索

```toml
[search]
url = "https://novel.example.com/search?q={{ keyword }}&page={{ page }}"

[search.list]
steps = [{ css = { selector = ".book-item", all = true } }]

[search.pagination]
pagination_type = "page_number"
start_page = 1

[search.fields]
title.steps = [
    { css = ".book-name" },
    { filter = "trim" }
]

url.steps = [
    { css = "a.book-link" },
    { attr = "href" },
    { filter = "absolute_url" }
]

cover.steps = [
    { css = ".book-cover img" },
    { attr = "src" },
    { filter = "absolute_url" }
]

author.steps = [
    { css = ".book-author" },
    { filter = "trim | replace('作者：', '')" }
]

category.steps = [
    { css = ".book-category" },
    { filter = "trim" }
]
category.nullable = true

status.steps = [
    { css = ".book-status" },
    { filter = "trim" }
]
status.nullable = true

latest.steps = [
    { css = ".latest-chapter" },
    { filter = "trim" }
]
latest.nullable = true
```

## JSON 格式示例

```json
{
  "search": {
    "url": "https://example.com/search?q={{ keyword }}&page={{ page }}",
    "description": "搜索内容",
    "list": {
      "steps": [
        { "css": { "selector": ".item", "all": true } }
      ]
    },
    "pagination": {
      "pagination_type": "page_number",
      "start_page": 1
    },
    "fields": {
      "title": {
        "steps": [
          { "css": ".title" },
          { "filter": "trim" }
        ]
      },
      "url": {
        "steps": [
          { "css": "a" },
          { "attr": "href" },
          { "filter": "absolute_url" }
        ]
      },
      "cover": {
        "steps": [
          { "css": "img" },
          { "attr": "src" }
        ],
        "nullable": true
      }
    }
  }
}
```

## 常见问题

### 1. 搜索结果为空

- 检查 CSS 选择器是否正确
- 确认网站是否需要登录
- 检查是否有反爬措施

### 2. 分页不工作

- 确认 `start_page` 设置正确（有些网站从0开始）
- 检查 URL 模板中的 `{{ page }}` 变量

### 3. 封面图无法显示

- 检查是否需要 `absolute_url` 过滤器
- 尝试 `data-src`、`data-original` 等懒加载属性

## 下一步

- 📖 [详情流程](./detail.md) - 获取内容详情
- 🔍 [发现流程](./discovery.md) - 分类浏览与筛选
