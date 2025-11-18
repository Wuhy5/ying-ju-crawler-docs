# 脚本配置

## 脚本系统的作用

当规范提供的声明式步骤无法满足复杂需求时，脚本系统提供了完全的编程灵活性：

### 适用场景

- **数据解密/解码**：处理加密或编码的数据
- **动态签名计算**：生成API请求签名
- **复杂数据转换**：多步骤的数据处理逻辑
- **条件判断**：基于数据内容做出不同处理
- **自定义解析**：处理非标准的数据格式

### 设计理念

脚本系统遵循"声明式为主，脚本为辅"的原则：
- 简单任务使用声明式步骤
- 复杂任务使用脚本处理
- 脚本代码内联在规则文件中
- 支持多种脚本引擎

## 脚本引擎选择

规范支持多种脚本引擎，每种有不同的特点：

### Rhai 引擎

```toml
[scripting]
engine = "rhai"
```

**特点：**
- 专门为嵌入式设计的脚本语言
- 语法类似Rust，学习成本低
- 性能优秀，内存占用小
- 内置安全沙箱

**适用场景：**
- 数据处理和转换
- 简单计算逻辑
- 字符串操作

### JavaScript 引擎

```toml
[scripting]
engine = "javascript"
```

**特点：**
- 使用标准JavaScript语法
- 生态丰富，有大量库可用
- 动态类型，灵活性高
- 相对较大的运行时开销

**适用场景：**
- 复杂的数据处理
- 需要使用现有JS库
- DOM操作和解析

### Python 引擎

```toml
[scripting]
engine = "python"
```

**特点：**
- Python生态系统丰富
- 科学计算和数据处理能力强
- 语法清晰，易于维护
- 较大的内存占用

**适用场景：**
- 科学计算和数据分析
- 使用Python数据处理库
- 复杂的算法实现

## 模块系统

### 模块定义

脚本代码组织在模块中，每个模块可以包含多个函数：

```toml
[scripting.modules.utils]
code = """
fn format_title(title: string) -> string {
    title.trim().to_uppercase()
}

fn calculate_hash(data: string) -> string {
    // 计算哈希值
    sha256(data)
}
"""

[scripting.modules.crypto]
code = """
fn decrypt_data(encrypted: string, key: string) -> string {
    // 解密逻辑
    aes_decrypt(encrypted, key)
}
"""
```

### 模块调用

在步骤中使用模块函数：

```toml
[flows.process_data]
description = "处理数据"

[flows.process_data.actions]
- type = "script"
  call = "utils.format_title"
  with = { title = "{{raw_title}}" }
  output = "formatted_title"

- type = "script"
  call = "crypto.decrypt_data"
  with = { encrypted = "{{data}}", key = "{{secret_key}}" }
  output = "decrypted_data"
```

## 脚本语法详解

### Rhai 语法基础

#### 变量和类型

```rust
// 变量声明
let name = "张三";
let age = 25;
let active = true;
let scores = [85, 92, 78];

// 对象
let user = #{
    name: "张三",
    age: 25,
    active: true
};
```

#### 函数定义

```rust
fn greet(name: string) -> string {
    "你好，" + name + "!"
}

fn calculate_average(scores: array) -> f64 {
    let sum = 0.0;
    for score in scores {
        sum += score;
    }
    sum / scores.len() as f64
}
```

#### 控制流

```rust
fn check_age(age: i64) -> string {
    if age < 18 {
        "未成年"
    } else if age < 65 {
        "成年人"
    } else {
        "老年人"
    }
}

fn process_items(items: array) -> array {
    let results = [];
    for item in items {
        if item.status == "active" {
            results.push(item);
        }
    }
    results
}
```

### 数据操作

#### 字符串处理

```rust
fn clean_text(text: string) -> string {
    text
        .trim()                    // 去除空白
        .replace("\n", " ")        // 替换换行
        .replace_regex(r"\s+", " ") // 合并空白
}

fn extract_number(text: string) -> i64 {
    let pattern = r"(\d+)";
    let matches = text.matches(pattern);
    if matches.len() > 0 {
        parse_int(matches[0])
    } else {
        0
    }
}
```

#### JSON 处理

```rust
fn parse_user_data(json_str: string) -> map {
    let data = json_parse(json_str);
    #{
        id: data.id,
        name: data.name,
        email: data.email
    }
}

fn build_api_request(params: map) -> string {
    json_stringify(#{
        action: "search",
        query: params.query,
        limit: params.limit || 10
    })
}
```

#### 时间处理

```rust
fn format_timestamp(timestamp: i64) -> string {
    let dt = datetime_from_timestamp(timestamp);
    dt.format("%Y-%m-%d %H:%M:%S")
}

fn is_recent(timestamp: i64) -> bool {
    let now = current_timestamp();
    let diff = now - timestamp;
    diff < 86400  // 24小时内
}
```

## 高级脚本功能

### 文件操作

```rust
fn read_config(filename: string) -> string {
    try {
        file_read(filename)
    } catch (error) {
        log("读取配置文件失败: " + error);
        ""
    }
}

fn save_cache(key: string, data: string) {
    let filename = "cache/" + key + ".json";
    file_write(filename, data);
}
```

### 网络请求

