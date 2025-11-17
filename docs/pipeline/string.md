# string - 字符串操作

对字符串进行各种转换操作。

## 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `type` | String | 是 | `"string"` |
| `operation` | String | 是 | 操作类型 |

## 操作类型

### format - 格式化

使用模板格式化字符串。

```toml
{ type = "string", operation = "format", template = "https://{domain}/{input}" }
```

**占位符**:
- `{input}`: 上一步的输出
- `{domain}`: 元数据中的域名
- 自定义占位符（通过 `vars` 参数）

**示例**:
```toml
full_url = [
  { type = "selector", query = "a", extract = "attr:href" },
  { type = "string", operation = "format", template = "https://{domain}{input}" }
]
```

### replace - 替换

替换子字符串。

```toml
{ type = "string", operation = "replace", from = "http://", to = "https://" }
```

**示例**:
```toml
secure_url = [
  { type = "selector", query = "a", extract = "attr:href" },
  { type = "string", operation = "replace", from = "http://", to = "https://" }
]
```

### append - 追加

在末尾追加字符串。

```toml
{ type = "string", operation = "append", suffix = ".mp4" }
```

**示例**:
```toml
video_file = [
  { type = "jsonpath", query = "$.filename" },
  { type = "string", operation = "append", suffix = ".mp4" }
]
```

### prepend - 前置

在开头添加字符串。

```toml
{ type = "string", operation = "prepend", prefix = "https://" }
```

**示例**:
```toml
full_url = [
  { type = "selector", query = "a", extract = "attr:href" },
  { type = "string", operation = "prepend", prefix = "https://example.com" }
]
```

### trim - 修剪

去除首尾空白字符。

```toml
{ type = "string", operation = "trim" }
```

**示例**:
```toml
clean_title = [
  { type = "selector", query = "h1", extract = "text" },
  { type = "string", operation = "trim" }
]
```

### split - 分割

将字符串分割为数组。

```toml
{ type = "string", operation = "split", delimiter = "," }
```

**示例**:
```toml
tags = [
  { type = "selector", query = "meta[name='keywords']", extract = "attr:content" },
  { type = "string", operation = "split", delimiter = "," }
]
# 输入: "标签1,标签2,标签3"
# 输出: ["标签1", "标签2", "标签3"]
```

### join - 连接

将数组连接为字符串。

```toml
{ type = "string", operation = "join", delimiter = ", " }
```

**示例**:
```toml
tags_str = [
  { type = "jsonpath", query = "$.tags[*]" },
  { type = "string", operation = "join", delimiter = ", " }
]
# 输入: ["标签1", "标签2", "标签3"]
# 输出: "标签1, 标签2, 标签3"
```

### lowercase - 转小写

```toml
{ type = "string", operation = "lowercase" }
```

**示例**:
```toml
normalized_tag = [
  { type = "selector", query = "span.tag", extract = "text" },
  { type = "string", operation = "lowercase" }
]
```

### uppercase - 转大写

```toml
{ type = "string", operation = "uppercase" }
```

## 组合示例

### URL 构建

```toml
api_url = [
  { type = "selector", query = "div.item", extract = "attr:data-id" },
  { type = "string", operation = "format", template = "https://{domain}/api/detail/{input}" }
]
```

### 文本清理

```toml
clean_description = [
  { type = "selector", query = "p.desc", extract = "text" },
  { type = "string", operation = "trim" },
  { type = "string", operation = "replace", from = "\\n", to = " " },
  { type = "string", operation = "replace", from = "  ", to = " " }
]
```

### 标签处理

```toml
tags = [
  { type = "selector", query = "meta[name='keywords']", extract = "attr:content" },
  { type = "string", operation = "split", delimiter = "," },
  {
    type = "loop",
    operation = "for_each",
    pipeline = [
      { type = "string", operation = "trim" },
      { type = "string", operation = "lowercase" }
    ]
  }
]
```

## 注意事项

1. **链式调用**: 可以连续使用多个 string 操作
2. **类型要求**: 输入必须是字符串或数组（join 操作）
3. **模板变量**: format 操作支持的变量取决于上下文
4. **性能**: 大量字符串操作可能影响性能，考虑使用脚本优化
