# 发现流程

发现流程（DiscoveryFlow）用于分类浏览和筛选功能，是规则的可选部分。

## 基本结构

```toml
[discovery]
url = "https://example.com/list/{{ category }}/{{ area }}/{{ year }}/page/{{ page }}"
description = "分类浏览"

[discovery.pagination]
pagination_type = "page_number"
start_page = 1

[discovery.categories]
type = "static"
items = [
    { key = "movie", label = "电影" },
    { key = "tv", label = "电视剧" }
]

[discovery.filters]
type = "static"
groups = [
    { name = "地区", key = "area", options = [
        { name = "全部", value = "" },
        { name = "中国", value = "cn" }
    ]}
]

[discovery.fields]
title.steps = [{ css = ".title" }]
url.steps = [{ css = "a" }, { attr = "href" }]
```

## URL 模板

发现页 URL 支持以下变量：

| 变量 | 说明 | 来源 |
|------|------|------|
| `{{ category }}` | 分类标识 | categories 配置 |
| `{{ page }}` | 当前页码 | pagination 配置 |
| 自定义变量 | 筛选器值 | filters 配置的 key |

### 示例

```toml
# 路径式
url = "https://example.com/list/{{ category }}/{{ area }}/{{ year }}/page/{{ page }}"

# 查询参数式
url = "https://example.com/list?type={{ category }}&area={{ area }}&year={{ year }}&page={{ page }}"

# 混合式
url = "https://example.com/{{ category }}.html?region={{ area }}&p={{ page }}"
```

## 分类配置

分类定义了内容的主要类型，如电影、电视剧、动漫等。

### 静态分类

手动配置分类列表：

```toml
[discovery.categories]
type = "static"
items = [
    { key = "movie", label = "电影" },
    { key = "tv", label = "电视剧" },
    { key = "anime", label = "动漫" },
    { key = "variety", label = "综艺" },
    { key = "documentary", label = "纪录片" }
]
```

#### 分类项属性

| 属性 | 必需 | 说明 |
|------|------|------|
| `key` | ✅ | 分类唯一标识，用于 URL 模板 |
| `label` | ✅ | 显示名称 |
| `value` | ❌ | 实际请求值，不提供则使用 key |

```toml
# 当 key 和实际值不同时
items = [
    { key = "movie", label = "电影", value = "1" },
    { key = "tv", label = "电视剧", value = "2" }
]
```

### 动态分类

从网页提取分类列表：

```toml
[discovery.categories]
type = "dynamic"
url = "https://example.com/categories"
selector = ".category-item"

[discovery.categories.fields]
key = "a::attr(href)::regex('/type/(\\w+)')"
label = "a::text"
```

#### 动态分类配置

| 属性 | 必需 | 说明 |
|------|------|------|
| `url` | ✅ | 分类数据源 URL |
| `selector` | ✅ | 分类列表选择器 |
| `fields.key` | ✅ | 分类标识提取规则 |
| `fields.label` | ✅ | 分类名称提取规则 |
| `fields.value` | ❌ | 分类值提取规则 |

## 筛选器配置

筛选器提供更细粒度的过滤选项，如地区、年份、排序等。

### 静态筛选器

```toml
[discovery.filters]
type = "static"
groups = [
    # 地区筛选
    { name = "地区", key = "area", options = [
        { name = "全部", value = "" },
        { name = "中国大陆", value = "cn" },
        { name = "中国香港", value = "hk" },
        { name = "中国台湾", value = "tw" },
        { name = "美国", value = "us" },
        { name = "韩国", value = "kr" },
        { name = "日本", value = "jp" }
    ]},
    
    # 年份筛选
    { name = "年份", key = "year", options = [
        { name = "全部", value = "" },
        { name = "2024", value = "2024" },
        { name = "2023", value = "2023" },
        { name = "2022", value = "2022" },
        { name = "更早", value = "older" }
    ]},
    
    # 排序筛选
    { name = "排序", key = "order", options = [
        { name = "最新", value = "time" },
        { name = "最热", value = "hits" },
        { name = "评分", value = "score" }
    ]}
]
```

