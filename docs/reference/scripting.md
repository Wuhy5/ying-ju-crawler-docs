# 脚本配置参考

脚本配置允许使用自定义脚本处理复杂的数据提取和转换。

## 基本结构

```toml
[scripting]
engine = "rhai"

[scripting.modules.main]
code = '''
fn process_data(input) {
    // 处理逻辑
    return result;
}
'''
```

## 支持的脚本引擎

| 引擎 | 说明 | 特点 |
|------|------|------|
| `rhai` | Rhai 脚本（默认） | 轻量、安全、语法类似 Rust |
| `javascript` | JavaScript | 广泛使用、生态丰富 |
| `python` | Python | 语法简洁、库丰富 |
| `lua` | Lua | 轻量、嵌入友好 |

## Rhai 脚本（推荐）

### 基本配置

```toml
[scripting]
engine = "rhai"

[scripting.modules.main]
code = '''
// 定义处理函数
fn decrypt_url(encrypted) {
    let decoded = base64_decode(encrypted);
    return decoded;
}

fn format_title(title) {
    return title.trim().replace("【", "[").replace("】", "]");
}
'''
```

### 使用脚本

```toml
media_url.steps = [
    { css = "script:contains('encrypt')" },
    { regex = "encrypt\\(\"([^\"]+)\"\\)" },
    { script = "decrypt_url" }
]

title.steps = [
    { css = "h1" },
    { script = "format_title" }
]
```

### Rhai 语法示例

```rhai
// 变量声明
let x = 10;
let name = "hello";
let arr = [1, 2, 3];
let obj = #{ key: "value", num: 42 };

// 条件语句
if x > 5 {
    print("big");
} else {
    print("small");
}

// 循环
for item in arr {
    print(item);
}

// 函数定义
fn add(a, b) {
    return a + b;
}

// 字符串操作
let s = "hello world";
s.len();           // 长度
s.contains("world"); // 包含
s.replace("world", "rhai"); // 替换
s.split(" ");      // 分割
s.to_upper();      // 大写

// 数组操作
arr.push(4);       // 添加
arr.pop();         // 移除最后一个
arr.len();         // 长度
arr[0];            // 索引访问
```

### 内置函数

| 函数 | 说明 |
|------|------|
| `base64_encode(s)` | Base64 编码 |
| `base64_decode(s)` | Base64 解码 |
| `url_encode(s)` | URL 编码 |
| `url_decode(s)` | URL 解码 |
| `md5(s)` | MD5 哈希 |
| `sha256(s)` | SHA256 哈希 |
| `json_parse(s)` | 解析 JSON |
| `json_stringify(obj)` | 转为 JSON |
| `regex_match(s, pattern)` | 正则匹配 |
| `regex_replace(s, pattern, replacement)` | 正则替换 |
| `http_get(url)` | HTTP GET 请求 |
| `http_post(url, body)` | HTTP POST 请求 |

## JavaScript 脚本

### 基本配置

```toml
[scripting]
engine = "javascript"

[scripting.modules.main]
code = '''
function decrypt_url(encrypted) {
    // 使用 CryptoJS 等库解密
    return decrypted;
}

function parse_player_data(html) {
    const match = html.match(/player_data\s*=\s*(\{[^}]+\})/);
    if (match) {
        return JSON.parse(match[1]);
    }
    return null;
}
'''
```

### 引入外部库

```toml
[scripting]
engine = "javascript"

[scripting.modules.crypto]
url = "https://cdn.example.com/crypto-js.min.js"

[scripting.modules.main]
code = '''
function decrypt(data) {
    return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
}
'''
```

## Python 脚本

### 基本配置

```toml
[scripting]
engine = "python"

[scripting.modules.main]
code = '''
import base64
import json

def decrypt_url(encrypted):
    decoded = base64.b64decode(encrypted)
    return decoded.decode('utf-8')

def parse_data(html):
    import re
    match = re.search(r'data\s*=\s*(\{.+?\})', html)
    if match:
        return json.loads(match.group(1))
    return None
'''
```

## Lua 脚本

### 基本配置

```toml
[scripting]
engine = "lua"

[scripting.modules.main]
code = '''
function decrypt_url(encrypted)
    local decoded = base64.decode(encrypted)
    return decoded
end

function format_title(title)
    return string.gsub(title, "%s+", " ")
end
'''
```

## 多模块组织

