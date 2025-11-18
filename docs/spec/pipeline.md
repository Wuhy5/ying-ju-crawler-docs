# 流水线系统

## 流水线概述

流水线（Pipeline）是媒体爬虫规范的核心执行引擎，它将复杂的爬取任务分解为一系列可重用的处理步骤。通过流水线，可以构建灵活、可维护的数据处理流程。

## 流水线组成

### 步骤类型

流水线由以下类型的步骤组成：

#### 数据获取步骤
- `http_request`：发送HTTP请求获取数据
- `script`：执行自定义脚本逻辑
- `cache_get`：从缓存获取数据
- `cache_set`：将数据存入缓存

#### 数据处理步骤
- `parse_html`：解析HTML内容
- `parse_json`：解析JSON数据
- `parse_xml`：解析XML数据
- `extract_text`：提取文本内容
- `regex_match`：正则表达式匹配
- `jsonpath_query`：JSONPath查询
- `xpath_query`：XPath查询

#### 数据转换步骤
- `map_field`：字段映射转换
- `transform_data`：数据转换
- `filter_data`：数据过滤
- `merge_data`：数据合并
- `split_data`：数据分割

#### 控制流步骤
- `condition`：条件判断
- `loop_for_each`：循环处理
- `parallel`：并行执行
- `sequence`：顺序执行

#### 输出步骤
- `log`：记录日志
- `return`：返回结果
- `error`：抛出错误

### 步骤配置

每个步骤的基本配置：

```toml
[flows.my_flow.actions]
- type = "http_request"
  url = "https://api.example.com/data"
  method = "GET"
  headers = { "User-Agent" = "MyCrawler/1.0" }
  output = "response"

- type = "parse_json"
  input = "{{response.body}}"
  output = "parsed_data"

- type = "map_field"
  input = "{{parsed_data}}"
  target = "item_summary"
  mappings = [
    { from = "title", to = "title" },
    { from = "url", to = "url" }
  ]
  output = "result"
```

## 流水线执行

### 执行顺序

流水线按步骤定义的顺序执行，每个步骤的输出可以作为后续步骤的输入：

```toml
[flows.search.actions]
# 步骤1：发送搜索请求
- type = "http_request"
  url = "https://api.example.com/search?q={{query}}"
  method = "GET"
  output = "search_response"

# 步骤2：解析搜索结果
- type = "parse_json"
  input = "{{search_response.body}}"
  output = "search_data"

# 步骤3：提取结果列表
- type = "jsonpath_query"
  input = "{{search_data}}"
  query = "$.results[*]"
  output = "results"

# 步骤4：转换数据格式
- type = "map_field"
  input = "{{results}}"
  target = "item_summary"
  mappings = [
    { from = "name", to = "title" },
    { from = "link", to = "url" },
    { from = "thumbnail", to = "cover" }
  ]
  output = "search_results"

# 步骤5：返回结果
- type = "return"
  value = "{{search_results}}"
```

### 数据流

通过模板变量实现步骤间的数据传递：

```toml
# 使用双花括号引用变量
url = "https://api.example.com/user/{{user_id}}"

# 引用上一步的输出
input = "{{previous_step_output}}"

# 引用配置参数
query = "{{config.search_query}}"
```

### 错误处理

流水线支持错误处理和恢复：

```toml
[flows.robust_request.actions]
- type = "http_request"
  url = "https://api.example.com/data"
  method = "GET"
  retry_count = 3
  retry_delay = 1000
  timeout = 5000
  on_error = "fallback_flow"
  output = "response"

- type = "condition"
  if = "{{response.status_code}} != 200"
  then = [
    { type = "log", message = "请求失败，状态码: {{response.status_code}}" },
    { type = "error", message = "API请求失败" }
  ]
  else = [
    { type = "parse_json", input = "{{response.body}}", output = "data" }
  ]
```

## 控制流

### 条件执行

基于条件执行不同的处理分支：

```toml
[flows.conditional_processing.actions]
- type = "condition"
  if = "{{data.type}} == 'video'"
  then = [
    { type = "map_field", input = "{{data}}", target = "video_item", mappings = [...] }
  ]
  else = [
    { type = "map_field", input = "{{data}}", target = "book_item", mappings = [...] }
  ]
  output = "result"
```

### 循环处理

对数组数据进行循环处理：

```toml
[flows.batch_process.actions]
- type = "loop_for_each"
  input = "{{items}}"
  as = "item"
  pipeline = [
    { type = "http_request", url = "{{item.detail_url}}", output = "detail_response" },
    { type = "parse_json", input = "{{detail_response.body}}", output = "detail_data" },
    { type = "map_field", input = "{{detail_data}}", target = "item_detail", mappings = [...] }
  ]
  output = "processed_items"
```

### 并行执行

同时执行多个独立的任务：

```toml
[flows.parallel_fetch.actions]
- type = "parallel"
  tasks = [
    {
      name = "fetch_videos",
      pipeline = [
        { type = "http_request", url = "https://api.example.com/videos", output = "videos" }
      ]
    },
    {
      name = "fetch_books",
      pipeline = [
        { type = "http_request", url = "https://api.example.com/books", output = "books" }
      ]
    }
  ]
  output = "all_data"
```

## 流水线组合

### 子流水线调用

将复杂的流水线分解为可重用的子流水线：

