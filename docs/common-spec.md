# 通用规范

本文档定义所有媒体类型共享的通用配置结构。

## 文件顶级结构

每个规则文件包含以下顶级表：

```toml
[meta]        # 元数据 (必须)
[http]        # HTTP 配置 (可选)
[scripting]   # 脚本配置 (可选)
[discover]    # 发现入口 (可选)
[search]      # 搜索入口 (可选)
[recommendation] # 推荐入口 (可选)
[ranking]     # 排行入口 (可选)
[parse]       # 解析规则 (必须)
```

**要求**: 至少包含一个入口定义 (`discover`, `search`, `recommendation`, `ranking`)。

---

## 1. `[meta]` - 元数据

### 必需字段

| 字段 | 类型 | 描述 | 示例 |
|------|------|------|------|
| `name` | String | 规则名称 | `"豆瓣电影"` |
| `author` | String | 作者 | `"张三"` |
| `version` | String | 规则版本号（建议遵循 SemVer） | `"1.2.0"` |
| `spec_version` | String | 爬虫规范版本（遵循 SemVer） | `"1.0.0"` |
| `domain` | String | 目标网站域名 | `"movie.douban.com"` |
| `media_type` | String | 媒体类型 | `"video"` / `"audio"` / `"book"` / `"manga"` |

### 可选字段

| 字段 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `description` | String | `""` | 详细描述 |
| `min_spec_version` | String | 当前 `spec_version` | 最低兼容的规范版本 |
| `encoding` | String | `"UTF-8"` | 目标网站编码 |
| `icon_url` | String | `""` | 数据源图标 URL |
| `homepage` | String | `""` | 数据源主页 |
| `language` | String | `"zh-CN"` | 内容语言代码 |
| `region` | String | `""` | 服务区域 |
| `tags` | Array[String] | `[]` | 标签列表 |

### 示例

```toml
[meta]
name = "豆瓣电影"
author = "张三"
version = "1.0.0"
spec_version = "1.0.0"
min_spec_version = "0.9.0"
description = "豆瓣电影数据采集规则"
domain = "movie.douban.com"
media_type = "video"
encoding = "UTF-8"
icon_url = "https://movie.douban.com/favicon.ico"
language = "zh-CN"
region = "CN"
tags = ["电影", "评分", "影评"]
```

#### 版本管理说明

- `spec_version`: 表示此规则文件遵循的爬虫规范版本
- `min_spec_version`: 表示运行此规则所需的最低规范版本
- `version`: 表示规则文件本身的版本

