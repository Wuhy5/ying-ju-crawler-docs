# 脚本配置高级指南

本文档详细说明脚本系统的设计理念、配置方式和最佳实践。

## 设计理念

### 为什么需要脚本？

爬虫规范提供了丰富的声明式步骤（selector、jsonpath、regex 等），但某些场景下声明式配置无法满足需求：

- 复杂的数据解密/解码逻辑
- 动态签名计算
- 自定义的数据格式解析
- 条件判断和复杂转换

脚本系统作为"逃生舱"，提供了完全的编程灵活性。

### 设计目标

1. **分发友好**: 脚本内联在规则文件中，无需额外文件
2. **动态更新**: 支持远程加载，便于快速修复和更新
3. **跨平台**: 使用 Rust 实现的引擎，在所有平台运行
4. **安全隔离**: 沙箱执行，限制访问权限
5. **性能优先**: 编译缓存，避免重复解析

## 配置结构

### 顶层配置

```toml
[scripting]
engine = "rhai"      # 脚本引擎，可选: rhai, javascript, python
modules = { ... }    # 模块定义
```

### 模块定义

每个模块是一个命名的脚本集合，可以包含多个函数：

```toml
[scripting.modules.模块名]
code = "内联脚本代码"
# 或
url = "远程脚本 URL"
cache_ttl = 86400    # 可选：缓存时间（秒）
```

## 脚本引擎

### Rhai（推荐）

**特点**:
- ✅ Rust 原生，性能最佳
- ✅ 零依赖，包体积最小
- ✅ 类 Rust/JavaScript 混合语法
- ✅ 编译时优化
- ❌ 生态相对较小

**适用场景**: 默认选择，适合所有场景

### JavaScript

**特点**:
- ✅ 熟悉的语法，学习成本低
- ✅ 丰富的语言特性（ES6+）
- ✅ 强大的 JSON 处理能力
- ⚠️ 运行时相对较大
- ⚠️ 性能略低于 Rhai

**适用场景**: 熟悉 JS 的开发者，复杂 JSON 处理

### Lua

**特点**:
- ✅ 轻量级，包体积小
- ✅ 高性能，接近 Rhai
- ✅ 简洁的语法
- ✅ 游戏开发常用
- ⚠️ 生态相对较小

**适用场景**: 移动端应用，性能敏感场景

### Python

**特点**:
- ✅ 强大的标准库
- ✅ 优秀的字符串和数据处理
- ✅ 表达力强
- ⚠️ 运行时最大
- ⚠️ 性能相对较低

**适用场景**: 复杂数据处理，熟悉 Python 的开发者

### 性能对比

| 引擎 | 启动时间 | 执行速度 | 内存占用 | 包体积 | 推荐度 |
|------|---------|---------|---------|--------|--------|
| Rhai | 极快 | 极快 | 极小 | 最小 | ⭐⭐⭐⭐⭐ |
| Lua | 极快 | 极快 | 极小 | 最小 | ⭐⭐⭐⭐⭐ |
| JavaScript | 快 | 快 | 小 | 中等 | ⭐⭐⭐⭐ |
| Python | 中等 | 中等 | 中等 | 较大 | ⭐⭐⭐ |

## 使用方式

### 方式 1: 内联脚本（推荐）

直接在规则文件中编写脚本代码：

```toml
[scripting]
engine = "rhai"

[scripting.modules.crypto]
code = '''
// AES 解密函数
fn decrypt(encrypted, key) {
    let cipher = aes::new(key);
    cipher.decrypt(encrypted)
}

// Base64 解码
fn decode_base64(input) {
    base64::decode(input)
}
'''
```

**优点**:
- ✅ 单文件分发，无依赖
- ✅ 版本一致性
- ✅ 易于调试
- ✅ 无网络请求

**适用**: 中小型脚本（< 500 行）

### 方式 2: 远程脚本

从 URL 加载脚本，支持动态更新：

```toml
[scripting]
engine = "rhai"

[scripting.modules.crypto]
url = "https://example.com/scripts/crypto-v2.rhai"
cache_ttl = 86400  # 缓存 24 小时
```

**优点**:
- ✅ 动态更新，无需重新分发规则文件
- ✅ 代码复用，多个规则共享
- ✅ 便于维护和修复
- ✅ 减小规则文件体积

**缺点**:
- ⚠️ 需要网络请求（首次加载）
- ⚠️ 依赖外部服务可用性

