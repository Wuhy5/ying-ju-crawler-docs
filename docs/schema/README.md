# JSON Schema 规范

本目录包含媒体爬虫规范的 JSON Schema 定义，用于规则文件的结构验证和类型检查。

## 概述

JSON Schema 是规范的核心验证机制，定义了规则文件的完整结构和约束条件。我们使用 Rust 类型定义作为单一真实来源，通过 `schemars` 库自动生成 JSON Schema，确保类型安全和一致性。

## 文件结构

- **`schema.json`** - 自动生成的完整 JSON Schema 文件
- **`README.md`** - 本文档

## Schema 生成

Schema 通过 Rust 代码自动生成：

```bash
# 在 ying-ju-crawler-schema 目录中执行
cd ../ying-ju-crawler-schema
cargo run --bin generate_schema
```

此命令会：
1. 从 Rust 类型定义生成 JSON Schema
2. 添加版本信息和元数据
3. 输出到 `docs/schema/schema.json`

## 使用方式

### 编辑器集成

在 VS Code 中启用 JSON Schema 验证：

```json
{
  "yaml.schemas": {
    "./docs/schema/schema.json": ["*.toml", "*.rule.toml"]
  },
  "json.schemas": [
    {
      "fileMatch": ["*.rule.json"],
      "url": "./docs/schema/schema.json"
    }
  ]
}
```

### 命令行验证

使用 JSON Schema 验证工具：

```bash
# 安装验证工具
npm install -g ajv-cli

# 验证 TOML 文件（需要先转换为 JSON）
ajv validate -s schema.json -d rule.json
```

### 程序化验证

在 Rust 代码中使用：

```rust
use ying_ju_crawler_schema::RuleFile;
use std::fs;

// 加载和验证规则文件
let content = fs::read_to_string("rule.toml")?;
let rule: RuleFile = toml::from_str(&content)?;

// 规则文件会自动通过类型系统验证
println!("规则名称: {}", rule.meta.name);
println!("媒体类型: {:?}", rule.meta.media_type);
```

## 核心类型定义

### 规则文件结构

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "RuleFile",
  "type": "object",
  "properties": {
    "meta": { "$ref": "#/$defs/Meta" },
    "config": { "$ref": "#/$defs/Config" },
    "scripting": { "$ref": "#/$defs/ScriptingConfig" },
    "components": { "$ref": "#/$defs/Components" },
    "flows": { "$ref": "#/$defs/Flows" }
  },
  "required": ["meta"]
}
```

### 元数据 (Meta)

```json
{
  "Meta": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "description": { "type": "string" },
      "author": { "type": "string" },
      "version": { "type": "string" },
      "spec_version": { "type": "string" },
      "media_type": {
        "enum": ["video", "audio", "book", "manga"]
      },
      "domain": { "type": "string" },
      "language": { "type": "string" },
      "region": { "type": "string" },
      "tags": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "required": ["name", "author", "version", "spec_version", "media_type", "domain"]
  }
}
```

### 配置结构

#### HTTP 配置

```json
{
  "HttpConfig": {
    "type": "object",
    "properties": {
      "timeout": { "type": "integer", "minimum": 0 },
      "user_agent": { "type": "string" },
      "headers": {
        "type": "object",
        "additionalProperties": { "type": "string" }
      },
      "proxy": { "type": "string" },
      "retry_count": { "type": "integer", "minimum": 0 },
      "follow_redirects": { "type": "boolean" }
    }
  }
}
```

#### 缓存配置

```json
{
  "CacheConfig": {
    "type": "object",
    "properties": {
      "backend": { "enum": ["memory", "sqlite"] },
      "database_path": { "type": "string" },
      "strategies": {
        "type": "object",
        "additionalProperties": { "$ref": "#/$defs/CacheStrategy" }
      }
    }
  }
}
```

#### 脚本配置

```json
{
  "ScriptingConfig": {
    "type": "object",
    "properties": {
      "engine": {
        "type": "object",
        "properties": {
          "type": { "enum": ["rhai", "javascript", "python"] }
        }
      },
      "modules": {
        "type": "object",
        "additionalProperties": { "$ref": "#/$defs/ScriptModule" }
      }
    }
  }
}
```

### 流水线步骤

流水线步骤使用标签联合类型：

```json
{
  "Step": {
    "oneOf": [
      {
        "type": "object",
        "properties": {
          "type": { "const": "http_request" },
          "url": { "type": "string" },
          "method": { "enum": ["GET", "POST", "PUT", "DELETE"] },
          "headers": { "type": "object" },
          "output": { "type": "string" }
        },
        "required": ["type", "url", "output"]
      },
      {
        "type": "object",
        "properties": {
          "type": { "const": "parse_json" },
          "input": { "type": "string" },
          "output": { "type": "string" }
        },
        "required": ["type", "input", "output"]
      }
      // ... 更多步骤类型
    ]
  }
}
```

## 验证规则

### 自动验证

JSON Schema 提供以下验证：

- ✅ **必需字段检查**: 确保必须的字段都存在
- ✅ **类型验证**: 字段值类型必须正确
- ✅ **枚举约束**: 值必须是预定义选项之一
- ✅ **格式验证**: URL、版本号等格式检查
- ✅ **范围检查**: 数字的最小值、最大值限制

### 业务逻辑验证

除了 Schema 验证，还需要业务逻辑检查：

```rust
impl RuleFile {
    pub fn validate_business_logic(&self) -> Result<(), ValidationError> {
        // 检查至少有一个流程
        if self.flows.is_empty() {
            return Err(ValidationError::NoFlows);
        }

        // 检查脚本模块引用是否存在
        for flow in &self.flows {
            for step in &flow.actions {
                if let Step::Script { call, .. } = step {
                    if !self.scripting.modules.contains_key(call) {
                        return Err(ValidationError::MissingScriptModule(call.clone()));
                    }
                }
            }
        }

        Ok(())
    }
}
```

## 扩展 Schema

### 添加新步骤类型

1. **在 Rust 中定义新步骤**

```rust
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
#[serde(tag = "type")]
pub enum Step {
    // ... 现有步骤

