# 提取步骤参考

本文档详细说明所有可用的提取步骤（ExtractStep）。

## 步骤概览

| 步骤类型 | 说明 | 输入 | 输出 |
|---------|------|------|------|
| `css` | CSS 选择器 | HTML | 元素/文本 |
| `xpath` | XPath 选择器 | HTML/XML | 元素/文本 |
| `json` | JSONPath 选择器 | JSON | 值 |
| `regex` | 正则表达式 | 文本 | 匹配组 |
| `attr` | 获取属性 | 元素 | 属性值 |
| `filter` | 文本过滤 | 文本 | 处理后文本 |
| `index` | 索引选择 | 数组 | 单项/切片 |
| `const` | 常量值 | - | 常量 |
| `var` | 变量引用 | - | 变量值 |
| `script` | 脚本调用 | 任意 | 脚本返回值 |

## CSS 选择器

从 HTML 中选择元素。

### 基本语法

```toml
# 简写形式
steps = [{ css = ".title" }]

# 完整形式
steps = [{ css = { selector = ".title" } }]

# 选择多个元素
steps = [{ css = { selector = ".item", all = true } }]
```

### 参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `selector` | String | ✅ | CSS 选择器 |
| `all` | Boolean | ❌ | 是否选择所有匹配元素，默认 false |

### 示例

```toml
# 选择单个元素，获取文本
steps = [{ css = "h1.title" }]

# 选择多个元素（列表场景）
steps = [{ css = { selector = ".video-item", all = true } }]

# 嵌套选择
steps = [
    { css = { selector = ".video-list .item", all = true } },
    { css = ".title" }  # 在每个 item 中选择 .title
]

# 组合选择器
steps = [{ css = ".header h1, .header h2" }]

# 属性选择器
steps = [{ css = "a[href^='/video/']" }]

# 伪类选择器
steps = [{ css = ".item:first-child" }]
steps = [{ css = ".item:nth-child(2)" }]
steps = [{ css = ".item:not(.ad)" }]
```

### 常用 CSS 选择器

| 选择器 | 说明 |
|--------|------|
| `.class` | 类选择器 |
| `#id` | ID 选择器 |
| `element` | 元素选择器 |
| `parent > child` | 直接子元素 |
| `ancestor descendant` | 后代元素 |
| `[attr]` | 属性存在 |
| `[attr="value"]` | 属性等于 |
| `[attr^="prefix"]` | 属性前缀 |
| `[attr$="suffix"]` | 属性后缀 |
| `[attr*="contain"]` | 属性包含 |
| `:first-child` | 第一个子元素 |
| `:last-child` | 最后一个子元素 |
| `:nth-child(n)` | 第 n 个子元素 |
| `:not(selector)` | 排除选择器 |
| `:contains('text')` | 包含文本（扩展） |

## XPath 选择器

使用 XPath 表达式选择元素。

### 基本语法

```toml
# 简写形式
steps = [{ xpath = "//div[@class='title']" }]

# 完整形式
steps = [{ xpath = { expr = "//div[@class='title']" } }]

# 选择多个元素
steps = [{ xpath = { expr = "//li[@class='item']", all = true } }]
```

### 参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `expr` | String | ✅ | XPath 表达式 |
| `all` | Boolean | ❌ | 是否选择所有匹配，默认 false |

### 示例

```toml
# 基本选择
steps = [{ xpath = "//h1[@class='title']" }]

# 多元素选择
steps = [{ xpath = { expr = "//div[@class='item']", all = true } }]

# 获取文本
steps = [{ xpath = "//span[@class='price']/text()" }]

# 获取属性
steps = [{ xpath = "//a/@href" }]

# 条件选择
steps = [{ xpath = "//div[contains(@class, 'video') and @data-id]" }]

# 位置选择
steps = [{ xpath = "(//div[@class='item'])[1]" }]
steps = [{ xpath = "//div[@class='item'][last()]" }]

# 轴选择
steps = [{ xpath = "//div[@class='title']/following-sibling::div[1]" }]
```

### 常用 XPath 表达式

| 表达式 | 说明 |
|--------|------|
| `//element` | 所有 element 元素 |
| `//element[@attr]` | 有 attr 属性的元素 |
| `//element[@attr='value']` | attr 等于 value |
| `//element[contains(@attr, 'value')]` | attr 包含 value |
| `//element[starts-with(@attr, 'prefix')]` | attr 以 prefix 开头 |
| `//element/text()` | 元素文本 |
| `//element/@attr` | 元素属性 |
| `//parent/child` | 子元素 |
| `//ancestor//descendant` | 后代元素 |
| `(//element)[n]` | 第 n 个元素 |
| `//element[last()]` | 最后一个元素 |
| `//element[position()<=3]` | 前 3 个元素 |

