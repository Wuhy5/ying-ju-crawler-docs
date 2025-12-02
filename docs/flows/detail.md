# 详情流程

详情流程（DetailFlow）用于获取单个内容项的详细信息，是规则的必需部分。

## 基本结构

```toml
[detail]
url = "{{ detail_url }}"
description = "获取影视详情"

[detail.fields]
media_type = "video"
title.steps = [{ css = "h1.title" }]
cover.steps = [{ css = ".poster img" }, { attr = "src" }]
intro.steps = [{ css = ".description" }]
```

## URL 模板

详情页 URL 使用 `{{ detail_url }}` 变量，该变量来自搜索或发现流程的结果。

```toml
# 直接使用
url = "{{ detail_url }}"

# 如果需要处理 URL
url = "{{ detail_url | replace('.html', '/play.html') }}"
```

## 字段定义

详情字段根据 `media_type` 分为四种类型，每种类型有不同的字段集合。

### 视频详情 (video)

```toml
[detail.fields]
media_type = "video"

# 必需字段
title.steps = [{ css = "h1.title" }, { filter = "trim" }]

# 可选字段
cover.steps = [{ css = ".poster img" }, { attr = "src" }, { filter = "absolute_url" }]
intro.steps = [{ css = ".description" }, { filter = "trim" }]
director.steps = [{ css = ".info-director" }, { filter = "trim" }]
actors.steps = [{ css = ".info-actors" }, { filter = "trim" }]
category.steps = [{ css = ".info-type" }, { filter = "trim" }]
region.steps = [{ css = ".info-region" }, { filter = "trim" }]
year.steps = [{ css = ".info-year" }, { filter = "trim" }]
language.steps = [{ css = ".info-language" }, { filter = "trim" }]
duration.steps = [{ css = ".info-duration" }, { filter = "trim" }]
score.steps = [{ css = ".score em" }, { filter = "trim" }]
tags.steps = [{ css = ".tags a" }, { filter = "trim" }]
update_info.steps = [{ css = ".update-status" }, { filter = "trim" }]

# 播放线路（视频特有）
[detail.fields.play_lines]
lines.steps = [{ css = { selector = ".play-source", all = true } }]
line_name.steps = [{ css = ".source-name" }, { filter = "trim" }]

[detail.fields.play_lines.episodes]
list.steps = [{ css = { selector = ".episode-item", all = true } }]
name.steps = [{ css = "a" }, { filter = "trim" }]
url.steps = [{ css = "a" }, { attr = "href" }, { filter = "absolute_url" }]
```

#### 视频字段说明

| 字段 | 必需 | 说明 |
|------|------|------|
| `title` | ✅ | 片名 |
| `cover` | ❌ | 封面/海报图片 |
| `intro` | ❌ | 简介/剧情介绍 |
| `director` | ❌ | 导演 |
| `actors` | ❌ | 演员列表 |
| `category` | ❌ | 分类/类型 |
| `region` | ❌ | 地区 |
| `year` | ❌ | 年份 |
| `language` | ❌ | 语言 |
| `duration` | ❌ | 时长 |
| `score` | ❌ | 评分 |
| `tags` | ❌ | 标签列表 |
| `update_info` | ❌ | 更新信息/集数状态 |
| `play_lines` | ❌ | 播放线路列表 |

### 音频详情 (audio)

```toml
[detail.fields]
media_type = "audio"

# 必需字段
title.steps = [{ css = "h1.title" }, { filter = "trim" }]

# 可选字段
cover.steps = [{ css = ".album-cover img" }, { attr = "src" }, { filter = "absolute_url" }]
intro.steps = [{ css = ".description" }, { filter = "trim" }]
artist.steps = [{ css = ".artist-name" }, { filter = "trim" }]
album.steps = [{ css = ".album-name" }, { filter = "trim" }]
category.steps = [{ css = ".category" }, { filter = "trim" }]
tags.steps = [{ css = ".tags a" }, { filter = "trim" }]
play_count.steps = [{ css = ".play-count" }, { filter = "trim" }]
update_time.steps = [{ css = ".update-time" }, { filter = "trim" }]

# 音轨列表（音频特有）
[detail.fields.tracks]
list.steps = [{ css = { selector = ".track-item", all = true } }]
name.steps = [{ css = ".track-name" }, { filter = "trim" }]
url.steps = [{ css = "a" }, { attr = "href" }, { filter = "absolute_url" }]
duration.steps = [{ css = ".track-duration" }, { filter = "trim" }]
```

#### 音频字段说明

| 字段 | 必需 | 说明 |
|------|------|------|
| `title` | ✅ | 标题 |
| `cover` | ❌ | 封面 |
| `intro` | ❌ | 简介/描述 |
| `artist` | ❌ | 艺术家/作者 |
| `album` | ❌ | 专辑名 |
| `category` | ❌ | 分类 |
| `tags` | ❌ | 标签列表 |
| `play_count` | ❌ | 播放量 |
| `update_time` | ❌ | 更新时间 |
| `tracks` | ❌ | 音轨列表 |

### 书籍详情 (book)

