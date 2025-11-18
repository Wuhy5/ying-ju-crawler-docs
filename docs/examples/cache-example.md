# 缓存配置示例

## 基础缓存配置

### 内存缓存配置

最简单的缓存配置，使用内存存储：

```toml
[cache]
backend = "memory"
default_ttl = 3600  # 1小时过期时间
```

这个配置会为所有请求启用内存缓存，数据在程序重启后丢失。

### SQLite 缓存配置

使用文件存储的持久化缓存：

```toml
[cache]
backend = "sqlite"
default_ttl = 86400  # 24小时
storage_path = "./cache/data.db"
```

数据会保存到本地文件，重启程序后仍然可用。

## 实际应用场景

### 用户会话缓存

```toml
# 规则文件：session-cache.toml

[meta]
name = "会话缓存示例"
author = "示例作者"
version = "1.0.0"
domain = "example.com"
media_type = "video"

[cache]
backend = "memory"
default_ttl = 7200  # 2小时会话缓存

[scripting.modules.session]
code = """
fn get_session_token(username: string) -> string {
    let cache_key = "session_" + username;
    let cached = cache_get(cache_key);
    if cached != null {
        return cached;
    }
    // 这里应该是实际的登录逻辑
    let token = "generated_token_" + username;
    cache_set(cache_key, token, 7200);
    token
}
"""

[flows.login]
description = "用户登录"

[flows.login.entry.general]
url = "/login"

[flows.login.actions]
- type = "script"
  call = "session.get_session_token"
  with = { username = "{{username}}" }
  output = "token"

- type = "log"
  message = "用户 {{username}} 登录成功，token: {{token}}"
```

### API 响应缓存

```toml
# 规则文件：api-cache.toml

[meta]
name = "API缓存示例"
author = "示例作者"
version = "1.0.0"
domain = "api.example.com"
media_type = "video"

[cache]
backend = "sqlite"
default_ttl = 1800  # 30分钟
storage_path = "./cache/api_responses.db"

[http]
user_agent = "MediaCrawler/1.0"
timeout = 30

[flows.get_popular_videos]
description = "获取热门视频"

[flows.get_popular_videos.entry.general]
url = "/api/videos/popular"

[flows.get_popular_videos.actions]
- type = "http_request"
  url = "{{entry.url}}"
  headers = { "Authorization": "Bearer {{api_token}}" }
  output = "response"

- type = "json_path"
  input = "{{response.body}}"
  query = "$.videos"
  output = "videos"

- type = "map_field"
  input = "{{videos}}"
  target = "item_summary"
  mappings = [
    { from = "title", to = "title" },
    { from = "url", to = "url" },
    { from = "thumbnail", to = "cover" },
    { from = "description", to = "summary" }
  ]
  output = "result"
```

### 搜索结果缓存

```toml
# 规则文件：search-cache.toml

[meta]
name = "搜索缓存示例"
author = "示例作者"
version = "1.0.0"
domain = "search.example.com"
media_type = "video"

[cache]
backend = "memory"
default_ttl = 900  # 15分钟搜索缓存

[scripting.modules.search]
code = """
fn generate_search_cache_key(keyword: string, page: i64, filters: map) -> string {
    let key_parts = ["search", keyword, page.to_string()];
    if filters.len() > 0 {
        key_parts.push(json_stringify(filters));
    }
    key_parts.join("_")
}

fn is_cache_valid(cache_time: i64) -> bool {
    let now = current_timestamp();
    let age = now - cache_time;
    age < 900  // 15分钟内有效
}
"""

[flows.search]
description = "搜索视频"

[flows.search.entry.search]
url = "/search?q={{keyword}}&page={{page}}"

[flows.search.actions]
- type = "script"
  call = "search.generate_search_cache_key"
  with = { keyword = "{{keyword}}", page = "{{page}}", filters = "{{filters}}" }
  output = "cache_key"

- type = "cache_get"
  key = "{{cache_key}}"
  output = "cached_result"

- type = "http_request"
  url = "{{entry.url}}"
  output = "fresh_response"
  condition = "{{!cached_result}}"

- type = "json_path"
  input = "{{fresh_response.body}}"
  query = "$.results"
  output = "search_results"
  condition = "{{!cached_result}}"

- type = "cache_set"
  key = "{{cache_key}}"
  value = "{{search_results}}"
  ttl = 900
  condition = "{{!cached_result}}"

- type = "constant"
  value = "{{cached_result || search_results}}"
  output = "final_results"

- type = "map_field"
  input = "{{final_results}}"
  target = "item_summary"
  mappings = [
    { from = "video_title", to = "title" },
    { from = "video_url", to = "url" },
    { from = "thumbnail_url", to = "cover" },
    { from = "description", to = "summary" }
  ]
  output = "result"
```

