# Schema 定义

本目录包含媒体爬虫规范的 Schema 定义，包括 Rust 类型定义和 JSON Schema。

## Rust Schema

Rust 类型定义在 `packages/schema/src/lib.rs` 中，使用 `serde` 和 `schemars` 进行序列化/反序列化和 Schema 生成。

### 使用方式

```rust
use crawler_schema::RuleFile;

// 从 TOML 文件加载
let content = std::fs::read_to_string("rule.toml")?;
let rule: RuleFile = toml::from_str(&content)?;

// 验证媒体类型
match rule.meta.media_type {
    MediaType::Video => { /* 处理影视 */ }
    MediaType::Audio => { /* 处理音频 */ }
    MediaType::Book => { /* 处理图书 */ }
    MediaType::Manga => { /* 处理漫画 */ }
}

// 遍历解析规则
for (field_name, pipeline) in &rule.parse.detail.fields {
    for step in pipeline {
        match step {
            Step::Selector { query, extract, .. } => { /* 处理选择器 */ }
            Step::Jsonpath { query } => { /* 处理 JSONPath */ }
            // ...
        }
    }
}
```

## JSON Schema

JSON Schema 使用 `schemars` 从 Rust 类型自动生成，确保类型定义和 Schema 的一致性。

位置：`crawler-doc/docs/schema/schema.json`

### 生成 Schema

```bash
# 重新生成 JSON Schema
cargo run --package crawler-schema --bin generate_schema
```

### 验证工具

可以使用任何支持 JSON Schema 的工具验证规则文件：

```bash
# 使用 ajv-cli
npm install -g ajv-cli
ajv validate -s schema.json -d rule.json
```

## 类型层次

```
RuleFile
├── Meta (元数据)
│   ├── spec_version (规范版本)
│   └── min_spec_version (最低兼容版本)
├── HttpConfig (HTTP 配置)
│   ├── cookies (Cookie 配置)
│   ├── auth (认证配置)
│   └── interceptor (请求拦截器)
├── ScriptingConfig (脚本配置)
│   └── engine (支持 rhai, javascript, lua, python)
├── CacheConfig (缓存配置)
│   ├── backend (缓存后端)
│   └── strategy (缓存策略)
├── Entry (入口)
│   ├── DiscoverEntry
│   ├── SearchEntry
│   ├── RecommendationEntry
│   └── RankingEntry
└── ParseRules (解析规则)
    ├── ListParse
    │   ├── item_selector: Step
    │   └── fields: HashMap<String, Pipeline>
    └── DetailParse
        └── fields: HashMap<String, Pipeline>

Pipeline = Vec<Step>

Step (枚举)
├── Selector (CSS 选择器)
├── Jsonpath (JSONPath 查询)
├── Regex (正则表达式)
├── Script (自定义脚本)
├── String (字符串操作)
├── HttpRequest (HTTP 请求)
├── Conditional (条件分支)
├── Loop (循环处理)
├── Transform (数据转换)
├── Validate (数据验证)
├── Cast (类型转换)
├── Crypto (加密/解密)
└── Constant (常量值)
```

## 扩展 Schema

当添加新的步骤类型或媒体类型时：

1. 在 `packages/schema/src/lib.rs` 的 Rust 中添加对应的枚举变体
2. 为新类型添加 `#[derive(JsonSchema)]` 宏
3. 运行 `cargo run --package crawler-schema --bin generate_schema` 自动生成 JSON Schema
4. 添加测试用例
5. 更新文档

### 添加新步骤类型示例

```rust
// 在 packages/schema/src/lib.rs 的 Step 枚举中添加
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum Step {
    // ... 现有类型
    
    // 新类型
    XmlPath {
        query: String,
    },
}
```

然后运行生成器：
```bash
cargo run --package crawler-schema --bin generate_schema
```

### 添加新媒体类型示例

```rust
// 在 MediaType 枚举中添加
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum MediaType {
    Video,
    Audio,
    Book,
    Manga,
    // 新媒体类型
    Podcast,
}
```

## 验证规则

Schema 提供以下自动验证（由 schemars 生成）：

1. **必需字段检查**: `meta`, `parse` 等必需字段
2. **类型检查**: 字段类型必须匹配定义
3. **枚举值检查**: `media_type`, `method`, 步骤类型等必须是预定义值
4. **结构约束**: 至少有一个入口定义
5. **管道步骤验证**: 每个步骤必须有正确的参数
6. **递归类型支持**: 通过 `$defs` 引用支持嵌套的管道结构

## 测试

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_video_rule() {
        let toml = r#"
        [meta]
        name = "Test"
        author = "Test"
        version = "1.0.0"
        spec_version = "1.0.0"
        domain = "example.com"
        media_type = "video"
        
        [search]
        entry_url_template = "https://{domain}/search?q={keyword}"
        
        [parse.list]
        item_selector = { type = "selector", query = "div.item", extract = "text" }
        
        [parse.list.fields]
        
        [parse.detail.fields]
        "#;
        
        let rule: RuleFile = toml::from_str(toml).unwrap();
        assert_eq!(rule.meta.media_type, MediaType::Video);
        assert_eq!(rule.meta.spec_version, "1.0.0");
    }
}
```

## 相关工具

### Schema 生成器

位置：`packages/schema/src/bin/generate_schema.rs`

使用 `schemars` 库自动从 Rust 类型生成 JSON Schema，避免手动维护导致的不一致。

## 下一步

- 查看 [示例](../examples/README.md) 了解如何使用 Schema
- 参考完整的 [JSON Schema](./schema.json)
