# 脚本配置

本文档详细说明脚本系统的配置和使用方式。

## 脚本引擎

爬虫规范支持四种脚本引擎，**全部基于 Rust 实现**，确保全平台兼容（iOS、Android、Desktop、Web）。

### 引擎对比

| 引擎           | 实现        | 性能  | 生态  | 学习成本 | 推荐场景           |
| -------------- | ----------- | ----- | ----- | -------- | ------------------ |
| **Rhai**       | Rust 原生   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐⭐⭐     | 默认选择，性能最佳 |
| **JavaScript** | Boa (Rust)  | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | 熟悉 JS 的开发者   |
| **Lua**        | mlua + Luau | ⭐⭐⭐⭐  | ⭐⭐⭐⭐  | ⭐⭐⭐      | 轻量级脚本需求     |
| **Python**     | RustPython  | ⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | 数据处理和转换     |

### 全平台支持说明

| 引擎       | 实现技术    | iOS | Android | Desktop | Web |
| ---------- | ----------- | --- | ------- | ------- | --- |
| Rhai       | Rust 原生   | ✅   | ✅       | ✅       | ✅   |
| JavaScript | Boa (Rust)  | ✅   | ✅       | ✅       | ✅   |
| Lua        | mlua + Luau | ✅   | ✅       | ✅       | ✅   |
| Python     | RustPython  | ✅   | ✅       | ✅       | ✅   |

**关键技术**：
- **Boa**: Rust 编写的 JavaScript 引擎，完全兼容 ES6+
- **mlua + Luau**: mlua 支持 Luau，Luau 是 Roblox 开发的高性能 Lua 变体，原生支持 iOS
- **RustPython**: 纯 Rust 实现的 Python 解释器，支持 WASM

## 基础配置

| 字段         | 类型   | 默认值      | 描述                                                 |
| ------------ | ------ | ----------- | ---------------------------------------------------- |
| `engine`     | Enum   | `rhai`      | 脚本引擎（`rhai` / `javascript` / `python` / `lua`） |
| `source_dir` | String | `"scripts"` | 脚本文件目录（相对路径）                             |
| `files`      | Map    | `{}`        | 脚本文件映射                                         |

### Rhai（默认推荐）

**语法**: 类 Rust/JavaScript 混合风格  
**特点**: Rust 原生集成，性能最佳，无 GC 压力

```toml
[scripting]
engine = "rhai"
source_dir = "./scripts"

[scripting.files]
crypto = "decrypt.rhai"
```

### JavaScript

**语法**: 标准 JavaScript (ES6+)  
**特点**: Boa 引擎，生态丰富，语法熟悉

```toml
[scripting]
engine = "javascript"
source_dir = "./scripts"

[scripting.files]
crypto = "decrypt.js"
```

### Lua

**语法**: Luau (Lua 5.1 增强版)  
**特点**: 高性能，类型推导，游戏开发常用

```toml
[scripting]
engine = "lua"
source_dir = "./scripts"

[scripting.files]
crypto = "decrypt.luau"
```

### Python

**语法**: Python 3  
**特点**: 强大的数据处理能力，丰富的标准库

```toml
[scripting]
engine = "python"
source_dir = "./scripts"

[scripting.files]
crypto = "decrypt.py"
```

## 函数编写

### 统一接口

所有引擎的脚本函数遵循统一接口：

```
function_name(input, args) -> result
```

| 参数     | 类型   | 描述             |
| -------- | ------ | ---------------- |
| `input`  | Any    | 上一步管道的输出 |
| `args`   | Object | 配置传入的参数   |
| `result` | Any    | 返回值           |

### 多引擎示例

#### Rhai

```rust
// crypto.rhai

fn decrypt(input, args) {
    let key = args.key;
    aes_decrypt(input, key)
}

fn encode(input, args) {
    base64_encode(input)
}
```

#### JavaScript

```javascript
// crypto.js

function decrypt(input, args) {
    const key = args.key;
    return aesDecrypt(input, key);
}

function encode(input, args) {
    return btoa(input);
}
```

#### Lua

```lua
-- crypto.luau

function decrypt(input, args)
    local key = args.key
    return aes_decrypt(input, key)
end

function encode(input, args)
    return base64_encode(input)
end
```

#### Python

```python
# crypto.py

def decrypt(input, args):
    key = args['key']
    return aes_decrypt(input, key)

def encode(input, args):
    return base64_encode(input)
```