```rust
fn fetch_external_data(url: string) -> string {
    let response = http_get(url);
    if response.status == 200 {
        response.body
    } else {
        throw "请求失败: " + response.status
    }
}
```

### 加密解密

```rust
fn generate_signature(data: string, secret: string) -> string {
    hmac_sha256(data, secret)
}

fn encrypt_sensitive_data(data: string, key: string) -> string {
    aes_encrypt(data, key, "CBC")
}
```

## 脚本调试和测试

### 日志输出

```rust
fn debug_data(data: any) {
    log("调试信息: " + json_stringify(data));
}

fn trace_execution(step: string) {
    log("执行步骤: " + step + " at " + current_time());
}
```

### 错误处理

```rust
fn safe_parse_number(text: string) -> i64 {
    try {
        parse_int(text)
    } catch (error) {
        log("解析数字失败: " + error);
        0
    }
}

fn validate_input(data: map) -> bool {
    if !data.contains("name") {
        log("缺少必要字段: name");
        return false;
    }
    if data.name.len() == 0 {
        log("name不能为空");
        return false;
    }
    true
}
```

## 性能优化

### 缓存计算结果

```toml
[scripting.modules.cache]
code = """
fn get_cached_result(key: string, compute_fn: Fn() -> any) -> any {
    let cache_key = "script_cache_" + key;
    let cached = cache_get(cache_key);
    if cached != null {
        return cached;
    }
    let result = compute_fn();
    cache_set(cache_key, result, 3600); // 缓存1小时
    result
}
"""
```

### 批量处理

```rust
fn process_batch(items: array, processor: Fn(any) -> any) -> array {
    let results = [];
    let batch_size = 10;

    for i in range(0, items.len(), batch_size) {
        let batch = items.slice(i, i + batch_size);
        let batch_results = batch.map(processor);
        results.extend(batch_results);
    }

    results
}
```

## 安全考虑

### 输入验证

```rust
fn safe_eval_expression(expr: string) -> any {
    // 白名单验证表达式
    let allowed_chars = "0123456789+-*/() ";
    for char in expr.chars() {
        if !allowed_chars.contains(char) {
            throw "不安全的表达式";
        }
    }
    eval(expr)
}
```

### 资源限制

```toml
[scripting]
max_execution_time = 5000    # 最大执行时间（毫秒）
max_memory_usage = "50MB"    # 最大内存使用
max_call_depth = 100         # 最大调用深度
```

## 实际应用示例

### 数据解密

```toml
[scripting.modules.decrypt]
code = """
fn decrypt_video_url(encrypted_url: string) -> string {
    let key = "site_specific_key";
    let decrypted = aes_decrypt(encrypted_url, key);
    decrypted
}
"""

[flows.get_video]
description = "获取视频播放地址"

[flows.get_video.actions]
- type = "selector"
  input = "{{page_html}}"
  query = ".video-player"
  extract = "attr:data-encrypted-url"
  output = "encrypted_url"

- type = "script"
  call = "decrypt.decrypt_video_url"
  with = { encrypted_url = "{{encrypted_url}}" }
  output = "video_url"
```

### API 签名

```toml
[scripting.modules.api_auth]
code = """
fn generate_api_signature(params: map, secret: string) -> string {
    let sorted_keys = params.keys().sort();
    let query_string = "";
    for key in sorted_keys {
        if query_string.len() > 0 {
            query_string += "&";
        }
        query_string += key + "=" + params[key].to_string();
    }
    hmac_sha256(query_string, secret)
}
"""

[flows.api_request]
description = "调用API接口"

[flows.api_request.actions]
- type = "script"
  call = "api_auth.generate_api_signature"
  with = { params = "{{request_params}}", secret = "{{api_secret}}" }
  output = "signature"

- type = "http_request"
  url = "{{api_url}}"
  headers = { "X-Signature": "{{signature}}" }
  output = "response"
```

### 复杂数据转换

```toml
[scripting.modules.data_transform]
code = """
fn transform_search_results(raw_data: map) -> array {
    let results = [];
    for item in raw_data.items {
        results.push(#{
            id: item.id,
            title: item.title,
            url: item.url,
            cover: item.thumbnail,
            summary: item.description,
            tags: item.tags || [],
            meta: #{
                duration: item.duration,
                views: item.view_count,
                upload_date: item.upload_time
            }
        });
    }
    results
}
"""

[flows.search]
description = "搜索视频"

[flows.search.actions]
- type = "http_request"
  url = "/api/search?q={{keyword}}"
  output = "response"

- type = "json_path"
  input = "{{response.body}}"
  query = "$.data"
  output = "raw_data"

- type = "script"
  call = "data_transform.transform_search_results"
  with = { raw_data = "{{raw_data}}" }
  output = "results"
```

## 最佳实践

### 脚本编写原则
- 函数职责单一，逻辑清晰
- 添加适当的错误处理
- 使用有意义的变量名
- 添加注释说明复杂逻辑

### 性能考虑
- 避免在循环中进行复杂计算
- 合理使用缓存减少重复计算
- 批量处理数据提高效率

### 维护性
- 模块化组织代码
- 统一错误处理方式
- 编写可读性好的代码

### 安全原则
- 验证所有输入数据
- 限制脚本执行资源
- 避免执行外部命令
- 定期审查脚本代码