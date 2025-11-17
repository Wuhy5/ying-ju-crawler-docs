# 缓存操作

管道支持三种缓存操作：存储、读取和清除。缓存可用于临时保存数据，如登录 Token、API 响应等。

## 存储缓存

### cache_key

将当前数据存储到缓存中，并原样返回数据继续管道流。

**参数**:
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `type` | String | 是 | `"cache_key"` |
| `key` | String | 是 | 缓存键名（支持变量如 `{id}`） |
| `scope` | String | 否 | 作用域名称 |
| `ttl` | Integer | 否 | 过期时间（秒，覆盖作用域默认值） |

**示例**:
```toml
# 缓存登录 Token
token = [
  { type = "jsonpath", query = "$.data.token" },
  { type = "cache_key", key = "auth_token", scope = "session" }
]

# 使用模板变量
user_profile = [
  { type = "http_request", url_template = "https://{domain}/api/user/{id}" },
  { type = "cache_key", key = "user_{id}", scope = "hourly" }
]

# 自定义 TTL
special = [
  { type = "jsonpath", query = "$.data" },
  { type = "cache_key", key = "special_data", scope = "session", ttl = 600 }
]
```

## 读取缓存

### cache_retrieve

从缓存中读取数据。如果缓存未命中，返回 `null`。

**参数**:
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `type` | String | 是 | `"cache_retrieve"` |
| `key` | String | 是 | 缓存键名 |
| `scope` | String | 否 | 作用域名称 |

**示例**:
```toml
# 读取缓存
token = [
  { type = "cache_retrieve", key = "auth_token", scope = "session" }
]

# 配合 conditional 处理缓存未命中
token = [
  { type = "cache_retrieve", key = "auth_token", scope = "session" },
  {
    type = "conditional",
    condition = "empty",
    if_true = [
      { type = "script", call = "auth.login" },
      { type = "cache_key", key = "auth_token", scope = "session" }
    ]
  }
]
```

## 清除缓存

### cache_clear

清除指定的缓存数据。

**参数**:
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `type` | String | 是 | `"cache_clear"` |
| `key` | String | 否 | 缓存键（支持通配符 `*`，不指定则清除整个作用域） |
| `scope` | String | 否 | 作用域名称 |

**示例**:
```toml
# 清除特定缓存
logout = [
  { type = "cache_clear", key = "auth_token", scope = "session" }
]

# 清除作用域内所有缓存
clear_all = [
  { type = "cache_clear", scope = "session" }
]

# 使用通配符清除
clear_users = [
  { type = "cache_clear", key = "user_*", scope = "hourly" }
]
```

## 缓存配置

在规则文件的 `[cache]` 部分配置缓存行为：

```toml
[cache]
enabled = true
backend = "sqlite"
storage_path = "./cache/data.db"

[cache.scopes.session]
ttl = 86400  # 24小时

[cache.scopes.hourly]
ttl = 3600   # 1小时
```

## 实际应用场景

### 场景 1: 登录认证

```toml
[parse.detail.fields]
# 1. 尝试从缓存读取 Token
auth_token = [
  { type = "cache_retrieve", key = "auth_token", scope = "session" },
  {
    type = "conditional",
    condition = "empty",
    if_true = [
      # 2. 缓存未命中，执行登录
      { type = "http_request", url_template = "https://{domain}/api/login" },
      { type = "jsonpath", query = "$.token" },
      # 3. 缓存 Token
      { type = "cache_key", key = "auth_token", scope = "session" }
    ]
  }
]

# 使用 Token 请求数据
video_list = [
  { type = "cache_retrieve", key = "auth_token", scope = "session" },
  {
    type = "http_request",
    url_template = "https://{domain}/api/videos",
    headers = { Authorization = "Bearer {prev}" }
  }
]
```

### 场景 2: API 响应缓存

```toml
detail = [
  # 1. 尝试从缓存读取
  { type = "cache_retrieve", key = "detail_{id}", scope = "hourly" },
  {
    type = "conditional",
    condition = "empty",
    if_true = [
      # 2. 缓存未命中，请求 API
      { type = "http_request", url_template = "https://{domain}/api/detail/{id}" },
      # 3. 缓存响应
      { type = "cache_key", key = "detail_{id}", scope = "hourly" }
    ]
  }
]
```

### 场景 3: 分页数据聚合

```toml
all_pages = [
  # 初始化页码
  { type = "constant", value = "1" },
  { type = "cache_key", key = "current_page" },
  # 循环请求分页
  {
    type = "loop",
    operation = "while",
    condition = "has_next",
    pipeline = [
      { type = "cache_retrieve", key = "current_page" },
      { type = "http_request", url_template = "https://{domain}/api/list?page={input}" },
      # 更新页码
      { type = "jsonpath", query = "$.next_page" },
      { type = "cache_key", key = "current_page" }
    ]
  }
]
```

## 最佳实践

1. **合理设置 TTL**: 根据数据更新频率设置合适的过期时间
2. **使用作用域**: 为不同类型的数据使用不同的作用域
3. **错误处理**: 缓存未命中时提供降级方案
4. **清理策略**: 定期清理过期或不需要的缓存
5. **键名规范**: 使用有意义的键名，避免冲突

## 注意事项

1. **性能**: 缓存可以显著提升性能，但也会占用存储空间
2. **一致性**: 缓存数据可能与源数据不一致，注意更新策略
3. **安全性**: 敏感数据（如密码）不应直接缓存
4. **并发**: 多个请求可能同时访问缓存，需注意竞争条件