## 高级缓存策略

### 多层缓存

```toml
# 规则文件：multi-level-cache.toml

[meta]
name = "多层缓存示例"
author = "示例作者"
version = "1.0.0"
domain = "example.com"
media_type = "video"

[cache]
backend = "sqlite"
default_ttl = 3600
storage_path = "./cache/multi_level.db"

[scripting.modules.cache_strategy]
code = """
fn get_with_multi_level_cache(key: string, fetch_fn: Fn() -> any) -> any {
    // 1. 检查内存缓存（L1）
    let l1_key = "l1_" + key;
    let l1_data = cache_get(l1_key);
    if l1_data != null {
        return l1_data;
    }

    // 2. 检查文件缓存（L2）
    let l2_key = "l2_" + key;
    let l2_data = cache_get(l2_key);
    if l2_data != null {
        // 提升到L1缓存
        cache_set(l1_key, l2_data, 300); // 5分钟L1缓存
        return l2_data;
    }

    // 3. 获取新鲜数据
    let fresh_data = fetch_fn();

    // 4. 设置多层缓存
    cache_set(l1_key, fresh_data, 300);  // L1: 5分钟
    cache_set(l2_key, fresh_data, 3600); // L2: 1小时

    fresh_data
}

fn invalidate_cache_pattern(pattern: string) {
    // 清除匹配模式的所有缓存
    cache_delete_pattern("l1_" + pattern);
    cache_delete_pattern("l2_" + pattern);
}
"""

[flows.get_video_details]
description = "获取视频详情（多层缓存）"

[flows.get_video_details.entry.general]
url = "/video/{{video_id}}"

[flows.get_video_details.actions]
- type = "string_template"
  template = "video_detail_{{video_id}}"
  output = "cache_key"

- type = "script"
  call = "cache_strategy.get_with_multi_level_cache"
  with = {
    key = "{{cache_key}}",
    fetch_fn = || {
      // 实际的数据获取逻辑
      http_request("{{entry.url}}").body
    }
  }
  output = "video_html"

- type = "call"
  component = "parse_video_detail"
  with = { html = "{{video_html}}" }
  output = "parsed_detail"

- type = "map_field"
  input = "{{parsed_detail}}"
  target = "item_detail"
  mappings = [
    { from = "title", to = "title" },
    { from = "description", to = "description" },
    { from = "duration", to = "metadata.duration" },
    { from = "director", to = "metadata.director" }
  ]
  output = "result"
```

### 条件缓存

