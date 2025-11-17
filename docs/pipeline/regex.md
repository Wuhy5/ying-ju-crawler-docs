# regex - 正则表达式

使用正则表达式提取或匹配文本。

## 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `type` | String | 是 | `"regex"` |
| `query` | String | 是 | 正则表达式 |
| `group` | Integer | 否 | 捕获组索引（默认 `1`），`0` 表示整个匹配 |

## 示例

### 提取 ID

```toml
id = [
  { type = "selector", query = "div.item", extract = "attr:data-info" },
  { type = "regex", query = "id=(\\d+)", group = 1 }
]
```

### 清理文本（去除首尾空白）

```toml
clean_text = [
  { type = "selector", query = "p", extract = "text" },
  { type = "regex", query = "^\\s*(.+?)\\s*$", group = 1 }
]
```

### 提取 URL 中的参数

```toml
video_id = [
  { type = "selector", query = "a.play", extract = "attr:href" },
  { type = "regex", query = "v=([a-zA-Z0-9_-]+)", group = 1 }
]
```

### 提取多个捕获组

```toml
# 输入: "2024-01-15"
year = [
  { type = "constant", value = "2024-01-15" },
  { type = "regex", query = "(\\d{4})-(\\d{2})-(\\d{2})", group = 1 }
]
# 输出: "2024"

month = [
  { type = "constant", value = "2024-01-15" },
  { type = "regex", query = "(\\d{4})-(\\d{2})-(\\d{2})", group = 2 }
]
# 输出: "01"
```

### 验证格式

```toml
# 检查是否为有效的 URL
is_valid_url = [
  { type = "selector", query = "a", extract = "attr:href" },
  { type = "regex", query = "^https?://", group = 0 }
]
```

### 提取加密参数

```toml
encrypted_data = [
  { type = "selector", query = "script", extract = "text" },
  { type = "regex", query = "var\\s+encrypted\\s*=\\s*['\"]([^'\"]+)['\"]", group = 1 }
]
```

## 正则表达式语法参考

| 语法 | 描述 | 示例 |
|------|------|------|
| `.` | 任意字符 | `a.c` 匹配 "abc", "a1c" |
| `\d` | 数字 | `\d+` 匹配 "123" |
| `\w` | 字母数字下划线 | `\w+` 匹配 "abc_123" |
| `\s` | 空白字符 | `\s+` 匹配空格、制表符 |
| `*` | 0 次或多次 | `a*` 匹配 "", "a", "aaa" |
| `+` | 1 次或多次 | `a+` 匹配 "a", "aaa" |
| `?` | 0 次或 1 次 | `a?` 匹配 "", "a" |
| `{n}` | 恰好 n 次 | `\d{4}` 匹配 "2024" |
| `{n,m}` | n 到 m 次 | `\d{2,4}` 匹配 "12", "123", "1234" |
| `[abc]` | 字符类 | `[abc]` 匹配 "a", "b", "c" |
| `[^abc]` | 否定字符类 | `[^abc]` 匹配除 "a", "b", "c" 外的字符 |
| `^` | 字符串开头 | `^http` 匹配以 "http" 开头 |
| `$` | 字符串结尾 | `.jpg$` 匹配以 ".jpg" 结尾 |
| `(...)` | 捕获组 | `(\d+)` 捕获数字 |
| `(?:...)` | 非捕获组 | `(?:http|https)` 匹配但不捕获 |

## 转义字符

在 TOML 中，反斜杠 `\` 需要转义为 `\\`：

```toml
# 错误
query = "\d+"

# 正确
query = "\\d+"
```

## 常用模式

### URL 提取

```toml
url = [
  { type = "regex", query = "https?://[^\\s\"']+", group = 0 }
]
```

### 邮箱提取

```toml
email = [
  { type = "regex", query = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", group = 0 }
]
```

### 日期提取

```toml
date = [
  { type = "regex", query = "\\d{4}-\\d{2}-\\d{2}", group = 0 }
]
```

### 数字提取

```toml
number = [
  { type = "regex", query = "\\d+", group = 0 }
]
```

## 注意事项

1. **转义**: TOML 字符串中的反斜杠需要双写 `\\`
2. **捕获组**: 使用括号 `()` 创建捕获组，`group = 1` 获取第一个捕获组
3. **性能**: 复杂的正则表达式可能影响性能，尽量保持简洁
4. **贪婪匹配**: 默认是贪婪匹配，使用 `?` 变为非贪婪，如 `.*?`
5. **错误处理**: 如果正则不匹配，通常返回 null，建议配合验证步骤
