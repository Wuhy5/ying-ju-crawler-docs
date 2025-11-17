# jsonpath - JSONPath 查询

从 JSON 数据中提取字段。

## 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `type` | String | 是 | `"jsonpath"` |
| `query` | String | 是 | JSONPath 表达式 |

## JSONPath 语法

| 语法 | 描述 | 示例 |
|------|------|------|
| `$` | 根对象 | `$` |
| `.key` | 访问对象属性 | `$.data.title` |
| `[index]` | 访问数组元素 | `$.items[0]` |
| `[*]` | 所有数组元素 | `$.items[*]` |
| `..key` | 递归查找 | `$..author` |
| `[start:end]` | 数组切片 | `$.items[0:5]` |
| `[?(@.key)]` | 过滤表达式 | `$.items[?(@.price < 10)]` |

## 示例

### 提取单个字段

```toml
title = [
  { type = "jsonpath", query = "$.data.title" }
]
```

### 提取嵌套字段

```toml
author = [
  { type = "jsonpath", query = "$.data.info.author" }
]
```

### 提取数组

```toml
tags = [
  { type = "jsonpath", query = "$.data.tags[*]" }
]
```

### 提取数组的第一个元素

```toml
first_tag = [
  { type = "jsonpath", query = "$.data.tags[0]" }
]
```

### 递归查找

```toml
# 查找所有名为 "url" 的字段
all_urls = [
  { type = "jsonpath", query = "$..url" }
]
```

### 条件过滤

```toml
# 提取价格小于 10 的项目
cheap_items = [
  { type = "jsonpath", query = "$.items[?(@.price < 10)]" }
]

# 提取包含特定字段的项目
valid_items = [
  { type = "jsonpath", query = "$.items[?(@.url)]" }
]
```

## 实际应用示例

### API 响应处理

```toml
# API 返回格式：
# {
#   "code": 200,
#   "data": {
#     "video": {
#       "title": "示例视频",
#       "episodes": [
#         {"num": 1, "url": "..."},
#         {"num": 2, "url": "..."}
#       ]
#     }
#   }
# }

title = [
  { type = "jsonpath", query = "$.data.video.title" }
]

episode_urls = [
  { type = "jsonpath", query = "$.data.video.episodes[*].url" }
]
```

### 组合使用

```toml
# 从 HTML 中提取 JSON，再从 JSON 中提取数据
play_url = [
  { type = "selector", query = "script#__NEXT_DATA__", extract = "text" },
  { type = "jsonpath", query = "$.props.pageProps.videoUrl" }
]
```

## 注意事项

1. **路径准确性**: 确保 JSONPath 表达式与实际 JSON 结构匹配
2. **错误处理**: 路径不存在时通常返回 null，建议配合 conditional 步骤处理
3. **数组结果**: 使用 `[*]` 会返回数组，可能需要进一步处理
4. **性能**: 避免过度使用递归查找 `..`
