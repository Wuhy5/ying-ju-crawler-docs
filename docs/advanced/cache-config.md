# 缓存配置

本文档详细说明数据缓存的配置和使用方式。

## 设计理念

缓存系统专为**单端应用**设计，提供简单易用的配置方式：

- **开箱即用**：提供预设作用域，无需手动配置
- **灵活扩展**：支持自定义作用域满足特殊需求
- **模板变量**：缓存键支持变量替换，动态生成
- **优雅降级**：缓存未命中时自然回退到正常流程

## 快速开始

### 最简配置

```toml
[cache]
enabled = true

# 使用预设作用域缓存 Token
[parse.detail.fields]
token = [
  { type = "jsonpath", query = "$.token" },
  { type = "cache_key", key = "auth_token", scope = "session" }
]
```

仅需一行配置，即可使用内存缓存和预设作用域。

### 生产环境配置

```toml
[cache]
enabled = true
backend = "sqlite"
storage_path = "./cache/data.db"
```

切换到 SQLite 后端，数据持久化不丢失。

## 配置参数

| 字段 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `enabled` | Boolean | `false` | 是否启用缓存 |
| `backend` | String | `"memory"` | 缓存后端（`memory` 或 `sqlite`） |
| `default_ttl` | Integer | `3600` | 默认缓存时间（秒，0=永不过期） |
| `max_size` | Integer | `100` | 最大缓存条目数（仅 memory） |
| `storage_path` | String | `"./cache"` | SQLite 数据库路径（仅 sqlite） |
| `use_preset_scopes` | Boolean | `true` | 启用预设作用域 |

## 缓存后端

### Memory（内存缓存）

**特点**：速度快，应用重启后丢失

```toml
[cache]
enabled = true
backend = "memory"
max_size = 500
```

**适用场景**：开发调试、临时数据

### SQLite（持久化缓存）

**特点**：数据持久化，支持复杂查询

```toml
[cache]
enabled = true
backend = "sqlite"
storage_path = "./cache/data.db"
```

**适用场景**：生产环境、需要持久化的数据

## 预设作用域

启用 `use_preset_scopes = true`（默认）后，自动提供以下作用域：

| 作用域 | TTL | 用途 |
|--------|-----|------|
| `temporary` | 5分钟 | 临时数据、API 响应缓存 |
| `session` | 30分钟 | 会话数据、登录凭证 |
| `hourly` | 1小时 | 小时级数据、用户信息 |
| `daily` | 24小时 | 日级数据、统计信息 |
| `persistent` | 永久 | 静态配置、字典数据 |

### 使用示例

```toml
# 无需任何作用域配置，直接使用

# 缓存登录 Token（30分钟）
token = [
  { type = "jsonpath", query = "$.token" },
  { type = "cache_key", key = "auth_token", scope = "session" }
]

# 缓存用户信息（1小时）
user_info = [
  { type = "http_request", url_template = "https://{domain}/api/user" },
  { type = "cache_key", key = "user_{id}", scope = "hourly" }
]

# 缓存静态配置（永久）
config = [
  { type = "http_request", url_template = "https://{domain}/api/config" },
  { type = "cache_key", key = "site_config", scope = "persistent" }
]
```

## 自定义作用域

如果预设作用域不满足需求，可以自定义：

```toml
[cache]
enabled = true
use_preset_scopes = false  # 禁用预设

[[cache.scopes]]
name = "vip_session"
ttl = 7200  # 2小时
description = "VIP 用户会话"

[[cache.scopes]]
name = "weekly"
ttl = 604800  # 7天
description = "周级数据"
```

## 管道中使用缓存

### 1. 存储数据：`cache_key`

将数据存储到缓存并继续传递。

**参数**：

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `key` | String | 是 | 缓存键（支持变量如 `{id}`） |
| `scope` | String | 否 | 作用域名称（默认：全局） |
| `ttl` | Integer | 否 | 过期时间（覆盖作用域默认值） |

