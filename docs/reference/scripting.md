---
sidebar_position: 4
---

# 脚本配置参考

脚本允许使用自定义代码处理复杂的数据提取、转换和交互逻辑。

## 基本结构

脚本使用内联方式配置，直接嵌入到需要使用脚本的位置：

```toml
# 简单脚本（字符串形式）
some_field.steps = [
    { css = ".data" },
    { script = "return data.trim();" }
]

# 脚本配置对象
[login.login_script]
code = '''
const result = await http.post("/api/login", inputs);
return { success: result.code === 0 };
'''
```

## Script 类型

### 字符串脚本

适用于简单的转换逻辑：

```toml
# 直接写脚本代码
process.steps = [
    { script = "return data.toUpperCase();" }
]
```

### ScriptConfig 对象

适用于复杂脚本或需要额外配置：

```toml
[some_section.some_script]
engine = "javascript"  # 可选，默认 javascript
code = '''
// 多行复杂脚本
async function process() {
    const response = await http.get("https://api.example.com/data");
    if (response.code === 0) {
        return response.data;
    }
    throw new Error("请求失败");
}
return await process();
'''
```

### ScriptConfig 属性

| 属性 | 必需 | 说明 |
|------|------|------|
| `code` | 与 `file`/`url` 三选一 | 内联脚本代码 |
| `file` | 与 `code`/`url` 三选一 | 本地文件路径（相对于规则文件） |
| `url` | 与 `code`/`file` 三选一 | 远程脚本 URL |
| `engine` | ❌ | 脚本引擎（默认 `javascript`） |
| `function` | ❌ | 要调用的函数名（默认调用 `main` 或直接执行） |
| `params` | ❌ | 传递给脚本的参数对象 |

### 带参数的脚本调用

```toml
[some_section.some_script]
code = "return input.replace(params.from, params.to)"
params = { from = "old", to = "new" }
```

### 引用外部文件

```toml
# 本地文件
[login.login_script]
file = "./scripts/login.js"
function = "doLogin"

# 远程脚本
[detail.fields.decrypt_script]
url = "https://example.com/scripts/decrypt.js"
function = "decryptUrl"
```

## 脚本引擎

| 引擎 | 说明 | 默认 |
|------|------|------|
| `javascript` | JavaScript（推荐，使用 Boa） | ✅ |
| `rhai` | Rhai 脚本（轻量级，Rust 原生） | - |
| `lua` | Lua 脚本 | - |

### JavaScript（默认）

JavaScript 是默认且推荐的脚本引擎，语法熟悉、功能强大：

```toml
[login.login_script]
# engine = "javascript"  # 可省略，默认值
code = '''
// ES6+ 语法
const { username, password } = inputs;

const response = await http.post("https://example.com/api/login", {
    username,
    password
});

if (response.code === 0) {
    setCookie("token", response.data.token);
    return { success: true };
}

return { 
    success: false, 
    message: response.message || "登录失败" 
};
'''
```

### Rhai

Rhai 是一种轻量级嵌入式脚本语言：

```toml
[some_section.some_script]
engine = "rhai"
code = '''
fn process_data(input) {
    let result = input.trim();
    result = result.replace("old", "new");
    return result;
}
process_data(data)
'''
```

## 脚本使用场景

### 提取步骤中使用

在 `steps` 数组中使用脚本转换数据：

```toml
# 简单脚本
title.steps = [
    { css = "h1" },
    { script = "return data.trim().replace(/\\s+/g, ' ');" }
]

# 复杂处理
[detail.fields.play_url]
steps = [
    { css = "script:contains('player')" },
    { regex = "url\":\"([^\"]+)\"" }
]

# 使用脚本步骤引用函数
play_url.steps = [
    { css = "script:contains('player')" },
    { script = "decrypt" }  # 引用已定义的函数
]
```

### 登录流程中使用

```toml
# 初始化脚本
[login.init_script]
code = '''
const captcha = await http.get("/captcha", { responseType: "base64" });
setVar("captcha_img", captcha);
'''

# 登录脚本
[login.login_script]
code = '''
const response = await http.post("/login", {
    username: inputs.username,
    password: inputs.password,
    captcha: inputs.captcha
});
return { success: response.code === 0 };
'''

# UI 按钮动作脚本
[[login.ui]]
type = "button"
label = "获取验证码"
[login.ui.action]
code = '''
await http.post("/sms/send", { phone: inputs.phone });
return true;
'''
```

### WebView 中使用

```toml
[login]
type = "webview"
start_url = "https://example.com/login"

# 检测登录成功
check_script = "return document.querySelector('.user-info') !== null;"

# 页面注入脚本
inject_script = '''
// 自动隐藏广告
document.querySelectorAll('.ad').forEach(el => el.remove());
'''

# 登录完成后脚本
[login.finish_script]
code = '''
const token = localStorage.getItem('token');
setHeader('Authorization', 'Bearer ' + token);
'''
```

### 人机验证中使用