**适用**: 大型脚本库，需要频繁更新的逻辑

### 方式 3: 混合使用

核心复杂逻辑远程加载，简单工具函数内联：

```toml
[scripting]
engine = "rhai"

# 加密库从远程加载（复杂、稳定）
[scripting.modules.crypto]
url = "https://cdn.example.com/libs/crypto-v1.0.0.rhai"
cache_ttl = 604800  # 缓存 7 天

# 简单工具函数内联（简单、常变）
[scripting.modules.utils]
code = '''
fn format_url(path) {
    "https://" + domain + path
}

fn clean_title(title) {
    title.trim().replace("【", "[").replace("】", "]")
}
'''
```

**优点**: 兼具两种方式的优点

## 多引擎支持

### 为什么需要多引擎？

不同的语言有不同的优势：
- **Rhai/Lua**: 性能优异，适合加密解密、签名计算
- **JavaScript**: JSON 处理强大，适合 API 数据解析
- **Python**: 字符串和数据处理，适合复杂转换

多引擎支持允许你在同一个规则文件中使用最适合的语言处理不同任务。

### 配置方式

#### 全局默认引擎

```toml
[scripting]
engine = "rhai"  # 所有模块默认使用 Rhai

[scripting.modules.crypto]
code = '''  # 使用默认的 Rhai
fn decrypt(data, key) {
    // Rhai 代码
}
'''
```

#### 模块级引擎覆盖

每个模块可以指定自己的引擎，覆盖全局设置：

```toml
[scripting]
engine = "rhai"  # 默认引擎

# 使用默认的 Rhai
[scripting.modules.crypto]
code = '''
fn decrypt_aes(data, key) {
    // Rhai 代码
}
'''

# 指定使用 JavaScript
[scripting.modules.parser]
engine = "javascript"  # 覆盖为 JavaScript
code = '''
function parseJson(jsonStr) {
    return JSON.parse(jsonStr);
}
'''

# 指定使用 Python
[scripting.modules.cleaner]
engine = "python"  # 覆盖为 Python
code = '''
def clean_text(text):
    import re
    return re.sub(r'\s+', ' ', text).strip()
'''

# 指定使用 Lua
[scripting.modules.utils]
engine = "lua"  # 覆盖为 Lua
code = '''
function format_url(path)
    return "https://" .. domain .. path
end
'''
```

### 实战示例：多引擎协同

```toml
[meta]
name = "某视频站"
domain = "video.example.com"
media_type = "video"

[scripting]
engine = "rhai"  # 默认高性能引擎

# Rhai: 处理加密（性能关键）
[scripting.modules.crypto]
engine = "rhai"
code = '''
fn decrypt_play_url(encrypted_base64, key) {
    let encrypted = base64::decode(encrypted_base64);
    let decrypted = aes::decrypt(encrypted, key, "0000000000000000");
    String::from_utf8(decrypted)
}

fn sign_request(url, timestamp) {
    let data = url + timestamp.to_string();
    sha256(data + "secret_key")
}
'''

# JavaScript: 处理复杂 JSON（原生支持好）
[scripting.modules.api]
engine = "javascript"
code = '''
function parseEpisodeList(responseText) {
    const data = JSON.parse(responseText);
    
    // 提取嵌套的 JSON
    const episodes = data.result.data.episodes || [];
    
    return episodes.map((ep, index) => ({
        number: index + 1,
        title: ep.title || `第 ${index + 1} 集`,
        url: ep.playUrl,
        thumbnail: ep.cover || "",
        duration: parseInt(ep.duration) || 0
    })).filter(ep => ep.url);  // 过滤无效数据
}
'''

# Python: 数据清洗和格式化
[scripting.modules.formatter]
engine = "python"
code = '''
import re
from datetime import datetime

def clean_description(html_text):
    """'清洗描述文本"""
    # 移除 HTML 标签
    text = re.sub(r'<[^>]+>', '', html_text)
    # 移除多余空白
    text = re.sub(r'\s+', ' ', text)
    # 移除特殊字符
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
    return text.strip()

def format_date(date_str):
    """'格式化日期"""
    try:
        dt = datetime.strptime(date_str, '%Y%m%d')
        return dt.strftime('%Y-%m-%d')
    except:
        return date_str
'''

# Lua: 简单工具函数（轻量级）
[scripting.modules.utils]
engine = "lua"
code = '''
function build_full_url(path)
    if path:sub(1, 4) == "http" then
        return path
    end
    return "https://" .. domain .. path
end

function extract_id(url)
    local id = url:match("/video/(%d+)")
    return id or ""
end
'''

# 在管道中使用
[parse.detail.fields]
# 使用 Rhai 解密
play_url = [
    { type = "selector", query = "#player-data", extract = "attr:data-enc" },
    { type = "script", call = "crypto.decrypt_play_url", args = { key = "mykey" } }
]

# 使用 JavaScript 解析 JSON
episodes = [
    { type = "http_request", url_template = "https://api.example.com/episodes" },
    { type = "script", call = "api.parseEpisodeList" }
]

# 使用 Python 清洗数据
description = [
    { type = "selector", query = ".description", extract = "html" },
    { type = "script", call = "formatter.clean_description" }
]

# 使用 Lua 构建 URL
cover = [
    { type = "selector", query = "img.cover", extract = "attr:src" },
    { type = "script", call = "utils.build_full_url" }
]
```