**示例**：

```toml
# 基础用法
token = [
  { type = "jsonpath", query = "$.token" },
  { type = "cache_key", key = "token", scope = "session" }
]

# 使用模板变量
user_data = [
  { type = "http_request", url_template = "https://{domain}/api/user/{id}" },
  { type = "cache_key", key = "user_{id}", scope = "hourly" }
]

# 覆盖 TTL
special_data = [
  { type = "jsonpath", query = "$.data" },
  { type = "cache_key", key = "special", scope = "session", ttl = 600 }
]
```

### 2. 读取数据：`cache_retrieve`

从缓存读取数据。如果未命中，返回 `null`。

**参数**：

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `key` | String | 是 | 缓存键 |
| `scope` | String | 否 | 作用域名称 |

**示例**：

```toml
# 直接读取
token = [
  { type = "cache_retrieve", key = "auth_token", scope = "session" }
]

# 配合 conditional 处理未命中
token = [
  { type = "cache_retrieve", key = "auth_token", scope = "session" },
  {
    type = "conditional",
    condition = "empty",
    if_true = [
      # 缓存未命中，重新登录
      { type = "script", call = "auth.login" },
      { type = "cache_key", key = "auth_token", scope = "session" }
    ]
  }
]
```

### 3. 清除缓存：`cache_clear`

清除指定的缓存数据。

**参数**：

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `key` | String | 否 | 缓存键（支持通配符 `*`） |
| `scope` | String | 否 | 作用域名称 |

**示例**：

```toml
# 清除特定缓存
logout = [
  { type = "cache_clear", key = "auth_token", scope = "session" }
]

# 清除作用域内所有缓存
refresh = [
  { type = "cache_clear", scope = "session" }
]

# 清除匹配的缓存（通配符）
clear_users = [
  { type = "cache_clear", key = "user_*", scope = "hourly" }
]
```

## 完整示例

### 场景1：用户认证与缓存

```toml
[meta]
name = "用户认证示例"
domain = "api.example.com"
media_type = "video"

[cache]
enabled = true
backend = "sqlite"
storage_path = "./cache/auth.db"

[parse.detail.fields]
# 从缓存读取 Token，未命中则登录
token = [
  { type = "cache_retrieve", key = "access_token", scope = "session" },
  {
    type = "conditional",
    condition = "empty",
    if_true = [
      # 执行登录
      { type = "http_request", url_template = "https://{domain}/api/login", method = "POST" },
      { type = "jsonpath", query = "$.data.token" },
      # 缓存 Token
      { type = "cache_key", key = "access_token", scope = "session" }
    ]
  }
]

# 使用 Token 请求数据
user_data = [
  { type = "cache_retrieve", key = "access_token", scope = "session" },
  {
    type = "http_request",
    url_template = "https://{domain}/api/user",
    headers = { Authorization = "Bearer {prev}" }
  }
]
```

### 场景2：分级缓存策略

```toml
[cache]
enabled = true
backend = "sqlite"
storage_path = "./cache/data.db"

[parse.detail.fields]
# 高频访问数据：5分钟缓存
hot_data = [
  { type = "cache_retrieve", key = "hot_list", scope = "temporary" },
  {
    type = "conditional",
    condition = "empty",
    if_true = [
      { type = "http_request", url_template = "https://{domain}/api/hot" },
      { type = "cache_key", key = "hot_list", scope = "temporary" }
    ]
  }
]

# 用户数据：1小时缓存
user_profile = [
  { type = "cache_retrieve", key = "user_{user_id}", scope = "hourly" },
  {
    type = "conditional",
    condition = "empty",
    if_true = [
      { type = "http_request", url_template = "https://{domain}/api/user/{user_id}" },
      { type = "cache_key", key = "user_{user_id}", scope = "hourly" }
    ]
  }
]

# 静态配置：永久缓存
site_config = [
  { type = "cache_retrieve", key = "config", scope = "persistent" },
  {
    type = "conditional",
    condition = "empty",
    if_true = [
      { type = "http_request", url_template = "https://{domain}/api/config" },
      { type = "cache_key", key = "config", scope = "persistent" }
    ]
  }
]
```

