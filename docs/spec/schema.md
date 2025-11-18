# Schema 定义

## 什么是 JSON Schema

JSON Schema 是用来定义和验证 JSON 数据结构的规范。在媒体爬虫规范中，我们使用 JSON Schema 来：

1. **定义数据格式**：明确每个字段的类型、格式和约束条件
2. **验证规则文件**：确保用户编写的规则符合规范要求
3. **生成文档**：自动从 Schema 生成配置说明
4. **提供智能提示**：在编写规则时提供字段补全和错误检查

## Schema 文件结构

规范的 Schema 文件定义了规则文件的完整结构：

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "RuleFile",
  "type": "object",
  "required": ["meta", "components", "flows"],
  "properties": {
    "meta": { "$ref": "#/$defs/Meta" },
    "http": { "$ref": "#/$defs/HttpConfig" },
    "cache": { "$ref": "#/$defs/CacheConfig" },
    "scripting": { "$ref": "#/$defs/ScriptingConfig" },
    "components": { "type": "object" },
    "flows": { "type": "object" }
  }
}
```

## 核心数据类型

### 基本类型

- **string**：文本字符串
- **integer**：整数
- **boolean**：布尔值（true/false）
- **object**：对象类型
- **array**：数组类型

### 约束条件

Schema 可以定义各种约束：

```json
{
  "type": "string",
  "minLength": 1,
  "maxLength": 100,
  "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
}
```

这个定义要求字符串长度在1-100之间，且必须以字母或下划线开头。

## 字段定义详解

### 元数据 (Meta)

```json
"Meta": {
  "type": "object",
  "required": ["name", "author", "version", "spec_version", "domain", "media_type"],
  "properties": {
    "name": { "type": "string" },
    "author": { "type": "string" },
    "version": { "type": "string" },
    "spec_version": { "type": "string" },
    "domain": { "type": "string" },
    "media_type": {
      "enum": ["video", "audio", "book", "manga"]
    }
  }
}
```

### 网络配置 (HttpConfig)

```json
"HttpConfig": {
  "type": "object",
  "properties": {
    "user_agent": { "type": "string" },
    "timeout": { "type": "integer", "minimum": 0 },
    "proxy": { "type": "string" },
    "headers": {
      "type": "object",
      "patternProperties": {
        ".*": { "type": "string" }
      }
    }
  }
}
```

### 缓存配置 (CacheConfig)

```json
"CacheConfig": {
  "type": "object",
  "required": ["backend", "default_ttl"],
  "properties": {
    "backend": {
      "enum": ["memory", "sqlite"]
    },
    "default_ttl": {
      "type": "integer",
      "minimum": 0
    }
  }
}
```

## 步骤类型定义

### HTTP 请求步骤

```json
{
  "type": "object",
  "required": ["type", "url", "output"],
  "properties": {
    "type": { "const": "http_request" },
    "url": { "type": "string" },
    "method": {
      "enum": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"]
    },
    "body": { "type": "string" },
    "headers": {
      "type": "object",
      "patternProperties": { ".*": { "type": "string" } }
    },
    "output": { "type": "string", "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$" }
  }
}
```

### 选择器步骤

```json
{
  "type": "object",
  "required": ["type", "input", "query", "extract", "output"],
  "properties": {
    "type": { "const": "selector" },
    "input": { "type": "string" },
    "query": { "type": "string" },
    "extract": {
      "enum": ["text", "html", "outer_html", "attr:href", "attr:src"]
    },
    "output": { "type": "string", "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$" }
  }
}
```

## 模板字符串

规范支持在字符串中使用 `{{variable}}` 语法进行变量替换：

```json
{
  "url": "/search?q={{keyword}}&page={{page}}"
}
```

Schema 中使用 `pattern` 来验证模板字符串的格式。

## 自定义验证规则

### 标识符验证

变量名、组件名等必须符合标识符规则：

```json
{
  "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
}
```

### URL 模板验证

URL 字符串可以包含模板变量：

```json
{
  "type": "string",
  "description": "支持 {{variable}} 模板语法"
}
```

## 使用 Schema 的好处

### 开发时验证

在编写规则时，Schema 可以：
- 检查必填字段是否完整
- 验证字段类型是否正确
- 提示可选字段和默认值
- 发现拼写错误和格式问题

### 运行时验证

程序加载规则时会验证：
- 所有必需字段都已提供
- 字段值符合类型要求
- 引用关系正确（组件存在、变量已定义）

### 文档生成

Schema 可以自动生成：
- 配置字段说明
- 类型定义和约束
- 示例配置
- 错误信息提示

## 扩展 Schema

当需要添加新的步骤类型或配置选项时，需要相应更新 Schema：

1. 在 `$defs` 中定义新的类型
2. 在相应位置引用新类型
3. 更新版本号和文档

这种设计确保了规范的一致性和扩展性。