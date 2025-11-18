# YingJu 媒体爬虫规范文档

这是一个基于 TOML 配置的媒体爬虫规范系统，支持视频、音频、图书和漫画等多种媒体类型的自动化数据采集。

## 文档结构

### 📖 核心概念
- **[核心概念](docs/core/concepts.md)** - 了解媒体爬虫的基本概念和工作原理
- **[规则文件](docs/core/rule-file.md)** - 掌握 TOML 规则文件的完整结构

### 🔧 规范定义
- **[JSON Schema](docs/spec/schema.md)** - 规则文件的验证规范和数据结构
- **[媒体类型](docs/spec/media-types.md)** - 支持的媒体类型和数据模型
- **[字段映射](docs/spec/field-mapping.md)** - 数据转换和标准化
- **[流水线系统](docs/spec/pipeline.md)** - 任务执行流程和步骤编排

### ⚙️ 配置指南
- **[缓存配置](docs/config/cache.md)** - 缓存系统的配置和优化
- **[HTTP 配置](docs/config/http.md)** - 网络请求的配置选项
- **[脚本配置](docs/config/scripting.md)** - 自定义逻辑的脚本编写

### 🧩 高级特性
- **[组件系统](docs/components/overview.md)** - 可重用的处理组件
- **[流程系统](docs/flows/overview.md)** - 复杂任务的流程编排

### 💡 实践示例
- **[缓存示例](docs/examples/cache-example.md)** - 缓存使用的最佳实践
- **[流程示例](docs/examples/flow-example.md)** - 完整流程的实现案例

## 快速开始

### 1. 创建基础规则文件

```toml
# 基础的视频搜索规则
title = "示例视频网站"
description = "演示如何配置视频爬虫规则"
version = "1.0.0"

[meta]
media_type = "video"
language = "zh-CN"

[config.http]
timeout = 10000
user_agent = "YingJu-Crawler/1.0"

[flows.search]
actions = [
  { type = "http_request", url = "https://api.example.com/search?q={{query}}", output = "response" },
  { type = "parse_json", input = "{{response.body}}", output = "data" },
  { type = "map_field", input = "{{data.results}}", target = "item_summary", mappings = [
    { from = "title", to = "title" },
    { from = "url", to = "url" },
    { from = "thumbnail", to = "cover" }
  ], output = "results" },
  { type = "return", value = "{{results}}" }
]
```

### 2. 配置缓存优化

```toml
[config.cache]
backend = "sqlite"
database_path = "./cache.db"

[config.cache.strategies.search]
ttl = 3600
max_size = 1000

[config.cache.strategies.detail]
ttl = 86400
max_size = 500
```

### 3. 添加自定义脚本

```toml
[scripting.engine]
type = "rhai"

[scripting.modules.utils]
code = '''
fn format_duration(seconds: i64) -> string {
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    let secs = seconds % 60;
    format!("{}:{:02}:{:02}", hours, minutes, secs)
}

fn clean_title(title: string) -> string {
    regex_replace(title, r"[\\|/:*?\"<>|]", "")
}
'''
```

## 开发环境

### 本地开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run start
```

### 构建文档

```bash
# 构建静态站点
bun run build

# 预览构建结果
bun run serve
```

### 部署

```bash
# 部署到 GitHub Pages
GIT_USER=<Your GitHub username> bun run deploy
```

## 贡献指南

### 文档规范

1. **结构清晰**：每个文档包含 3-5 个主要章节
2. **示例丰富**：提供完整的 TOML 配置示例
3. **用户友好**：用通俗语言解释技术概念
4. **版本一致**：示例代码与最新规范保持同步

### 编写规范

- 使用 Markdown 格式
- 代码块使用适当的语法高亮
- TOML 配置示例使用 ```toml
- 脚本代码使用相应的语言标签
- 保持中英文混用，技术术语使用英文

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](../LICENSE) 文件了解详情。

## 相关项目

- [ying-ju-app](../ying-ju-app/) - 爬虫应用主程序
- [ying-ju-crawler-schema](../ying-ju-crawler-schema/) - 规范验证工具