## JSONPath 选择器

从 JSON 数据中提取值。

### 基本语法

```toml
# 简写形式
steps = [{ json = "$.data.title" }]

# 完整形式
steps = [{ json = { selector = "$.data.title" } }]

# 选择多个值
steps = [{ json = { selector = "$.data.list[*].name", all = true } }]
```

### 参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `selector` | String | ✅ | JSONPath 表达式 |
| `all` | Boolean | ❌ | 是否返回所有匹配，默认 false |

### 示例

```toml
# 简单路径
steps = [{ json = "$.data.title" }]

# 数组索引
steps = [{ json = "$.data.list[0]" }]

# 数组所有元素
steps = [{ json = { selector = "$.data.list[*]", all = true } }]

# 嵌套属性
steps = [
    { json = { selector = "$.data.items[*]", all = true } },
    { json = "$.name" }  # 在每个 item 中取 name
]

# 条件过滤
steps = [{ json = "$.data.list[?(@.status=='active')]" }]

# 递归搜索
steps = [{ json = "$..title" }]
```

### JSONPath 语法

| 语法 | 说明 |
|------|------|
| `$` | 根对象 |
| `.key` | 子属性 |
| `['key']` | 子属性（键名有特殊字符时） |
| `[n]` | 数组第 n 项（0-based） |
| `[*]` | 数组所有元素 |
| `[start:end]` | 数组切片 |
| `..` | 递归下降 |
| `?(@.expr)` | 条件过滤 |
| `@` | 当前元素 |

## 正则表达式

使用正则表达式提取或匹配文本。

### 基本语法

```toml
# 简写形式（提取第一个捕获组）
steps = [{ regex = "id=(\\d+)" }]

# 完整形式
steps = [{ regex = { pattern = "id=(\\d+)" } }]

# 提取所有匹配
steps = [{ regex = { pattern = "(\\d+)", all = true } }]

# 指定捕获组
steps = [{ regex = { pattern = "(\\w+)=(\\d+)", group = 2 } }]
```

### 参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `pattern` | String | ✅ | 正则表达式 |
| `all` | Boolean | ❌ | 是否返回所有匹配，默认 false |
| `group` | Integer | ❌ | 捕获组索引，默认 1 |
| `flags` | String | ❌ | 正则标志（i, m, s 等） |

### 示例

```toml
# 提取数字
steps = [{ regex = "(\\d+)" }]

# 提取 URL
steps = [{ regex = "https?://[^\\s\"']+" }]

# 提取 JSON 对象
steps = [{ regex = "var data = (\\{[^}]+\\})" }]

# 多行匹配
steps = [{ regex = { pattern = "title\":\"([^\"]+)\"", flags = "s" } }]

# 所有匹配
steps = [{ regex = { pattern = "\"url\":\"([^\"]+)\"", all = true } }]

# 指定捕获组
steps = [{ regex = { pattern = "(\\w+):(\\d+)", group = 2 } }]

# 不区分大小写
steps = [{ regex = { pattern = "video", flags = "i" } }]
```

### 常用正则模式

| 模式 | 说明 |
|------|------|
| `\d+` | 一个或多个数字 |
| `\w+` | 一个或多个单词字符 |
| `[^"]+` | 非引号字符 |
| `.*?` | 非贪婪任意字符 |
| `(?:...)` | 非捕获组 |
| `(?i)` | 不区分大小写 |
| `(?s)` | 单行模式（. 匹配换行） |
| `(?m)` | 多行模式 |

## 属性获取

获取 HTML 元素的属性值。

### 基本语法

```toml
steps = [
    { css = "a" },
    { attr = "href" }
]
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `attr` | String | 属性名称 |

### 示例

```toml
# 获取 href
steps = [{ css = "a" }, { attr = "href" }]

# 获取 src
steps = [{ css = "img" }, { attr = "src" }]

# 获取 data-* 属性
steps = [{ css = ".video" }, { attr = "data-url" }]

# 获取懒加载图片
steps = [
    { css = "img" },
    { attr = "data-src" }  # 或 data-original, data-lazy-src 等
]

# 获取自定义属性
steps = [{ css = ".item" }, { attr = "data-id" }]
```

### 常用属性

| 属性 | 说明 |
|------|------|
| `href` | 链接地址 |
| `src` | 资源地址 |
| `data-src` | 懒加载资源 |
| `data-original` | 懒加载原图 |
| `alt` | 替代文本 |
| `title` | 标题 |
| `class` | 类名 |
| `id` | ID |
| `data-*` | 自定义数据属性 |

## 索引选择

从数组中选择特定项或切片。

### 基本语法

```toml
# 选择单项
steps = [{ index = 0 }]

