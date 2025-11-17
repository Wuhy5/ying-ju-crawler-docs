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

用于扩展规范的声明式能力，处理复杂的数据处理逻辑。

### 设计理念

- **内联优先**: 脚本代码直接嵌入规则文件，便于分发和管理
- **远程加载**: 支持从 URL 加载脚本，实现动态更新和代码复用
- **模块化**: 通过命名模块组织脚本，避免命名冲突
- **跨平台**: 使用 Rust 实现的脚本引擎，确保在所有平台运行

### 基础配置

| 字段 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `engine` | String | `"rhai"` | 默认脚本引擎（`rhai`, `javascript`, `python`, `lua`） |
| `modules` | Table | `{}` | 脚本模块定义 |

> **引擎选择建议**：
> - `rhai`: 推荐，轻量级、类 Rust 语法、性能好
> - `javascript`: 熟悉的语法，较大的运行时
> - `python`: 功能强大，运行时最大
> - `lua`: 轻量级、高性能，适合移动端

> **多引擎支持**：每个模块可以指定不同的引擎，允许在同一规则文件中混合使用多种语言。

### 使用方式

#### 方式 1: 内联脚本（推荐）

```toml
[scripting]
engine = "rhai"

[scripting.modules.crypto]
code = '''
// AES 解密函数
fn decrypt(encrypted, key) {
    let cipher = aes::new(key);
    cipher.decrypt(encrypted)
}

// Base64 解码
fn decode_base64(input) {
    base64::decode(input)
}
'''

[scripting.modules.utils]
code = '''
fn clean_title(title) {
    title.trim()
         .replace("【", "[")
         .replace("】", "]")
}
'''
```

在管道中调用：
```toml
[parse.detail.fields]
play_url = [
    { type = "selector", query = "#player-data", extract = "text" },
    { type = "script", call = "crypto.decrypt", args = { key = "secret123" } }
]

title = [
    { type = "selector", query = "h1", extract = "text" },
    { type = "script", call = "utils.clean_title" }
]
```

#### 方式 2: 远程脚本

```toml
[scripting]
engine = "rhai"

[scripting.modules.crypto]
url = "https://example.com/scripts/crypto.rhai"
# 可选：指定缓存时间（秒）
cache_ttl = 86400

[scripting.modules.parser]
url = "https://cdn.example.com/v1/parser.rhai"
```

#### 方式 3: 混合使用

```toml
[scripting]
engine = "rhai"

# 核心加密逻辑从远程加载
[scripting.modules.crypto]
url = "https://example.com/scripts/crypto.rhai"
cache_ttl = 86400

# 简单工具函数内联
[scripting.modules.utils]
code = '''
fn format_url(path) {
    "https://" + domain + path
}
'''
```

#### 方式 4: 多引擎混合（高级）

每个模块可以指定不同的引擎，发挥各种语言的优势：

```toml
[scripting]
engine = "rhai"  # 默认引擎

# Rhai 处理加密（性能最优）
[scripting.modules.crypto]
engine = "rhai"
code = '''
fn decrypt_aes(data, key) {
    let decrypted = aes::decrypt(base64::decode(data), key, "0000000000000000");
    String::from_utf8(decrypted)
}
'''

# JavaScript 处理 JSON（原生支持好）
[scripting.modules.parser]
engine = "javascript"
code = '''
function parseEpisodes(jsonStr) {
    const data = JSON.parse(jsonStr);
    return data.episodes.map(ep => ({
        number: ep.num,
        title: ep.title,
        url: ep.play_url
    }));
}
'''

# Python 处理数据清洗（字符串处理强）
[scripting.modules.cleaner]
engine = "python"
code = '''
import re

def clean_text(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()
'''

# Lua 处理简单逻辑（轻量级）
[scripting.modules.utils]
engine = "lua"
code = '''
function format_url(path)
    return "https://" .. domain .. path
end
'''
```

调用方式：
```toml
[parse.detail.fields]
play_url = [
    { type = "selector", query = "#data", extract = "text" },
    { type = "script", call = "crypto.decrypt_aes", args = { key = "key123" } }
]

episodes = [
    { type = "http_request", url_template = "https://api.example.com/episodes" },
    { type = "script", call = "parser.parseEpisodes" }
]

description = [
    { type = "selector", query = ".desc", extract = "html" },
    { type = "script", call = "cleaner.clean_text" }
]
```

