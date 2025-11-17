# 媒体类型规范

本目录包含各种媒体类型的特定规范文档。

## 支持的媒体类型

| 媒体类型 | `media_type` 值 | 文档 |
|---------|----------------|------|
| 影视 | `"video"` | [video.md](./video.md) |
| 音频 | `"audio"` | [audio.md](./audio.md) |
| 图书 | `"book"` | [book.md](./book.md) |
| 漫画 | `"manga"` | [manga.md](./manga.md) |

## 媒体类型系统

每种媒体类型：

1. **继承通用规范**: 所有媒体类型都遵循 [通用规范](../common-spec.md) 中定义的基础结构
2. **扩展特定字段**: 在 `parse.list.fields` 和 `parse.detail.fields` 中定义专有字段
3. **独立演进**: 可以独立添加新字段，不影响其他媒体类型

## 字段分类

### 通用字段（所有媒体类型）

在 [通用规范](../common-spec.md) 中定义：
- `title`: 标题
- `url`: 详情页 URL
- `cover`: 封面图
- `description`: 描述
- `tags`: 标签
- `publish_date`: 发布日期
- `update_date`: 更新日期

### 媒体特定字段

每种媒体类型有各自的特定字段，例如：
- 影视: `director`, `actors`, `episodes`, `play_lines`
- 音频: `artist`, `album`, `duration`, `audio_quality`
- 图书: `author`, `isbn`, `publisher`, `chapter_list`
- 漫画: `author`, `chapters`, `reading_direction`

## 扩展新媒体类型

要添加新的媒体类型：

1. 在 `media-types/` 目录创建新的规范文档（如 `podcast.md`）
2. 定义该类型的特定字段
3. 更新 `schema/` 目录中的 Schema 定义
4. 更新本 README 文件

### 规范文档模板

```markdown
# {媒体类型名称}规范

## 概述

简要描述该媒体类型及其特点。

## 媒体类型标识

\`\`\`toml
[meta]
media_type = "{type_id}"
\`\`\`

## 列表页字段

### 通用字段
(列出继承的通用字段)

### 特定字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| ... | ... | ... | ... |

## 详情页字段

### 通用字段
(列出继承的通用字段)

### 特定字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| ... | ... | ... | ... |

## 完整示例

\`\`\`toml
(提供完整的规则文件示例)
\`\`\`
```

## 下一步

选择你要实现的媒体类型，阅读对应的规范文档。
