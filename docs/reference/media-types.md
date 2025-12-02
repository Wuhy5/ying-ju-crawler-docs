# 媒体类型参考

本文档详细说明各媒体类型支持的字段。

## 媒体类型概览

| 类型 | 说明 | 典型场景 |
|------|------|----------|
| `video` | 视频内容 | 电影、电视剧、动漫、综艺 |
| `audio` | 音频内容 | 音乐、播客、有声书 |
| `book` | 文字内容 | 小说、电子书、文章 |
| `manga` | 漫画内容 | 漫画、图集 |

## Video（视频）

视频类型适用于影视内容，支持多线路多集播放。

### 搜索/发现字段 (ItemFields)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `title` | String | ✅ | 视频标题 |
| `url` | String | ✅ | 详情页 URL |
| `cover` | String | ❌ | 封面/海报图 |
| `summary` | String | ❌ | 简介 |
| `category` | String | ❌ | 分类/类型 |
| `score` | String | ❌ | 评分 |
| `status` | String | ❌ | 状态（更新中/已完结） |
| `latest` | String | ❌ | 最新集数/更新信息 |
| `extra` | Object | ❌ | 扩展字段 |

### 详情字段 (VideoDetailFields)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `title` | String | ✅ | 片名 |
| `cover` | String | ❌ | 封面/海报 |
| `intro` | String | ❌ | 剧情简介 |
| `director` | String | ❌ | 导演 |
| `actors` | String | ❌ | 演员 |
| `category` | String | ❌ | 类型（动作/喜剧等） |
| `region` | String | ❌ | 地区 |
| `year` | String | ❌ | 年份 |
| `language` | String | ❌ | 语言 |
| `duration` | String | ❌ | 时长 |
| `score` | String | ❌ | 评分 |
| `tags` | String | ❌ | 标签列表 |
| `update_info` | String | ❌ | 更新状态 |
| `play_lines` | PlayLines | ❌ | 播放线路 |

### 播放线路 (PlayLines)

```toml
[detail.fields.play_lines]
lines.steps = [...]        # 线路列表选择器
line_name.steps = [...]    # 线路名称

[detail.fields.play_lines.episodes]
list.steps = [...]         # 剧集列表选择器
name.steps = [...]         # 剧集名
url.steps = [...]          # 播放页 URL
```

### 内容字段 (VideoContentFields)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `media_url` | String | ✅ | 播放地址 |
| `video_type` | String | ❌ | 类型（m3u8/mp4/flv） |
| `title` | String | ❌ | 当前剧集标题 |
| `next_url` | String | ❌ | 下一集 URL |
| `subtitle_url` | String | ❌ | 字幕文件 URL |

### 完整示例

```toml
[meta]
name = "示例视频站"
media_type = "video"

[search.fields]
title.steps = [{ css = { selector = ".video-item", all = true } }, { css = ".title" }]
url.steps = [{ css = { selector = ".video-item", all = true } }, { css = "a" }, { attr = "href" }]
cover.steps = [{ css = { selector = ".video-item", all = true } }, { css = "img" }, { attr = "src" }]
score.steps = [{ css = { selector = ".video-item", all = true } }, { css = ".score" }]
score.nullable = true

[detail.fields]
media_type = "video"
title.steps = [{ css = "h1" }]
cover.steps = [{ css = ".poster img" }, { attr = "src" }]
intro.steps = [{ css = ".description" }]
director.steps = [{ css = ".director" }]
director.nullable = true
actors.steps = [{ css = ".actors" }]
actors.nullable = true

[detail.fields.play_lines]
lines.steps = [{ css = { selector = ".play-source", all = true } }]
line_name.steps = [{ css = ".source-name" }]

[detail.fields.play_lines.episodes]
list.steps = [{ css = { selector = ".episode", all = true } }]
name.steps = [{ filter = "trim" }]
url.steps = [{ attr = "href" }]

[content.fields]
media_type = "video"
media_url.steps = [{ css = "script:contains('player')" }, { regex = "url\":\"([^\"]+)\"" }]
video_type.steps = [{ const = "m3u8" }]
```

## Audio（音频）

音频类型适用于音乐、播客等内容。

### 搜索/发现字段 (ItemFields)

同视频类型的 ItemFields。

### 详情字段 (AudioDetailFields)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `title` | String | ✅ | 标题 |
| `cover` | String | ❌ | 封面图 |
| `intro` | String | ❌ | 简介/描述 |
| `artist` | String | ❌ | 艺术家/主播 |
| `album` | String | ❌ | 专辑名 |
| `category` | String | ❌ | 分类 |
| `tags` | String | ❌ | 标签 |
| `play_count` | String | ❌ | 播放量 |
| `update_time` | String | ❌ | 更新时间 |
| `tracks` | Tracks | ❌ | 音轨列表 |