### 多引擎使用指南

| 任务类型 | 推荐引擎 | 理由 |
|----------|----------|------|
| 加密/解密 | Rhai / Lua | 性能关键，需要高效执行 |
| 签名计算 | Rhai / Lua | 需要高性能和低延迟 |
| JSON 解析 | JavaScript | 原生支持好，代码简洁 |
| API 数据处理 | JavaScript | 对象操作方便 |
| 正则表达式 | Python | 强大的 `re` 模块 |
| 数据清洗 | Python | 丰富的字符串方法 |
| 简单工具 | Lua | 轻量级，启动快 |
| 通用逻辑 | Rhai | 默认选择，性能好 |

### 注意事项

1. **性能开销**: 每种引擎都需要初始化，使用越多引擎内存占用越大
2. **包体积**: 多引擎会增加应用程序体积
3. **调试复杂度**: 多语言混合使用增加调试难度
4. **团队技能**: 确保团队成员熟悉使用的语言

**建议**:
- 小型项目: 只用一种引擎（Rhai 或 JavaScript）
- 中型项目: 2-3 种引擎混合使用
- 大型项目: 根据需要使用多种引擎
- 移动端: 优先 Rhai/Lua，减少包体积

## 函数编写规范

### 函数签名

所有脚本函数遵循统一的签名约定：

```rust
// 接收一个参数：管道输入
fn function_name(input) {
    // 处理 input
    return result
}

// 接收多个参数：管道输入 + 配置参数
fn function_name(input, key, iv) {
    // 使用 input、key、iv
    return result
}
```

### 输入输出类型

**输入类型**（前一步的输出）:
- `String`: 字符串
- `i64/f64`: 数字
- `bool`: 布尔值
- `Array`: 数组
- `Map`: 对象/字典

**输出类型**（作为下一步的输入）:
同上，支持任意 JSON 可表示的类型

### 调用方式

在管道中使用 `script` 步骤：

```toml
# 无额外参数
{ type = "script", call = "module.function" }

# 带参数（对象形式）
{
  type = "script",
  call = "crypto.decrypt",
  args = { key = "secret123", iv = "0000000000000000" }
}
```

参数通过 `args` 字段传递，在函数中作为第 2+ 个参数接收。

## 多引擎示例

### Rhai 语法

```rust
// 模块: crypto.rhai

/// AES-128-CBC 解密
fn decrypt_aes(encrypted_base64, key, iv) {
    try {
        let encrypted = base64::decode(encrypted_base64);
        let decrypted = aes::decrypt(encrypted, key, iv);
        String::from_utf8(decrypted)
    } catch (e) {
        throw "解密失败: " + e;
    }
}

/// URL 签名
fn sign_url(url, timestamp, secret) {
    let data = url + timestamp.to_string();
    let signature = sha256(data + secret);
    url + "?ts=" + timestamp + "&sign=" + signature
}

/// 解析加密的 JSON
fn decrypt_json(encrypted, key) {
    let decrypted = decrypt_aes(encrypted, key, "0000000000000000");
    json::parse(decrypted)
}
```

**特点**: 类 Rust 语法，类型推导，性能优异

### JavaScript 语法