### 使用示例

```toml
[scripting]
engine = "javascript"  # 选择 JS 引擎
source_dir = "./scripts"

[scripting.files]
crypto = "crypto.js"

[parse.detail.fields]
decrypted_url = [
  { type = "selector", query = "div.encrypted", extract = "text" },
  { type = "script", call = "crypto.decrypt", args = { key = "secret123" } }
]
```

## 语法速查

### Rhai

```rust
// 变量
let x = 10;
let name = "Alice";
let arr = [1, 2, 3];
let obj = #{name: "Bob", age: 30};

// 控制流
if x > 10 {
    print("大于10");
}

for i in 0..10 {
    print(i);
}

// 字符串
let full = first + " " + last;
let greeting = `Hello, ${name}!`;
```

### JavaScript

```javascript
// 变量
const x = 10;
const name = "Alice";
const arr = [1, 2, 3];
const obj = {name: "Bob", age: 30};

// 控制流
if (x > 10) {
    console.log("大于10");
}

for (let i = 0; i < 10; i++) {
    console.log(i);
}

// 字符串
const full = first + " " + last;
const greeting = `Hello, ${name}!`;
```

### Lua (Luau)

```lua
-- 变量
local x = 10
local name = "Alice"
local arr = {1, 2, 3}
local obj = {name = "Bob", age = 30}

-- 控制流
if x > 10 then
    print("大于10")
end

for i = 0, 9 do
    print(i)
end

-- 字符串
local full = first .. " " .. last
local greeting = string.format("Hello, %s!", name)
```

### Python

```python
# 变量
x = 10
name = "Alice"
arr = [1, 2, 3]
obj = {"name": "Bob", "age": 30}

# 控制流
if x > 10:
    print("大于10")

for i in range(10):
    print(i)

# 字符串
full = first + " " + last
greeting = f"Hello, {name}!"
```

## 引擎选择建议

### 根据团队技能

| 团队背景      | 推荐引擎   | 理由               |
| ------------- | ---------- | ------------------ |
| Rust 开发     | Rhai       | 语法相似，无缝集成 |
| Web 前端      | JavaScript | 熟悉的语法和生态   |
| 移动端开发    | Lua        | Luau 性能优秀，体积小 |
| 数据分析/爬虫 | Python     | 强大的数据处理能力 |

### 根据性能需求

| 需求           | 推荐引擎         | 说明               |
| -------------- | ---------------- | ------------------ |
| 极致性能       | Rhai             | Rust 原生，最快    |
| 平衡性能和易用 | JavaScript / Lua | 性能和开发效率兼顾 |
| 复杂数据处理   | Python           | 丰富的标准库       |

### 根据使用场景

| 场景           | 推荐引擎          | 说明         |
| -------------- | ----------------- | ------------ |
| 简单字符串处理 | Rhai              | 轻量快速     |
| 加密解密       | Rhai / JavaScript | 成熟的库支持 |
| JSON 处理      | JavaScript        | 原生支持     |
| 数据转换       | Python            | 表达力强     |

## 完整示例

### 场景1：多引擎混合使用

```toml
[meta]
name = "多引擎示例"
domain = "example.com"
media_type = "video"

[scripting]
engine = "rhai"  # 主引擎
source_dir = "./scripts"

[scripting.files]
crypto = "crypto.rhai"      # Rhai 处理加密
parser = "parser.js"         # JS 处理 JSON (如果需要可切换引擎)
formatter = "format.py"      # Python 格式化数据
```

### 场景2：JavaScript 数据处理

```toml
[scripting]
engine = "javascript"
source_dir = "./scripts"

[scripting.files]
parser = "parser.js"

[parse.detail.fields]
episodes = [
  { type = "selector", query = "script#__NEXT_DATA__", extract = "text" },
  { type = "script", call = "parser.extractEpisodes" }
]
```

**parser.js**:

```javascript
function extractEpisodes(input, args) {
    const data = JSON.parse(input);
    const episodes = data.props.pageProps.episodes;
    
    return episodes.map(ep => ({
        number: ep.number,
        title: ep.title,
        url: ep.url
    }));
}
```

### 场景3：Lua 视频分集解析

