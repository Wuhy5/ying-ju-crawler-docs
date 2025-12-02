# HTTP 配置参考

HTTP 配置用于自定义网络请求行为，是规则的可选部分。

## 基本结构

```toml
[http]
timeout = 30
user_agent = "Mozilla/5.0 ..."
headers = { "Accept" = "application/json" }
```

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `timeout` | Integer | 30 | 请求超时时间（秒） |
| `user_agent` | String | - | 自定义 User-Agent |
| `headers` | Object | {} | 自定义请求头 |
| `proxy` | String | - | 代理服务器地址 |
| `use_cookies` | Boolean | true | 是否使用 Cookie |
| `cookie_store` | String | "memory" | Cookie 存储方式 |
| `follow_redirects` | Boolean | true | 是否跟随重定向 |
| `max_redirects` | Integer | 10 | 最大重定向次数 |
| `verify_ssl` | Boolean | true | 是否验证 SSL 证书 |
| `retry` | Object | - | 重试配置 |
| `rate_limit` | Object | - | 请求频率限制 |

## 超时配置

### 基本超时

```toml
[http]
timeout = 30  # 30 秒超时
```

### 详细超时配置

```toml
[http]
connect_timeout = 10    # 连接超时
read_timeout = 30       # 读取超时
write_timeout = 30      # 写入超时
```

## User-Agent 配置

### 使用预设

```toml
[http]
user_agent = "desktop"  # 预设: desktop, mobile, tablet
```

### 自定义

```toml
[http]
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
```

### 移动端

```toml
[http]
user_agent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
```

## 请求头配置

### 基本配置

```toml
[http]
headers = { "Accept" = "text/html", "Accept-Language" = "zh-CN" }
```

### 详细配置

```toml
[http.headers]
"Accept" = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
"Accept-Language" = "zh-CN,zh;q=0.9,en;q=0.8"
"Accept-Encoding" = "gzip, deflate, br"
"Cache-Control" = "no-cache"
"Referer" = "https://example.com/"
```

### API 请求头

```toml
[http.headers]
"Accept" = "application/json"
"Content-Type" = "application/json"
"X-Requested-With" = "XMLHttpRequest"
"X-Client-Version" = "1.0.0"
```

### 防盗链 Referer

```toml
[http]
headers = { "Referer" = "https://example.com/" }
```

## Cookie 配置

### 启用 Cookie

```toml
[http]
use_cookies = true
cookie_store = "persistent"  # memory | persistent
```

### 存储方式

| 值 | 说明 |
|-----|------|
| `memory` | 内存存储，程序退出后丢失 |
| `persistent` | 持久化存储，跨会话保持 |

### 手动设置 Cookie

```toml
[http]
cookies = [
    { name = "token", value = "xxx", domain = "example.com" },
    { name = "session", value = "yyy", domain = "example.com", path = "/" }
]
```

## 代理配置

### HTTP 代理

```toml
[http]
proxy = "http://127.0.0.1:7890"
```

### SOCKS5 代理

```toml
[http]
proxy = "socks5://127.0.0.1:1080"
```

### 带认证的代理

```toml
[http]
proxy = "http://user:pass@127.0.0.1:7890"
```

## 重定向配置

```toml
[http]
follow_redirects = true
max_redirects = 10
```

### 禁用重定向

```toml
[http]
follow_redirects = false
```

## SSL 配置

### 禁用 SSL 验证

```toml
[http]
verify_ssl = false  # 不推荐，仅用于测试
```

### 自定义证书

```toml
[http]
ca_cert = "/path/to/ca.crt"
client_cert = "/path/to/client.crt"
client_key = "/path/to/client.key"
```

## 重试配置

```toml
[http.retry]
max_retries = 3         # 最大重试次数
retry_delay = 1000      # 重试间隔（毫秒）
retry_on_status = [500, 502, 503, 504]  # 触发重试的状态码
exponential_backoff = true  # 指数退避
```