```javascript
// 模块: crypto.js

/**
 * AES-128-CBC 解密
 */
function decryptAes(encryptedBase64, key, iv) {
    try {
        const encrypted = atob(encryptedBase64);
        const decrypted = aesDecrypt(encrypted, key, iv);
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        throw new Error(`解密失败: ${e}`);
    }
}

/**
 * URL 签名
 */
function signUrl(url, timestamp, secret) {
    const data = url + timestamp.toString();
    const signature = sha256(data + secret);
    return `${url}?ts=${timestamp}&sign=${signature}`;
}

/**
 * 解析加密的 JSON
 */
function decryptJson(encrypted, key) {
    const decrypted = decryptAes(encrypted, key, "0000000000000000");
    return JSON.parse(decrypted);
}
```

**特点**: 熟悉的语法，ES6+ 特性，丰富的标准库

### Python 语法

```python
# 模块: crypto.py

def decrypt_aes(encrypted_base64, key, iv):
    """AES-128-CBC 解密"""
    try:
        encrypted = base64.b64decode(encrypted_base64)
        decrypted = aes_decrypt(encrypted, key, iv)
        return decrypted.decode('utf-8')
    except Exception as e:
        raise Exception(f"解密失败: {e}")

def sign_url(url, timestamp, secret):
    """URL 签名"""
    data = url + str(timestamp)
    signature = sha256(data + secret)
    return f"{url}?ts={timestamp}&sign={signature}"

def decrypt_json(encrypted, key):
    """解析加密的 JSON"""
    decrypted = decrypt_aes(encrypted, key, "0000000000000000")
    return json.loads(decrypted)
```

**特点**: 简洁优雅，强大的字符串处理，丰富的内置函数

### Lua 语法

```lua
-- 模块: crypto.lua

--- AES-128-CBC 解密
function decrypt_aes(encrypted_base64, key, iv)
    local success, result = pcall(function()
        local encrypted = base64.decode(encrypted_base64)
        local decrypted = aes.decrypt(encrypted, key, iv)
        return decrypted
    end)
    
    if success then
        return result
    else
        error("解密失败: " .. tostring(result))
    end
end

--- URL 签名
function sign_url(url, timestamp, secret)
    local data = url .. tostring(timestamp)
    local signature = sha256(data .. secret)
    return url .. "?ts=" .. timestamp .. "&sign=" .. signature
end

--- 解析加密的 JSON
function decrypt_json(encrypted, key)
    local decrypted = decrypt_aes(encrypted, key, "0000000000000000")
    return json.parse(decrypted)
end
```

**特点**: 简洁的语法，高性能，适合嵌入式场景

## 内置 API

所有引擎提供统一的内置 API：

### 字符串处理

```rust
// Rhai 示例
str.len()           // 长度
str.trim()          // 去除首尾空格
str.to_upper()      // 转大写
str.to_lower()      // 转小写
str.contains(sub)   // 包含检查
str.starts_with(prefix)
str.ends_with(suffix)
str.replace(from, to)
str.split(delimiter)
str.substring(start, end)
```

### 编码解码

```rust
// Base64
base64::encode(data)
base64::decode(encoded)

// Hex
hex::encode(data)
hex::decode(encoded)

// URL
url::encode(text)
url::decode(encoded)
```

### 加密哈希

```rust
// 哈希
md5(data)
sha1(data)
sha256(data)

// AES
aes::encrypt(data, key, iv)
aes::decrypt(encrypted, key, iv)
```

### JSON 处理

```rust
// 解析和序列化
json::parse(text)
json::stringify(obj)

// JSONPath 查询
json::get(obj, "$.data[0].title")
```

### HTTP 请求

```rust
// 简单 GET
http::get(url)

// POST
http::post(url, data)

// 完整配置
http::request(#{
    url: "https://api.example.com",
    method: "POST",
    headers: #{ "Content-Type": "application/json" },
    body: json::stringify(data),
    timeout: 30
})
```

### 实用工具

```rust
// 时间
timestamp()         // 当前时间戳（秒）
timestamp_ms()      // 当前时间戳（毫秒）
sleep(ms)          // 休眠

// 随机
random()           // 0-1 随机数
random_int(min, max)
uuid()             // 生成 UUID

// 正则表达式
regex::match(pattern, text)
regex::find_all(pattern, text)
regex::replace(pattern, text, replacement)
```

完整 API 文档请参考各引擎的标准库文档。

## 错误处理

### Rhai

```rust
fn safe_operation(input, args) {
    try {
        // 可能出错的操作
        return risky_operation(input);
    } catch (e) {
        // 记录错误或返回默认值
        print(`错误: ${e}`);
        return "";
    }
}
```

### JavaScript

```javascript
function safeOperation(input, args) {
    try {
        return riskyOperation(input);
    } catch (e) {
        console.error(`错误: ${e}`);
        return "";
    }
}
```

