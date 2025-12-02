# 字段提取

字段提取是爬虫规则的核心。本文详细介绍如何从网页中提取所需数据。

## 提取流程

每个字段通过一系列**步骤（steps）** 依次处理数据：

```
原始内容 → 步骤1 → 步骤2 → 步骤3 → ... → 最终值
```

### 基本语法

```toml
# 单步骤
title.steps = [{ css = ".title" }]

# 多步骤
cover.steps = [
    { css = "img.poster" },    # 1. 选择图片元素
    { attr = "src" },          # 2. 获取 src 属性
    { filter = "absolute_url" } # 3. 转为绝对 URL
]
```

## CSS 选择器

最常用的选择方式，支持标准 CSS 选择器语法。

### 基本用法

```toml
# 简单选择器
title.steps = [{ css = ".title" }]

# 复合选择器
title.steps = [{ css = "div.content > h1.title" }]

# ID 选择器
player.steps = [{ css = "#video-player" }]
```

### 选择多个元素

```toml
# 选择所有匹配元素
items.steps = [
    { css = { selector = ".video-item", all = true } }
]
```

### 常用选择器

| 选择器 | 说明 | 示例 |
|--------|------|------|
| `.class` | 类选择器 | `.title` |
| `#id` | ID 选择器 | `#player` |
| `element` | 元素选择器 | `h1` |
| `parent > child` | 直接子元素 | `div > p` |
| `ancestor descendant` | 后代元素 | `div p` |
| `[attr]` | 属性存在 | `[data-id]` |
| `[attr=value]` | 属性值 | `[type="video"]` |
| `:first-child` | 第一个子元素 | `li:first-child` |
| `:last-child` | 最后一个子元素 | `li:last-child` |
| `:nth-child(n)` | 第n个子元素 | `li:nth-child(2)` |

## XPath 表达式

适用于复杂的 HTML/XML 结构。

```toml
# 基本 XPath
title.steps = [{ xpath = "//h1[@class='title']" }]

# 选择多个
items.steps = [
    { xpath = { selector = "//div[@class='item']", all = true } }
]

# 获取文本
text.steps = [{ xpath = "//p/text()" }]

# 获取属性
href.steps = [{ xpath = "//a/@href" }]
```

### 常用 XPath 语法

| 表达式 | 说明 |
|--------|------|
| `//element` | 选择所有该元素 |
| `/parent/child` | 直接子元素 |
| `//element[@attr]` | 有某属性的元素 |
| `//element[@attr='value']` | 属性值匹配 |
| `//element/text()` | 获取文本内容 |
| `//element/@attr` | 获取属性值 |
| `//element[position()=1]` | 第一个元素 |
| `//element[contains(@class,'name')]` | 类名包含 |

## JSONPath 表达式

用于解析 JSON 格式的响应数据。

```toml
# 基本路径
title.steps = [{ json = "$.data.title" }]

# 数组索引
first.steps = [{ json = "$.items[0]" }]

# 选择所有
items.steps = [
    { json = { selector = "$.data.list[*]", all = true } }
]

# 嵌套路径
url.steps = [{ json = "$.data.video.playUrl" }]
```

### 常用 JSONPath 语法

| 表达式 | 说明 |
|--------|------|
| `$` | 根节点 |
| `$.field` | 字段访问 |
| `$.array[0]` | 数组索引 |
| `$.array[*]` | 所有数组元素 |
| `$.array[-1]` | 最后一个元素 |
| `$..field` | 递归搜索字段 |
| `$.array[?(@.active)]` | 条件过滤 |

## 正则表达式

从文本中提取特定模式的内容。

```toml
# 简单正则（默认取第1个捕获组）
id.steps = [{ regex = "id=(\\d+)" }]

# 带配置的正则
id.steps = [
    { regex = { pattern = "id=(\\d+)", group = 1 } }
]

# 全局匹配
ids.steps = [
    { regex = { pattern = "(\\d+)", global = true } }
]
```

### 正则配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `pattern` | 字符串 | - | 正则表达式（必需） |
| `group` | 整数 | 1 | 捕获组索引 |
| `global` | 布尔 | false | 是否全局匹配 |

## 属性提取

获取 HTML 元素的属性值。

```toml
# 获取 href
url.steps = [
    { css = "a" },
    { attr = "href" }
]

# 获取 src
image.steps = [
    { css = "img" },
    { attr = "src" }
]

# 获取 data-* 属性
id.steps = [
    { css = ".video" },
    { attr = "data-id" }
]

# 常用属性
# href, src, data-*, class, id, title, alt
```

## 索引与切片

从数组中获取特定元素。

```toml
# 获取第一个元素（索引从0开始）
first.steps = [
    { css = { selector = ".item", all = true } },
    { index = 0 }
]

# 获取最后一个元素
last.steps = [
    { css = { selector = ".item", all = true } },
    { index = -1 }
]

# 切片：获取第2到第5个元素
some.steps = [
    { css = { selector = ".item", all = true } },
    { index = "1:5" }
]

# 切片：每隔2个取一个
alternate.steps = [
    { css = { selector = ".item", all = true } },
    { index = "::2" }
]
```

### 切片语法

| 语法 | 说明 |
|------|------|
| `n` | 第 n 个元素 |
| `-n` | 倒数第 n 个元素 |
| `start:end` | 从 start 到 end-1 |
| `start:` | 从 start 到末尾 |
| `:end` | 从开头到 end-1 |
| `::step` | 每隔 step 个元素 |
| `start:end:step` | 完整切片 |

## 过滤器

对提取的数据进行转换处理。