```toml
[detail.fields]
media_type = "book"

# 必需字段
title.steps = [{ css = "h1.book-name" }, { filter = "trim" }]
author.steps = [{ css = ".author-name" }, { filter = "trim" }]

# 可选字段
cover.steps = [{ css = ".book-cover img" }, { attr = "src" }, { filter = "absolute_url" }]
intro.steps = [{ css = ".book-intro" }, { filter = "trim" }]
category.steps = [{ css = ".book-category" }, { filter = "trim" }]
tags.steps = [{ css = ".book-tags a" }, { filter = "trim" }]
status.steps = [{ css = ".book-status" }, { filter = "trim" }]
word_count.steps = [{ css = ".word-count" }, { filter = "trim" }]
update_time.steps = [{ css = ".update-time" }, { filter = "trim" }]
last_chapter.steps = [{ css = ".latest-chapter a" }, { filter = "trim" }]
toc_url.steps = [{ css = ".toc-link" }, { attr = "href" }, { filter = "absolute_url" }]

# 章节列表（书籍特有）
[detail.fields.chapters]
list.steps = [{ css = { selector = ".chapter-item", all = true } }]
title.steps = [{ css = "a" }, { filter = "trim" }]
url.steps = [{ css = "a" }, { attr = "href" }, { filter = "absolute_url" }]
```

#### 书籍字段说明

| 字段 | 必需 | 说明 |
|------|------|------|
| `title` | ✅ | 书名 |
| `author` | ✅ | 作者 |
| `cover` | ❌ | 封面图 URL |
| `intro` | ❌ | 简介/描述 |
| `category` | ❌ | 分类/类型 |
| `tags` | ❌ | 标签列表 |
| `status` | ❌ | 连载状态 |
| `word_count` | ❌ | 字数 |
| `update_time` | ❌ | 更新时间 |
| `last_chapter` | ❌ | 最新章节名 |
| `toc_url` | ❌ | 目录页 URL |
| `chapters` | ❌ | 章节列表 |

### 漫画详情 (manga)

```toml
[detail.fields]
media_type = "manga"

# 必需字段
title.steps = [{ css = "h1.manga-title" }, { filter = "trim" }]

# 可选字段
cover.steps = [{ css = ".manga-cover img" }, { attr = "src" }, { filter = "absolute_url" }]
intro.steps = [{ css = ".manga-intro" }, { filter = "trim" }]
author.steps = [{ css = ".manga-author" }, { filter = "trim" }]
category.steps = [{ css = ".manga-type" }, { filter = "trim" }]
tags.steps = [{ css = ".manga-tags a" }, { filter = "trim" }]
status.steps = [{ css = ".manga-status" }, { filter = "trim" }]
update_time.steps = [{ css = ".update-time" }, { filter = "trim" }]
last_chapter.steps = [{ css = ".latest-chapter" }, { filter = "trim" }]

# 章节列表（漫画特有）
[detail.fields.chapters]
list.steps = [{ css = { selector = ".chapter-item", all = true } }]
title.steps = [{ css = "a" }, { filter = "trim" }]
url.steps = [{ css = "a" }, { attr = "href" }, { filter = "absolute_url" }]
```

#### 漫画字段说明

| 字段 | 必需 | 说明 |
|------|------|------|
| `title` | ✅ | 漫画名 |
| `cover` | ❌ | 封面 |
| `intro` | ❌ | 简介/描述 |
| `author` | ❌ | 作者 |
| `category` | ❌ | 分类 |
| `tags` | ❌ | 标签列表 |
| `status` | ❌ | 连载状态 |
| `update_time` | ❌ | 更新时间 |
| `last_chapter` | ❌ | 最新章节 |
| `chapters` | ❌ | 章节列表 |

## 播放线路提取

视频类型支持多线路多集的提取。

### HTML 结构示例

```html
<div class="play-list">
    <div class="play-source" data-source="source1">
        <h3>线路一</h3>
        <ul class="episode-list">
            <li><a href="/play/1-1.html">第1集</a></li>
            <li><a href="/play/1-2.html">第2集</a></li>
        </ul>
    </div>
    <div class="play-source" data-source="source2">
        <h3>线路二</h3>
        <ul class="episode-list">
            <li><a href="/play/2-1.html">第1集</a></li>
            <li><a href="/play/2-2.html">第2集</a></li>
        </ul>
    </div>
</div>
```

### 提取规则

```toml
[detail.fields.play_lines]
# 选择所有线路
lines.steps = [{ css = { selector = ".play-source", all = true } }]

# 线路名称（相对于单个线路元素）
line_name.steps = [{ css = "h3" }, { filter = "trim" }]

# 剧集列表
[detail.fields.play_lines.episodes]
# 选择线路下的所有剧集
list.steps = [{ css = { selector = ".episode-list li", all = true } }]

# 剧集名称
name.steps = [{ css = "a" }, { filter = "trim" }]

# 剧集播放页 URL
url.steps = [{ css = "a" }, { attr = "href" }, { filter = "absolute_url" }]
```

## 章节列表提取

书籍和漫画支持章节列表提取。

### HTML 结构示例