### Python

```python
def safe_operation(input, args):
    try:
        return risky_operation(input)
    except Exception as e:
        print(f"错误: {e}")
        return ""
```

## 完整示例

### 示例 1: 视频地址解密

```toml
[meta]
name = "某视频站"
domain = "video.example.com"
media_type = "video"

[scripting]
engine = "rhai"

[scripting.modules.video]
code = '''
// 解密播放地址
fn decrypt_play_url(encrypted_data, key) {
    // 1. Base64 解码
    let encrypted = base64::decode(encrypted_data);
    
    // 2. AES 解密
    let decrypted = aes::decrypt(encrypted, key, "1234567890123456");
    
    // 3. 解析 JSON
    let data = json::parse(decrypted);
    
    // 4. 提取 URL
    data["video_url"]
}

// 生成请求签名
fn generate_sign(episode_id, timestamp) {
    let data = episode_id + "|" + timestamp.to_string();
    let secret = "app_secret_key_2024";
    sha256(data + secret)
}
'''

[parse.detail.fields]
play_url = [
    { type = "selector", query = "#player-data", extract = "attr:data-enc" },
    { type = "script", call = "video.decrypt_play_url", args = { key = "mykey123" } }
]
```

### 示例 2: 动态签名请求

```toml
[scripting]
engine = "javascript"

[scripting.modules.api]
code = '''
function buildSignedUrl(baseUrl, params) {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.random().toString(36).substring(7);
    
    // 构建签名字符串
    const signStr = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&') + `&timestamp=${timestamp}&nonce=${nonce}`;
    
    // 计算签名
    const signature = sha256(signStr + "secret_key");
    
    // 构建最终 URL
    return `${baseUrl}?${signStr}&sign=${signature}`;
}
'''

[parse.list.fields]
items = [
    { type = "script", call = "api.buildSignedUrl", args = {
        baseUrl = "https://api.example.com/list",
        params = { page = 1, size = 20 }
    }},
    { type = "http_request", url_template = "{input}" },
    { type = "jsonpath", query = "$.data.items[*]" }
]
```

### 示例 3: 复杂数据转换

```toml
[scripting]
engine = "python"

[scripting.modules.parser]
code = '''
def parse_episode_list(html_content):
    """解析剧集列表"""
    import re
    
    # 提取 JSON 数据
    pattern = r'var episodeData = ({.*?});'
    match = re.search(pattern, html_content, re.DOTALL)
    
    if not match:
        return []
    
    data = json.loads(match.group(1))
    episodes = []
    
    for ep in data.get('episodes', []):
        episodes.append({
            'number': int(ep['number']),
            'title': ep['title'].strip(),
            'url': f"https://example.com/play/{ep['id']}",
            'duration': ep.get('duration', 0)
        })
    
    return sorted(episodes, key=lambda x: x['number'])
'''

[parse.detail.fields]
episodes = [
    { type = "selector", query = "body", extract = "html" },
    { type = "script", call = "parser.parse_episode_list" }
]
```

## 性能优化

### 1. 脚本缓存

脚本在首次加载时会被编译和缓存：

```toml
# 远程脚本缓存配置
[scripting.modules.crypto]
url = "https://cdn.example.com/crypto.rhai"
cache_ttl = 604800  # 缓存 7 天，减少网络请求
```

### 2. 避免频繁调用

```toml
# ❌ 不好：在循环中调用脚本
episodes = [
    { type = "selector", query = ".episode", extract = "text" },
    { type = "loop", operation = "map", pipeline = [
        { type = "script", call = "parse.extract" }  # 每个项目都调用
    ]}
]

# ✅ 更好：一次性处理
episodes = [
    { type = "selector", query = ".episode", extract = "text" },
    { type = "script", call = "parse.extract_all" }  # 一次处理全部
]
```

### 3. 使用声明式步骤

```toml
# ❌ 不必要的脚本
url = [
    { type = "selector", query = "a", extract = "attr:href" },
    { type = "script", call = "utils.add_protocol" }
]

# ✅ 使用内置步骤
url = [
    { type = "selector", query = "a", extract = "attr:href" },
    { type = "string", operation = "prepend", prefix = "https://" }
]
```

## 安全考虑

### 沙箱隔离

所有脚本在隔离的沙箱环境中运行：

