# 登录流程

登录流程（LoginFlow）用于处理需要用户认证的网站，是规则的可选部分。

## 登录类型

登录流程支持三种认证方式：

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| `webview` | WebView 登录 | 复杂登录、验证码、第三方登录 |
| `form` | 表单登录 | 简单的用户名密码登录 |
| `credential` | 凭证登录 | Cookie、Token 等直接凭证 |

## WebView 登录

最通用的登录方式，在 WebView 中加载登录页面，用户手动完成登录。

### 基本配置

```toml
[login]
type = "webview"

[login.webview]
url = "https://example.com/login"
success_url = "https://example.com/user"  # 登录成功后的 URL
timeout = 300  # 超时时间（秒）
```

### 配置参数

| 参数 | 必需 | 说明 |
|------|------|------|
| `url` | ✅ | 登录页面 URL |
| `success_url` | ✅ | 登录成功后跳转的 URL（或 URL 前缀） |
| `timeout` | ❌ | 等待超时时间，默认 300 秒 |
| `user_agent` | ❌ | 自定义 User-Agent |
| `inject_js` | ❌ | 注入的 JavaScript 代码 |

### 示例

```toml
[login]
type = "webview"

[login.webview]
url = "https://example.com/login"
success_url = "https://example.com/member"
timeout = 180
user_agent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)"
```

### 带 JavaScript 注入

```toml
[login]
type = "webview"

[login.webview]
url = "https://example.com/login"
success_url = "https://example.com/user"
inject_js = '''
// 隐藏广告
document.querySelectorAll('.ad-banner').forEach(el => el.remove());

// 自动填充测试账号（仅示例）
// document.querySelector('#username').value = 'test';
'''
```

## 表单登录

直接发送 HTTP 请求进行表单登录。

### 基本配置

```toml
[login]
type = "form"

[login.form]
url = "https://example.com/api/login"
method = "POST"
content_type = "application/x-www-form-urlencoded"

[login.form.fields]
username = "{{ username }}"
password = "{{ password }}"

[login.form.success_check]
type = "json"
path = "$.code"
value = "0"
```

### 配置参数

| 参数 | 必需 | 说明 |
|------|------|------|
| `url` | ✅ | 登录接口 URL |
| `method` | ✅ | HTTP 方法（通常为 POST） |
| `content_type` | ❌ | 内容类型，默认 `application/x-www-form-urlencoded` |
| `fields` | ✅ | 表单字段 |
| `success_check` | ✅ | 成功验证规则 |
| `headers` | ❌ | 自定义请求头 |

### 表单字段变量

| 变量 | 说明 |
|------|------|
| `{{ username }}` | 用户输入的用户名 |
| `{{ password }}` | 用户输入的密码 |
| `{{ captcha }}` | 验证码（如需要） |

### 成功验证

#### JSON 响应验证

```toml
[login.form.success_check]
type = "json"
path = "$.code"        # JSONPath
value = "0"            # 期望值
message_path = "$.msg" # 错误消息路径（可选）
```

#### Cookie 验证

```toml
[login.form.success_check]
type = "cookie"
name = "user_token"    # Cookie 名称
```

#### 响应状态验证

```toml
[login.form.success_check]
type = "status"
value = "200"
```

### JSON 登录示例

```toml
[login]
type = "form"

[login.form]
url = "https://api.example.com/user/login"
method = "POST"
content_type = "application/json"

[login.form.headers]
"Accept" = "application/json"
"X-Client-Version" = "1.0.0"

[login.form.fields]
account = "{{ username }}"
pwd = "{{ password }}"
remember = "1"

[login.form.success_check]
type = "json"
path = "$.status"
value = "success"
message_path = "$.message"
```

### 需要验证码的表单登录

```toml
[login]
type = "form"

[login.form]
url = "https://example.com/login"
method = "POST"
captcha_required = true

[login.form.captcha]
url = "https://example.com/captcha"
type = "image"  # image, sms, email

[login.form.fields]
username = "{{ username }}"
password = "{{ password }}"
verify_code = "{{ captcha }}"

[login.form.success_check]
type = "json"
path = "$.code"
value = "0"
```

## 凭证登录

直接使用 Cookie 或 Token 进行认证。

### Cookie 凭证

```toml
[login]
type = "credential"

[login.credential]
credential_type = "cookie"
cookie_names = ["user_token", "session_id"]  # 需要的 Cookie 名称
validate_url = "https://example.com/api/user/info"  # 验证 URL

[login.credential.validate_check]
type = "json"
path = "$.code"
value = "0"
```