    // 新步骤：XPath 查询
    XPath {
        query: String,
        #[serde(default)]
        extract: ExtractType,
    },
}
```

2. **重新生成 Schema**

```bash
cargo run --bin generate_schema
```

3. **更新文档**

在流水线文档中添加新步骤的使用说明。

### 添加新配置选项

1. **扩展配置结构体**

```rust
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct HttpConfig {
    // ... 现有字段

    #[serde(default)]
    pub connection_pool_size: Option<usize>,
}
```

2. **重新生成并测试**

### 添加新媒体类型

1. **扩展 MediaType 枚举**

```rust
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum MediaType {
    Video,
    Audio,
    Book,
    Manga,
    Podcast,  // 新类型
}
```

2. **更新相关文档**

## 测试和验证

### 单元测试

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_schema_validation() {
        let schema = generate_schema();
        let rule_json = json!({
            "meta": {
                "name": "Test Rule",
                "author": "Test",
                "version": "1.0.0",
                "spec_version": "1.0.0",
                "media_type": "video",
                "domain": "example.com"
            },
            "flows": {
                "search": {
                    "actions": [
                        {
                            "type": "http_request",
                            "url": "https://api.example.com/search",
                            "output": "response"
                        }
                    ]
                }
            }
        });

        // 使用 jsonschema 库验证
        assert!(schema.validate(&rule_json).is_ok());
    }
}
```

### 集成测试

```rust
#[test]
fn test_real_rule_files() {
    for entry in std::fs::read_dir("examples/").unwrap() {
        let path = entry.unwrap().path();
        if path.extension() == Some(std::ffi::OsStr::new("toml")) {
            let content = std::fs::read_to_string(&path).unwrap();
            let rule: RuleFile = toml::from_str(&content).unwrap();

            // 验证业务逻辑
            rule.validate_business_logic().unwrap();
        }
    }
}
```

## 版本管理

Schema 版本通过以下方式管理：

- **规范版本**: 通过 `spec_version` 字段声明
- **向后兼容**: 新版本必须兼容旧规则文件
- **版本检查**: 运行时验证规则文件与规范版本的兼容性

## 常见问题

### Schema 验证失败怎么办？

1. **检查必需字段**: 确保所有必需字段都存在
2. **验证类型**: 检查字段值类型是否正确
3. **查看枚举值**: 确保枚举字段使用预定义值
4. **检查格式**: URL 和版本号等格式是否正确

### 如何调试验证错误？

启用详细错误信息：

```rust
use jsonschema::{JSONSchema, ValidationError};

let schema = JSONSchema::compile(&schema_json).unwrap();
let result = schema.validate(&instance);

if let Err(errors) = result {
    for error in errors {
        eprintln!("验证错误: {}", error);
        eprintln!("实例路径: {}", error.instance_path);
        eprintln!("Schema 路径: {}", error.schema_path);
    }
}
```

### 性能考虑

- Schema 编译是开销较大的操作，应该缓存编译结果
- 大文件验证时注意内存使用
- 考虑使用流式验证处理超大文件

## 相关文档

- **[核心概念](../../core/concepts.md)** - 理解规范基础
- **[规则文件结构](../../core/rule-file.md)** - 文件组织方式
- **[流水线系统](../../spec/pipeline.md)** - 步骤类型详解
- **[字段映射](../../spec/field-mapping.md)** - 数据转换规范
- **[媒体类型](../../spec/media-types.md)** - 媒体数据模型
