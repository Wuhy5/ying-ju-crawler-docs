---
sidebar_position: 6
---

# 人机验证流程

人机验证流程（ChallengeConfig）用于处理各种反爬验证机制，是规则的可选部分。当目标网站使用 Cloudflare、reCAPTCHA、hCaptcha 等验证方式时，可以通过此配置自动检测并处理。

## 基本结构

```toml
[challenge]
enabled = true                # 是否启用验证处理（默认 true）
max_attempts = 3              # 最大验证尝试次数（默认 3）
cache_duration = 3600         # 凭证缓存时间（秒）

[[challenge.detectors]]       # 验证检测器列表
type = "cloudflare"

[challenge.handler]           # 验证处理器
type = "webview"
timeout_seconds = 120
```

## 验证检测器

检测器用于判断响应是否为人机验证页面。支持多个检测器，按顺序检查，首个匹配的触发处理。

### Cloudflare 检测

自动识别 Cloudflare 验证页面。

```toml
[[challenge.detectors]]
type = "cloudflare"
extra_patterns = ["checking your browser"]  # 额外的检测模式（可选）
```

### reCAPTCHA 检测

检测 Google reCAPTCHA 验证。

```toml
[[challenge.detectors]]
type = "recaptcha"
version = "v2"  # 可选: v2, v3
```

### hCaptcha 检测

检测 hCaptcha 验证。

```toml
[[challenge.detectors]]
type = "hcaptcha"
```

### 自定义检测

根据 HTTP 响应特征自定义检测规则。

```toml
[[challenge.detectors]]
type = "custom"
status_codes = [403, 503]                           # 触发验证的状态码
body_patterns = ["验证码", "human verification"]    # 响应体包含的文本
url_pattern = ".*\\/captcha\\/.*"                   # URL 匹配模式（正则）

[challenge.detectors.headers]                       # 响应头匹配规则
"Server" = "cloudflare"
"X-Challenge" = ".*required.*"

[challenge.detectors.detect_script]                 # 自定义检测脚本
code = '''
// 输入：响应对象，返回 true 表示检测到验证
return response.status === 403 && response.body.includes("captcha");
'''
```

## 验证处理器

处理器定义如何处理检测到的人机验证。

### WebView 手动验证

打开浏览器窗口让用户手动完成验证。

```toml
[challenge.handler]
type = "webview"
timeout_seconds = 120                              # 超时时间（默认 120 秒）
check_interval_ms = 500                            # 检测间隔（默认 500 毫秒）
tip = "请完成人机验证后继续"                       # 提示文案
user_agent = "Mozilla/5.0..."                      # 自定义 UA
success_check = "return !document.body.innerHTML.includes('Just a moment');"
extract_cookies = ["cf_clearance", "__cf_bm"]      # 需要提取的 Cookie

[challenge.handler.finish_script]                   # 验证完成后执行的脚本
code = '''
// 提取和保存验证凭证
return { cookies: document.cookie };
'''
```

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `timeout_seconds` | 整数 | ❌ | 120 | 验证超时时间（秒） |
| `check_interval_ms` | 整数 | ❌ | 500 | 验证成功检测间隔（毫秒） |
| `success_check` | 字符串 | ❌ | - | 验证成功检测脚本，返回 true 表示验证完成 |
| `tip` | 字符串 | ❌ | - | 提示用户的说明文案 |
| `user_agent` | 字符串 | ❌ | - | 自定义 User-Agent |
| `extract_cookies` | 数组 | ❌ | - | 需要提取的 Cookie 名称列表 |
| `finish_script` | Script | ❌ | - | 验证完成后执行的脚本 |

### 自动重试

等待后重试请求，适用于 JS Challenge。

```toml
[challenge.handler]
type = "retry"
max_retries = 3              # 最大重试次数（默认 3）
delay_ms = 5000              # 重试前等待时间（默认 5000 毫秒）
backoff_factor = 1.5         # 延迟倍增因子（默认 1.5）
use_webview = false          # 是否使用 WebView 渲染（默认 false）
```

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `max_retries` | 整数 | ❌ | 3 | 最大重试次数 |
| `delay_ms` | 整数 | ❌ | 5000 | 重试前等待时间（毫秒） |
| `backoff_factor` | 浮点数 | ❌ | 1.5 | 每次重试的延迟倍增因子 |
| `use_webview` | 布尔 | ❌ | false | 重试时使用 WebView 渲染 |

### Cookie 注入

使用预设的验证 Cookie。

#### 从用户输入获取

```toml
[challenge.handler]
type = "cookie"

[challenge.handler.user_input]
cookie_names = ["cf_clearance", "__cf_bm"]
tip = "请从浏览器复制 Cloudflare Cookie"

[challenge.handler.validate_script]
code = "return cookies.cf_clearance !== undefined;"
```

#### 从配置读取

```toml
[challenge.handler]
type = "cookie"

[challenge.handler.config]
cookies = "cf_clearance=xxx; __cf_bm=yyy"
```

#### 从脚本获取

```toml
[challenge.handler]
type = "cookie"

[challenge.handler.script]
code = '''
// 动态获取 Cookie
return await fetchCookiesFromStorage();
'''
```

