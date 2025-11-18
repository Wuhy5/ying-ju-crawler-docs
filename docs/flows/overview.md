# 流程概述

## 什么是流程

流程是规则文件的核心执行单元，每个流程定义了一个完整的、可独立运行的任务。流程就像菜谱，描述了如何从原始数据获取到最终结果的完整过程。

### 流程的特点

- **独立性**：每个流程都可以单独执行
- **完整性**：从输入到输出形成完整链条
- **可配置**：通过入口定义支持不同触发方式
- **可扩展**：支持复杂的数据处理逻辑

## 流程的基本结构

### 流程定义

```toml
[flows.search_videos]
description = "搜索视频内容"

[flows.search_videos.entry]
# 入口定义：如何触发此流程

[flows.search_videos.actions]
# 执行步骤：具体的处理逻辑
```

### 入口定义

入口定义了流程的触发方式：

#### 搜索入口

```toml
[flows.search.entry.search]
url = "/search?q={{keyword}}&page={{page}}"
```

#### 发现入口

```toml
[flows.discover.entry.discover]
url = "/list/{{category}}-{{sort}}-{{year}}.html"

[flows.discover.entry.discover.filters]
category = { name = "分类", key = "category", options = [
  { name = "电影", value = "movie" },
  { name = "电视剧", value = "tv" }
] }
sort = { name = "排序", key = "sort", options = [
  { name = "最新", value = "new" },
  { name = "热门", value = "hot" }
] }
```

#### 通用入口

```toml
[flows.login.entry.general]
url = "/login"
```

### 动作管道

动作定义了具体的执行步骤：

```toml
[flows.search.actions]
- type = "http_request"
  url = "{{entry.url}}"
  output = "response"

- type = "selector_all"
  input = "{{response.body}}"
  query = ".video-item"
  extract = "outer_html"
  output = "video_items"

- type = "loop_for_each"
  input = "{{video_items}}"
  as = "item_html"
  pipeline = [
    { type = "call", component = "parse_video_item", with = { html = "{{item_html}}" }, output = "parsed_item" }
  ]
  output = "parsed_items"

- type = "map_field"
  input = "{{parsed_items}}"
  target = "item_summary"
  mappings = [
    { from = "title", to = "title" },
    { from = "url", to = "url" },
    { from = "thumbnail", to = "cover" }
  ]
  output = "result"
```

## 流程类型

### 数据获取流程

最常见的流程类型，用于获取和解析数据：

```toml
[flows.get_movie_detail]
description = "获取电影详情"

[flows.get_movie_detail.entry.general]
url = "/movie/{{movie_id}}"

[flows.get_movie_detail.actions]
- type = "http_request"
  url = "{{entry.url}}"
  output = "page_response"

- type = "call"
  component = "parse_movie_detail"
  with = { html = "{{page_response.body}}" }
  output = "movie_data"

- type = "map_field"
  input = "{{movie_data}}"
  target = "item_detail"
  mappings = [
    { from = "title", to = "title" },
    { from = "description", to = "description" },
    { from = "director", to = "metadata.director" }
  ]
  output = "result"
```

### 认证流程

处理用户登录和认证：

```toml
[flows.user_login]
description = "用户登录"

[flows.user_login.entry.general]
url = "/api/login"

[flows.user_login.actions]
- type = "http_request"
  url = "{{entry.url}}"
  method = "POST"
  body = "username={{username}}&password={{password}}"
  output = "login_response"

- type = "json_path"
  input = "{{login_response.body}}"
  query = "$.token"
  output = "auth_token"

- type = "cache_key"
  key = "user_session_{{username}}"
  value = "{{auth_token}}"
  scope = "session"
  ttl = 7200
```

### 批量处理流程

处理大量数据的流程：

```toml
[flows.sync_all_movies]
description = "同步所有电影数据"

[flows.sync_all_movies.entry.general]
url = "/api/movies/list"

[flows.sync_all_movies.actions]
- type = "http_request"
  url = "{{entry.url}}"
  output = "list_response"

- type = "json_path"
  input = "{{list_response.body}}"
  query = "$.movies[*].id"
  output = "movie_ids"

- type = "loop_for_each"
  input = "{{movie_ids}}"
  as = "movie_id"
  pipeline = [
    { type = "call", component = "get_movie_detail", with = { movie_id = "{{movie_id}}" }, output = "movie_detail" },
    { type = "call", component = "save_to_database", with = { data = "{{movie_detail}}" }, output = "save_result" }
  ]
  output = "sync_results"
```

## 流程控制

### 条件执行

```toml
[flows.smart_search]
description = "智能搜索"

[flows.smart_search.actions]
- type = "cache_get"
  key = "search_cache_{{keyword}}"
  output = "cached_result"

- type = "http_request"
  url = "/search?q={{keyword}}"
  output = "fresh_result"
  condition = "{{!cached_result}}"

- type = "constant"
  value = "{{cached_result || fresh_result}}"
  output = "search_result"
```

### 循环处理

```toml
[flows.paginated_search]
description = "分页搜索"

[flows.paginated_search.actions]
- type = "constant"
  value = []
  output = "all_results"

- type = "constant"
  value = 1
  output = "current_page"

- type = "loop_while"
  condition = "{{current_page <= max_pages}}"
  pipeline = [
    { type = "http_request", url = "/search?q={{keyword}}&page={{current_page}}", output = "page_result" },
    { type = "script", call = "utils.extract_items", with = { html = "{{page_result.body}}" }, output = "page_items" },
    { type = "script", call = "utils.append_array", with = { target = "{{all_results}}", items = "{{page_items}}" }, output = "all_results" },
    { type = "script", call = "utils.increment", with = { value = "{{current_page}}" }, output = "current_page" }
  ]
  output = "final_results"
```

