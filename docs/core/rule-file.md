# 规则文件结构

## 规则文件的组成

规则文件是 TOML 格式的配置文件，包含了从特定网站获取数据的完整指令。一个完整的规则文件通常包含以下几个主要部分：

```toml
# 规则元数据
[meta]
name = "示例视频站"
author = "规则作者"
version = "1.0.0"
domain = "example.com"
media_type = "video"

# 网络请求配置
[http]
user_agent = "Mozilla/5.0..."
timeout = 30

# 缓存配置
[cache]
backend = "memory"
default_ttl = 3600

# 脚本配置（可选）
[scripting]
engine = "rhai"

# 可重用组件
[components.login]
# 组件定义...

# 数据处理流程
[flows.search]
# 流程定义...
```

## 元数据部分

元数据定义了规则的基本信息，是规则文件的必需部分。

### 基本信息字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `name` | 字符串 | 是 | 规则的显示名称 |
| `author` | 字符串 | 是 | 规则作者 |
| `version` | 字符串 | 是 | 规则版本号 |
| `spec_version` | 字符串 | 是 | 规范版本号 |
| `domain` | 字符串 | 是 | 目标网站域名 |
| `media_type` | 字符串 | 是 | 媒体类型 |

### 可选字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `description` | 字符串 | 规则的详细描述 |
| `encoding` | 字符串 | 网站编码（默认 UTF-8） |
| `icon_url` | 字符串 | 数据源图标URL |

## 配置部分

配置部分定义了规则的运行环境和行为。

### 网络配置 [http]

控制所有网络请求的行为：

```toml
[http]
user_agent = "Mozilla/5.0 (compatible; MediaCrawler/1.0)"
timeout = 30
follow_redirects = true
proxy = "http://proxy.example.com:8080"

[http.headers]
Referer = "https://example.com/"
Accept-Language = "zh-CN,zh;q=0.9"
```

### 缓存配置 [cache]

定义数据缓存策略：

```toml
[cache]
backend = "memory"  # 或 "sqlite"
default_ttl = 3600  # 默认缓存时间（秒）
```

### 脚本配置 [scripting]

配置自定义脚本执行环境：

```toml
[scripting]
engine = "rhai"  # 或 "javascript", "python"

[scripting.modules.utils]
code = """
fn format_title(title: string) -> string {
    title.trim().to_uppercase()
}
"""
```

## 组件部分

组件是可重用的数据处理模块，可以在多个流程中调用。

### 组件定义

```toml
[components.extract_title]
description = "从HTML中提取标题"

[components.extract_title.inputs]
html = "输入的HTML内容"

[components.extract_title.pipeline]
# 处理步骤...
```

### 组件调用

在流程中通过 `call` 步骤使用组件：

```toml
[flows.get_detail.actions]
- type = "call"
  component = "extract_title"
  with = { html = "{{response.body}}" }
  output = "title"
```

## 流程部分

流程定义了具体的执行逻辑，每个流程对应一个可独立运行的任务。

### 流程结构

```toml
[flows.search]
description = "搜索内容"

[flows.search.entry]
# 入口定义...

[flows.search.actions]
# 执行步骤...
```

### 入口定义

入口定义了如何触发流程：

```toml
[flows.search.entry.search]
url = "/search?q={{keyword}}"
```

### 动作管道

动作定义了数据处理的详细步骤：

```toml
[flows.search.actions]
- type = "http_request"
  url = "{{entry.url}}"
  output = "response"

- type = "selector_all"
  input = "{{response.body}}"
  query = ".item"
  extract = "outer_html"
  output = "items"
```

## 文件组织建议

### 基础规则

- 使用有意义的英文或拼音命名
- 版本号遵循语义化版本规范
- 及时更新规则以适应网站变化

### 复杂规则

对于复杂的网站，可以将规则拆分为多个文件：

```
rules/
├── base.toml      # 基础配置
├── search.toml    # 搜索相关
├── detail.toml    # 详情页相关
└── components/    # 共享组件
    └── common.toml
```

这种组织方式提高了规则的可维护性和重用性。