```html
<div class="chapter-list">
    <div class="chapter-item">
        <a href="/read/1.html">第一章 开始</a>
    </div>
    <div class="chapter-item">
        <a href="/read/2.html">第二章 冒险</a>
    </div>
</div>
```

### 提取规则

```toml
[detail.fields.chapters]
# 章节列表容器
list.steps = [{ css = { selector = ".chapter-item", all = true } }]

# 章节标题
title.steps = [{ css = "a" }, { filter = "trim" }]

# 章节 URL
url.steps = [{ css = "a" }, { attr = "href" }, { filter = "absolute_url" }]
```

## 完整示例

### 视频站详情

```toml
[detail]
url = "{{ detail_url }}"
description = "获取视频详情"

[detail.fields]
media_type = "video"

title.steps = [
    { css = ".video-info h1" },
    { filter = "trim" }
]

cover.steps = [
    { css = ".video-poster img" },
    { attr = "src" },
    { filter = "absolute_url" }
]

intro.steps = [
    { css = ".video-desc" },
    { filter = "trim | strip_html" }
]
intro.nullable = true

director.steps = [
    { css = ".info-row:contains('导演') .info-value" },
    { filter = "trim" }
]
director.nullable = true

actors.steps = [
    { css = ".info-row:contains('主演') .info-value" },
    { filter = "trim" }
]
actors.nullable = true

category.steps = [
    { css = ".info-row:contains('类型') .info-value" },
    { filter = "trim" }
]
category.nullable = true

region.steps = [
    { css = ".info-row:contains('地区') .info-value" },
    { filter = "trim" }
]
region.nullable = true

year.steps = [
    { css = ".info-row:contains('年份') .info-value" },
    { filter = "trim" }
]
year.nullable = true

score.steps = [
    { css = ".video-score em" },
    { filter = "trim" }
]
score.nullable = true

update_info.steps = [
    { css = ".update-status" },
    { filter = "trim" }
]
update_info.nullable = true

[detail.fields.play_lines]
lines.steps = [{ css = { selector = ".play-tab-content", all = true } }]
line_name.steps = [{ css = ".tab-title" }, { filter = "trim" }]

[detail.fields.play_lines.episodes]
list.steps = [{ css = { selector = ".episode-link", all = true } }]
name.steps = [{ filter = "trim" }]
url.steps = [{ attr = "href" }, { filter = "absolute_url" }]
```

### 小说站详情

```toml
[detail]
url = "{{ detail_url }}"
description = "获取小说详情"

[detail.fields]
media_type = "book"

title.steps = [
    { css = ".book-info h1" },
    { filter = "trim" }
]

author.steps = [
    { css = ".book-author a" },
    { filter = "trim" }
]

cover.steps = [
    { css = ".book-cover img" },
    { attr = "src" },
    { filter = "absolute_url" }
]

intro.steps = [
    { css = ".book-intro" },
    { filter = "trim" }
]
intro.nullable = true

category.steps = [
    { css = ".book-category a" },
    { filter = "trim" }
]
category.nullable = true

status.steps = [
    { css = ".book-status" },
    { filter = "trim | replace('状态：', '')" }
]
status.nullable = true

word_count.steps = [
    { css = ".word-count" },
    { filter = "trim | replace('字数：', '')" }
]
word_count.nullable = true

update_time.steps = [
    { css = ".update-time" },
    { filter = "trim | replace('更新：', '')" }
]
update_time.nullable = true

last_chapter.steps = [
    { css = ".latest-chapter a" },
    { filter = "trim" }
]
last_chapter.nullable = true

[detail.fields.chapters]
list.steps = [{ css = { selector = "#chapter-list li", all = true } }]
title.steps = [{ css = "a" }, { filter = "trim" }]
url.steps = [{ css = "a" }, { attr = "href" }, { filter = "absolute_url" }]
```

## JSON 格式示例

```json
{
  "detail": {
    "url": "{{ detail_url }}",
    "description": "获取详情",
    "fields": {
      "media_type": "video",
      "title": {
        "steps": [
          { "css": "h1.title" },
          { "filter": "trim" }
        ]
      },
      "cover": {
        "steps": [
          { "css": ".poster img" },
          { "attr": "src" },
          { "filter": "absolute_url" }
        ]
      },
      "play_lines": {
        "lines": {
          "steps": [
            { "css": { "selector": ".play-source", "all": true } }
          ]
        },
        "line_name": {
          "steps": [
            { "css": ".source-name" },
            { "filter": "trim" }
          ]
        },
        "episodes": {
          "list": {
            "steps": [
              { "css": { "selector": ".episode", "all": true } }
            ]
          },
          "name": {
            "steps": [
              { "css": "a" },
              { "filter": "trim" }
            ]
          },
          "url": {
            "steps": [
              { "css": "a" },
              { "attr": "href" },
              { "filter": "absolute_url" }
            ]
          }
        }
      }
    }
  }
}
```

## 下一步

- ▶️ [内容流程](./content.md) - 解析播放/阅读资源
- 🔍 [发现流程](./discovery.md) - 分类浏览与筛选