### 错误处理

```toml
[flows.robust_request]
description = "健壮的网络请求"

[flows.robust_request.actions]
- type = "http_request"
  url = "{{request_url}}"
  retry_on_error = true
  max_retries = 3
  output = "response"

- type = "script"
  call = "utils.check_response"
  with = { response = "{{response}}" }
  output = "is_success"

- type = "constant"
  value = "请求失败"
  output = "error_message"
  condition = "{{!is_success}}"

- type = "log"
  message = "请求失败: {{error_message}}"
  condition = "{{!is_success}}"
```

## 数据流管理

### 变量作用域

```toml
[flows.complex_processing]
description = "复杂数据处理"

[flows.complex_processing.actions]
# 全局变量
- type = "constant"
  value = "config_data"
  output = "config"

# 局部作用域
- type = "loop_for_each"
  input = "{{items}}"
  as = "item"
  pipeline = [
    # item 是局部变量，只在循环内有效
    { type = "call", component = "process_item", with = { data = "{{item}}" }, output = "processed_item" }
  ]
  output = "processed_items"
```

### 数据转换

```toml
[flows.data_transformation]
description = "数据格式转换"

[flows.data_transformation.actions]
- type = "http_request"
  url = "/api/data"
  output = "raw_response"

- type = "json_path"
  input = "{{raw_response.body}}"
  query = "$.items"
  output = "raw_items"

- type = "map_field"
  input = "{{raw_items}}"
  target = "item_summary"
  mappings = [
    { from = "title", to = "title" },
    { from = "link", to = "url" },
    { from = "image", to = "cover" },
    { from = "desc", to = "summary" }
  ]
  output = "standardized_items"
```

## 流程优化

### 并发执行

```toml
[flows.parallel_processing]
description = "并发数据处理"

[flows.parallel_processing.actions]
- type = "constant"
  value = ["url1", "url2", "url3", "url4"]
  output = "urls"

- type = "parallel_for_each"
  input = "{{urls}}"
  as = "url"
  max_concurrency = 3
  pipeline = [
    { type = "http_request", url = "{{url}}", output = "response" },
    { type = "call", component = "parse_response", with = { data = "{{response}}" }, output = "parsed_data" }
  ]
  output = "all_results"
```

### 缓存策略

```toml
[flows.cached_workflow]
description = "带缓存的工作流"

[flows.cached_workflow.actions]
- type = "string_template"
  template = "workflow_cache_{{input_hash}}"
  output = "cache_key"

- type = "cache_get"
  key = "{{cache_key}}"
  output = "cached_output"

- type = "call"
  component = "expensive_operation"
  with = { input = "{{input_data}}" }
  output = "computed_output"
  condition = "{{!cached_output}}"

- type = "cache_set"
  key = "{{cache_key}}"
  value = "{{computed_output}}"
  ttl = 3600
  condition = "{{!computed_output}}"

- type = "constant"
  value = "{{cached_output || computed_output}}"
  output = "final_output"
```

## 流程测试

### 单元测试

```toml
[flows.test_workflow]
description = "测试工作流"

[flows.test_workflow.actions]
- type = "constant"
  value = "test_input"
  output = "test_data"

- type = "call"
  component = "target_component"
  with = { input = "{{test_data}}" }
  output = "actual_result"

- type = "constant"
  value = "expected_output"
  output = "expected_result"

- type = "script"
  call = "utils.assert_equal"
  with = { actual = "{{actual_result}}", expected = "{{expected_result}}" }
  output = "test_passed"

- type = "log"
  message = "测试 {{test_passed ? '通过' : '失败'}}"
```

### 性能监控

```toml
[flows.monitored_workflow]
description = "带监控的工作流"

[flows.monitored_workflow.actions]
- type = "script"
  call = "utils.start_timer"
  output = "start_time"

- type = "call"
  component = "main_processing"
  with = { data = "{{input_data}}" }
  output = "result"

- type = "script"
  call = "utils.end_timer"
  with = { start_time = "{{start_time}}" }
  output = "duration"

- type = "log"
  message = "处理耗时: {{duration}}ms"

- type = "script"
  call = "utils.record_metrics"
  with = { duration = "{{duration}}", success = true }
```

## 最佳实践

### 流程设计原则

- **职责分离**：每个流程专注一个任务
- **错误处理**：始终考虑异常情况
- **性能优化**：合理使用缓存和并发
- **可维护性**：添加适当的日志和注释

### 命名规范

- 使用动词开头：`get_user_profile`、`search_products`
- 描述性强：`sync_user_data`、`validate_payment`
- 避免缩写：`create_new_order` 而不是 `create_order`

### 文档化

```toml
[flows.complex_data_sync]
description = "复杂数据同步流程

此流程执行以下操作：
1. 从API获取数据列表
2. 过滤无效数据
3. 转换数据格式
4. 保存到数据库
5. 发送通知

输入参数：
- source_url: 数据源URL
- batch_size: 批处理大小（默认100）

输出：
- 同步结果统计信息
"
```

通过良好的流程设计，可以构建出健壮、灵活、可维护的数据处理系统。