- ✅ 可访问: HTTP/HTTPS 请求、标准库
- ❌ 禁止: 文件系统、系统命令、原生库
- ⚠️ 限制: CPU 时间、内存使用、网络请求数

### 资源限制

```rust
// 自动应用的限制
- 单个脚本执行时间: 最大 30 秒
- 内存使用: 最大 256MB
- HTTP 请求: 最大 100 个/分钟
```

### 代码审查

使用远程脚本时，建议：

1. 使用 HTTPS 确保传输安全
2. 验证脚本来源和完整性
3. 定期审查脚本内容
4. 使用版本控制（URL 中包含版本号）

## 最佳实践

### 1. 优先声明式

只在必要时使用脚本：

```toml
# ✅ 简单操作用声明式
title = [
    { type = "selector", query = "h1", extract = "text" },
    { type = "string", operation = "trim" }
]

# ✅ 复杂逻辑用脚本
encrypted_url = [
    { type = "selector", query = "#data", extract = "text" },
    { type = "script", call = "crypto.decrypt_and_parse" }
]
```

### 2. 函数职责单一

```rust
// ✅ 好的设计
fn decrypt(data, key) { /* 只负责解密 */ }
fn parse_json(text) { /* 只负责解析 */ }

// ❌ 坏的设计
fn process_everything(data) {
    // 解密、解析、提取、转换...
}
```

### 3. 添加文档注释

```rust
/// 解密视频播放地址
///
/// 参数:
///   - encrypted: Base64 编码的加密数据
///   - key: AES 密钥
///
/// 返回: 解密后的 URL 字符串
fn decrypt_play_url(encrypted, key) {
    // 实现...
}
```

### 4. 错误处理完善

```rust
fn safe_decrypt(data, key) {
    if data.is_empty() {
        return "";
    }
    
    try {
        decrypt(data, key)
    } catch (e) {
        log_error(`解密失败: ${e}`);
        return "";
    }
}
```

### 5. 使用模块组织

```toml
[scripting.modules.crypto]   # 加密相关
[scripting.modules.parser]   # 解析相关
[scripting.modules.utils]    # 工具函数
[scripting.modules.api]      # API 相关
```

## 调试技巧

### 日志输出

```rust
// Rhai
fn debug_process(input) {
    print(`输入: ${input}`);
    let result = process(input);
    print(`输出: ${result}`);
    result
}
```

```javascript
// JavaScript
function debugProcess(input) {
    console.log(`输入: ${input}`);
    const result = process(input);
    console.log(`输出: ${result}`);
    return result;
}
```

### 返回中间结果

```rust
fn debug_pipeline(input) {
    let step1 = decode(input);
    let step2 = decrypt(step1);
    let step3 = parse(step2);
    
    // 返回包含所有步骤的对象
    #{
        original: input,
        decoded: step1,
        decrypted: step2,
        final: step3
    }
}
```

## 常见问题

### Q: 如何选择脚本引擎？

**A**: 
- 性能优先 → Rhai / Lua
- 熟悉度优先 → JavaScript
- 数据处理 → Python
- 移动端 → Rhai / Lua（包体积小）

### Q: 可以在一个规则中使用多种语言吗？

**A**: 
可以！每个模块可以指定不同的引擎：

```toml
[scripting]
engine = "rhai"  # 默认引擎

[scripting.modules.crypto]
engine = "rhai"  # 加密用 Rhai（性能好）

[scripting.modules.parser]
engine = "javascript"  # JSON 解析用 JS（原生支持）

[scripting.modules.cleaner]
engine = "python"  # 数据清洗用 Python（表达力强）
```

但要注意：
- 会增加包体积
- 增加内存占用
- 增加调试复杂度

### Q: 内联脚本还是远程脚本？

**A**:
- 小型脚本（< 200 行）→ 内联
- 大型库或频繁更新 → 远程
- 混合使用也很常见

### Q: 脚本性能如何优化？

**A**:
1. 减少脚本调用次数
2. 批量处理数据
3. 缓存计算结果
4. 优先使用内置函数

### Q: 如何在不同引擎间迁移？

**A**: 遵循统一的函数接口，主要修改：
- 语法差异（变量声明、函数定义等）
- 标准库调用方式
- 更新 `engine` 字段

## 下一步

- [HTTP 配置](./http-config.md) - 了解 HTTP 请求配置
- [缓存配置](./cache-config.md) - 了解缓存系统
- [处理管道](../pipeline/README.md) - 了解所有步骤类型
- [通用规范](../common-spec.md) - 返回通用规范
