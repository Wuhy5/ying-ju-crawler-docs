# Schema 定义

本目录包含媒体爬虫规范的 Schema 定义，包括 Rust 类型定义和自动生成的 JSON Schema。

## 概述

Schema 是规范的核心，定义了规则文件的结构和约束。我们使用 Rust 作为单一真实来源（Single Source of Truth），通过 `schemars` 库自动生成 JSON Schema，确保类型安全和一致性。

## Rust Schema

类型定义位于 [`ying-ju-crawler-schema/src/lib.rs`](https://github.com/Wuhy5/ying-ju-crawler-schema)，使用：
- `serde`: 序列化/反序列化
- `schemars`: JSON Schema 生成

### 基本使用

```rust
use crawler_schema::{RuleFile, MediaType};
use std::fs;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 从 TOML 文件加载规则
    let content = fs::read_to_string("rule.toml")?;
    let rule: RuleFile = toml::from_str(&content)?;
    
    // 访问元数据
    println!("规则名称: {}", rule.meta.name);
    println!("媒体类型: {:?}", rule.meta.media_type);
    
    // 检查可用入口
    if let Some(search) = rule.search {
        println!("支持搜索: {}", search.entry_url_template);
    }
    
    Ok(())
}
```

## JSON Schema

自动生成的 JSON Schema 位于 [`schema.json`](./schema.json)，可用于：
- IDE 智能提示和验证
- CI/CD 管道中的自动验证
- 文档生成工具

### 生成 JSON Schema

```bash
# 在项目根目录执行
cd ying-ju-crawler-schema
cargo run --bin generate_schema
```

此命令会：
1. 从 Rust 类型定义生成 JSON Schema
2. 添加版本信息到 `$comment` 字段
3. 输出到 `../ying-ju-crawler-docs/docs/schema/schema.json`

### 使用 JSON Schema 验证

编辑器配置示例（VS Code）：

```json
{
  "yaml.schemas": {
    "./docs/schema/schema.json": "*.rule.toml"
  }
}
```

命令行验证（需要先将 TOML 转换为 JSON）：

```bash
# 使用 ajv-cli
npm install -g ajv-cli
ajv validate -s schema.json -d rule.json
```

## 类型层次

### 顶层结构

```rust
RuleFile {
    meta: Meta,                    // 必需：元数据
    http: Option<HttpConfig>,      // 可选：HTTP 配置
    scripting: Option<ScriptingConfig>,  // 可选：脚本配置
    cache: Option<CacheConfig>,    // 可选：缓存配置
    discover: Option<DiscoverEntry>,     // 可选：发现入口
    search: Option<SearchEntry>,   // 可选：搜索入口
    recommendation: Option<RecommendationEntry>,  // 可选：推荐入口
    ranking: Option<RankingEntry>, // 可选：排行榜入口
    parse: ParseRules,             // 必需：解析规则
}
```

### 元数据 (Meta)

```rust
Meta {
    name: String,                  // 规则名称
    author: String,                // 作者
    version: String,               // 规则版本
    spec_version: String,          // 规范版本
    domain: String,                // 目标域名
    media_type: MediaType,         // 媒体类型: video, audio, book, manga
    description: Option<String>,   // 描述
    min_spec_version: Option<String>,  // 最低兼容规范版本
    encoding: Option<String>,      // 页面编码
    icon_url: Option<String>,      // 图标 URL
    homepage: Option<String>,      // 主页 URL
    language: Option<String>,      // 语言
    region: Option<String>,        // 地区
    tags: Option<Vec<String>>,     // 标签
}
```

### 入口类型

所有入口类型都包含以下字段：

```rust
{
    entry_url_template: String,    // URL 模板
    method: Option<HttpMethod>,    // HTTP 方法，默认 GET
    response_type: Option<ResponseType>,  // 响应类型，默认 html
}
```

特定入口的额外字段：

- **DiscoverEntry**: `categories: Option<Vec<Category>>` - 分类列表
- **RankingEntry**: 
  - `types: Option<Vec<RankingType>>` - 排行榜类型
  - `periods: Option<Vec<RankingPeriod>>` - 时间周期

### 解析规则 (ParseRules)

```rust
ParseRules {
    list: ListParse {
        item_selector: Step,       // 列表项选择器
        fields: Option<Map<String, Value>>,  // 字段提取管道
    },
    detail: DetailParse {
        fields: Option<Map<String, Value>>,  // 字段提取管道
    },
}
```

### 管道步骤 (Step)

Step 是一个带标签的枚举，每个变体代表一种数据处理操作：

#### 数据提取步骤

- **Selector**: CSS 选择器提取
  ```rust
  { type = "selector", query = "div.title", extract = "text" }
  ```

- **Jsonpath**: JSONPath 查询
  ```rust
  { type = "jsonpath", query = "$.data[*].title" }
  ```

- **Regex**: 正则表达式匹配
  ```rust
  { type = "regex", query = "id=(\\d+)", group = 1 }
  ```

#### 数据转换步骤

- **String**: 字符串操作 (prepend, append, replace, split, trim, template)
  ```rust
  { type = "string", operation = "prepend", prefix = "https://" }
  ```

- **Transform**: 数组转换 (map, filter, flatten, first, last, unique)
  ```rust
  { type = "transform", operation = "first" }
  ```

- **Cast**: 类型转换
  ```rust
  { type = "cast", to = "int" }
  ```

#### 流程控制步骤

- **Conditional**: 条件分支
  ```rust
  {
    type = "conditional",
    condition = "len(input) > 0",
    if_true = [{ type = "constant", value = "有效" }],
    if_false = [{ type = "constant", value = "无效" }]
  }
  ```

- **Loop**: 循环处理 (foreach, while, map)
  ```rust
  {
    type = "loop",
    operation = "foreach",
    pipeline = [{ type = "selector", query = "a", extract = "attr:href" }]
  }
  ```

#### 高级步骤

- **HttpRequest**: 发起新的 HTTP 请求
- **Script**: 调用自定义脚本
- **Crypto**: 加密/解密操作
- **Validate**: 数据验证
- **CacheKey/CacheRetrieve/CacheClear**: 缓存操作
- **WebView**: 使用浏览器引擎渲染
- **Constant**: 返回常量值

完整的步骤类型和参数请参考 [管道文档](../pipeline/README.md)。

## 扩展 Schema

### 添加新的步骤类型

当需要添加新的管道步骤时：

1. **在 Rust 中定义新变体**

编辑 `ying-ju-crawler-schema/src/lib.rs`：

```rust
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum Step {
    // ... 现有步骤
    
    // 新步骤: XPath 查询
    Xpath {
        query: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        index: Option<usize>,
    },
}
```

2. **重新生成 JSON Schema**

```bash
cd ying-ju-crawler-schema
cargo run --bin generate_schema
```

3. **添加文档**

在相应的管道文档中添加使用说明。

4. **添加测试用例**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_xpath_step() {
        let json = r#"{"type": "xpath", "query": "//div[@class='title']"}"#;
        let step: Step = serde_json::from_str(json).unwrap();
        match step {
            Step::Xpath { query, .. } => {
                assert_eq!(query, "//div[@class='title']");
            }
            _ => panic!("Expected Xpath step"),
        }
    }
}
```

### 添加新的媒体类型

1. **扩展 MediaType 枚举**

```rust
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum MediaType {
    Video,
    Audio,
    Book,
    Manga,
    Podcast,  // 新媒体类型
}
```

2. **定义媒体特定字段**

在相应的媒体类型文档中定义该类型特有的字段约定。

3. **重新生成 Schema 并更新文档**

### 添加新的枚举值

对于现有枚举类型（如 `ExtractType`、`StringOperation` 等），添加新值的过程类似：

```rust
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ExtractType {
    Text,
    Html,
    // ... 现有值
    
    #[serde(rename = "attr:data-lazy")]
    AttrDataLazy,  // 新的提取类型
}
```

## Schema 验证

### 自动验证

JSON Schema 提供以下自动验证：

- ✅ **必需字段**: `meta` 和 `parse` 必须存在
- ✅ **类型检查**: 字段值类型必须正确（字符串、数字、布尔等）
- ✅ **枚举约束**: 枚举值必须是预定义的选项之一
- ✅ **步骤结构**: 每个步骤必须有正确的 `type` 和对应参数
- ✅ **递归结构**: 支持嵌套的管道（如 `conditional.if_true`）

### 手动验证

除了 Schema 验证，还应该进行业务逻辑验证：

```rust
impl RuleFile {
    pub fn validate(&self) -> Result<(), ValidationError> {
        // 检查至少有一个入口
        if self.discover.is_none() 
            && self.search.is_none() 
            && self.recommendation.is_none() 
            && self.ranking.is_none() {
            return Err(ValidationError::NoEntry);
        }
        
        // 检查 URL 模板格式
        // 检查脚本引用是否存在
        // ...
        
        Ok(())
    }
}
```

## 测试工具

### 验证规则文件

```bash
# 使用 Rust 验证
cd ying-ju-crawler-schema
cargo test