#### 筛选器组属性

| 属性 | 必需 | 说明 |
|------|------|------|
| `name` | ✅ | 筛选器组显示名称 |
| `key` | ✅ | URL 模板中的变量名 |
| `options` | ✅ | 选项列表 |
| `multiselect` | ❌ | 是否允许多选（默认 false） |

#### 选项属性

| 属性 | 必需 | 说明 |
|------|------|------|
| `name` | ✅ | 选项显示名称 |
| `value` | ✅ | 选项值 |

### 动态筛选器

从网页提取筛选选项：

```toml
[discovery.filters]
type = "dynamic"
url = "https://example.com/filters"
selector = ".filter-group"

[discovery.filters.fields]
name = ".group-title::text"
key = "::attr(data-key)"
options_selector = ".filter-option"

[discovery.filters.fields.option_fields]
name = "::text"
value = "::attr(data-value)"
```

## 分页配置

与搜索流程相同：

```toml
[discovery.pagination]
pagination_type = "page_number"
start_page = 1
page_param = "page"
max_pages = 100
```

## 字段定义

使用 `ItemFields` 结构，与搜索流程相同：

```toml
[discovery.fields]
title.steps = [
    { css = { selector = ".video-item", all = true } },
    { css = ".title" },
    { filter = "trim" }
]

url.steps = [
    { css = { selector = ".video-item", all = true } },
    { css = "a" },
    { attr = "href" },
    { filter = "absolute_url" }
]

cover.steps = [
    { css = { selector = ".video-item", all = true } },
    { css = "img" },
    { attr = "data-src" },
    { filter = "absolute_url" }
]

score.steps = [
    { css = { selector = ".video-item", all = true } },
    { css = ".score" },
    { filter = "trim" }
]
score.nullable = true

latest.steps = [
    { css = { selector = ".video-item", all = true } },
    { css = ".episode" },
    { filter = "trim" }
]
latest.nullable = true
```

## 完整示例

### 视频站发现

```toml
[discovery]
url = "https://example.com/vodshow/{{ category }}-{{ area }}-{{ year }}-{{ lang }}---{{ order }}---{{ page }}----.html"
description = "分类浏览"

[discovery.pagination]
pagination_type = "page_number"
start_page = 1

[discovery.categories]
type = "static"
items = [
    { key = "1", label = "电影" },
    { key = "2", label = "电视剧" },
    { key = "3", label = "综艺" },
    { key = "4", label = "动漫" }
]

[discovery.filters]
type = "static"
groups = [
    { name = "地区", key = "area", options = [
        { name = "全部", value = "" },
        { name = "大陆", value = "大陆" },
        { name = "香港", value = "香港" },
        { name = "台湾", value = "台湾" },
        { name = "美国", value = "美国" },
        { name = "韩国", value = "韩国" },
        { name = "日本", value = "日本" }
    ]},
    { name = "年份", key = "year", options = [
        { name = "全部", value = "" },
        { name = "2024", value = "2024" },
        { name = "2023", value = "2023" },
        { name = "2022", value = "2022" },
        { name = "2021", value = "2021" },
        { name = "2020", value = "2020" }
    ]},
    { name = "语言", key = "lang", options = [
        { name = "全部", value = "" },
        { name = "国语", value = "国语" },
        { name = "英语", value = "英语" },
        { name = "粤语", value = "粤语" },
        { name = "韩语", value = "韩语" },
        { name = "日语", value = "日语" }
    ]},
    { name = "排序", key = "order", options = [
        { name = "时间", value = "time" },
        { name = "人气", value = "hits" },
        { name = "评分", value = "score" }
    ]}
]

[discovery.fields]
title.steps = [
    { css = { selector = ".module-item", all = true } },
    { css = ".module-item-title a" },
    { filter = "trim" }
]

url.steps = [
    { css = { selector = ".module-item", all = true } },
    { css = ".module-item-cover a" },
    { attr = "href" },
    { filter = "absolute_url" }
]

cover.steps = [
    { css = { selector = ".module-item", all = true } },
    { css = ".module-item-pic img" },
    { attr = "data-src" },
    { filter = "absolute_url" }
]

score.steps = [
    { css = { selector = ".module-item", all = true } },
    { css = ".module-item-note" },
    { filter = "trim" }
]
score.nullable = true

latest.steps = [
    { css = { selector = ".module-item", all = true } },
    { css = ".module-item-text" },
    { filter = "trim" }
]
latest.nullable = true
```

