# 过滤器参考

过滤器用于对提取的文本进行处理和转换。

## 使用方式

### 单个过滤器

```toml
steps = [{ css = ".title" }, { filter = "trim" }]
```

### 链式过滤器

使用 `|` 连接多个过滤器：

```toml
steps = [{ css = ".content" }, { filter = "trim | strip_html | lowercase" }]
```

### 带参数的过滤器

使用括号传递参数：

```toml
steps = [{ css = ".date" }, { filter = "replace('年', '-') | replace('月', '-') | replace('日', '')" }]
```

## 空白处理

### trim

去除首尾空白字符。

```toml
{ filter = "trim" }

# " hello world " => "hello world"
```

### trim_start / trim_left

去除开头空白。

```toml
{ filter = "trim_start" }

# "  hello" => "hello"
```

### trim_end / trim_right

去除结尾空白。

```toml
{ filter = "trim_end" }

# "hello  " => "hello"
```

### collapse_whitespace

将多个连续空白合并为单个空格。

```toml
{ filter = "collapse_whitespace" }

# "hello    world" => "hello world"
```

## 大小写转换

### lowercase

转为小写。

```toml
{ filter = "lowercase" }

# "Hello World" => "hello world"
```

### uppercase

转为大写。

```toml
{ filter = "uppercase" }

# "Hello World" => "HELLO WORLD"
```

### capitalize

首字母大写。

```toml
{ filter = "capitalize" }

# "hello world" => "Hello world"
```

### title_case

每个单词首字母大写。

```toml
{ filter = "title_case" }

# "hello world" => "Hello World"
```

## 文本替换

### replace

简单文本替换。

```toml
{ filter = "replace('old', 'new')" }

# "hello old" => "hello new"
```

### replace_all

替换所有匹配（与 replace 相同）。

```toml
{ filter = "replace_all('a', 'b')" }

# "banana" => "bbnbnb"
```

### regex_replace

正则表达式替换。

```toml
{ filter = "regex_replace('\\d+', 'NUM')" }

# "item123" => "itemNUM"
```

### remove

移除指定文本。

```toml
{ filter = "remove('广告')" }

# "视频广告内容" => "视频内容"
```

## HTML 处理

### strip_html

移除所有 HTML 标签。

```toml
{ filter = "strip_html" }

# "<p>Hello <b>World</b></p>" => "Hello World"
```

### strip_tags

移除指定标签，保留内容。

```toml
{ filter = "strip_tags('script,style')" }
```

### unescape_html

HTML 实体解码。

```toml
{ filter = "unescape_html" }

# "&lt;div&gt;" => "<div>"
# "&amp;" => "&"
# "&nbsp;" => " "
```

### escape_html

HTML 实体编码。

```toml
{ filter = "escape_html" }

# "<div>" => "&lt;div&gt;"
```

## URL 处理

### absolute_url

将相对 URL 转换为绝对 URL。

```toml
{ filter = "absolute_url" }

# "/video/123.html" => "https://example.com/video/123.html"
```

### url_encode / urlencode

URL 编码。

```toml
{ filter = "url_encode" }

# "hello world" => "hello%20world"
# "中文" => "%E4%B8%AD%E6%96%87"
```

### url_decode / urldecode

URL 解码。

```toml
{ filter = "url_decode" }

# "hello%20world" => "hello world"
```

### extract_domain

提取域名。

```toml
{ filter = "extract_domain" }

# "https://www.example.com/path" => "example.com"
```

### extract_path

提取路径。

```toml
{ filter = "extract_path" }

# "https://example.com/video/123.html" => "/video/123.html"
```

### add_protocol

添加协议前缀。

```toml
{ filter = "add_protocol('https')" }

# "//example.com/img.jpg" => "https://example.com/img.jpg"
```

## 编码处理

### base64_encode

Base64 编码。

```toml
{ filter = "base64_encode" }

# "hello" => "aGVsbG8="
```

### base64_decode

Base64 解码。

```toml
{ filter = "base64_decode" }

# "aGVsbG8=" => "hello"
```

### unicode_decode

Unicode 转义解码。

```toml
{ filter = "unicode_decode" }

# "\\u4e2d\\u6587" => "中文"
```

### json_decode

解析 JSON 字符串。

```toml
{ filter = "json_decode" }

# "{\"name\":\"test\"}" => 对象
```

### json_encode

转换为 JSON 字符串。

```toml
{ filter = "json_encode" }
```

## 字符串操作

### prepend

在开头添加文本。

```toml
{ filter = "prepend('https://')" }

# "example.com" => "https://example.com"
```

### append

在结尾添加文本。

```toml
{ filter = "append('.html')" }

# "/video/123" => "/video/123.html"
```

### substring

截取子字符串。

```toml
{ filter = "substring(0, 10)" }

# "hello world test" => "hello worl"
```

### split

分割字符串。

```toml
{ filter = "split(',')" }

# "a,b,c" => ["a", "b", "c"]
```

### join

连接数组。

```toml
{ filter = "join(' / ')" }

# ["动作", "科幻"] => "动作 / 科幻"
```

### reverse

反转字符串。