```toml
# 规则文件：conditional-cache.toml

[meta]
name = "条件缓存示例"
author = "示例作者"
version = "1.0.0"
domain = "example.com"
media_type = "video"

[cache]
backend = "memory"
default_ttl = 1800

[scripting.modules.conditional_cache]
code = """
fn should_cache_response(response: map) -> bool {
    // 只缓存成功的响应
    if response.status != 200 {
        return false;
    }

    // 不缓存空结果
    let body = response.body;
    if body.trim().len() == 0 {
        return false;
    }

    // 不缓存错误消息
    if body.contains("error") || body.contains("Error") {
        return false;
    }

    true
}

fn get_cache_ttl_by_content_type(content: string) -> i64 {
    if content.contains("video") {
        return 3600; // 视频数据缓存1小时
    } else if content.contains("user") {
        return 1800; // 用户数据缓存30分钟
    } else {
        return 900; // 其他数据缓存15分钟
    }
}
"""

[flows.smart_cached_request]
description = "智能条件缓存请求"

[flows.smart_cached_request.entry.general]
url = "/api/data?type={{data_type}}&id={{id}}"

[flows.smart_cached_request.actions]
- type = "string_template"
  template = "smart_cache_{{data_type}}_{{id}}"
  output = "cache_key"

- type = "cache_get"
  key = "{{cache_key}}"
  output = "cached_data"

- type = "http_request"
  url = "{{entry.url}}"
  output = "fresh_response"
  condition = "{{!cached_data}}"

- type = "script"
  call = "conditional_cache.should_cache_response"
  with = { response = "{{fresh_response}}" }
  output = "should_cache"
  condition = "{{!cached_data}}"

- type = "script"
  call = "conditional_cache.get_cache_ttl_by_content_type"
  with = { content = "{{fresh_response.body}}" }
  output = "cache_ttl"
  condition = "{{should_cache}}"

- type = "cache_set"
  key = "{{cache_key}}"
  value = "{{fresh_response.body}}"
  ttl = "{{cache_ttl}}"
  condition = "{{should_cache}}"

- type = "constant"
  value = "{{cached_data || fresh_response.body}}"
  output = "final_data"

- type = "log"
  message = "缓存状态: {{cached_data ? '命中' : '未命中'}}, 是否缓存: {{should_cache}}"
```

## 缓存监控和维护

### 缓存统计

```toml
# 规则文件：cache-monitoring.toml

[meta]
name = "缓存监控示例"
author = "示例作者"
version = "1.0.0"
domain = "example.com"
media_type = "video"

[cache]
backend = "sqlite"
default_ttl = 3600
storage_path = "./cache/monitored.db"

[scripting.modules.cache_monitor]
code = """
fn log_cache_stats() {
    let stats = cache_stats();
    log("缓存统计:");
    log("  总条目数: " + stats.total_entries);
    log("  内存使用: " + stats.memory_usage + " bytes");
    log("  命中次数: " + stats.hits);
    log("  未命中次数: " + stats.misses);
    log("  命中率: " + (stats.hits as f64 / (stats.hits + stats.misses) as f64 * 100.0) + "%");
}

fn cleanup_expired_cache() {
    let before = cache_stats().total_entries;
    cache_cleanup();
    let after = cache_stats().total_entries;
    log("清理过期缓存: " + (before - after) + " 条");
}

fn get_cache_hit_rate() -> f64 {
    let stats = cache_stats();
    let total = stats.hits + stats.misses;
    if total == 0 {
        return 0.0;
    }
    stats.hits as f64 / total as f64
}
"""

[flows.cache_maintenance]
description = "缓存维护任务"

[flows.cache_maintenance.entry.general]
url = "/admin/cache/status"

[flows.cache_maintenance.actions]
- type = "script"
  call = "cache_monitor.log_cache_stats"
  output = "_"

- type = "script"
  call = "cache_monitor.cleanup_expired_cache"
  output = "_"

- type = "script"
  call = "cache_monitor.get_cache_hit_rate"
  output = "hit_rate"

- type = "log"
  message = "当前缓存命中率: {{hit_rate * 100}}%"

- type = "constant"
  value = { hit_rate = "{{hit_rate}}", status = "ok" }
  output = "maintenance_result"
```

这些示例展示了缓存配置的不同使用场景，从基础设置到高级策略，帮助用户根据具体需求选择合适的缓存方案。