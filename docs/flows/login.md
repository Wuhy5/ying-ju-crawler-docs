---
sidebar_position: 5
---

# 登录流程

登录流程（LoginFlow）用于处理需要用户认证的网站，是规则的可选部分。

## 登录类型

登录流程支持三种认证模式：

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| `script` | 脚本交互模式 | 复杂登录、验证码、多步骤流程 |
| `webview` | WebView 模式 | 网页登录、第三方登录 |
| `credential` | 凭证模式 | Cookie、Token 等直接凭证 |

## 脚本交互模式

App 渲染原生 UI，脚本处理登录逻辑。适用于需要验证码、多步骤验证等复杂场景。

### 基本配置

```toml
[login]
type = "script"
description = "用户名密码登录"

[[login.ui]]
type = "text"
key = "username"
label = "用户名"
placeholder = "请输入用户名"

[[login.ui]]
type = "password"
key = "password"
label = "密码"
placeholder = "请输入密码"

[login.login_script]
code = '''
const response = await http.post("https://example.com/api/login", {
    username: inputs.username,
    password: inputs.password
});
if (response.code === 0) {
    return { success: true };
} else {
    return { success: false, message: response.message };
}
'''
```

### UI 元素类型

#### 文本输入框

```toml
[[login.ui]]
type = "text"
key = "username"           # 变量名，脚本通过此 key 获取输入
label = "用户名"           # 显示名称
placeholder = "请输入"     # 占位符（可选）
required = true            # 是否必填（默认 true）
```

#### 密码输入框

```toml
[[login.ui]]
type = "password"
key = "password"
label = "密码"
placeholder = "请输入密码"
```

#### 功能按钮

```toml
[[login.ui]]
type = "button"
label = "获取验证码"

[login.ui.action]
code = '''
// 获取短信验证码
const result = await http.post("https://example.com/api/sms", {
    phone: inputs.phone
});
return result.success;
'''
```

#### 验证码图片

```toml
[[login.ui]]
type = "image"
key = "captcha_img"        # 绑定变量名，脚本更新此变量时图片自动刷新
label = "验证码"

[login.ui.action]          # 点击图片时执行（用于刷新验证码）
code = '''
const imgData = await http.get("https://example.com/captcha", { responseType: "base64" });
setVar("captcha_img", imgData);
'''
```

### 初始化脚本

界面打开时自动执行，用于加载验证码或获取初始数据：

```toml
[login.init_script]
code = '''
// 自动加载图形验证码
const imgData = await http.get("https://example.com/captcha", { responseType: "base64" });
setVar("captcha_img", imgData);
'''
```

### 完整示例：带验证码的登录

```toml
[login]
type = "script"
description = "用户名密码登录（带验证码）"

# UI 元素定义
[[login.ui]]
type = "text"
key = "username"
label = "用户名"

[[login.ui]]
type = "password"
key = "password"
label = "密码"

[[login.ui]]
type = "image"
key = "captcha_img"
label = "验证码图片"

[login.ui.action]
code = "await refreshCaptcha();"

[[login.ui]]
type = "text"
key = "captcha"
label = "验证码"
placeholder = "请输入图中验证码"

# 初始化脚本
[login.init_script]
code = '''
async function refreshCaptcha() {
    const imgData = await http.get("https://example.com/captcha", { responseType: "base64" });
    setVar("captcha_img", imgData);
}
await refreshCaptcha();
'''

# 登录脚本
[login.login_script]
code = '''
const response = await http.post("https://example.com/api/login", {
    username: inputs.username,
    password: inputs.password,
    captcha: inputs.captcha
});

if (response.code === 0) {
    // 保存登录凭证
    setCookie("token", response.data.token);
    return { success: true };
} else {
    // 刷新验证码
    await refreshCaptcha();
    return { success: false, message: response.message };
}
'''
```

## WebView 模式

打开浏览器窗口，用户在网页中手动完成登录，脚本检测登录状态。

### 基本配置

```toml
[login]
type = "webview"
start_url = "https://example.com/login"
description = "网页登录"

# 登录成功检测脚本（返回 true 表示成功）
check_script = "return document.querySelector('.user-info') !== null;"

# 检测间隔（毫秒，默认 500）
check_interval_ms = 500

# 超时时间（秒，默认 300）
timeout_seconds = 300
```

### 配置参数

| 参数 | 必需 | 默认值 | 说明 |
|------|------|--------|------|
| `start_url` | ✅ | - | 登录起始页 URL |
| `check_script` | ❌ | - | 登录成功检测脚本 |
| `check_interval_ms` | ❌ | 500 | 检测间隔（毫秒） |
| `timeout_seconds` | ❌ | 300 | 超时时间（秒） |
| `user_agent` | ❌ | - | 自定义 User-Agent |
| `inject_script` | ❌ | - | 页面加载后注入的脚本 |
| `finish_script` | ❌ | - | 登录成功后执行的脚本 |
| `allow_redirects` | ❌ | true | 是否允许重定向 |

### 注入脚本

页面加载完成后自动执行，用于处理 DOM：

```toml
[login]
type = "webview"
start_url = "https://example.com/login"

# 自动勾选"同意协议"
inject_script = '''
const checkbox = document.querySelector('#agree-terms');
if (checkbox && !checkbox.checked) {
    checkbox.click();
}
'''
```

### 完成脚本

登录成功后、WebView 关闭前执行，用于提取和保存凭证：

```toml
[login]
type = "webview"
start_url = "https://example.com/login"
check_script = "return document.querySelector('.user-avatar') !== null;"

[login.finish_script]
code = '''
// 从 localStorage 提取 Token
const token = localStorage.getItem('auth_token');
if (token) {
    setVar('auth_token', token);
}

// 提取特定 Cookie
const cookies = document.cookie;
setVar('login_cookies', cookies);
'''
```

