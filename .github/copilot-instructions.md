# YingJu Crawler Docs - Copilot 指南

## 项目概述

基于 **Docusaurus 3.9** 的媒体爬虫规则规范文档站点。本项目的核心是 `docs/schema/schema.json`，所有文档内容必须与此 Schema 保持同步。

## 核心原则

**`docs/schema/schema.json` 是唯一权威来源** - 文档是 Schema 的人类可读形式。

## 开发命令

```bash
bun install          # 安装依赖（使用 bun）
bun run start        # 开发服务器
bun run build        # 生产构建（验证链接完整性）
bun run serve        # 预览构建结果
```

## Schema 同步流程

### 版本未变更时（增量更新）

当 `schema.json` 的 `$comment` 中版本号未改变时：

```bash
# 1. 查找上次文档更新的提交
git log --oneline docs/

# 2. 比较 schema 变更 schema一般是自动更新, 更新提交消息为: feat: 更新 schema.json 来自 ying-ju-crawler-schema
git diff <上次文档变更的提交点>..HEAD -- docs/schema/schema.json

# 3. 根据 diff 更新对应文档
# 4. 验证构建
bun run build
```

### 版本变更时（版本发布）

当 Schema 版本升级时（如 1.0.0 → 1.1.0）：

```bash
# 1. 创建版本快照
bun run docusaurus docs:version <新版本号>

# 2. 更新 docusaurus.config.ts 版本配置
# 3. 更新所有文档内容
# 4. 在 blog/ 添加版本发布说明
```

## 文档规范

### 代码示例

- **TOML 为主格式**，章节末尾附 JSON 等价示例
- 示例必须可直接使用，避免占位符
- 中文注释，英文保留技术术语

```toml
[search]
url = "https://example.com/search?q={{ keyword }}"

[search.list]
steps = [{ css = { selector = ".item", all = true } }]
```

### 写作风格

| 要求 | 说明 |
|------|------|
| 简洁准确 | 每句话都有信息量，避免冗余 |
| 结构清晰 | 使用表格总结配置项，代码示例配合说明 |
| 面向实践 | 提供可运行的完整示例，而非片段 |
| 错误友好 | 说明常见错误及解决方案 |

### Markdown 规范

- 使用 `:::important` 标注必需字段
- 相对链接引用其他文档
- frontmatter 中设置 `sidebar_position` 控制顺序

## 语言约定

- 站点语言：**简体中文**（`zh-Hans`）
- 技术术语保持英文：CSS、JSON、TOML、URL、API
- 示例中的用户界面文本使用中文
