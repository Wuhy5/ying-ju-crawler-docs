# selector - CSS 选择器

从 HTML 文档中提取元素。

## 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `type` | String | 是 | `"selector"` |
| `query` | String | 是 | CSS 选择器表达式 |
| `extract` | String | 是 | 提取方式 |
| `index` | Integer | 否 | 选择第 N 个匹配元素（从 0 开始），默认提取所有 |

## extract 选项

- `"text"`: 元素的文本内容
- `"html"`: 元素的内部 HTML
- `"outer_html"`: 元素的完整 HTML（包括标签本身）
- `"attr:<name>"`: 指定属性的值，如 `"attr:href"`, `"attr:data-id"`

## 示例

### 提取标题文本

```toml
title = [
  { type = "selector", query = "h1.title", extract = "text" }
]
```

### 提取链接地址

```toml
url = [
  { type = "selector", query = "a.link", extract = "attr:href" }
]
```

### 提取第一个图片的 src

```toml
cover = [
  { type = "selector", query = "img", extract = "attr:src", index = 0 }
]
```

### 提取自定义属性

```toml
video_id = [
  { type = "selector", query = "div.player", extract = "attr:data-id" }
]
```

### 提取多个元素

```toml
tags = [
  { type = "selector", query = "span.tag", extract = "text" }
  # 返回数组：["标签1", "标签2", "标签3"]
]
```

## CSS 选择器语法参考

| 选择器 | 描述 | 示例 |
|--------|------|------|
| `.class` | 类选择器 | `.title` |
| `#id` | ID 选择器 | `#header` |
| `element` | 元素选择器 | `div` |
| `[attr]` | 属性选择器 | `[data-id]` |
| `[attr=value]` | 属性值选择器 | `[type=text]` |
| `parent > child` | 直接子元素 | `div > p` |
| `ancestor descendant` | 后代元素 | `div p` |
| `element:first-child` | 第一个子元素 | `li:first-child` |
| `element:nth-child(n)` | 第 n 个子元素 | `li:nth-child(2)` |

## 注意事项

1. **性能**: 选择器应尽可能具体，避免过于宽泛的匹配
2. **稳定性**: 优先使用语义化的类名，避免依赖动态生成的类名
3. **兼容性**: 使用标准的 CSS3 选择器语法
4. **数组处理**: 不指定 `index` 时返回数组，可配合 loop 步骤处理
