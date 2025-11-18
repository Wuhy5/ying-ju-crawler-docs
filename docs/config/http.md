# HTTP 配置

## 网络请求基础

HTTP 配置定义了所有网络请求的默认行为，包括请求头、超时设置、代理等。这些配置会应用到规则文件中的所有 HTTP 请求。

## 基本配置

### 请求头设置

```toml
[http]
user_agent = "Mozilla/5.0 (compatible; MediaCrawler/1.0)"
timeout = 30
follow_redirects = true
```

### 自定义请求头

```toml
[http.headers]
Accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
Accept-Language = "zh-CN,zh;q=0.9,en;q=0.8"
Accept-Encoding = "gzip, deflate, br"
Cache-Control = "no-cache"
```

## 超时和重试

### 超时设置

```toml
[http]
timeout = 30          # 请求超时时间（秒）
connect_timeout = 10  # 连接超时时间（秒）
read_timeout = 20     # 读取超时时间（秒）
```

### 重试机制

```toml
[http]
retry_times = 3       # 最大重试次数
retry_delay = 1000    # 重试间隔（毫秒）
retry_on_status = [500, 502, 503, 504]  # 哪些状态码重试
```

## 代理设置

### HTTP 代理

```toml
[http]
proxy = "http://proxy.example.com:8080"
```

### SOCKS5 代理

```toml
[http]
proxy = "socks5://proxy.example.com:1080"
```

### 认证代理

```toml
[http]
proxy = "http://username:password@proxy.example.com:8080"
```

## Cookie 管理

### 全局 Cookie

```toml
[http.cookies]
session_id = "abc123def456"
user_token = "token_value"
```

### Cookie 持久化

```toml
[http]
cookie_store = "./cookies.json"  # Cookie 存储文件
cookie_policy = "standard"       # Cookie 策略：standard, netscape, ignore
```

## SSL/TLS 配置

### 证书验证

```toml
[http]
verify_ssl = true                    # 是否验证SSL证书
ca_cert_file = "./ca-cert.pem"       # CA证书文件
client_cert_file = "./client.pem"    # 客户端证书
client_key_file = "./client-key.pem" # 客户端密钥
```

### 自定义证书

```toml
[http]
danger_accept_invalid_certs = false  # 生产环境应设为false
```

## 连接池管理

### 连接池设置

```toml
[http]
pool_max_idle_per_host = 10     # 每个主机最大空闲连接数
pool_idle_timeout = 90          # 空闲连接超时时间（秒）
pool_max_size = 100             # 连接池最大大小
```

### Keep-Alive

```toml
[http]
keep_alive = true               # 启用Keep-Alive
tcp_keepalive = true            # TCP Keep-Alive
tcp_keepalive_interval = 60     # Keep-Alive间隔（秒）
```

## 请求频率控制

### 全局限流

```toml
[http]
rate_limit = 10     # 每秒最大请求数（0表示无限制）
burst_limit = 20    # 突发请求上限
```

### 域名限流

```toml
[http.rate_limits]
"api.example.com" = { requests_per_second = 5, burst = 10 }
"cdn.example.com" = { requests_per_second = 50, burst = 100 }
```

## 特殊请求处理

### 重定向处理

```toml
[http]
follow_redirects = true         # 是否跟随重定向
max_redirects = 10              # 最大重定向次数
redirect_policy = "standard"    # 重定向策略：standard, lax, strict
```

### 压缩支持

```toml
[http]
accept_encoding = ["gzip", "deflate", "br"]  # 支持的压缩格式
automatic_decompression = true               # 自动解压缩
```

## 调试和监控

### 请求日志

```toml
[http]
enable_logging = true           # 启用请求日志
log_level = "info"              # 日志级别：error, warn, info, debug
log_body = false                # 是否记录请求/响应体
```

### 性能监控

```toml
[http]
enable_metrics = true           # 启用性能指标
metrics_interval = 60           # 指标收集间隔（秒）
```

## 流程中的 HTTP 请求

### 基本请求

```toml
[flows.get_page]
description = "获取网页内容"

[flows.get_page.actions]
- type = "http_request"
  url = "https://example.com/page"
  method = "GET"
  output = "response"
```