```toml
{ filter = "reverse" }

# "hello" => "olleh"
```

### pad_start

开头填充。

```toml
{ filter = "pad_start(5, '0')" }

# "42" => "00042"
```

### pad_end

结尾填充。

```toml
{ filter = "pad_end(10, '-')" }

# "hello" => "hello-----"
```

## 数值处理

### to_int / to_integer

转为整数。

```toml
{ filter = "to_int" }

# "123" => 123
# "12.5" => 12
```

### to_float

转为浮点数。

```toml
{ filter = "to_float" }

# "12.5" => 12.5
```

### round

四舍五入。

```toml
{ filter = "round(2)" }

# "3.14159" => "3.14"
```

### floor

向下取整。

```toml
{ filter = "floor" }

# "3.9" => "3"
```

### ceil

向上取整。

```toml
{ filter = "ceil" }

# "3.1" => "4"
```

### abs

绝对值。

```toml
{ filter = "abs" }

# "-5" => "5"
```

### format_number

数字格式化。

```toml
{ filter = "format_number(2)" }

# "1234567.891" => "1,234,567.89"
```

## 日期处理

### format_date

日期格式化。

```toml
{ filter = "format_date('%Y-%m-%d')" }

# "2024/01/15" => "2024-01-15"
```

### parse_date

解析日期字符串。

```toml
{ filter = "parse_date('%Y年%m月%d日')" }

# "2024年01月15日" => 日期对象
```

### relative_time

转换为相对时间描述。

```toml
{ filter = "relative_time" }

# 时间戳 => "3小时前"
```

## 条件处理

### default

设置默认值。

```toml
{ filter = "default('未知')" }

# "" => "未知"
# null => "未知"
```

### if_empty

如果为空则使用备选值。

```toml
{ filter = "if_empty('暂无')" }
```

### if_match

条件匹配。

```toml
{ filter = "if_match('完结', '已完结', '连载中')" }

# 包含"完结"返回"已完结"，否则返回"连载中"
```

### map

映射转换。

```toml
{ filter = "map('1:电影,2:电视剧,3:动漫')" }

# "1" => "电影"
# "2" => "电视剧"
```

## 正则操作

### regex_extract

正则提取。

```toml
{ filter = "regex_extract('id=(\\d+)')" }

# "?id=123&type=1" => "123"
```

### regex_match

检查是否匹配。

```toml
{ filter = "regex_match('^\\d+$')" }

# "123" => true
# "abc" => false
```

### regex_replace

正则替换（同前文）。

```toml
{ filter = "regex_replace('<[^>]+>', '')" }
```

## 数组操作

### first

获取第一个元素。

```toml
{ filter = "first" }

# ["a", "b", "c"] => "a"
```

### last

获取最后一个元素。

```toml
{ filter = "last" }

# ["a", "b", "c"] => "c"
```

### nth

获取第 n 个元素（0-based）。

```toml
{ filter = "nth(1)" }

# ["a", "b", "c"] => "b"
```

### unique

去重。

```toml
{ filter = "unique" }

# ["a", "b", "a", "c"] => ["a", "b", "c"]
```

### flatten

扁平化嵌套数组。

```toml
{ filter = "flatten" }

# [["a", "b"], ["c"]] => ["a", "b", "c"]
```

### sort

排序。

```toml
{ filter = "sort" }

# ["c", "a", "b"] => ["a", "b", "c"]
```

### count / length

获取长度。

```toml
{ filter = "count" }

# ["a", "b", "c"] => 3
# "hello" => 5
```

## 模板处理

### template

使用模板生成字符串。

```toml
{ filter = "template('https://example.com/video/{{ value }}.html')" }

# "123" => "https://example.com/video/123.html"
```

### format

格式化字符串。

```toml
{ filter = "format('第{}集')" }

# "5" => "第5集"
```

## 组合示例

### 清理标题

```toml
title.steps = [
    { css = ".title" },
    { filter = "trim | strip_html | collapse_whitespace" }
]
```

### 处理 URL

```toml
url.steps = [
    { css = "a" },
    { attr = "href" },
    { filter = "trim | absolute_url" }
]
```

### 处理日期

```toml
date.steps = [
    { css = ".date" },
    { filter = "trim | replace('年', '-') | replace('月', '-') | replace('日', '') | trim" }
]

# "2024年01月15日" => "2024-01-15"
```

### 提取数字

```toml
episode.steps = [
    { css = ".episode" },
    { filter = "regex_extract('第(\\d+)集') | to_int" }
]

# "第12集" => 12
```

### 处理评分

```toml
score.steps = [
    { css = ".score" },
    { filter = "trim | regex_extract('[\\d.]+') | to_float | round(1)" }
]

# "评分：8.56分" => 8.6
```

### 处理分类标签

```toml
tags.steps = [
    { css = { selector = ".tags a", all = true } },
    { filter = "trim" },
    { filter = "unique | join(' / ')" }
]

# ["动作", "科幻", "动作"] => "动作 / 科幻"
```

## 下一步

- 📖 [媒体类型参考](./media-types.md) - 媒体类型字段
- 📖 [HTTP 配置](./http.md) - 网络请求配置