```toml
[scripting]
engine = "lua"
source_dir = "./scripts"

[scripting.files]
video = "video_parser.luau"

[parse.detail.fields]
episodes = [
  { type = "http_request", url_template = "https://{domain}/api/episodes" },
  { type = "script", call = "video.parseEpisodes" }
]
```

**video_parser.luau**:

```lua
function parseEpisodes(input, args)
    local data = json.decode(input)
    local result = {}
    
    for _, ep in ipairs(data.episodes) do
        table.insert(result, {
            number = ep.number,
            title = ep.title,
            url = ep.video_url,
            duration = tonumber(ep.duration)
        })
    end
    
    return result
end
```

### 场景4：Python 数据清洗

```toml
[scripting]
engine = "python"
source_dir = "./scripts"

[scripting.files]
cleaner = "data_cleaner.py"

[parse.detail.fields]
cleaned_text = [
  { type = "selector", query = "div.content", extract = "text" },
  { type = "script", call = "cleaner.clean_text" }
]
```

**data_cleaner.py**:

```python
import re

def clean_text(input, args):
    # 移除 HTML 标签
    text = re.sub(r'<[^>]+>', '', input)
    # 移除多余空格
    text = re.sub(r'\s+', ' ', text)
    # 去除首尾空格
    text = text.strip()
    return text
```

## 性能对比

| 引擎       | 启动时间 | 执行速度 | 内存占用 | 包体积 |
| ---------- | -------- | -------- | -------- | ------ |
| Rhai       | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐  |
| JavaScript | ⭐⭐⭐⭐     | ⭐⭐⭐⭐     | ⭐⭐⭐⭐     | ⭐⭐⭐⭐   |
| Lua        | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐     | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐  |
| Python     | ⭐⭐⭐      | ⭐⭐⭐      | ⭐⭐⭐      | ⭐⭐     |

**建议**：
- 移动端优先选择 Rhai 或 Lua（体积小，性能好）
- Desktop 可选择 JavaScript 或 Python（开发效率高）
- 性能敏感场景使用 Rhai

## 最佳实践

### 1. 选择合适的引擎

```toml
# 简单场景：使用 Rhai
[scripting]
engine = "rhai"

# 复杂 JSON 处理：使用 JavaScript
[scripting]
engine = "javascript"

# 数据科学：使用 Python
[scripting]
engine = "python"
```

### 2. 函数命名规范

所有引擎统一使用清晰的函数名：

```
// ✅ 好的命名
decrypt_video_url
parse_episode_list
extract_subtitle_url

// ❌ 不好的命名
process
handle
do_it
```

### 3. 保持函数简单

每个函数只做一件事：

```javascript
// ✅ 单一职责
function extractTitle(input, args) {
    return input.trim().replace(/\n/g, ' ');
}

// ❌ 做太多事情
function processEverything(input, args) {
    // 提取标题、验证 URL、解析日期...
}
```

### 4. 错误处理

所有引擎都应处理错误：

**Rhai**:
```rust
fn safe_parse(input, args) {
    try {
        return parse_json(input);
    } catch (e) {
        return #{};
    }
}
```

**JavaScript**:
```javascript
function safeParse(input, args) {
    try {
        return JSON.parse(input);
    } catch (e) {
        return {};
    }
}
```

**Lua**:
```lua
function safe_parse(input, args)
    local success, result = pcall(json.decode, input)
    if success then
        return result
    else
        return {}
    end
end
```

**Python**:
```python
def safe_parse(input, args):
    try:
        return json.loads(input)
    except:
        return {}
```

## 常见问题

### Q: 如何在不同引擎间迁移？

A: 遵循统一的函数接口，只需修改 `engine` 字段和文件扩展名。

### Q: 可以混合使用多个引擎吗？

A: 每个规则文件只能使用一个引擎。如需多引擎，考虑拆分规则文件。

### Q: 性能差异大吗？

A: Rhai > Lua > JavaScript > Python。简单操作差异不明显，复杂计算推荐 Rhai。

### Q: 引擎包体积多大？

A: Rhai (最小) < Lua < JavaScript < Python (最大)。移动端建议优先 Rhai/Lua。

## 下一步

- 查看 [HTTP 配置](./http-config.md) 了解 HTTP 设置
- 查看 [缓存配置](./cache-config.md) 了解缓存系统
- 查看 [处理管道](../pipeline/README.md) 了解所有步骤类型
- 返回 [通用规范](../common-spec.md)