### 外部打码服务

调用第三方打码平台处理验证码。

```toml
[challenge.handler]
type = "external"
provider = "two_captcha"              # 服务商: two_captcha, anti_captcha, cap_solver, custom
api_key = "{{ env.CAPTCHA_API_KEY }}" # API 密钥（支持模板变量）
timeout_seconds = 120                 # 请求超时（默认 120 秒）
endpoint = "https://custom.api/solve" # 自定义端点（可选）

[challenge.handler.extra_params]      # 额外参数
proxy = "http://proxy:8080"
```

支持的打码平台：

| 服务商 | 标识 | 说明 |
|--------|------|------|
| 2captcha | `two_captcha` | 主流打码平台 |
| Anti-Captcha | `anti_captcha` | 支持多种验证类型 |
| CapSolver | `cap_solver` | AI 打码服务 |
| 自定义 | `custom` | 自建服务（需配置 endpoint） |

### 自定义脚本处理

使用脚本完全自定义验证处理逻辑。

```toml
[challenge.handler]
type = "script"
timeout_seconds = 60

[challenge.handler.script]
code = '''
// 输入：请求上下文和响应
// 输出：处理后的凭证
const { request, response } = input;

// 自定义处理逻辑
const token = await solveCaptcha(response.body);

return {
    cookies: { "captcha_token": token },
    headers: { "X-Captcha-Solved": "true" }
};
'''
```

## 完整示例

### Cloudflare 验证处理

```toml
[meta]
name = "示例站点"
domain = "example.com"
media_type = "video"

[challenge]
enabled = true
max_attempts = 3
cache_duration = 7200  # 缓存 2 小时

[[challenge.detectors]]
type = "cloudflare"

[challenge.handler]
type = "webview"
timeout_seconds = 120
success_check = "return !document.body.innerHTML.includes('Just a moment');"
extract_cookies = ["cf_clearance", "__cf_bm"]
tip = "请完成 Cloudflare 人机验证"
```

### 自定义验证码处理

```toml
[challenge]
enabled = true

[[challenge.detectors]]
type = "custom"
status_codes = [403]
body_patterns = ["请输入验证码", "captcha"]

[challenge.handler]
type = "external"
provider = "two_captcha"
api_key = "{{ env.TWO_CAPTCHA_KEY }}"
timeout_seconds = 60
```

### 多重验证检测

```toml
[challenge]
enabled = true
max_attempts = 5

# 检测器1: Cloudflare
[[challenge.detectors]]
type = "cloudflare"

# 检测器2: reCAPTCHA
[[challenge.detectors]]
type = "recaptcha"
version = "v2"

# 检测器3: 自定义规则
[[challenge.detectors]]
type = "custom"
status_codes = [429, 503]
body_patterns = ["rate limit", "too many requests"]

[challenge.handler]
type = "retry"
max_retries = 3
delay_ms = 10000
backoff_factor = 2.0
```

### JS Challenge 自动处理

```toml
[challenge]
enabled = true

[[challenge.detectors]]
type = "cloudflare"

[challenge.handler]
type = "retry"
max_retries = 3
delay_ms = 5000
use_webview = true  # 使用 WebView 执行 JavaScript
```

## JSON 格式示例

```json
{
  "challenge": {
    "enabled": true,
    "max_attempts": 3,
    "cache_duration": 3600,
    "detectors": [
      {
        "type": "cloudflare"
      },
      {
        "type": "custom",
        "status_codes": [403, 503],
        "body_patterns": ["验证码"]
      }
    ],
    "handler": {
      "type": "webview",
      "timeout_seconds": 120,
      "success_check": "return document.querySelector('.success') !== null;",
      "extract_cookies": ["cf_clearance"]
    }
  }
}
```

## 配置参数总览

### ChallengeConfig

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `enabled` | 布尔 | ❌ | true | 是否启用验证处理 |
| `detectors` | 数组 | ✅ | - | 验证检测器列表 |
| `handler` | 对象 | ✅ | - | 验证处理器 |
| `max_attempts` | 整数 | ❌ | 3 | 最大验证尝试次数 |
| `cache_duration` | 整数 | ❌ | - | 凭证缓存时间（秒） |

## 最佳实践

1. **优先使用内置检测器**：Cloudflare、reCAPTCHA、hCaptcha 都有专门的检测器，比自定义规则更准确。

2. **合理设置缓存时间**：验证通过后的凭证可以缓存，避免频繁验证。建议设置 `cache_duration` 为 1-2 小时。

3. **提供清晰的用户提示**：使用 WebView 处理时，设置 `tip` 参数告知用户需要完成的操作。

4. **使用环境变量存储 API Key**：打码平台的 API Key 应使用模板变量从环境中读取，避免硬编码。

5. **配置多个检测器**：同一网站可能使用多种验证方式，按优先级配置多个检测器。

## 相关文档

- 📖 [登录流程](./login.md) - 用户认证配置
- 📖 [HTTP 配置](../reference/http.md) - 网络请求配置
- 📖 [脚本配置](../reference/scripting.md) - 自定义脚本
