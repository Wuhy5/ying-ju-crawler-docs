# JSON Schema

本目录包含爬虫规则的 JSON Schema 定义文件。

## 文件说明

| 文件 | 说明 |
|------|------|
| `schema.json` | 完整的 JSON Schema 定义 |

## Schema 版本

当前版本：**1.0.0**

## 使用 Schema

### VS Code 配置

在 VS Code 中为 JSON 规则文件启用 Schema 验证：

1. 打开设置 (Ctrl+,)
2. 搜索 "json.schemas"
3. 添加配置：

```json
{
  "json.schemas": [
    {
      "fileMatch": ["*.rule.json", "rule.json"],
      "url": "./schema.json"
    }
  ]
}
```

### 在规则文件中引用

```json
{
  "$schema": "./schema.json",
  "meta": {
    "name": "示例规则",
    "version": "1.0.0"
  }
}
```

## Schema 结构概览

```
CrawlerRule
├── meta (必需)
│   ├── name
│   ├── author
│   ├── version
│   ├── spec_version
│   ├── domain
│   ├── media_type
│   └── description
├── search (必需)
│   ├── url
│   ├── fields (ItemFields)
│   └── pagination
├── detail (必需)
│   ├── url
│   └── fields (DetailFields)
├── discovery (可选)
│   ├── url
│   ├── fields
│   ├── categories
│   ├── filters
│   └── pagination
├── content (可选)
│   ├── url
│   └── fields (ContentFields)
├── login (可选)
│   ├── type
│   ├── webview
│   ├── form
│   └── credential
├── http (可选)
│   ├── timeout
│   ├── headers
│   ├── user_agent
│   └── ...
└── scripting (可选)
    ├── engine
    └── modules
```

## 主要类型定义

### FieldRule

字段提取规则：

```json
{
  "steps": [
    { "css": ".title" },
    { "filter": "trim" }
  ],
  "fallback": [
    [{ "css": ".name" }]
  ],
  "default": [{ "const": "未知" }],
  "nullable": true
}
```

### ExtractStep

提取步骤类型：

| 类型 | 说明 |
|------|------|
| `css` | CSS 选择器 |
| `xpath` | XPath 表达式 |
| `json` | JSONPath 表达式 |
| `regex` | 正则表达式 |
| `attr` | 获取属性 |
| `filter` | 文本过滤 |
| `index` | 索引选择 |
| `const` | 常量值 |
| `var` | 变量引用 |
| `script` | 脚本调用 |

### MediaType

支持的媒体类型：

- `video` - 视频
- `audio` - 音频
- `book` - 书籍
- `manga` - 漫画

## 验证规则文件

### 使用 VS Code

安装 JSON Schema 扩展后，VS Code 会自动验证并提示错误。

### 使用命令行

```bash
# 使用 ajv-cli
npm install -g ajv-cli
ajv validate -s schema.json -d rule.json

# 使用 jsonschema (Python)
pip install jsonschema
jsonschema -i rule.json schema.json
```

## 相关文档

- 📖 [快速开始](../guide/getting-started.md)
- 📖 [核心概念](../guide/concepts.md)
- 📖 [媒体类型参考](../reference/media-types.md)