```toml
[challenge.handler]
type = "script"
[challenge.handler.script]
code = '''
// 自定义验证处理逻辑
const result = await solveCaptcha(context.captcha_id);
return result.token;
'''
```

### 凭证验证中使用

```toml
[login.validate_script]
code = '''
const response = await http.get("/api/user/info");
return {
    valid: response.code === 0,
    message: response.code !== 0 ? "凭证无效或已过期" : null
};
'''
```

## 内置 API

### HTTP 请求

```javascript
// GET 请求
const data = await http.get(url);
const data = await http.get(url, { headers: { "X-Token": "xxx" } });
const img = await http.get(url, { responseType: "base64" });

// POST 请求
const result = await http.post(url, body);
const result = await http.post(url, body, { 
    headers: { "Content-Type": "application/json" } 
});
```

### 变量操作

```javascript
// 设置变量（UI 绑定）
setVar("captcha_img", imageData);

// 获取变量
const value = getVar("some_key");

// 设置 Cookie
setCookie("name", "value");
setCookie("name", "value", { domain: "example.com", path: "/" });

// 设置 Header（后续请求自动携带）
setHeader("Authorization", "Bearer xxx");
```

### 编码解码

```javascript
// Base64
const encoded = base64Encode(str);
const decoded = base64Decode(encoded);

// URL 编码
const encoded = urlEncode(str);
const decoded = urlDecode(encoded);

// JSON
const obj = JSON.parse(jsonStr);
const str = JSON.stringify(obj);
```

### 加密哈希

```javascript
const hash = md5(str);
const hash = sha256(str);
```

### 正则操作

```javascript
// 匹配
const matches = regexMatch(str, pattern);

// 替换
const result = regexReplace(str, pattern, replacement);
```

### 上下文变量

脚本中可以访问以下上下文变量：

| 变量 | 说明 | 可用范围 |
|------|------|----------|
| `data` | 当前处理的数据 | 提取步骤 |
| `inputs` | 用户输入的表单数据 | 登录脚本 |
| `context` | 上下文信息 | 所有脚本 |
| `document` | DOM 文档对象 | WebView 脚本 |

## JavaScript 示例

### 解密播放地址

```javascript
// 解密 Base64 + URL 编码的地址
const decrypted = urlDecode(base64Decode(data));
return decrypted.replace(/\\/g, '');
```

### 处理 JSON 数据

```javascript
const json = JSON.parse(data);
return json.data.list.map(item => ({
    title: item.name,
    url: item.link
}));
```

### 生成签名

```javascript
const timestamp = Date.now();
const params = {
    ...inputs,
    timestamp,
    nonce: Math.random().toString(36).substring(2)
};

const sortedKeys = Object.keys(params).sort();
const signStr = sortedKeys.map(k => `${k}=${params[k]}`).join('&');
params.sign = md5(signStr + SECRET);

return params;
```

### 格式化数据

```javascript
// 格式化播放量
function formatCount(count) {
    if (count >= 100000000) {
        return (count / 100000000).toFixed(1) + '亿';
    }
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
}

return formatCount(parseInt(data));
```

### 清理标题

```javascript
return data
    .replace(/\[广告\]/g, '')
    .replace(/【推广】/g, '')
    .replace(/\s+/g, ' ')
    .trim();
```

## Rhai 示例

### 基本语法

```rhai
// 变量
let x = 10;
let name = "hello";
let arr = [1, 2, 3];
let obj = #{ key: "value" };

// 条件
if x > 5 {
    "big"
} else {
    "small"
}

// 循环
for item in arr {
    print(item);
}

// 函数
fn add(a, b) {
    a + b
}
```

### 字符串处理

```rhai
let s = data;
s = s.trim();
s = s.replace("old", "new");
s = s.to_upper();
return s;
```

## JSON 格式示例

### ScriptConfig

```json
{
  "login_script": {
    "engine": "javascript",
    "code": "const res = await http.post('/login', inputs);\nreturn { success: res.code === 0 };"
  }
}
```

### 内联脚本

```json
{
  "steps": [
    { "css": ".title" },
    { "script": "return data.trim();" }
  ]
}
```

## 调试技巧

### 日志输出

```javascript
console.log("当前数据:", data);
console.log("输入参数:", JSON.stringify(inputs));
```

### 错误处理

```javascript
try {
    const result = JSON.parse(data);
    return result.value;
} catch (e) {
    console.error("解析失败:", e.message);
    return null;
}
```

## 安全限制

1. **沙箱执行**：脚本在隔离环境中运行，无法访问系统资源
2. **超时限制**：脚本执行时间有限制，避免无限循环
3. **内存限制**：脚本内存使用受限
4. **网络限制**：只能通过内置 HTTP API 进行网络请求

## 下一步

- 📖 [提取步骤参考](./steps.md) - 完整步骤说明
- 📖 [过滤器参考](./filters.md) - 文本处理过滤器
- 🔐 [登录流程](../flows/login.md) - 登录脚本详细用法
