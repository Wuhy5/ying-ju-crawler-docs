# 组件概述

## 什么是组件

组件是可重用的数据处理模块，可以在多个流程中调用。它们就像编程中的函数，可以接受参数、执行特定的处理逻辑，然后返回结果。

### 组件的特点

- **可重用性**：一个组件可以在多个地方调用
- **封装性**：内部实现细节对外隐藏
- **参数化**：可以通过参数定制行为
- **组合性**：组件可以调用其他组件

## 组件的基本结构

### 组件定义

```toml
[components.extract_user_info]
description = "从HTML中提取用户信息"

[components.extract_user_info.inputs]
html = "输入的HTML内容"
user_id = "用户ID（可选）"

[components.extract_user_info.pipeline]
# 处理步骤...
```

### 组件调用

```toml
[flows.get_user_profile]
description = "获取用户资料"

[flows.get_user_profile.actions]
- type = "call"
  component = "extract_user_info"
  with = { html = "{{page_html}}", user_id = "{{user_id}}" }
  output = "user_info"
```

## 输入参数

### 参数定义

组件可以定义输入参数：

```toml
[components.search_api]
description = "调用搜索API"

[components.search_api.inputs]
query = "搜索关键词"
limit = "结果数量限制（默认10）"
sort_by = "排序方式（默认相关度）"
```

### 参数使用

在组件内部使用 `{{参数名}}` 引用输入参数：

```toml
[components.search_api.pipeline]
- type = "string_template"
  template = "/api/search?q={{query}}&limit={{limit}}&sort={{sort_by}}"
  output = "api_url"

- type = "http_request"
  url = "{{api_url}}"
  output = "response"
```

### 默认参数

```toml
[components.search_api.inputs]
query = "搜索关键词"
limit = "结果数量限制"
sort_by = "排序方式"

[components.search_api.pipeline]
- type = "constant"
  value = "{{limit || 10}}"
  output = "actual_limit"

- type = "constant"
  value = "{{sort_by || 'relevance'}}"
  output = "actual_sort"
```

## 处理管道

组件的核心是处理管道，定义了具体的执行步骤。

### 简单组件

```toml
[components.format_title]
description = "格式化标题"

[components.format_title.inputs]
title = "原始标题"

[components.format_title.pipeline]
- type = "string_template"
  template = "{{title | trim | capitalize}}"
  output = "formatted_title"
```

### 复杂组件

```toml
[components.login_and_get_token]
description = "登录并获取访问令牌"

[components.login_and_get_token.inputs]
username = "用户名"
password = "密码"

[components.login_and_get_token.pipeline]
- type = "http_request"
  url = "/api/login"
  method = "POST"
  body = "username={{username}}&password={{password}}"
  output = "login_response"

- type = "json_path"
  input = "{{login_response.body}}"
  query = "$.token"
  output = "token"

- type = "cache_key"
  key = "user_token_{{username}}"
  value = "{{token}}"
  scope = "session"
  ttl = 3600
```

## 输出结果

### 单个输出

大多数组件返回单个结果：

```toml
[components.extract_price]
description = "提取商品价格"

[components.extract_price.inputs]
html = "商品页面HTML"

[components.extract_price.pipeline]
- type = "selector"
  input = "{{html}}"
  query = ".price"
  extract = "text"
  output = "price_text"

- type = "script"
  call = "utils.parse_price"
  with = { text = "{{price_text}}" }
  output = "price"
```

### 多个输出

组件可以返回多个相关结果：

```toml
[components.parse_product]
description = "解析商品信息"

[components.parse_product.inputs]
html = "商品页面HTML"

[components.parse_product.pipeline]
- type = "selector"
  input = "{{html}}"
  query = ".product-title"
  extract = "text"
  output = "title"

- type = "selector"
  input = "{{html}}"
  query = ".product-price"
  extract = "text"
  output = "price"

- type = "selector"
  input = "{{html}}"
  query = ".product-image"
  extract = "attr:src"
  output = "image_url"
```

调用时会得到包含所有输出的对象：

```toml
- type = "call"
  component = "parse_product"
  with = { html = "{{product_html}}" }
  output = "product_data"

# 现在可以使用：
# {{product_data.title}}
# {{product_data.price}}
# {{product_data.image_url}}
```

## 组件组合

### 组件调用组件

```toml
[components.get_user_and_posts]
description = "获取用户资料和帖子"

[components.get_user_and_posts.inputs]
user_id = "用户ID"

[components.get_user_and_posts.pipeline]
- type = "call"
  component = "get_user_profile"
  with = { user_id = "{{user_id}}" }
  output = "user_profile"

- type = "call"
  component = "get_user_posts"
  with = { user_id = "{{user_id}}", limit = 10 }
  output = "user_posts"
```

### 条件调用