```toml
[scripting]
engine = "rhai"

# 工具函数模块
[scripting.modules.utils]
code = '''
fn trim_all(s) {
    return s.trim().replace("  ", " ");
}

fn extract_number(s) {
    let matches = regex_match(s, "\\d+");
    if matches.len() > 0 {
        return parse_int(matches[0]);
    }
    return 0;
}
'''

# 解密模块
[scripting.modules.crypto]
code = '''
fn decrypt_type1(s) {
    return base64_decode(s);
}

fn decrypt_type2(s) {
    // 复杂解密逻辑
    return result;
}
'''

# 主模块
[scripting.modules.main]
code = '''
fn process_url(url) {
    let clean = utils::trim_all(url);
    return crypto::decrypt_type1(clean);
}
'''
```

## 实际应用示例

### 解密播放地址

```toml
[scripting]
engine = "rhai"

[scripting.modules.main]
code = '''
fn decrypt_player_url(encrypted) {
    // 1. Base64 解码
    let decoded = base64_decode(encrypted);
    
    // 2. URL 解码
    let url = url_decode(decoded);
    
    // 3. 处理特殊字符
    let clean = url.replace("\\u002F", "/");
    
    return clean;
}
'''

[content.fields]
media_type = "video"
media_url.steps = [
    { css = "script:contains('player_aaaa')" },
    { regex = "url\":\"([^\"]+)\"" },
    { script = "decrypt_player_url" }
]
```

### 处理分页数据

```toml
[scripting]
engine = "rhai"

[scripting.modules.main]
code = '''
fn get_total_pages(html) {
    // 从 HTML 中提取总页数
    let match = regex_match(html, "共(\\d+)页");
    if match.len() > 1 {
        return parse_int(match[1]);
    }
    return 1;
}

fn build_page_url(base_url, page) {
    return base_url.replace("{page}", page.to_string());
}
'''
```

### 解析 JSON 播放数据

```toml
[scripting]
engine = "rhai"

[scripting.modules.main]
code = '''
fn parse_play_sources(json_str) {
    let data = json_parse(json_str);
    let sources = [];
    
    for source in data.sources {
        let item = #{
            name: source.name,
            url: source.url,
            type: source.type
        };
        sources.push(item);
    }
    
    return sources;
}
'''
```

### 处理加密参数

```toml
[scripting]
engine = "javascript"

[scripting.modules.main]
code = '''
function generateSign(params) {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2);
    
    const str = Object.keys(params)
        .sort()
        .map(k => `${k}=${params[k]}`)
        .join('&');
    
    const sign = md5(str + timestamp + nonce + SECRET_KEY);
    
    return {
        ...params,
        timestamp,
        nonce,
        sign
    };
}
'''
```

### 格式化文本

```toml
[scripting]
engine = "rhai"

[scripting.modules.main]
code = '''
fn format_duration(seconds) {
    let h = seconds / 3600;
    let m = (seconds % 3600) / 60;
    let s = seconds % 60;
    
    if h > 0 {
        return `${h}:${m.to_string().pad_left(2, '0')}:${s.to_string().pad_left(2, '0')}`;
    }
    return `${m}:${s.to_string().pad_left(2, '0')}`;
}

fn format_count(count) {
    if count >= 100000000 {
        return `${(count / 100000000).round(1)}亿`;
    }
    if count >= 10000 {
        return `${(count / 10000).round(1)}万`;
    }
    return count.to_string();
}

fn clean_title(title) {
    // 移除广告标识
    let clean = title
        .replace("[广告]", "")
        .replace("【推广】", "")
        .trim();
    
    // 限制长度
    if clean.len() > 50 {
        return clean.sub_string(0, 47) + "...";
    }
    return clean;
}
'''
```

## JSON 格式示例

```json
{
  "scripting": {
    "engine": "rhai",
    "modules": {
      "main": {
        "code": "fn process(input) {\n    return input.trim();\n}"
      },
      "utils": {
        "code": "fn helper(x) {\n    return x * 2;\n}"
      }
    }
  }
}
```

## 调试技巧

### 日志输出

```rhai
fn debug_process(input) {
    print("Input: " + input);  // 输出日志
    
    let result = process(input);
    print("Result: " + result);
    
    return result;
}
```

### 错误处理

```rhai
fn safe_process(input) {
    try {
        return process(input);
    } catch (e) {
        print("Error: " + e);
        return "";
    }
}
```

## 安全注意事项

1. **沙箱执行**：脚本在沙箱环境中执行，无法访问系统资源
2. **超时限制**：脚本执行有时间限制，避免无限循环
3. **内存限制**：脚本内存使用受限
4. **网络限制**：只能通过提供的 API 进行网络请求

## 下一步

- 📖 [提取步骤参考](./steps.md) - 完整步骤说明
- 📖 [过滤器参考](./filters.md) - 文本处理过滤器
