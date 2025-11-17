# 示例规则文件

本目录包含各种媒体类型的完整示例规则文件。

## 示例列表

| 文件 | 媒体类型 | 描述 |
|------|---------|------|
| [video-example.toml](./video-example.toml) | 影视 | 完整的影视数据源规则示例 |
| [audio-example.toml](./audio-example.toml) | 音频 | 音乐平台数据源规则示例 |
| [book-example.toml](./book-example.toml) | 图书 | 小说网站数据源规则示例 |
| [manga-example.toml](./manga-example.toml) | 漫画 | 漫画网站数据源规则示例 |

## 使用方式

### 1. 直接使用

将示例文件复制到你的规则目录，根据实际网站修改配置。

```bash
cp examples/video-example.toml rules/my-video-source.toml
```

### 2. 验证规则

使用 Schema 验证规则文件：

```rust
use media_crawler_schema::RuleFile;

let content = std::fs::read_to_string("rules/my-video-source.toml")?;
let rule: RuleFile = toml::from_str(&content)?;
```

### 3. 测试规则

```bash
# 使用爬虫工具测试
cargo run --bin media-crawler -- test rules/my-video-source.toml
```

## 示例特点

每个示例都包含：

1. **完整的配置**: 包含所有必需和可选字段
2. **实用的管道**: 展示常见的数据提取模式
3. **详细注释**: 解释每个配置项的作用
4. **最佳实践**: 演示推荐的配置方式

## 学习路径

1. **入门**: 从 `video-example.toml` 开始，它包含最全面的注释
2. **进阶**: 学习 `audio-example.toml` 中的 JSON 处理
3. **复杂场景**: 查看 `book-example.toml` 的章节列表处理
4. **图像内容**: 了解 `manga-example.toml` 的图片提取

## 常见模式

### HTML 解析

```toml
field = [
  { type = "selector", query = "div.item", extract = "text" }
]
```

### JSON 解析

```toml
field = [
  { type = "jsonpath", query = "$.data.field" }
]
```

### 多步处理

```toml
field = [
  { type = "selector", query = "a", extract = "attr:href" },
  { type = "regex", query = "/id/(\\d+)", group = 1 },
  { type = "string", operation = "format", template = "https://api.example.com/{input}" }
]
```

### 数组转换

```toml
field = [
  { type = "selector", query = "div.item" },
  {
    type = "transform",
    operation = "map",
    pipeline = [
      { type = "selector", query = "span", extract = "text" }
    ]
  }
]
```

## 调试技巧

1. **分步测试**: 逐步添加管道步骤，确认每步输出
2. **使用日志**: 在爬虫工具中启用详细日志
3. **浏览器调试**: 使用浏览器开发者工具查看实际HTML结构
4. **API测试**: 使用 Postman 或 curl 测试 API 响应

## 下一步

- 阅读 [通用规范](../common-spec.md) 了解配置选项
- 查看 [处理管道](../pipeline/README.md) 学习管道机制
- 参考对应的 [媒体类型规范](../media-types/README.md)