# 选择切片
steps = [{ index = { start = 0, end = 5 } }]

# 选择最后一项
steps = [{ index = -1 }]
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `index` | Integer | 单项索引（负数从末尾计） |
| `start` | Integer | 切片起始索引 |
| `end` | Integer | 切片结束索引（不包含） |
| `step` | Integer | 步长（可选） |

### 示例

```toml
# 第一项
steps = [
    { css = { selector = ".item", all = true } },
    { index = 0 }
]

# 最后一项
steps = [
    { css = { selector = ".item", all = true } },
    { index = -1 }
]

# 前 5 项
steps = [
    { css = { selector = ".item", all = true } },
    { index = { start = 0, end = 5 } }
]

# 跳过前 2 项
steps = [
    { css = { selector = ".item", all = true } },
    { index = { start = 2 } }
]

# 每隔一项取一个
steps = [
    { css = { selector = ".item", all = true } },
    { index = { start = 0, step = 2 } }
]
```

## 常量值

返回固定的常量值。

### 基本语法

```toml
steps = [{ const = "固定值" }]
```

### 示例

```toml
# 固定字符串
video_type.steps = [{ const = "m3u8" }]

# 固定 URL 前缀
base_url.steps = [{ const = "https://example.com" }]

# 用于默认值
score.steps = [{ css = ".score" }]
score.default = [{ const = "暂无评分" }]
```

## 变量引用

引用已提取的变量或上下文变量。

### 基本语法

```toml
steps = [{ var = "变量名" }]
```

### 示例

```toml
# 引用上下文变量
full_url.steps = [
    { var = "base_url" },
    { filter = "append({{ path }})" }
]

# 引用已提取的字段
combined.steps = [
    { var = "title" },
    { filter = "append(' - {{ author }}')" }
]
```

### 可用变量

| 变量 | 说明 |
|------|------|
| `detail_url` | 详情页 URL |
| `content_url` | 内容页 URL |
| `keyword` | 搜索关键词 |
| `page` | 当前页码 |
| `category` | 当前分类 |
| 自定义变量 | 通过脚本或配置定义 |

## 脚本调用

调用自定义脚本函数处理数据。

### 基本语法

```toml
steps = [{ script = "函数名" }]
```

### 示例

```toml
# 调用解密函数
media_url.steps = [
    { css = "script:contains('encrypted')" },
    { regex = "encrypted = \"([^\"]+)\"" },
    { script = "decrypt_url" }
]

# 调用格式化函数
date.steps = [
    { css = ".date" },
    { script = "format_date" }
]

# 调用复杂处理函数
data.steps = [
    { json = "$.raw_data" },
    { script = "parse_complex_data" }
]
```

### 脚本定义

```toml
[scripting]
engine = "rhai"

[scripting.modules.main]
code = '''
fn decrypt_url(encrypted) {
    // 解密逻辑
    return decrypted;
}

fn format_date(raw) {
    // 日期格式化
    return formatted;
}
'''
```

## 组合使用

### 完整提取链

```toml
# 从 HTML 中提取视频列表
title.steps = [
    { css = { selector = ".video-item", all = true } },  # 1. 选择所有列表项
    { css = ".title a" },                                 # 2. 在每个项中选择标题
    { filter = "trim" }                                   # 3. 去除空白
]

url.steps = [
    { css = { selector = ".video-item", all = true } },  # 1. 选择所有列表项
    { css = ".title a" },                                 # 2. 选择链接
    { attr = "href" },                                    # 3. 获取 href 属性
    { filter = "absolute_url" }                           # 4. 转为绝对路径
]
```

### 从 JavaScript 提取 JSON

```toml
data.steps = [
    { css = "script:contains('__DATA__')" },             # 1. 找到包含数据的 script
    { regex = "__DATA__\\s*=\\s*(\\{[\\s\\S]+?\\});?" }, # 2. 提取 JSON 字符串
    { json = "$.list" }                                   # 3. 解析 JSON 获取 list
]
```

### 多步骤文本处理

```toml
clean_text.steps = [
    { css = ".content" },                     # 1. 获取内容
    { filter = "strip_html" },                # 2. 移除 HTML 标签
    { filter = "regex_replace('\\s+', ' ')" },# 3. 合并空白
    { filter = "trim" }                       # 4. 去首尾空白
]
```

## 下一步

- 📖 [过滤器参考](./filters.md) - 文本处理过滤器
- 📖 [媒体类型参考](./media-types.md) - 媒体类型字段说明