### 音轨列表 (Tracks)

```toml
[detail.fields.tracks]
list.steps = [...]         # 音轨列表选择器
name.steps = [...]         # 音轨名
url.steps = [...]          # 音轨页面 URL
duration.steps = [...]     # 时长
```

### 内容字段 (AudioContentFields)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `media_url` | String | ✅ | 播放地址 |
| `audio_type` | String | ❌ | 类型（mp3/aac/flac） |
| `title` | String | ❌ | 当前音轨标题 |
| `duration` | String | ❌ | 时长 |
| `next_url` | String | ❌ | 下一曲 URL |
| `lyrics_url` | String | ❌ | 歌词 URL |

### 完整示例

```toml
[meta]
name = "示例音乐站"
media_type = "audio"

[search.fields]
title.steps = [{ css = { selector = ".audio-item", all = true } }, { css = ".title" }]
url.steps = [{ css = { selector = ".audio-item", all = true } }, { css = "a" }, { attr = "href" }]
cover.steps = [{ css = { selector = ".audio-item", all = true } }, { css = "img" }, { attr = "src" }]
author.steps = [{ css = { selector = ".audio-item", all = true } }, { css = ".artist" }]
author.nullable = true

[detail.fields]
media_type = "audio"
title.steps = [{ css = "h1.title" }]
cover.steps = [{ css = ".album-cover img" }, { attr = "src" }]
artist.steps = [{ css = ".artist" }]
album.steps = [{ css = ".album" }]
album.nullable = true

[detail.fields.tracks]
list.steps = [{ css = { selector = ".track-item", all = true } }]
name.steps = [{ css = ".track-name" }]
url.steps = [{ css = "a" }, { attr = "href" }]
duration.steps = [{ css = ".duration" }]
duration.nullable = true

[content.fields]
media_type = "audio"
media_url.steps = [{ json = "$.data.url" }]
audio_type.steps = [{ const = "mp3" }]
title.steps = [{ json = "$.data.title" }]
title.nullable = true
```

## Book（书籍）

书籍类型适用于小说、电子书等文字内容。

### 搜索/发现字段 (ItemFields)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `title` | String | ✅ | 书名 |
| `url` | String | ✅ | 详情页 URL |
| `cover` | String | ❌ | 封面图 |
| `summary` | String | ❌ | 简介 |
| `author` | String | ❌ | 作者 |
| `category` | String | ❌ | 分类 |
| `status` | String | ❌ | 连载状态 |
| `latest` | String | ❌ | 最新章节 |
| `extra` | Object | ❌ | 扩展字段 |

### 详情字段 (BookDetailFields)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `title` | String | ✅ | 书名 |
| `author` | String | ✅ | 作者 |
| `cover` | String | ❌ | 封面 |
| `intro` | String | ❌ | 简介 |
| `category` | String | ❌ | 分类 |
| `tags` | String | ❌ | 标签 |
| `status` | String | ❌ | 连载状态 |
| `word_count` | String | ❌ | 字数 |
| `update_time` | String | ❌ | 更新时间 |
| `last_chapter` | String | ❌ | 最新章节名 |
| `toc_url` | String | ❌ | 目录页 URL |
| `chapters` | Chapters | ❌ | 章节列表 |

### 章节列表 (Chapters)

```toml
[detail.fields.chapters]
list.steps = [...]         # 章节列表选择器
title.steps = [...]        # 章节标题
url.steps = [...]          # 章节 URL
```

### 内容字段 (BookContentFields)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `body` | String | ✅ | 正文内容 |
| `title` | String | ❌ | 章节标题 |
| `prev_url` | String | ❌ | 上一章 URL |
| `next_url` | String | ❌ | 下一章 URL |

### 完整示例

