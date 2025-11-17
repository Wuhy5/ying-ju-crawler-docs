# 处理管道 (Pipeline)

管道是媒体爬虫规范的核心机制，用于定义数据的提取和转换过程。

## 概念

**管道 (Pipeline)** 是一个由**步骤 (Step)** 组成的数组，数据按顺序流经每个步骤：

```
输入 → 步骤1 → 步骤2 → 步骤3 → ... → 输出
```

每个步骤：
- 接收前一步的输出作为输入
- 执行特定的处理操作
- 将结果传递给下一步

## 管道定义语法

在 TOML 中，管道是一个对象数组：

```toml
field_name = [
  { type = "step_type_1", param1 = "value1", ... },
  { type = "step_type_2", param2 = "value2", ... },
  # ...
]
```

## 步骤类型概览

每个步骤必须包含 `type` 字段，指定步骤类型。

### 数据提取

- **[selector](./selector.md)** - CSS 选择器，从 HTML 中提取元素
- **[jsonpath](./jsonpath.md)** - JSONPath 查询，从 JSON 中提取数据
- **[regex](./regex.md)** - 正则表达式，提取或匹配文本

### 数据转换

- **[string](./string.md)** - 字符串操作（格式化、替换、分割等）
- **cast** - 类型转换（字符串、数字、日期等）
- **crypto** - 加密/解密和编码操作

### 流程控制

- **conditional** - 条件分支
- **loop** - 循环处理

### 网络请求

- **http_request** - HTTP 请求
- **webview** - WebView 交互（处理 JavaScript 渲染和登录）

### 数据验证

- **validate** - 数据验证
- **constant** - 常量值

### 缓存操作

- **[cache_key](./cache.md)** - 存储缓存
- **[cache_retrieve](./cache.md)** - 读取缓存
- **[cache_clear](./cache.md)** - 清除缓存

### 自定义扩展

- **script** - 调用自定义脚本函数

## 快速示例

### 简单提取

```toml
title = [
  { type = "selector", query = "h1.title", extract = "text" }
]
```

### 多步处理

```toml
url = [
  { type = "selector", query = "a.link", extract = "attr:href" },
  { type = "regex", query = "/detail/(\\d+)", group = 1 },
  { type = "string", operation = "format", template = "https://{domain}/api/detail/{input}" }
]
```

### 条件处理

```toml
cover = [
  { type = "selector", query = "img.cover", extract = "attr:src" },
  {
    type = "conditional",
    condition = "exists",
    if_true = [],
    if_false = [
      { type = "constant", value = "https://example.com/default.jpg" }
    ]
  }
]
```

## 最佳实践

1. **保持简洁**: 优先使用声明式步骤，只在必要时使用脚本
2. **步骤单一职责**: 每个步骤只做一件事
3. **合理命名**: 使用清晰的字段名
4. **错误处理**: 使用验证和条件处理可能的异常
5. **性能考虑**: 避免不必要的 HTTP 请求，合理使用缓存

## 下一步

选择你感兴趣的步骤类型，深入了解其用法和参数。
