# 漫画规范

## 概述

漫画规范用于在线漫画、条漫、插画集等图像内容的数据采集。

## 媒体类型标识

```toml
[meta]
media_type = "manga"
```

## 列表页字段

### 通用字段

继承自 [通用规范](../common-spec.md)：
- `title`: 标题
- `url`: 详情页 URL
- `cover`: 封面图 URL
- `description`: 简介
- `tags`: 标签数组

### 漫画特定字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `manga_type` | String | 否 | 漫画类型：`"manga"` / `"webtoon"` / `"comic"` |
| `author` | String/Array[String] | 否 | 作者/漫画家 |
| `category` | String | 否 | 分类（热血、恋爱等） |
| `chapter_count` | Integer | 否 | 章节数 |
| `status` | String | 否 | 状态：`"ongoing"` / `"completed"` |
| `last_update` | String | 否 | 最后更新时间 |

---

## 详情页字段

### 通用字段

继承自 [通用规范](../common-spec.md)：
- `title`: 完整标题
- `cover`: 高清封面
- `description`: 详细描述
- `tags`: 标签数组
- `publish_date`: 发布日期
- `update_date`: 更新日期

### 漫画特定字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `manga_type` | String | 是 | 漫画类型 |
| `author` | String/Array[String] | 否 | 作者 |
| `artist` | String/Array[String] | 否 | 画师（如与作者不同） |
| `publisher` | String | 否 | 出版社 |
| `serialization` | String | 否 | 连载杂志/平台 |
| `category` | String | 否 | 分类 |
| `genre` | Array[String] | 否 | 流派/标签 |
| `chapter_count` | Integer | 否 | 章节数 |
| `status` | String | 否 | 状态 |
| `language` | String | 否 | 语言 |
| `rating` | Float | 否 | 评分 |
| `rating_count` | Integer | 否 | 评分人数 |
| `reading_direction` | String | 否 | 阅读方向：`"ltr"` / `"rtl"` / `"ttb"` |

### 阅读相关字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `chapters` | Array[Chapter] | 是 | 章节列表 |

#### Chapter 对象

章节信息。

```toml
# 返回结构
# [
#   {
#     "title": "第1话",
#     "url": "章节阅读页 URL",
#     "chapter_number": 1,
#     "publish_date": "2025-01-01",
#     "page_count": 45
#   },
#   ...
# ]
```

#### 章节内容获取

章节的图片列表需要二次请求获取：

```toml
# 在应用中，访问章节 URL 获取图片列表
chapter_images = [
  { type = "http_request", url_template = "{chapter_url}", response_type = "html" },
  { type = "selector", query = "div.page-container img" },
  {
    type = "transform",
    operation = "map",
    pipeline = [
      { type = "selector", query = "self", extract = "attr:data-src" }
    ]
  }
  # 返回图片 URL 数组: ["https://...", "https://...", ...]
]
```

---

## 完整示例