```toml
[meta]
name = "示例小说站"
media_type = "book"

[search.fields]
title.steps = [{ css = { selector = ".book-item", all = true } }, { css = ".book-name" }]
url.steps = [{ css = { selector = ".book-item", all = true } }, { css = "a" }, { attr = "href" }]
cover.steps = [{ css = { selector = ".book-item", all = true } }, { css = "img" }, { attr = "src" }]
author.steps = [{ css = { selector = ".book-item", all = true } }, { css = ".author" }]
status.steps = [{ css = { selector = ".book-item", all = true } }, { css = ".status" }]
status.nullable = true
latest.steps = [{ css = { selector = ".book-item", all = true } }, { css = ".latest" }]
latest.nullable = true

[detail.fields]
media_type = "book"
title.steps = [{ css = "h1.book-title" }]
author.steps = [{ css = ".book-author" }]
cover.steps = [{ css = ".book-cover img" }, { attr = "src" }]
intro.steps = [{ css = ".book-intro" }, { filter = "trim" }]
category.steps = [{ css = ".book-type" }]
category.nullable = true
status.steps = [{ css = ".book-status" }]
status.nullable = true
word_count.steps = [{ css = ".word-count" }]
word_count.nullable = true
update_time.steps = [{ css = ".update-time" }]
update_time.nullable = true

[detail.fields.chapters]
list.steps = [{ css = { selector = ".chapter-list li", all = true } }]
title.steps = [{ css = "a" }, { filter = "trim" }]
url.steps = [{ css = "a" }, { attr = "href" }, { filter = "absolute_url" }]

[content.fields]
media_type = "book"
body.steps = [{ css = "#chapter-content" }, { filter = "strip_html | trim" }]
title.steps = [{ css = ".chapter-title" }]
title.nullable = true
prev_url.steps = [{ css = ".prev-chapter" }, { attr = "href" }]
prev_url.nullable = true
next_url.steps = [{ css = ".next-chapter" }, { attr = "href" }]
next_url.nullable = true
```

## Manga（漫画）

漫画类型适用于图像内容。

### 搜索/发现字段 (ItemFields)

同书籍类型的 ItemFields。

### 详情字段 (MangaDetailFields)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `title` | String | ✅ | 漫画名 |
| `cover` | String | ❌ | 封面 |
| `intro` | String | ❌ | 简介 |
| `author` | String | ❌ | 作者 |
| `category` | String | ❌ | 分类 |
| `tags` | String | ❌ | 标签 |
| `status` | String | ❌ | 连载状态 |
| `update_time` | String | ❌ | 更新时间 |
| `last_chapter` | String | ❌ | 最新章节 |
| `chapters` | Chapters | ❌ | 章节列表 |

### 内容字段 (MangaContentFields)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `images` | Array | ✅ | 图片 URL 列表 |
| `title` | String | ❌ | 章节标题 |
| `prev_url` | String | ❌ | 上一章 URL |
| `next_url` | String | ❌ | 下一章 URL |

### 完整示例

```toml
[meta]
name = "示例漫画站"
media_type = "manga"

[search.fields]
title.steps = [{ css = { selector = ".manga-item", all = true } }, { css = ".manga-name" }]
url.steps = [{ css = { selector = ".manga-item", all = true } }, { css = "a" }, { attr = "href" }]
cover.steps = [{ css = { selector = ".manga-item", all = true } }, { css = "img" }, { attr = "data-src" }]
author.steps = [{ css = { selector = ".manga-item", all = true } }, { css = ".author" }]
author.nullable = true
status.steps = [{ css = { selector = ".manga-item", all = true } }, { css = ".status" }]
status.nullable = true

[detail.fields]
media_type = "manga"
title.steps = [{ css = "h1.manga-title" }]
cover.steps = [{ css = ".manga-cover img" }, { attr = "src" }]
author.steps = [{ css = ".manga-author" }]
author.nullable = true
intro.steps = [{ css = ".manga-intro" }]
intro.nullable = true
status.steps = [{ css = ".manga-status" }]
status.nullable = true
update_time.steps = [{ css = ".update-time" }]
update_time.nullable = true

[detail.fields.chapters]
list.steps = [{ css = { selector = ".chapter-item", all = true } }]
title.steps = [{ css = "a" }, { filter = "trim" }]
url.steps = [{ css = "a" }, { attr = "href" }, { filter = "absolute_url" }]

[content.fields]
media_type = "manga"
images.steps = [
    { css = { selector = ".manga-images img", all = true } },
    { attr = "data-src" },
    { filter = "absolute_url" }
]
title.steps = [{ css = ".chapter-title" }]
title.nullable = true
prev_url.steps = [{ css = ".prev a" }, { attr = "href" }]
prev_url.nullable = true
next_url.steps = [{ css = ".next a" }, { attr = "href" }]
next_url.nullable = true
```

## 字段共同属性

所有字段都支持以下属性：

| 属性 | 说明 |
|------|------|
| `steps` | 提取步骤数组 |
| `fallback` | 备用提取方案（数组的数组） |
| `default` | 提取失败时的默认值 |
| `nullable` | 是否可为空，默认 false |

### 示例

```toml
score.steps = [{ css = ".score" }]
score.fallback = [
    [{ css = ".rating" }],
    [{ css = ".point" }]
]
score.default = [{ const = "暂无评分" }]
score.nullable = true
```

## 下一步

- 📖 [HTTP 配置](./http.md) - 网络请求配置
- 📖 [脚本配置](./scripting.md) - 自定义脚本
