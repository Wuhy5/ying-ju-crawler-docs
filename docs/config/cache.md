# 缓存配置

## 缓存的作用

缓存系统可以显著提高数据采集的效率和用户体验：

### 性能提升
- **减少网络请求**：相同数据的重复请求可以直接从缓存获取
- **加快响应速度**：缓存数据通常比网络请求快数倍
- **降低服务器压力**：减少对目标网站的访问频率

### 用户体验
- **即时响应**：搜索结果、分类页面等可以瞬间显示
- **离线浏览**：在网络不稳定时仍能查看已缓存内容
- **节省流量**：减少数据传输量

## 缓存后端

规范支持两种缓存后端：

### 内存缓存 (memory)

```toml
[cache]
backend = "memory"
default_ttl = 3600  # 1小时
```

**特点：**
- 速度最快，数据存储在内存中
- 程序重启后缓存清空
- 适合临时数据和开发环境
- 内存使用量与缓存数据量相关

### SQLite 缓存 (sqlite)

```toml
[cache]
backend = "sqlite"
default_ttl = 86400  # 24小时
storage_path = "./cache/data.db"
```

**特点：**
- 数据持久化，重启程序后仍保留
- 支持大数据量存储
- 适合生产环境
- 需要磁盘存储空间

## 缓存配置选项

### 基本配置

```toml
[cache]
enabled = true          # 是否启用缓存（默认true）
backend = "memory"      # 缓存后端
default_ttl = 3600      # 默认过期时间（秒）
```

### 高级配置

```toml
[cache]
# SQLite 特有配置
storage_path = "./cache/crawler.db"  # 数据库文件路径
max_size = "1GB"                    # 最大缓存大小
cleanup_interval = 3600             # 清理间隔（秒）

# 内存缓存特有配置
max_entries = 10000                 # 最大条目数
```

## 缓存键管理

### 自动缓存键

系统会根据请求参数自动生成缓存键：

```toml
# HTTP 请求缓存
- type = "http_request"
  url = "/api/search?q={{keyword}}&page={{page}}"
  output = "response"
  # 缓存键自动生成：hash("/api/search?q=关键词&page=1")
```

### 自定义缓存键

对于复杂场景，可以自定义缓存键：

```toml
[parse.detail.fields]
token = [
  { type = "jsonpath", query = "$.token" },
  { type = "cache_key", key = "auth_token_{{user_id}}", scope = "session" }
]
```

## 缓存作用域

### 全局作用域

默认情况下，缓存是全局共享的：

```toml
[cache]
default_ttl = 3600
```

### 会话作用域

某些数据只在当前会话有效：

```toml
# 在组件或流程中定义
[components.login]
# 登录token只在当前会话有效
```

### 自定义作用域

```toml
# 使用脚本自定义作用域
[scripting.modules.cache_utils]
code = """
fn get_user_cache_key(user_id: string) -> string {
    "user_" + user_id + "_data"
}
"""
```

## 缓存策略

### 过期时间策略

```toml
[cache]
# 不同类型数据设置不同过期时间
default_ttl = 1800    # 30分钟默认
session_ttl = 3600    # 会话数据1小时
static_ttl = 86400    # 静态数据24小时
```

### 主动清理

```toml
[cache]
# 定期清理过期数据
cleanup_interval = 1800  # 每30分钟清理一次
max_age = 604800         # 7天后强制清理
```

### 容量管理

```toml
[cache]
# 内存缓存容量控制
max_entries = 5000       # 最多5000个条目
max_memory = "512MB"     # 最多使用512MB内存

# SQLite 缓存容量控制
max_size = "2GB"         # 数据库最大2GB
auto_vacuum = true       # 自动清理碎片
```

## 缓存使用模式

### 搜索结果缓存

```toml
[flows.search]
description = "搜索内容，支持缓存"

[flows.search.actions]
- type = "http_request"
  url = "/search?q={{keyword}}&page={{page}}"
  output = "response"
  cache = true           # 启用缓存
  cache_ttl = 1800       # 30分钟过期
```

### 用户会话缓存

```toml
[components.login]
description = "用户登录，缓存认证信息"

[components.login.pipeline]
- type = "http_request"
  url = "/login"
  method = "POST"
  body = "username={{username}}&password={{password}}"
  output = "login_response"

- type = "jsonpath"
  input = "{{login_response.body}}"
  query = "$.token"
  output = "token"

- type = "cache_key"
  key = "user_token_{{username}}"
  value = "{{token}}"
  scope = "session"
  ttl = 7200
```

### 静态资源缓存

```toml
[flows.get_cover]
description = "获取封面图片，长期缓存"

[flows.get_cover.actions]
- type = "http_request"
  url = "{{cover_url}}"
  output = "image_response"
  cache = true
  cache_ttl = 604800  # 7天
```

## 缓存失效处理

### 主动失效

```toml
[scripting.modules.cache]
code = """
fn invalidate_user_data(user_id: string) {
    // 清理用户相关缓存
    cache_delete("user_" + user_id + "_profile");
    cache_delete("user_" + user_id + "_favorites");
}
"""
```

### 条件缓存

```toml
[flows.get_data]
description = "条件缓存，只有在数据变化时才更新"

[flows.get_data.actions]
- type = "http_request"
  url = "/api/data"
  headers = { "If-Modified-Since": "{{last_modified}}" }
  output = "response"
  cache = true
  cache_condition = "response.status != 304"  # 只有在有更新时才缓存
```

## 调试和监控

### 缓存统计

```toml
[cache]
enable_stats = true     # 启用统计信息
stats_interval = 60     # 每分钟输出统计
```

### 缓存调试

```toml
[scripting.modules.debug]
code = """
fn show_cache_info() {
    let stats = cache_stats();
    log("缓存命中率: " + stats.hit_rate);
    log("缓存条目数: " + stats.entries);
    log("缓存大小: " + stats.size);
}
"""
```

## 最佳实践

### 缓存键设计
- 使用有意义的键名，便于调试
- 包含所有影响结果的参数
- 避免包含时间戳等易变参数

### 过期时间设置
- 频繁变化的数据：5-30分钟
- 中等变化的数据：1-24小时
- 静态数据：7天-30天

### 容量规划
- 根据数据量和访问模式设置容量
- 定期监控缓存使用情况
- 设置合理的清理策略

### 错误处理
- 缓存失效时优雅降级到正常流程
- 避免缓存穿透攻击
- 监控缓存异常情况