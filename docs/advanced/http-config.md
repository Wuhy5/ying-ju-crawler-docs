# HTTP 高级配置

本文档详细说明 HTTP 请求的高级配置选项。

## 基础配置

全局 HTTP 请求配置，可被具体请求覆盖。

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

## 自定义请求头

使用 `[http.headers]` 表定义自定义请求头。

```toml
[http.headers]
Referer = "https://example.com/"
Accept-Language = "zh-CN,zh;q=0.9"
Accept-Encoding = "gzip, deflate, br"
```

## Cookie 管理

支持静态 Cookie 和动态 Cookie 获取。

### 静态 Cookie

直接在配置中定义 Cookie 值：

```toml
[http.cookies]
session_id = "abc123"
user_token = "xyz789"
```

### 动态 Cookie

通过脚本动态获取 Cookie：

```toml
[http.cookie_script]
call = "auth.getCookies"
cache_ttl = 3600  # Cookie 缓存时间（秒）
```

脚本函数示例：

```javascript
// auth.js
function getCookies() {
    // 登录逻辑或 Cookie 获取逻辑
    return {
        session_id: "dynamic_session_id",
        user_token: "dynamic_token"
    };
}
```

## 认证配置

使用 `[http.auth]` 表配置认证方式。

### Basic 认证

```toml
[http.auth]
type = "basic"
username = "user"
password = "pass"
```

### Bearer Token

#### 静态 Token

```toml
[http.auth]
type = "bearer"
token = "your_static_token_here"
```

#### 动态 Token

通过脚本动态获取 Token：

```toml
[http.auth]
type = "bearer"
token_script = "auth.getToken"
cache_ttl = 3600  # Token 缓存时间（秒）
```

脚本函数示例：

```javascript
// auth.js
function getToken() {
    // 调用认证接口获取 Token
    const response = http.post("https://api.example.com/auth", {
        username: "user",
        password: "pass"
    });
    return response.data.token;
}
```

## 请求拦截器

在请求发送前/后执行自定义逻辑。

```toml
[http.interceptor]
before_request = "hooks.beforeRequest"  # 请求前钩子
after_response = "hooks.afterResponse"  # 响应后钩子
```

### 请求前钩子

修改请求配置，添加动态参数：

```javascript
// hooks.js
function beforeRequest(config) {
    // config: { url, method, headers, body, ... }
    
    // 添加时间戳
    config.headers["X-Timestamp"] = Date.now();
    
    // 添加签名
    const sign = generateSign(config.url, config.body);
    config.headers["X-Sign"] = sign;
    
    // 修改 URL
    config.url += "&_=" + Date.now();
    
    return config;
}
```

### 响应后钩子

处理响应数据，统一错误处理：

```javascript
// hooks.js
function afterResponse(response) {
    // response: { status, headers, body, ... }
    
    // 处理认证失败
    if (response.status === 401) {
        // 刷新 Token 或重新登录
        refreshToken();
    }
    
    // 处理限流
    if (response.status === 429) {
        // 等待后重试
        sleep(5000);
    }
    
    // 解密响应
    if (response.headers["Content-Encrypted"] === "true") {
        response.body = decrypt(response.body);
    }
    
    return response;
}
```

## 完整示例

```toml
[http]
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
timeout = 30
proxy = "http://proxy.example.com:8080"
retry_times = 3
retry_delay = 1000
rate_limit = 10
follow_redirect = true
max_redirects = 10

[http.headers]
Referer = "https://example.com/"
Accept-Language = "zh-CN,zh;q=0.9"
Accept-Encoding = "gzip, deflate, br"

[http.cookies]
session_id = "static_session"

[http.cookie_script]
call = "auth.getCookies"
cache_ttl = 3600

[http.auth]
type = "bearer"
token_script = "auth.getToken"
cache_ttl = 3600

[http.interceptor]
before_request = "hooks.beforeRequest"
after_response = "hooks.afterResponse"
```

## 最佳实践

### 1. 代理配置

对于需要代理的场景，建议使用环境变量：

```toml
[http]
proxy = "${HTTP_PROXY}"  # 从环境变量读取
```

### 2. 速率限制

根据目标网站的限制合理设置速率：

```toml
[http]
rate_limit = 5  # 每秒最多 5 个请求
retry_times = 5  # 增加重试次数
retry_delay = 2000  # 增加重试延迟
```

### 3. 超时设置

根据网站响应速度调整超时时间：

```toml
[http]
timeout = 60  # 对于慢速网站增加超时时间
```

### 4. 安全性

避免在配置文件中硬编码敏感信息：

```toml
[http.auth]
type = "bearer"
token_script = "auth.getToken"  # 使用脚本动态获取
# 不要: token = "hardcoded_token"
```

## 下一步

- 查看 [缓存配置](./cache-config.md) 了解缓存机制
- 查看 [脚本配置](./scripting-config.md) 了解脚本系统
- 返回 [通用规范](../common-spec.md)
