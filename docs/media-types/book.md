# 图书规范

## 概述

图书规范用于电子书、小说等文本内容的数据采集。

## 媒体类型标识

```toml
[meta]
media_type = "book"
```

## 列表页字段

### 通用字段

继承自 [通用规范](../common-spec.md)：
- `title`: 标题
- `url`: 详情页 URL
- `cover`: 封面图 URL
- `description`: 简介
- `tags`: 标签数组

### 图书特定字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `book_type` | String | 否 | 图书类型：`"novel"` / `"ebook"` / `"text"` |
| `author` | String/Array[String] | 否 | 作者 |
| `category` | String | 否 | 分类（小说、科幻、历史等） |
| `word_count` | Integer | 否 | 字数 |
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

### 图书特定字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `book_type` | String | 是 | 图书类型 |
| `author` | String/Array[String] | 否 | 作者 |
| `translator` | String/Array[String] | 否 | 译者（如有） |
| `publisher` | String | 否 | 出版社 |
| `isbn` | String | 否 | ISBN 码 |
| `category` | String | 否 | 分类 |
| `genre` | Array[String] | 否 | 流派/标签 |
| `word_count` | Integer | 否 | 总字数 |
| `chapter_count` | Integer | 否 | 章节数 |
| `status` | String | 否 | 状态 |
| `language` | String | 否 | 语言 |
| `rating` | Float | 否 | 评分 |
| `rating_count` | Integer | 否 | 评分人数 |

### 阅读相关字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `chapter_list` | Array[Chapter] | 是 | 章节列表 |
| `download_formats` | Array[Format] | 否 | 可下载格式 |

#### Chapter 对象

章节信息。

```toml
# 返回结构
# [
#   {
#     "title": "第一章 开始",
#     "url": "章节内容 URL",
#     "chapter_number": 1,
#     "word_count": 3000,
#     "publish_date": "2025-01-01"
#   },
#   ...
# ]
```

#### Format 对象

下载格式。

```toml
# 返回结构
# [
#   {
#     "format": "EPUB",
#     "size": "2.3MB",
#     "url": "下载地址"
#   },
#   {
#     "format": "MOBI",
#     "size": "2.1MB",
#     "url": "下载地址"
#   },
#   {
#     "format": "PDF",
#     "size": "5.6MB",
#     "url": "下载地址"
#   }
# ]
```

---

## 完整示例