# 解析示例文件
cargo run --example parse_rule -- path/to/rule.toml
```

### 生成测试用例

```rust
use crawler_schema::*;

#[test]
fn test_minimal_rule() {
    let toml = r#"
[meta]
name = "Test Rule"
author = "Test"
version = "1.0.0"
spec_version = "1.0.0"
domain = "example.com"
media_type = "video"

[search]
entry_url_template = "https://{domain}/search?q={keyword}"

[parse.list]
item_selector = { type = "selector", query = ".item", extract = "text" }

[parse.detail]
"#;

    let rule: RuleFile = toml::from_str(toml).unwrap();
    assert_eq!(rule.meta.name, "Test Rule");
    assert_eq!(rule.meta.media_type, MediaType::Video);
    assert!(rule.search.is_some());
}
```

## 相关资源

### 源代码

- **Schema 定义**: [`ying-ju-crawler-schema/src/lib.rs`](https://github.com/Wuhy5/ying-ju-crawler-schema/blob/master/src/lib.rs)
- **Schema 生成器**: [`ying-ju-crawler-schema/src/bin/generate_schema.rs`](https://github.com/Wuhy5/ying-ju-crawler-schema/blob/master/src/bin/generate_schema.rs)

### 相关文档

- [核心概念](../core-concepts.md) - 理解规范的设计思想
- [通用规范](../common-spec.md) - 所有媒体类型共享的配置
- [管道系统](../pipeline/README.md) - 深入了解数据处理管道
- [示例](../examples/README.md) - 完整的规则文件示例

### 外部工具

- [serde](https://serde.rs/) - Rust 序列化框架
- [schemars](https://graham.cool/schemars/) - JSON Schema 生成
- [TOML](https://toml.io/) - 配置文件格式
- [JSON Schema](https://json-schema.org/) - Schema 规范

## 常见问题

### 如何查看完整的类型定义？

查看 [`ying-ju-crawler-schema/src/lib.rs`](https://github.com/Wuhy5/ying-ju-crawler-schema/blob/master/src/lib.rs) 源代码，它包含了所有类型、字段和注释。

### 为什么不直接手写 JSON Schema？

使用 Rust 作为单一真实来源有以下优势：
- 类型安全，编译时检查
- 避免手动维护导致的不一致
- 可以直接用于 Rust 实现的爬虫引擎
- 自动生成文档和验证工具

### 如何贡献新的步骤类型？

1. Fork 仓库
2. 在 `Step` 枚举中添加新变体
3. 添加测试用例
4. 重新生成 JSON Schema
5. 更新文档
6. 提交 Pull Request

### Schema 版本如何管理？

Schema 版本通过 `Cargo.toml` 中的版本号管理，生成的 JSON Schema 会在 `$comment` 字段中包含版本信息。规则文件通过 `spec_version` 字段声明使用的规范版本。

## 下一步

- 📖 阅读 [通用规范](../common-spec.md) 了解完整的配置选项
- 🔧 查看 [管道系统](../pipeline/README.md) 学习数据处理
- 💡 参考 [示例](../examples/README.md) 快速上手
- 🎬 查看 [影视规范](../media-types/video.md) 了解媒体特定字段