### 脚本函数规范

#### 函数签名

```rust
// 接收一个参数（管道输入）
fn process(input) { 
    // 处理逻辑
    return result
}

// 接收多个参数（input + args）
fn process(input, arg1, arg2) {
    // 处理逻辑
    return result
}
```

#### 输入/输出类型

脚本函数的输入是前一步的输出，可以是：
- 字符串
- 数字
- 布尔值
- 数组
- 对象（Map）

返回值将作为下一步的输入。

#### 错误处理

```rhai
fn safe_parse(input) {
    // 使用 try-catch 处理错误
    try {
        parse_json(input)
    } catch (e) {
        // 返回默认值或抛出错误
        throw "解析失败: " + e
    }
}
```

### 调用方式

在管道中使用 `script` 步骤：

```toml
# 无额外参数
{ type = "script", call = "module.function" }

# 带参数（会作为函数的第 2+ 个参数）
{ type = "script", call = "crypto.decrypt", args = { key = "secret", iv = "123456" } }
```

### 内置 API

脚本引擎提供以下内置功能：

#### 字符串处理
```rhai
str.trim()
str.replace(from, to)
str.split(delimiter)
str.contains(pattern)
regex.match(pattern, text)
```

#### 编码/解码
```rhai
base64.encode(data)
base64.decode(data)
hex.encode(data)
hex.decode(data)
url.encode(text)
url.decode(text)
```

#### 加密/哈希
```rhai
md5(data)
sha1(data)
sha256(data)
aes.encrypt(data, key, iv)
aes.decrypt(data, key, iv)
```

#### JSON 处理
```rhai
json.parse(text)
json.stringify(obj)
json.get(obj, path)  // JSONPath 查询
```

#### HTTP 请求
```rhai
http.get(url)
http.post(url, data)
http.request(config)  // 完整配置
```

#### 实用工具
```rhai
sleep(ms)
timestamp()
random()
uuid()
```

完整 API 文档请参考 [脚本配置高级指南](./advanced/scripting-config.md)。

### 安全考虑

- ✅ 所有脚本在沙箱环境中运行
- ✅ 无文件系统访问权限
- ✅ 有限的网络访问（仅 HTTP/HTTPS）
- ✅ CPU 和内存使用限制
- ❌ 不能执行系统命令
- ❌ 不能加载原生库

### 性能优化

- 脚本在首次加载时编译，后续调用直接使用编译结果
- 远程脚本会缓存到本地
- 避免在循环中频繁调用脚本，考虑使用声明式步骤

### 最佳实践

1. **优先使用声明式步骤**: 只在无法用现有步骤实现时使用脚本
2. **保持函数简单**: 单一职责，易于测试和维护
3. **添加注释**: 说明函数用途和参数
4. **错误处理**: 优雅处理异常情况
5. **使用模块**: 按功能组织脚本（crypto、parser、utils 等）

### 示例：完整的加密解密模块

```toml
[scripting]
engine = "rhai"

[scripting.modules.crypto]
code = '''
// AES-128-CBC 解密
fn decrypt_aes(encrypted_base64, key, iv) {
    try {
        let encrypted = base64.decode(encrypted_base64);
        let decrypted = aes.decrypt(encrypted, key, iv);
        String::from_utf8(decrypted)
    } catch (e) {
        throw "解密失败: " + e
    }
}

// URL 签名验证
fn sign_url(url, timestamp, secret) {
    let data = url + timestamp.to_string();
    let signature = sha256(data + secret);
    url + "?ts=" + timestamp + "&sign=" + signature
}

// 解析加密的 JSON
fn decrypt_json(encrypted, key) {
    let decrypted = decrypt_aes(encrypted, key, "0000000000000000");
    json.parse(decrypted)
}
'''
```

使用：
```toml
[parse.detail.fields]
video_url = [
    { type = "selector", query = "#video-data", extract = "text" },
    { type = "script", call = "crypto.decrypt_json", args = { key = "mykey123" } },
    { type = "jsonpath", query = "$.url" }
]
```

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