```toml
# ===========================
# 元数据
# ===========================
[meta]
name = "示例小说网"
author = "王五"
version = "1.0.0"
domain = "novel.example.com"
media_type = "book"
description = "示例小说数据源"
icon_url = "https://novel.example.com/favicon.ico"

# ===========================
# HTTP 配置
# ===========================
[http]
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
timeout = 30

[http.headers]
Referer = "https://novel.example.com/"

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
name = "玄幻"
id = "xuanhuan"

[[discover.categories]]
name = "都市"
id = "dushi"

[[discover.categories]]
name = "科幻"
id = "kehuan"

[[discover.categories]]
name = "历史"
id = "lishi"

# ===========================
# 排行榜
# ===========================
[ranking]
entry_url_template = "https://{domain}/rank/{type}?period={period}"
response_type = "html"

[[ranking.types]]
name = "人气榜"
id = "popularity"

[[ranking.types]]
name = "推荐榜"
id = "recommendation"

[[ranking.periods]]
name = "日榜"
id = "daily"

[[ranking.periods]]
name = "周榜"
id = "weekly"

[[ranking.periods]]
name = "月榜"
id = "monthly"

# ===========================
# 解析规则
# ===========================
[parse]
  
  # 列表页解析
  [parse.list]
    item_selector = { type = "selector", query = "div.book-item" }
    
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
        { type = "selector", query = "img.cover", extract = "attr:src" }
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
      
      # 字数
      word_count = [
        { type = "selector", query = "span.words", extract = "text" },
        { type = "regex", query = "(\\d+\\.?\\d*)万字", group = 1 }
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
        { type = "selector", query = "h1.book-title", extract = "text" }
      ]
      
      # 封面
      cover = [
        { type = "selector", query = "img.book-cover", extract = "attr:src" }
      ]
      
      # 作者
      author = [
        { type = "selector", query = "div.author a", extract = "text" }
      ]
      
      # 描述
      description = [
        { type = "selector", query = "div.book-intro", extract = "text" },
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
      
      # 字数
      word_count = [
        { type = "selector", query = "span.word-count", extract = "text" },
        { type = "regex", query = "(\\d+)", group = 1 }
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
      
      # 出版社（如有）
      publisher = [
        { type = "selector", query = "span.publisher", extract = "text" }
      ]
      
      # ISBN（如有）
      isbn = [
        { type = "selector", query = "span.isbn", extract = "text" }
      ]
      
      # 更新日期
      update_date = [
        { type = "selector", query = "span.update-time", extract = "text" }
      ]
      
      # 章节列表
      chapter_list = [
        { type = "selector", query = "div.chapter-list li" },
        {
          type = "transform",
          operation = "map",
          pipeline = [
            # 对每个章节元素提取信息
            # 返回 { "title": "...", "url": "...", "chapter_number": 1 }
          ]
        }
        # 或者通过 API 获取
        # { type = "selector", query = "div#book-id", extract = "attr:data-id" },
        # { type = "http_request", url_template = "https://{domain}/api/chapters/{input}", response_type = "json" },
        # { type = "jsonpath", query = "$.data.chapters[*]" }
      ]
      
      # 下载格式（如支持）
      download_formats = [
        { type = "selector", query = "div.download a" },
        {
          type = "transform",
          operation = "map",
          pipeline = [
            # 提取格式信息
            # 返回 { "format": "EPUB", "size": "2.3MB", "url": "..." }
          ]
        }
      ]
```

---

## 字段说明补充

### `book_type` 值规范

| 值 | 含义 |
|----|------|
| `"novel"` | 网络小说 |
| `"ebook"` | 电子书（出版物） |
| `"text"` | 纯文本/其他 |

### `status` 值规范

| 值 | 含义 |
|----|------|
| `"ongoing"` | 连载中 |
| `"completed"` | 已完结 |

### 章节数据结构

```json
[
  {
    "title": "第一章 开始",
    "url": "https://novel.example.com/chapter/1.html",
    "chapter_number": 1,
    "word_count": 3000,
    "publish_date": "2025-01-01",
    "is_vip": false
  },
  {
    "title": "第二章 修炼",
    "url": "https://novel.example.com/chapter/2.html",
    "chapter_number": 2,
    "word_count": 3200,
    "publish_date": "2025-01-02",
    "is_vip": true
  }
]
```

### 章节内容获取

章节内容通常需要二次请求：

```toml
# 在应用中，根据章节 URL 再次请求获取章节内容
chapter_content = [
  { type = "http_request", url_template = "{chapter_url}", response_type = "html" },
  { type = "selector", query = "div.chapter-content", extract = "html" }
]
```

### 下载格式数据结构

```json
[
  {
    "format": "EPUB",
    "size": "2.3MB",
    "url": "https://novel.example.com/download/book.epub"
  },
  {
    "format": "MOBI",
    "size": "2.1MB",
    "url": "https://novel.example.com/download/book.mobi"
  },
  {
    "format": "PDF",
    "size": "5.6MB",
    "url": "https://novel.example.com/download/book.pdf"
  },
  {
    "format": "TXT",
    "size": "1.2MB",
    "url": "https://novel.example.com/download/book.txt"
  }
]
```

---

## 下一步

- 查看 [漫画规范](./manga.md) 了解漫画媒体类型
- 参考 [图书示例](../examples/book-example.toml) 查看完整配置