### 小说站发现

```toml
[discovery]
url = "https://novel.example.com/list/{{ category }}_{{ status }}_{{ order }}_{{ page }}.html"
description = "小说分类"

[discovery.pagination]
pagination_type = "page_number"
start_page = 1

[discovery.categories]
type = "static"
items = [
    { key = "xuanhuan", label = "玄幻" },
    { key = "xiuzhen", label = "修真" },
    { key = "dushi", label = "都市" },
    { key = "lishi", label = "历史" },
    { key = "youxi", label = "游戏" },
    { key = "kehuan", label = "科幻" }
]

[discovery.filters]
type = "static"
groups = [
    { name = "状态", key = "status", options = [
        { name = "全部", value = "all" },
        { name = "连载中", value = "serial" },
        { name = "已完结", value = "finish" }
    ]},
    { name = "排序", key = "order", options = [
        { name = "更新时间", value = "update" },
        { name = "点击量", value = "hits" },
        { name = "推荐", value = "recommend" }
    ]}
]

[discovery.fields]
title.steps = [
    { css = { selector = ".book-item", all = true } },
    { css = ".book-name a" },
    { filter = "trim" }
]

url.steps = [
    { css = { selector = ".book-item", all = true } },
    { css = ".book-name a" },
    { attr = "href" },
    { filter = "absolute_url" }
]

cover.steps = [
    { css = { selector = ".book-item", all = true } },
    { css = ".book-cover img" },
    { attr = "src" },
    { filter = "absolute_url" }
]

author.steps = [
    { css = { selector = ".book-item", all = true } },
    { css = ".book-author" },
    { filter = "trim" }
]

summary.steps = [
    { css = { selector = ".book-item", all = true } },
    { css = ".book-intro" },
    { filter = "trim" }
]
summary.nullable = true

status.steps = [
    { css = { selector = ".book-item", all = true } },
    { css = ".book-status" },
    { filter = "trim" }
]
status.nullable = true

latest.steps = [
    { css = { selector = ".book-item", all = true } },
    { css = ".latest-chapter" },
    { filter = "trim" }
]
latest.nullable = true
```

## JSON 格式示例

```json
{
  "discovery": {
    "url": "https://example.com/list/{{ category }}/{{ page }}",
    "description": "分类浏览",
    "pagination": {
      "pagination_type": "page_number",
      "start_page": 1
    },
    "categories": {
      "type": "static",
      "items": [
        { "key": "movie", "label": "电影" },
        { "key": "tv", "label": "电视剧" }
      ]
    },
    "filters": {
      "type": "static",
      "groups": [
        {
          "name": "地区",
          "key": "area",
          "options": [
            { "name": "全部", "value": "" },
            { "name": "中国", "value": "cn" }
          ]
        }
      ]
    },
    "fields": {
      "title": {
        "steps": [
          { "css": { "selector": ".item", "all": true } },
          { "css": ".title" },
          { "filter": "trim" }
        ]
      },
      "url": {
        "steps": [
          { "css": { "selector": ".item", "all": true } },
          { "css": "a" },
          { "attr": "href" },
          { "filter": "absolute_url" }
        ]
      }
    }
  }
}
```

## 下一步

- ▶️ [内容流程](./content.md) - 解析播放/阅读资源
- 🔐 [登录流程](./login.md) - 处理用户认证