### 场景3：缓存刷新与清理

```toml
[parse.detail.fields]
# 强制刷新：先清除再获取
refresh_data = [
  { type = "cache_clear", key = "hot_list", scope = "temporary" },
  { type = "http_request", url_template = "https://{domain}/api/hot" },
  { type = "cache_key", key = "hot_list", scope = "temporary" }
]

# 登出：清除所有会话缓存
logout = [
  { type = "cache_clear", scope = "session" },
  { type = "constant", value = "logged out" }
]

# 清除特定用户缓存
clear_user_cache = [
  { type = "cache_clear", key = "user_{user_id}", scope = "hourly" }
]
```

## 最佳实践

### 1. 使用预设作用域

大部分场景无需自定义，直接使用预设：

```toml
[cache]
enabled = true  # 仅此一行

# 直接使用预设作用域
scope = "temporary"   # 临时数据
scope = "session"     # 会话数据
scope = "hourly"      # 小时级数据
scope = "daily"       # 日级数据
scope = "persistent"  # 永久数据
```

### 2. 缓存键使用模板变量

动态生成缓存键，避免冲突：

```toml
# 好的命名
key = "user_{user_id}_profile"
key = "video_{video_id}_detail"
key = "search_{keyword}_page_{page}"

# 不推荐
key = "data"
key = "result"
```

### 3. 配合 conditional 处理缓存未命中

```toml
data = [
  { type = "cache_retrieve", key = "data_key", scope = "hourly" },
  {
    type = "conditional",
    condition = "empty",
    if_true = [
      # 从源获取
      { type = "http_request", url_template = "..." },
      # 缓存结果
      { type = "cache_key", key = "data_key", scope = "hourly" }
    ]
  }
]
```

### 4. 选择合适的后端

| 环境 | 推荐后端 | 理由 |
|------|---------|------|
| 开发 | memory | 速度快，无持久化需求 |
| 生产 | sqlite | 数据持久化，应用重启不丢失 |

### 5. 合理设置 TTL

| 数据类型 | 推荐作用域 | TTL |
|---------|-----------|-----|
| 登录凭证 | session | 30分钟 |
| 用户信息 | hourly | 1小时 |
| 热门数据 | temporary | 5分钟 |
| 统计数据 | daily | 24小时 |
| 静态配置 | persistent | 永久 |

### 6. 定期清理过期数据

SQLite 后端建议定期清理：

```sql
-- 应用启动时执行
DELETE FROM cache WHERE expires_at < datetime('now');
VACUUM;
```

## 性能对比

| 后端 | 读取速度 | 写入速度 | 持久化 | 内存占用 |
|------|---------|---------|--------|---------|
| Memory | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | 高 |
| SQLite | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | 低 |

## 故障排查

### 缓存未生效

**检查**：确保启用缓存

```toml
[cache]
enabled = true  # 确保为 true
```

### 缓存占用过大

**Memory 后端**：减少 max_size

```toml
[cache]
backend = "memory"
max_size = 100  # 降低最大条目数
```

**SQLite 后端**：定期清理

```sh
sqlite3 ./cache/data.db "VACUUM;"
```

### 数据未持久化

**检查**：确保使用 SQLite 后端

```toml
[cache]
backend = "sqlite"  # 而非 memory
storage_path = "./cache/data.db"
```

## 下一步

- 查看 [HTTP 配置](./http-config.md) 了解 HTTP 设置
- 查看 [脚本配置](./scripting-config.md) 了解脚本系统
- 查看 [处理管道](../pipeline/README.md) 了解所有步骤类型
- 返回 [通用规范](../common-spec.md)