```toml
# ===========================
# 元数据
# ===========================
[meta]
name = "示例漫画网"
author = "赵六"
version = "1.0.0"
domain = "manga.example.com"
media_type = "manga"
description = "示例漫画数据源"
icon_url = "https://manga.example.com/favicon.ico"

# ===========================
# HTTP 配置
# ===========================
[http]
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
timeout = 30

[http.headers]
Referer = "https://manga.example.com/"

# ===========================
# 搜索入口
# ===========================
[search]
entry_url_template = "https://{domain}/search?keyword={keyword}&page={page}"
method = "GET"
response_type = "html"

# ===========================
# 分类发现
# ===========================
[discover]
entry_url_template = "https://{domain}/category/{cate_id}?page={page}"
response_type = "html"

[[discover.categories]]
name = "热血"
id = "action"

[[discover.categories]]
name = "恋爱"
id = "romance"

[[discover.categories]]
name = "奇幻"
id = "fantasy"

[[discover.categories]]
name = "搞笑"
id = "comedy"

# ===========================
# 排行榜
# ===========================
[ranking]
entry_url_template = "https://{domain}/rank/{type}"
response_type = "html"

[[ranking.types]]
name = "人气榜"
id = "popularity"

[[ranking.types]]
name = "收藏榜"
id = "favorites"

[[ranking.types]]
name = "更新榜"
id = "recent"

# ===========================
# 解析规则
# ===========================
[parse]
  
  # 列表页解析
  [parse.list]
    item_selector = { type = "selector", query = "div.manga-item" }
    
    [parse.list.fields]
      # 标题
      title = [
        { type = "selector", query = "h3.title a", extract = "text" }
      ]
      
      # 详情页 URL
      url = [
        { type = "selector", query = "h3.title a", extract = "attr:href" },
        { type = "string", operation = "prepend", prefix = "https://{domain}" }
      ]
      
      # 封面
      cover = [
        { type = "selector", query = "img.cover", extract = "attr:data-src" }
      ]
      
      # 作者
      author = [
        { type = "selector", query = "span.author", extract = "text" }
      ]
      
      # 分类
      category = [
        { type = "selector", query = "span.category", extract = "text" }
      ]
      
      # 简介
      description = [
        { type = "selector", query = "p.intro", extract = "text" },
        { type = "string", operation = "trim" }
      ]
      
      # 章节数
      chapter_count = [
        { type = "selector", query = "span.chapters", extract = "text" },
        { type = "regex", query = "(\\d+)话", group = 1 }
      ]
      
      # 状态
      status = [
        { type = "selector", query = "span.status", extract = "text" }
      ]
      
      # 最后更新
      last_update = [
        { type = "selector", query = "span.update-time", extract = "text" }
      ]

  # 详情页解析
  [parse.detail]
    
    [parse.detail.fields]
      # 标题
      title = [
        { type = "selector", query = "h1.manga-title", extract = "text" }
      ]
      
      # 封面
      cover = [
        { type = "selector", query = "img.manga-cover", extract = "attr:src" }
      ]
      
      # 作者
      author = [
        { type = "selector", query = "div.author a", extract = "text" }
      ]
      
      # 画师（如有）
      artist = [
        { type = "selector", query = "div.artist a", extract = "text" }
      ]
      
      # 描述
      description = [
        { type = "selector", query = "div.manga-intro", extract = "text" },
        { type = "string", operation = "trim" }
      ]
      
      # 分类
      category = [
        { type = "selector", query = "span.category", extract = "text" }
      ]
      
      # 流派/标签
      genre = [
        { type = "selector", query = "div.tags a" },
        {
          type = "transform",
          operation = "map",
          pipeline = [
            { type = "selector", query = "self", extract = "text" }
          ]
        }
      ]
      
      # 出版社
      publisher = [
        { type = "selector", query = "span.publisher", extract = "text" }
      ]
      
      # 连载平台
      serialization = [
        { type = "selector", query = "span.serialization", extract = "text" }
      ]
      
      # 章节数
      chapter_count = [
        { type = "selector", query = "span.chapter-count", extract = "text" }
      ]
      
      # 状态
      status = [
        { type = "selector", query = "span.status", extract = "text" }
      ]
      
      # 评分
      rating = [
        { type = "selector", query = "span.rating", extract = "text" }
      ]
      
      # 阅读方向
      reading_direction = [
        { type = "selector", query = "div.manga-info", extract = "attr:data-direction" }
      ]
      
      # 更新日期
      update_date = [
        { type = "selector", query = "span.update-time", extract = "text" }
      ]
      
      # 发布日期
      publish_date = [
        { type = "selector", query = "span.publish-time", extract = "text" }
      ]
      
      # 章节列表
      chapters = [
        { type = "selector", query = "div.chapter-list li" },
        {
          type = "transform",
          operation = "map",
          pipeline = [
            # 对每个章节元素，返回章节信息对象
            # { "title": "第1话", "url": "...", "chapter_number": 1 }
          ]
        }
        # 或通过 API 获取
        # { type = "selector", query = "div#manga-id", extract = "attr:data-id" },
        # { type = "http_request", url_template = "https://{domain}/api/chapters/{input}", response_type = "json" },
        # { type = "jsonpath", query = "$.data.chapters[*]" }
      ]
```

---

## 字段说明补充

### `manga_type` 值规范

| 值 | 含义 |
|----|------|
| `"manga"` | 日式漫画（右→左） |
| `"webtoon"` | 韩式条漫（上→下） |
| `"comic"` | 美式漫画/其他 |

### `status` 值规范

| 值 | 含义 |
|----|------|
| `"ongoing"` | 连载中 |
| `"completed"` | 已完结 |
| `"hiatus"` | 休刊/暂停 |

### `reading_direction` 值规范

| 值 | 含义 |
|----|------|
| `"ltr"` | 从左到右（Left to Right） |
| `"rtl"` | 从右到左（Right to Left，日式漫画） |
| `"ttb"` | 从上到下（Top to Bottom，条漫） |

### 章节数据结构

```json
[
  {
    "title": "第1话 开始",
    "url": "https://manga.example.com/read/1.html",
    "chapter_number": 1,
    "publish_date": "2025-01-01",
    "page_count": 45,
    "is_vip": false
  },
  {
    "title": "第2话 冒险",
    "url": "https://manga.example.com/read/2.html",
    "chapter_number": 2,
    "publish_date": "2025-01-08",
    "page_count": 48,
    "is_vip": true
  }
]
```

### 章节图片获取

章节的图片列表需要二次请求：

```toml
# 方式1: HTML 解析
chapter_images = [
  { type = "http_request", url_template = "{chapter_url}", response_type = "html" },
  { type = "selector", query = "div.reader-container img" },
  {
    type = "transform",
    operation = "map",
    pipeline = [
      { type = "selector", query = "self", extract = "attr:data-src" }
    ]
  }
]

# 方式2: API 请求
chapter_images = [
  { type = "regex", query = "/read/(\\d+)", group = 1 },  # 从 URL 提取章节 ID
  { type = "http_request", url_template = "https://{domain}/api/images/{input}", response_type = "json" },
  { type = "jsonpath", query = "$.data.images[*]" }
]
```

返回格式：
```json
[
  "https://img.example.com/manga/123/1.jpg",
  "https://img.example.com/manga/123/2.jpg",
  "https://img.example.com/manga/123/3.jpg"
]
```

### 图片防盗链处理

很多漫画站有图片防盗链，需要在请求图片时带上特定的 Referer：

```toml
[http.headers]
Referer = "https://manga.example.com/"
```

或在管道中动态设置：

```toml
chapter_images = [
  { type = "http_request", 
    url_template = "{chapter_url}", 
    response_type = "html",
    headers = { Referer = "https://manga.example.com/" }
  }
]
```

---

## 下一步

- 查看 [Schema 定义](../schema/README.md) 了解完整的类型定义
- 参考 [漫画示例](../examples/manga-example.toml) 查看完整配置