```toml
[flows.parse_item.actions]
- type = "http_request"
  url = "{{item.url}}"
  output = "response"

- type = "call_flow"
  flow = "parse_detail"
  with = { html = "{{response.body}}" }
  output = "detail"

[flows.parse_detail.actions]
- type = "parse_html"
  input = "{{html}}"
  selectors = { title = "h1.title", description = "div.desc" }
  output = "parsed"

- type = "map_field"
  input = "{{parsed}}"
  target = "item_detail"
  mappings = [...]
  output = "result"
```

### 流水线模板

创建参数化的流水线模板：

```toml
[flows.search_template]
parameters = ["query", "type", "limit"]

[flows.search_template.actions]
- type = "http_request"
  url = "https://api.example.com/search?q={{query}}&type={{type}}&limit={{limit}}"
  output = "response"

- type = "parse_json"
  input = "{{response.body}}"
  output = "data"

- type = "return"
  value = "{{data.results}}"

# 使用模板
[flows.search_videos.actions]
- type = "call_flow"
  flow = "search_template"
  with = { query = "action movies", type = "video", limit = 20 }
  output = "videos"
```

## 流水线优化

### 缓存集成

使用缓存减少重复请求：

```toml
[flows.cached_request.actions]
- type = "cache_get"
  key = "api_data_{{request_id}}"
  output = "cached_data"

- type = "condition"
  if = "{{cached_data}} != null"
  then = [
    { type = "return", value = "{{cached_data}}" }
  ]
  else = [
    { type = "http_request", url = "https://api.example.com/data", output = "response" },
    { type = "parse_json", input = "{{response.body}}", output = "data" },
    { type = "cache_set", key = "api_data_{{request_id}}", value = "{{data}}", ttl = 3600 },
    { type = "return", value = "{{data}}" }
  ]
```

### 批量处理

优化大量数据的处理效率：

```toml
[flows.batch_update.actions]
- type = "split_data"
  input = "{{all_items}}"
  batch_size = 10
  output = "batches"

- type = "loop_for_each"
  input = "{{batches}}"
  as = "batch"
  pipeline = [
    { type = "parallel"
      tasks = [
        { name = "process_1", pipeline = [...] },
        { name = "process_2", pipeline = [...] }
      ]
      output = "batch_results"
    }
  ]
  output = "all_results"
```

### 性能监控

监控流水线执行性能：

```toml
[scripting.modules.performance]
code = """
fn measure_execution_time(start: i64, end: i64) -> map {
    let duration = end - start;
    #{ duration = duration, status = duration > 5000 ? "slow" : "normal" }
}
"""

[flows.monitored_flow.actions]
- type = "script"
  call = "utils.current_time_millis"
  output = "start_time"

# 执行主要逻辑
- type = "http_request"
  url = "https://api.example.com/data"
  output = "response"

- type = "parse_json"
  input = "{{response.body}}"
  output = "data"

- type = "script"
  call = "utils.current_time_millis"
  output = "end_time"

- type = "script"
  call = "performance.measure_execution_time"
  with = { start = "{{start_time}}", end = "{{end_time}}" }
  output = "metrics"

- type = "log"
  message = "流水线执行时间: {{metrics.duration}}ms (状态: {{metrics.status}})"

- type = "return"
  value = "{{data}}"
```

## 流水线调试

### 日志记录

在流水线中添加调试日志：

```toml
[flows.debug_flow.actions]
- type = "log"
  level = "info"
  message = "开始处理请求: {{request_id}}"

- type = "http_request"
  url = "https://api.example.com/data"
  output = "response"

- type = "log"
  level = "debug"
  message = "API响应状态: {{response.status_code}}"

- type = "condition"
  if = "{{response.status_code}} != 200"
  then = [
    { type = "log", level = "error", message = "请求失败: {{response.body}}" },
    { type = "error", message = "API调用失败" }
  ]

- type = "parse_json"
  input = "{{response.body}}"
  output = "data"

- type = "log"
  level = "info"
  message = "成功解析 {{data.items.len()}} 个项目"
```

### 断点调试

在关键步骤设置断点：

```toml
[flows.debuggable_flow.actions]
- type = "http_request"
  url = "https://api.example.com/data"
  output = "response"

- type = "breakpoint"
  name = "after_request"
  data = "{{response}}"

- type = "parse_json"
  input = "{{response.body}}"
  output = "data"

- type = "breakpoint"
  name = "after_parse"
  data = "{{data}}"
```

### 错误追踪

详细记录错误信息：

```toml
[scripting.modules.error_handler]
code = """
fn handle_error(error: map) -> map {
    #{ 
        timestamp = current_time_millis(),
        error_type = error.type,
        message = error.message,
        context = error.context,
        stack_trace = error.stack
    }
}
"""

[flows.error_handling.actions]
- type = "try_catch"
  try = [
    { type = "http_request", url = "{{url}}", output = "response" },
    { type = "parse_json", input = "{{response.body}}", output = "data" }
  ]
  catch = [
    { type = "script", call = "error_handler.handle_error", with = { error = "{{error}}" }, output = "error_info" },
    { type = "log", level = "error", message = "处理失败: {{error_info}}" },
    { type = "return", value = { success = false, error = "{{error_info}}" } }
  ]
  finally = [
    { type = "log", message = "清理资源" }
  ]
```

通过合理设计流水线，可以构建出高效、可靠、可维护的数据处理流程，实现复杂的爬取任务。