```toml
# 单个过滤器
title.steps = [
    { css = ".title" },
    { filter = "trim" }
]

# 管道链式调用
title.steps = [
    { css = ".title" },
    { filter = "trim | lower | replace(' ', '-')" }
]

# 结构化过滤器（复杂参数）
title.steps = [
    { css = ".title" },
    { filter = [
        { name = "trim" },
        { name = "replace", args = ["旧值", "新值"] }
    ]}
]
```

### 常用过滤器

| 过滤器 | 说明 | 示例 |
|--------|------|------|
| `trim` | 去除首尾空白 | `trim` |
| `lower` | 转小写 | `lower` |
| `upper` | 转大写 | `upper` |
| `replace(a, b)` | 替换文本 | `replace('old', 'new')` |
| `regex_replace(p, r)` | 正则替换 | `regex_replace('\\s+', ' ')` |
| `absolute_url` | 转绝对URL | `absolute_url` |
| `urlencode` | URL编码 | `urlencode` |
| `urldecode` | URL解码 | `urldecode` |
| `html_decode` | HTML解码 | `html_decode` |
| `strip_html` | 去除HTML标签 | `strip_html` |
| `split(sep)` | 分割字符串 | `split(',')` |
| `join(sep)` | 合并数组 | `join(',')` |
| `default(val)` | 默认值 | `default('未知')` |

## 常量与变量

### 常量值

```toml
# 直接设置固定值
media_type.steps = [{ const = "video" }]
source.steps = [{ const = "example.com" }]
```

### 上下文变量

```toml
# 引用上下文中的变量
base.steps = [{ var = "base_url" }]
```

## 回退与默认值

处理提取失败的情况。

```toml
[search.fields]
# 主提取规则
author.steps = [{ css = ".author" }]

# 回退规则：主规则失败时依次尝试
author.fallback = [
    [{ css = ".writer" }],
    [{ css = ".creator" }],
    [{ css = ".publisher" }]
]

# 默认值：所有规则都失败时使用
author.default = "佚名"

# 允许空值
description.steps = [{ css = ".desc" }]
description.nullable = true
```

## 脚本调用

处理复杂的提取逻辑。

```toml
# 先定义脚本模块
[scripting]
engine = "rhai"

[scripting.modules.utils]
code = '''
fn decrypt(data) {
    // 解密逻辑
    base64_decode(data)
}
'''

# 在步骤中调用
[search.fields]
play_url.steps = [
    { css = "#player" },
    { attr = "data-url" },
    { script = "utils.decrypt" }
]

# 带参数调用
play_url.steps = [
    { css = "#player" },
    { attr = "data-url" },
    { script = { name = "utils.decrypt", params = { key = "secret" } } }
]
```

## 实战示例

### 示例1：提取视频列表

```html
<div class="video-list">
    <div class="video-item">
        <a href="/video/123">
            <img src="/cover/123.jpg" alt="电影A">
            <span class="title">电影A</span>
            <span class="score">9.5</span>
        </a>
    </div>
    <div class="video-item">
        <a href="/video/456">
            <img src="/cover/456.jpg" alt="电影B">
            <span class="title">电影B</span>
            <span class="score">8.8</span>
        </a>
    </div>
</div>
```

```toml
[search.fields]
title.steps = [
    { css = { selector = ".video-item", all = true } },
    { css = ".title" },
    { filter = "trim" }
]

url.steps = [
    { css = { selector = ".video-item", all = true } },
    { css = "a" },
    { attr = "href" },
    { filter = "absolute_url" }
]

cover.steps = [
    { css = { selector = ".video-item", all = true } },
    { css = "img" },
    { attr = "src" },
    { filter = "absolute_url" }
]

score.steps = [
    { css = { selector = ".video-item", all = true } },
    { css = ".score" },
    { filter = "trim" }
]
```

### 示例2：从 JSON API 提取

```json
{
    "code": 0,
    "data": {
        "list": [
            { "id": 123, "name": "电影A", "cover": "/img/123.jpg" },
            { "id": 456, "name": "电影B", "cover": "/img/456.jpg" }
        ]
    }
}
```

```toml
[search.fields]
title.steps = [
    { json = { selector = "$.data.list[*]", all = true } },
    { json = "$.name" }
]

url.steps = [
    { json = { selector = "$.data.list[*]", all = true } },
    { json = "$.id" },
    { filter = "template('/video/{{ value }}.html')" }
]

cover.steps = [
    { json = { selector = "$.data.list[*]", all = true } },
    { json = "$.cover" },
    { filter = "absolute_url" }
]
```

### 示例3：处理加密数据

```toml
[scripting]
engine = "javascript"

[scripting.modules.crypto]
code = '''
function decryptUrl(encrypted) {
    // Base64 解码
    return atob(encrypted);
}
'''

[content.fields]
media_type = "video"
play_url.steps = [
    { css = "#player" },
    { attr = "data-encrypted" },
    { script = "crypto.decryptUrl" }
]
```

## 调试技巧

1. **逐步调试** - 一步一步添加提取步骤，观察中间结果
2. **使用浏览器** - F12 开发者工具测试 CSS 选择器
3. **检查数据格式** - 确认响应是 HTML 还是 JSON
4. **处理空值** - 使用 `nullable` 或 `default` 处理可能为空的字段

## 下一步

- 📋 [搜索流程](../flows/search.md) - 完整的搜索配置
- 📖 [详情流程](../flows/detail.md) - 详情页配置
- 🔧 [过滤器参考](../reference/filters.md) - 所有过滤器详解