```toml
[components.smart_login]
description = "智能登录"

[components.smart_login.inputs]
username = "用户名"
password = "密码"

[components.smart_login.pipeline]
- type = "cache_get"
  key = "login_token_{{username}}"
  output = "cached_token"

- type = "script"
  call = "utils.is_token_valid"
  with = { token = "{{cached_token}}" }
  output = "token_valid"

- type = "call"
  component = "login_and_get_token"
  with = { username = "{{username}}", password = "{{password}}" }
  output = "new_token"
  condition = "{{!token_valid}}"

- type = "constant"
  value = "{{token_valid ? cached_token : new_token.token}}"
  output = "final_token"
```

## 错误处理

### 异常捕获

```toml
[components.safe_http_request]
description = "安全的HTTP请求"

[components.safe_http_request.inputs]
url = "请求URL"
retries = "重试次数（默认3）"

[components.safe_http_request.pipeline]
- type = "constant"
  value = "{{retries || 3}}"
  output = "max_retries"

- type = "script"
  call = "utils.safe_request"
  with = { url = "{{url}}", retries = "{{max_retries}}" }
  output = "response"
```

### 降级处理

```toml
[components.get_product_image]
description = "获取商品图片，支持降级"

[components.get_product_image.inputs]
product_id = "商品ID"

[components.get_product_image.pipeline]
- type = "call"
  component = "get_high_res_image"
  with = { product_id = "{{product_id}}" }
  output = "high_res_result"

- type = "call"
  component = "get_low_res_image"
  with = { product_id = "{{product_id}}" }
  output = "low_res_result"
  condition = "{{!high_res_result.success}}"

- type = "constant"
  value = "{{high_res_result.success ? high_res_result.url : low_res_result.url}}"
  output = "final_image_url"
```

## 性能优化

### 缓存组件结果

```toml
[components.cached_api_call]
description = "带缓存的API调用"

[components.cached_api_call.inputs]
endpoint = "API端点"
params = "请求参数"

[components.cached_api_call.pipeline]
- type = "string_template"
  template = "api_cache_{{endpoint}}_{{params | hash}}"
  output = "cache_key"

- type = "cache_get"
  key = "{{cache_key}}"
  output = "cached_result"

- type = "call"
  component = "actual_api_call"
  with = { endpoint = "{{endpoint}}", params = "{{params}}" }
  output = "fresh_result"
  condition = "{{!cached_result}}"

- type = "cache_set"
  key = "{{cache_key}}"
  value = "{{fresh_result}}"
  ttl = 1800
  condition = "{{!cached_result}}"

- type = "constant"
  value = "{{cached_result || fresh_result}}"
  output = "final_result"
```

### 批量处理

```toml
[components.batch_process_items]
description = "批量处理项目"

[components.batch_process_items.inputs]
items = "项目列表"
batch_size = "批次大小（默认10）"

[components.batch_process_items.pipeline]
- type = "constant"
  value = "{{batch_size || 10}}"
  output = "actual_batch_size"

- type = "script"
  call = "utils.chunk_array"
  with = { array = "{{items}}", size = "{{actual_batch_size}}" }
  output = "batches"

- type = "loop_for_each"
  input = "{{batches}}"
  as = "batch"
  pipeline = [
    { type = "call", component = "process_batch", with = { items = "{{batch}}" }, output = "batch_result" }
  ]
  output = "all_results"
```

## 调试和测试

### 添加调试信息

```toml
[components.debug_component]
description = "调试组件"

[components.debug_component.inputs]
data = "要调试的数据"
label = "调试标签"

[components.debug_component.pipeline]
- type = "log"
  message = "[{{label}}] 输入数据: {{data | json}}"

- type = "constant"
  value = "{{data}}"
  output = "result"

- type = "log"
  message = "[{{label}}] 输出结果: {{result | json}}"
```

### 单元测试

```toml
[components.test_component]
description = "组件测试"

[components.test_component.inputs]
component_name = "要测试的组件名"
test_input = "测试输入"
expected_output = "期望输出"

[components.test_component.pipeline]
- type = "call"
  component = "{{component_name}}"
  with = "{{test_input}}"
  output = "actual_output"

- type = "script"
  call = "utils.assert_equal"
  with = { actual = "{{actual_output}}", expected = "{{expected_output}}" }
  output = "test_result"
```

## 最佳实践

### 设计原则

- **单一职责**：每个组件只做一件事情
- **接口清晰**：明确定义输入输出
- **错误友好**：妥善处理异常情况
- **性能意识**：考虑缓存和批量处理

### 命名规范

- 使用动词开头表示操作：`extract_title`、`parse_data`
- 使用名词表示数据：`user_profile`、`product_info`
- 避免缩写，使用完整有意义的名称

### 文档化

```toml
[components.complex_parser]
description = "复杂数据解析器，支持多种格式"

[components.complex_parser.inputs]
data = "要解析的数据"
format = "数据格式：json, xml, csv"
options = "解析选项（可选）"

# 在描述中详细说明：
# - 输入数据格式要求
# - 输出数据结构
# - 可能出现的错误
# - 使用示例
```

### 版本管理

```toml
[components.api_client_v2]
description = "API客户端 v2.0，支持新版接口"

# 版本说明：
# v1.0: 基础功能
# v2.0: 添加缓存支持，改进错误处理
```

通过合理使用组件，可以让规则文件更加模块化、可维护和可重用。