### 详细重试配置

```toml
[http.retry]
max_retries = 3
initial_delay = 1000    # 初始延迟
max_delay = 30000       # 最大延迟
multiplier = 2          # 延迟倍数
retry_on_status = [429, 500, 502, 503, 504]
retry_on_timeout = true
```

## 频率限制

### 基本限制

```toml
[http.rate_limit]
requests_per_second = 2  # 每秒最大请求数
```

### 详细限制

```toml
[http.rate_limit]
requests_per_second = 5
burst = 10              # 突发请求数
delay_between_requests = 200  # 请求间隔（毫秒）
```

### 域名级别限制

```toml
[http.rate_limit]
default = { requests_per_second = 2 }

[http.rate_limit.domains]
"api.example.com" = { requests_per_second = 10 }
"cdn.example.com" = { requests_per_second = 20 }
```

## 压缩配置

```toml
[http]
accept_encoding = "gzip, deflate, br"
auto_decompress = true
```

## 编码配置

```toml
[http]
default_encoding = "utf-8"
detect_encoding = true  # 自动检测编码
```

## 完整示例

### 基本配置

```toml
[http]
timeout = 30
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
use_cookies = true

[http.headers]
"Accept" = "text/html,application/xhtml+xml"
"Accept-Language" = "zh-CN,zh;q=0.9"
```

### API 站点配置

```toml
[http]
timeout = 15
use_cookies = true

[http.headers]
"Accept" = "application/json"
"Content-Type" = "application/json"
"X-Requested-With" = "XMLHttpRequest"

[http.retry]
max_retries = 3
retry_on_status = [429, 500, 502, 503]
```

### 需要认证的站点

```toml
[http]
timeout = 30
use_cookies = true
cookie_store = "persistent"

[http.headers]
"Accept" = "text/html"
"Referer" = "https://example.com/"

[login]
type = "webview"

[login.webview]
url = "https://example.com/login"
success_url = "https://example.com/user"
```

### 防爬虫站点

```toml
[http]
timeout = 30
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

[http.headers]
"Accept" = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
"Accept-Language" = "zh-CN,zh;q=0.9,en;q=0.8"
"Accept-Encoding" = "gzip, deflate, br"
"Upgrade-Insecure-Requests" = "1"
"Sec-Fetch-Dest" = "document"
"Sec-Fetch-Mode" = "navigate"
"Sec-Fetch-Site" = "none"
"Sec-Fetch-User" = "?1"

[http.rate_limit]
requests_per_second = 1
delay_between_requests = 1000
```

### 图片/资源站点

```toml
[http]
timeout = 60

[http.headers]
"Accept" = "image/webp,image/apng,image/*,*/*;q=0.8"
"Referer" = "https://example.com/"

[http.rate_limit]
requests_per_second = 5
```

## JSON 格式示例

```json
{
  "http": {
    "timeout": 30,
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "use_cookies": true,
    "headers": {
      "Accept": "text/html",
      "Accept-Language": "zh-CN"
    },
    "retry": {
      "max_retries": 3,
      "retry_on_status": [500, 502, 503]
    },
    "rate_limit": {
      "requests_per_second": 2
    }
  }
}
```

## 常见问题

### 1. 请求被拒绝 (403)

- 检查 User-Agent 是否被阻止
- 添加必要的请求头（Referer 等）
- 降低请求频率

### 2. 内容乱码

```toml
[http]
default_encoding = "gbk"  # 或其他编码
```

### 3. 图片无法加载

```toml
[http.headers]
"Referer" = "https://example.com/"  # 设置正确的 Referer
```

### 4. 请求超时

```toml
[http]
timeout = 60
connect_timeout = 15

[http.retry]
max_retries = 3
retry_on_timeout = true
```

## 下一步

- 📖 [脚本配置](./scripting.md) - 自定义脚本
- 📖 [登录流程](../flows/login.md) - 处理认证