版本号遵循 [SemVer 2.0.0](https://semver.org/) 规范：
- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

---

## 2. `[http]` - HTTP 配置

全局 HTTP 请求配置，可被具体请求覆盖。

### 基础配置

| 字段 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `user_agent` | String | 通用浏览器 UA | User-Agent 头 |
| `timeout` | Integer | `30` | 超时时间（秒） |
| `proxy` | String | `""` | 代理地址 |
| `retry_times` | Integer | `3` | 重试次数 |
| `retry_delay` | Integer | `1000` | 重试延迟（毫秒） |
| `rate_limit` | Integer | `0` | 请求速率限制（请求/秒，0=无限制） |
| `follow_redirect` | Boolean | `true` | 是否跟随重定向 |
| `max_redirects` | Integer | `10` | 最大重定向次数 |

### 简单示例

```toml
[http]
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
timeout = 30
retry_times = 3
rate_limit = 10

[http.headers]
Referer = "https://example.com/"
Accept-Language = "zh-CN,zh;q=0.9"
```

HTTP 配置还支持 Cookie 管理、认证、请求拦截器等高级功能，详见 [HTTP 高级配置](./advanced/http-config.md)。

---

## 3. `[scripting]` - 脚本配置

用于注册自定义脚本函数。

| 字段 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `engine` | String | `"rhai"` | 脚本引擎（`rhai`, `javascript`, `python`, `lua`） |
| `source_dir` | String | `"scripts"` | 脚本文件目录（相对路径） |

> **全平台兼容**：所有脚本引擎都使用 Rust 实现，确保在 iOS、Android、Desktop、Web 平台均可运行。
> **注意**： 由于现在rust生态的运行时不够完善可能很多功能不支持，建议优先使用 `rhai` 引擎。

### 简单示例

```toml
[scripting]
engine = "rhai"  # 默认引擎
source_dir = "./scripts"

[scripting.files]
crypto = "aes_decrypt.rhai"
utils = "string_utils.rhai"
```

**调用方式**: 在管道中使用 `{ type = "script", call = "crypto.decrypt" }`

详细的脚本引擎对比、函数编写指南和最佳实践，请参考 [脚本配置](./advanced/scripting-config.md)。

---

## 4. `[cache]` - 缓存配置

配置数据缓存策略，用于在管道中存储和复用数据。

### 基础配置

| 字段 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `enabled` | Boolean | `false` | 是否启用缓存 |
| `backend` | String | `"memory"` | 缓存后端（`memory`, `sqlite`） |
| `default_ttl` | Integer | `3600` | 默认缓存时间（秒，0=永不过期） |
| `max_size` | Integer | `100` | 最大缓存条目数（memory 后端） |
| `storage_path` | String | `"./cache"` | SQLite 数据库路径 |
| `use_preset_scopes` | Boolean | `true` | 启用预设作用域 |

### 预设作用域（开箱即用）

启用 `use_preset_scopes` 后，自动提供以下作用域：

| 作用域 | TTL | 用途 |
|--------|-----|------|
| `temporary` | 300秒（5分钟） | 临时数据、API 响应缓存 |
| `session` | 1800秒（30分钟） | 会话数据、登录凭证 |
| `hourly` | 3600秒（1小时） | 小时级数据 |
| `daily` | 86400秒（24小时） | 日级数据、用户信息 |
| `persistent` | 0（永不过期） | 静态配置、字典数据 |

### 简单示例

```toml
# 使用预设作用域（最简配置）
[cache]
enabled = true
backend = "sqlite"
storage_path = "./cache/data.db"

# 在管道中直接使用
token = [
  { type = "jsonpath", query = "$.token" },
  { type = "cache_key", key = "auth_token", scope = "session" }
]
```

### 自定义作用域

如果预设作用域不满足需求，可以自定义：

```toml
[cache]
enabled = true
backend = "sqlite"
use_preset_scopes = false  # 禁用预设

[[cache.scopes]]
name = "custom"
ttl = 7200
description = "自定义缓存"
```

详细的缓存后端对比、作用域管理和使用方式，请参考 [缓存配置](./advanced/cache-config.md)。

---

## 5. 入口定义

入口定义了触发数据采集的方式。所有入口类型共享以下结构。

### 通用字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `entry_url_template` | String | 是 | URL 模板 |
| `method` | String | 否 | HTTP 方法：`"GET"` / `"POST"` |
| `post_data_template` | String | 否 | POST 请求体模板 |
| `response_type` | String | 否 | 响应类型：`"html"` / `"json"` / `"xml"` |

### URL 模板占位符

| 占位符 | 描述 | 适用入口 |
|--------|------|---------|
| `{domain}` | 元数据中的域名 | 所有 |
| `{keyword}` | 搜索关键词 | `search` |
| `{page}` | 页码 | 所有 |
| `{cate_id}` | 分类 ID | `discover` |
| `{type}` | 榜单类型 | `ranking` |
| `{period}` | 时间周期 | `ranking` |

### 5.1 `[discover]` - 分类发现

```toml
[discover]
entry_url_template = "https://{domain}/category/{cate_id}?page={page}"
method = "GET"
response_type = "html"

# 定义分类列表
[[discover.categories]]
name = "电影"
id = "movie"

[[discover.categories]]
name = "电视剧"
id = "tv"
```

### 5.2 `[search]` - 搜索

```toml
[search]
entry_url_template = "https://{domain}/search?q={keyword}&page={page}"
method = "GET"
response_type = "json"
```

### 5.3 `[recommendation]` - 推荐

```toml
[recommendation]
entry_url_template = "https://{domain}/api/recommend?page={page}"
response_type = "json"
```

### 5.4 `[ranking]` - 排行榜

```toml
[ranking]
entry_url_template = "https://{domain}/rank/{type}?period={period}"
response_type = "html"

# 定义榜单类型
[[ranking.types]]
name = "热度榜"
id = "hot"

[[ranking.types]]
name = "评分榜"
id = "rating"

# 定义时间周期
[[ranking.periods]]
name = "日榜"
id = "daily"

[[ranking.periods]]
name = "周榜"
id = "weekly"
```

---

## 6. `[parse]` - 解析规则

解析规则分为列表页和详情页两部分。

```toml
[parse]
  [parse.list]
    # 列表页解析规则
  
  [parse.detail]
    # 详情页解析规则
```

### 6.1 列表页解析 `[parse.list]`

#### `item_selector` - 条目定位器

定位每个列表项的单步管道（必需）。

```toml
[parse.list]
# HTML 示例
item_selector = { type = "selector", query = "div.item" }

# JSON 示例
item_selector = { type = "jsonpath", query = "$.data.list[*]" }
```

#### `[parse.list.fields]` - 字段提取

定义从每个条目提取的字段，每个字段都是一个管道。

**通用字段**（所有媒体类型）:

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `title` | String | 是 | 标题 |
| `url` | String | 是 | 详情页 URL |
| `cover` | String | 否 | 封面图 URL |
| `description` | String | 否 | 简介 |
| `tags` | Array[String] | 否 | 标签列表 |

**媒体特定字段**将在各媒体类型规范中定义。

```toml
[parse.list.fields]
title = [
  { type = "selector", query = "h3.title", extract = "text" }
]

url = [
  { type = "selector", query = "a.link", extract = "attr:href" },
  { type = "string", operation = "prepend", prefix = "https://{domain}" }
]

cover = [
  { type = "selector", query = "img", extract = "attr:src" }
]
```

### 6.2 详情页解析 `[parse.detail]`

#### `[parse.detail.fields]` - 字段提取

定义从详情页提取的完整信息。

**通用字段**:

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `title` | String | 是 | 完整标题 |
| `description` | String | 否 | 详细描述 |
| `cover` | String | 否 | 高清封面 |
| `tags` | Array[String] | 否 | 标签 |
| `publish_date` | String | 否 | 发布日期 |
| `update_date` | String | 否 | 更新日期 |

**媒体特定字段**将在各媒体类型规范中定义。

---

## 完整示例

```toml
[meta]
name = "示例数据源"
author = "张三"
version = "1.0.0"
domain = "example.com"
media_type = "video"

[http]
user_agent = "Mozilla/5.0"
timeout = 30

[http.headers]
Referer = "https://example.com/"

[search]
entry_url_template = "https://{domain}/search?q={keyword}"
response_type = "html"

[parse]
  [parse.list]
    item_selector = { type = "selector", query = "div.item" }
    
    [parse.list.fields]
      title = [
        { type = "selector", query = "h3", extract = "text" }
      ]
      url = [
        { type = "selector", query = "a", extract = "attr:href" }
      ]

  [parse.detail]
    [parse.detail.fields]
      description = [
        { type = "selector", query = "div.desc", extract = "text" }
      ]
```

## 下一步

- 阅读 [处理管道](./pipeline/README.md) 了解管道的详细机制
- 查看 [媒体类型规范](./media-types/README.md) 了解特定媒体的字段定义