### 完整示例

```toml
[login]
type = "webview"
start_url = "https://example.com/login"
description = "网页登录"
check_script = "return document.querySelector('.user-center') !== null;"
check_interval_ms = 1000
timeout_seconds = 180
user_agent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)"

# 自动处理
inject_script = '''
// 隐藏广告弹窗
document.querySelectorAll('.ad-popup').forEach(el => el.remove());
'''

# 提取凭证
[login.finish_script]
code = '''
const token = localStorage.getItem('userToken');
if (token) {
    setHeader('Authorization', 'Bearer ' + token);
}
'''
```

## 凭证模式

用户手动提供 Cookie、Token 等认证信息，最简单的登录方式。

### 基本配置（Cookie）

```toml
[login]
type = "credential"
tip = "请从浏览器开发者工具中复制 Cookie"
docs_url = "https://example.com/help/get-cookie"  # 教程链接（可选）
```

### 自定义字段

```toml
[login]
type = "credential"
tip = "请输入您的 API Token"

[[login.fields]]
key = "token"
label = "API Token"
field_type = "password"
placeholder = "请输入 Token"
required = true

[[login.fields]]
key = "user_id"
label = "用户 ID"
field_type = "text"
placeholder = "可选"
required = false
```

### 字段类型

| 类型 | 说明 |
|------|------|
| `text` | 普通文本（单行） |
| `password` | 密码（隐藏显示） |
| `textarea` | 多行文本（如 Cookie 字符串） |

### 凭证存储方式

定义如何将用户输入的凭证应用到 HTTP 请求：

#### Cookie 存储

```toml
[login]
type = "credential"
tip = "请输入 Cookie"

[[login.storage]]
type = "cookie"
field_key = "cookie"      # 对应 fields 中的 key（可选）
domain = "example.com"    # Cookie 域名（可选）
```

#### Header 存储

```toml
[login]
type = "credential"
tip = "请输入 API Token"

[[login.fields]]
key = "token"
label = "Token"
field_type = "password"

[[login.storage]]
type = "header"
header_name = "Authorization"
header_template = "Bearer {{ token }}"
```

### 凭证验证

可选的验证脚本，检查用户输入的凭证是否有效：

```toml
[login]
type = "credential"
tip = "请输入 Cookie"

[login.validate_script]
code = '''
// 尝试访问用户信息接口验证凭证
const response = await http.get("https://example.com/api/user/info");
if (response.code === 0) {
    return { valid: true };
} else {
    return { valid: false, message: "Cookie 无效或已过期" };
}
'''
```

### 完整示例

#### Cookie 登录

```toml
[login]
type = "credential"
description = "Cookie 登录"
tip = "请从浏览器开发者工具 (F12) 的 Network 标签中复制 Cookie"
docs_url = "https://example.com/help/cookie"

[[login.storage]]
type = "cookie"

[login.validate_script]
code = '''
const res = await http.get("https://example.com/api/user");
return { valid: res.code === 0, message: res.code !== 0 ? "Cookie 无效" : null };
'''
```

#### Token 登录

```toml
[login]
type = "credential"
description = "Token 登录"
tip = "请在用户设置页面获取您的 API Token"

[[login.fields]]
key = "api_token"
label = "API Token"
field_type = "password"
placeholder = "sk-xxxxxxxx"
help = "在【设置】-【API】中获取"

[[login.storage]]
type = "header"
header_name = "X-Api-Key"
header_template = "{{ api_token }}"
```

#### 多凭证登录

```toml
[login]
type = "credential"
description = "多凭证登录"
tip = "请输入用户 ID 和 Token"

[[login.fields]]
key = "user_id"
label = "用户 ID"
field_type = "text"

[[login.fields]]
key = "token"
label = "Token"
field_type = "password"

[[login.storage]]
type = "header"
header_name = "X-User-Id"
header_template = "{{ user_id }}"

[[login.storage]]
type = "header"
header_name = "Authorization"
header_template = "Bearer {{ token }}"
```

## JSON 格式示例

### 脚本交互模式

```json
{
  "login": {
    "type": "script",
    "ui": [
      { "type": "text", "key": "username", "label": "用户名" },
      { "type": "password", "key": "password", "label": "密码" }
    ],
    "login_script": {
      "code": "const res = await http.post('/login', inputs); return { success: res.code === 0 };"
    }
  }
}
```

### WebView 模式

```json
{
  "login": {
    "type": "webview",
    "start_url": "https://example.com/login",
    "check_script": "return document.querySelector('.user-info') !== null;",
    "timeout_seconds": 300
  }
}
```

### 凭证模式

```json
{
  "login": {
    "type": "credential",
    "tip": "请输入 Cookie",
    "fields": [
      { "key": "cookie", "label": "Cookie", "field_type": "textarea" }
    ],
    "storage": [
      { "type": "cookie" }
    ]
  }
}
```

## 登录状态持久化

登录后的凭证（Cookie 或 Token）会自动保存，下次使用规则时会自动应用。

## 常见问题

### 1. 登录成功但无法获取内容

- 检查凭证是否正确保存
- 确认后续请求是否带上了认证信息
- 验证 Cookie 域名是否正确

### 2. WebView 登录检测不到成功

- 检查 `check_script` 选择器是否正确
- 适当增加 `check_interval_ms`
- 确认登录成功后页面确实有预期元素

### 3. 凭证过期处理

- 配置 `validate_script` 检测凭证有效性
- 提示用户重新登录获取新凭证

## 相关文档

- 🛡️ [人机验证](./challenge.md) - 处理反爬验证
- 📖 [HTTP 配置](../reference/http.md) - 网络请求配置
- 🔧 [脚本配置](../reference/scripting.md) - 自定义脚本