### 带参数的请求

```toml
[flows.search]
description = "搜索内容"

[flows.search.entry.search]
url = "/search?q={{keyword}}"

[flows.search.actions]
- type = "http_request"
  url = "{{entry.url}}"
  headers = { "X-API-Key": "{{api_key}}" }
  output = "response"
```

### POST 请求

```toml
[flows.login]
description = "用户登录"

[flows.login.actions]
- type = "http_request"
  url = "/api/login"
  method = "POST"
  headers = { "Content-Type": "application/json" }
  body = '{"username": "{{username}}", "password": "{{password}}"}'
  output = "login_response"
```

### 文件上传

```toml
[flows.upload]
description = "上传文件"

[flows.upload.actions]
- type = "http_request"
  url = "/api/upload"
  method = "POST"
  headers = { "Content-Type": "multipart/form-data" }
  body = "file={{file_data}}&filename={{filename}}"
  output = "upload_response"
```

## 高级用法

### 条件请求

```toml
[flows.get_data]
description = "条件获取数据"

[flows.get_data.actions]
- type = "http_request"
  url = "/api/data"
  headers = {
    "If-Modified-Since": "{{last_modified}}",
    "If-None-Match": "{{etag}}"
  }
  output = "response"
```

### 流式请求

```toml
[flows.download]
description = "下载大文件"

[flows.download.actions]
- type = "http_request"
  url = "{{download_url}}"
  stream = true                    # 启用流式下载
  output = "file_stream"
```

### WebSocket 连接

```toml
[flows.websocket]
description = "WebSocket 连接"

[flows.websocket.actions]
- type = "websocket_connect"
  url = "wss://example.com/ws"
  headers = { "Sec-WebSocket-Protocol": "chat" }
  output = "ws_connection"
```

## 错误处理

### 网络错误重试

```toml
[flows.api_call]
description = "API调用，带重试"

[flows.api_call.actions]
- type = "http_request"
  url = "/api/data"
  retry_on_error = true
  max_retries = 3
  retry_delay = 1000
  output = "response"
```

### 状态码检查

```toml
[flows.check_response]
description = "检查响应状态"

[flows.check_response.actions]
- type = "http_request"
  url = "/api/status"
  output = "response"

- type = "script"
  call = "check_status"
  with = { status_code = "{{response.status}}" }
```

## 安全考虑

### HTTPS 强制

```toml
[http]
force_https = true      # 强制使用HTTPS
upgrade_insecure = true # 自动升级HTTP到HTTPS
```

### 请求签名

```toml
[scripting.modules.auth]
code = """
fn sign_request(url: string, secret: string) -> string {
    // 生成请求签名
    let timestamp = current_time();
    let signature = hmac_sha256(url + timestamp, secret);
    signature
}
"""

[flows.auth_request]
description = "带签名的请求"

[flows.auth_request.actions]
- type = "script"
  call = "auth.sign_request"
  with = { url = "{{request_url}}", secret = "{{api_secret}}" }
  output = "signature"

- type = "http_request"
  url = "{{request_url}}"
  headers = { "X-Signature": "{{signature}}" }
  output = "response"
```

## 性能优化

### 并发请求

```toml
[flows.batch_request]
description = "并发请求多个URL"

[flows.batch_request.actions]
- type = "constant"
  value = ["url1", "url2", "url3"]
  output = "urls"

- type = "loop_for_each"
  input = "{{urls}}"
  as = "url"
  pipeline = [
    { type = "http_request", url = "{{url}}", output = "response" }
  ]
```

### 连接复用

```toml
[http]
# 启用连接复用以提高性能
keep_alive = true
pool_max_idle_per_host = 5
```

## 最佳实践

### 配置原则
- 生产环境使用合理的超时时间
- 启用 SSL 证书验证
- 设置适当的重试机制
- 使用连接池提高性能

### 调试技巧
- 启用请求日志定位问题
- 使用代理进行请求拦截
- 监控请求性能指标

### 安全建议
- 不要在日志中记录敏感信息
- 使用 HTTPS 进行敏感数据传输
- 定期更新证书和密钥