### Token 凭证

```toml
[login]
type = "credential"

[login.credential]
credential_type = "token"
token_header = "Authorization"  # Token 放在哪个 Header
token_prefix = "Bearer "        # Token 前缀
validate_url = "https://example.com/api/user/info"

[login.credential.validate_check]
type = "json"
path = "$.success"
value = "true"
```

### 配置参数

| 参数 | 必需 | 说明 |
|------|------|------|
| `credential_type` | ✅ | 凭证类型：`cookie` 或 `token` |
| `cookie_names` | ❌ | Cookie 模式下需要的 Cookie 名称列表 |
| `token_header` | ❌ | Token 模式下的 Header 名称 |
| `token_prefix` | ❌ | Token 前缀（如 "Bearer "） |
| `validate_url` | ✅ | 验证凭证有效性的 URL |
| `validate_check` | ✅ | 验证成功的检查规则 |

## 完整示例

### 视频网站登录（WebView）

```toml
[meta]
name = "示例视频站"
domain = "example.com"
media_type = "video"

[login]
type = "webview"

[login.webview]
url = "https://example.com/login"
success_url = "https://example.com/user/home"
timeout = 300

# HTTP 配置 - 使用登录后的 Cookie
[http]
use_cookies = true
```

### API 登录（Form）

```toml
[meta]
name = "小说站"
domain = "novel.example.com"
media_type = "book"

[login]
type = "form"

[login.form]
url = "https://novel.example.com/api/auth/login"
method = "POST"
content_type = "application/json"

[login.form.fields]
mobile = "{{ username }}"
password = "{{ password }}"
platform = "web"

[login.form.success_check]
type = "json"
path = "$.code"
value = "200"
message_path = "$.msg"

# 登录成功后 Token 存储在 Cookie 中
[http]
use_cookies = true
```

### Token 认证（Credential）

```toml
[meta]
name = "音乐平台"
domain = "music.example.com"
media_type = "audio"

[login]
type = "credential"

[login.credential]
credential_type = "token"
token_header = "X-Auth-Token"
validate_url = "https://music.example.com/api/user/profile"

[login.credential.validate_check]
type = "json"
path = "$.success"
value = "true"

# 所有请求自动带上 Token
[http]
headers = { "X-Auth-Token" = "{{ auth_token }}" }
```

## JSON 格式示例

### WebView 登录

```json
{
  "login": {
    "type": "webview",
    "webview": {
      "url": "https://example.com/login",
      "success_url": "https://example.com/user",
      "timeout": 300
    }
  }
}
```

### 表单登录

```json
{
  "login": {
    "type": "form",
    "form": {
      "url": "https://example.com/api/login",
      "method": "POST",
      "content_type": "application/json",
      "fields": {
        "username": "{{ username }}",
        "password": "{{ password }}"
      },
      "success_check": {
        "type": "json",
        "path": "$.code",
        "value": "0"
      }
    }
  }
}
```

### 凭证登录

```json
{
  "login": {
    "type": "credential",
    "credential": {
      "credential_type": "cookie",
      "cookie_names": ["session", "token"],
      "validate_url": "https://example.com/api/check",
      "validate_check": {
        "type": "json",
        "path": "$.status",
        "value": "ok"
      }
    }
  }
}
```

## 登录状态持久化

登录后的凭证（Cookie 或 Token）会自动保存，下次使用规则时会自动应用。

### 配置 HTTP 使用 Cookie

```toml
[http]
use_cookies = true
cookie_store = "persistent"  # 持久化存储
```

### 配置 HTTP 使用 Token

```toml
[http]
headers = { "Authorization" = "Bearer {{ auth_token }}" }
```

## 常见问题

### 1. 登录成功但无法获取内容

- 检查 `success_url` 是否正确
- 确认 Cookie 是否正确保存
- 验证后续请求是否带上了认证信息

### 2. 验证码处理

- WebView 登录可以手动输入验证码
- 表单登录需要配置 `captcha` 相关字段
- 复杂验证码建议使用 WebView 方式

### 3. Token 过期

- 配置 Token 刷新机制
- 或提示用户重新登录

## 下一步

- 📖 [HTTP 配置](../reference/http.md) - 网络请求配置
- 🔧 [脚本配置](../reference/scripting.md) - 自定义脚本
