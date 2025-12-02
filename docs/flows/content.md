# 内容流程

内容流程（ContentFlow）用于解析实际的播放/阅读资源，是规则的可选部分。

## 基本结构

```toml
[content]
url = "{{ content_url }}"
description = "解析播放地址"

[content.fields]
media_type = "video"
media_url.steps = [
    { css = "script:contains('player_data')" },
    { regex = "url\":\"([^\"]+)\"" }
]
```

## URL 模板

内容页 URL 使用 `{{ content_url }}` 变量，来自详情流程的播放线路或章节列表。

```toml
# 直接使用
url = "{{ content_url }}"

# 需要处理时
url = "{{ content_url | replace('/detail/', '/play/') }}"
```

## 字段定义

内容字段根据媒体类型不同而有所区别。

### 视频内容 (video)

```toml
[content.fields]
media_type = "video"

# 视频播放地址（必需）
media_url.steps = [
    { css = "script:contains('player')" },
    { regex = "url['\"]?\\s*[:=]\\s*['\"]([^'\"]+)['\"]" }
]

# 视频类型
video_type.steps = [{ const = "m3u8" }]
video_type.nullable = true

# 标题（当前剧集）
title.steps = [{ css = ".player-title" }, { filter = "trim" }]
title.nullable = true

# 下一集 URL
next_url.steps = [
    { css = ".next-episode a" },
    { attr = "href" },
    { filter = "absolute_url" }
]
next_url.nullable = true

# 字幕文件 URL
subtitle_url.steps = [
    { css = "script:contains('subtitle')" },
    { regex = "subtitle['\"]?\\s*[:=]\\s*['\"]([^'\"]+)['\"]" }
]
subtitle_url.nullable = true
```

#### 视频内容字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `media_url` | ✅ | 视频播放地址 |
| `video_type` | ❌ | 视频类型（m3u8, mp4, flv 等） |
| `title` | ❌ | 当前剧集标题 |
| `next_url` | ❌ | 下一集页面 URL |
| `subtitle_url` | ❌ | 字幕文件 URL |

### 音频内容 (audio)

```toml
[content.fields]
media_type = "audio"

# 音频播放地址（必需）
media_url.steps = [
    { json = "$.data.src" }
]

# 音频类型
audio_type.steps = [{ const = "mp3" }]
audio_type.nullable = true

# 标题
title.steps = [{ json = "$.data.title" }]
title.nullable = true

# 时长
duration.steps = [{ json = "$.data.duration" }]
duration.nullable = true

# 下一曲 URL
next_url.steps = [
    { css = ".next-track a" },
    { attr = "href" },
    { filter = "absolute_url" }
]
next_url.nullable = true

# 歌词 URL
lyrics_url.steps = [{ json = "$.data.lrc" }]
lyrics_url.nullable = true
```

#### 音频内容字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `media_url` | ✅ | 音频播放地址 |
| `audio_type` | ❌ | 音频类型（mp3, aac 等） |
| `title` | ❌ | 当前音轨标题 |
| `duration` | ❌ | 音频时长 |
| `next_url` | ❌ | 下一曲页面 URL |
| `lyrics_url` | ❌ | 歌词文件 URL |

### 书籍内容 (book)

```toml
[content.fields]
media_type = "book"

# 章节正文（必需）
body.steps = [
    { css = "#chapter-content" },
    { filter = "strip_html | trim" }
]

# 章节标题
title.steps = [{ css = "h1.chapter-title" }, { filter = "trim" }]
title.nullable = true

# 上一章 URL
prev_url.steps = [
    { css = ".prev-chapter a" },
    { attr = "href" },
    { filter = "absolute_url" }
]
prev_url.nullable = true

# 下一章 URL
next_url.steps = [
    { css = ".next-chapter a" },
    { attr = "href" },
    { filter = "absolute_url" }
]
next_url.nullable = true
```

#### 书籍内容字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `body` | ✅ | 章节正文内容 |
| `title` | ❌ | 章节标题 |
| `prev_url` | ❌ | 上一章页面 URL |
| `next_url` | ❌ | 下一章页面 URL |

### 漫画内容 (manga)

```toml
[content.fields]
media_type = "manga"

# 图片列表（必需）
images.steps = [
    { css = { selector = ".manga-images img", all = true } },
    { attr = "data-src" },
    { filter = "absolute_url" }
]

# 章节标题
title.steps = [{ css = "h1.chapter-title" }, { filter = "trim" }]
title.nullable = true

# 上一章 URL
prev_url.steps = [
    { css = ".prev-chapter a" },
    { attr = "href" },
    { filter = "absolute_url" }
]
prev_url.nullable = true

# 下一章 URL
next_url.steps = [
    { css = ".next-chapter a" },
    { attr = "href" },
    { filter = "absolute_url" }
]
next_url.nullable = true
```

#### 漫画内容字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `images` | ✅ | 漫画图片 URL 列表 |
| `title` | ❌ | 章节标题 |
| `prev_url` | ❌ | 上一章页面 URL |
| `next_url` | ❌ | 下一章页面 URL |

## 资源解析技巧

### 从 JavaScript 变量提取

很多网站将播放地址存储在 JavaScript 变量中：

```html
<script>
var player_data = {
    "url": "https://example.com/video.m3u8",
    "type": "hls"
};
</script>
```

提取方式：

```toml
media_url.steps = [
    { css = "script:contains('player_data')" },
    { regex = "url[\"']\\s*:\\s*[\"']([^\"']+)[\"']" }
]
```

### 从 JSON 配置提取

```html
<script>
window.__INITIAL_STATE__ = {"videoUrl":"https://example.com/video.mp4"};
</script>
```

提取方式：

```toml
media_url.steps = [
    { css = "script:contains('__INITIAL_STATE__')" },
    { regex = "__INITIAL_STATE__\\s*=\\s*(\\{[^;]+\\})" },
    { json = "$.videoUrl" }
]
```

### Base64 解码

某些网站会对地址进行 Base64 编码：

```toml
media_url.steps = [
    { css = "#player" },
    { attr = "data-url" },
    { filter = "base64_decode" }
]
```

### 使用脚本解析

复杂的加密需要使用脚本解析：

```toml
media_url.steps = [
    { css = "script:contains('encrypted')" },
    { regex = "var encrypted = \"([^\"]+)\"" },
    { script = "decrypt_url" }
]
```

## 完整示例

### 视频播放解析

```toml
[content]
url = "{{ content_url }}"
description = "解析视频播放地址"

[content.fields]
media_type = "video"

# 播放地址 - 从 player_aaaa 变量提取
media_url.steps = [
    { css = "script:contains('player_aaaa')" },
    { regex = "url[\"']\\s*:\\s*[\"']([^\"']+)[\"']" }
]
media_url.fallback = [
    # 备用：从 iframe 提取
    [
        { css = "iframe#player" },
        { attr = "src" },
        { regex = "url=([^&]+)" },
        { filter = "url_decode" }
    ],
    # 备用：从 data 属性提取
    [
        { css = "#player" },
        { attr = "data-video" }
    ]
]

# 视频类型
video_type.steps = [
    { css = "script:contains('player_aaaa')" },
    { regex = "type[\"']\\s*:\\s*[\"']([^\"']+)[\"']" }
]
video_type.default = "m3u8"

# 当前剧集标题
title.steps = [
    { css = ".player-episode-title" },
    { filter = "trim" }
]
title.nullable = true

# 下一集
next_url.steps = [
    { css = ".player-next a" },
    { attr = "href" },
    { filter = "absolute_url" }
]
next_url.nullable = true
```

### 小说阅读解析

```toml
[content]
url = "{{ content_url }}"
description = "获取章节内容"

[content.fields]
media_type = "book"

# 章节正文
body.steps = [
    { css = "#chapter-content" },
    { filter = "strip_html" },
    { filter = "regex_replace('<br\\s*/?>', '\\n')" },
    { filter = "trim" }
]

# 章节标题
title.steps = [
    { css = "h1.chapter-title" },
    { filter = "trim" }
]
title.nullable = true

# 上一章
prev_url.steps = [
    { css = "#prev-chapter" },
    { attr = "href" },
    { filter = "absolute_url" }
]
prev_url.nullable = true

# 下一章
next_url.steps = [
    { css = "#next-chapter" },
    { attr = "href" },
    { filter = "absolute_url" }
]
next_url.nullable = true
```

### 漫画阅读解析

```toml
[content]
url = "{{ content_url }}"
description = "获取漫画图片"

[content.fields]
media_type = "manga"

# 图片列表 - 从 JavaScript 数组提取
images.steps = [
    { css = "script:contains('chapterImages')" },
    { regex = "chapterImages\\s*=\\s*\\[([^\\]]+)\\]" },
    { regex = { pattern = "\"([^\"]+)\"", all = true } }
]
images.fallback = [
    # 备用：从 img 标签提取
    [
        { css = { selector = ".manga-page img", all = true } },
        { attr = "data-src" }
    ]
]

# 章节标题
title.steps = [
    { css = ".chapter-title" },
    { filter = "trim" }
]
title.nullable = true

# 上一章
prev_url.steps = [
    { css = ".chapter-nav .prev a" },
    { attr = "href" },
    { filter = "absolute_url" }
]
prev_url.nullable = true

# 下一章
next_url.steps = [
    { css = ".chapter-nav .next a" },
    { attr = "href" },
    { filter = "absolute_url" }
]
next_url.nullable = true
```

### 音频播放解析

```toml
[content]
url = "{{ content_url }}"
description = "获取音频播放地址"

[content.fields]
media_type = "audio"

# 音频地址 - 从 API 响应提取
media_url.steps = [
    { json = "$.data.playUrl" }
]

# 音频类型
audio_type.steps = [
    { json = "$.data.format" }
]
audio_type.default = "mp3"

# 当前曲目标题
title.steps = [
    { json = "$.data.title" }
]
title.nullable = true

# 时长
duration.steps = [
    { json = "$.data.duration" }
]
duration.nullable = true

# 下一曲
next_url.steps = [
    { json = "$.data.nextUrl" }
]
next_url.nullable = true

# 歌词
lyrics_url.steps = [
    { json = "$.data.lrcUrl" }
]
lyrics_url.nullable = true
```

## JSON 格式示例

```json
{
  "content": {
    "url": "{{ content_url }}",
    "description": "解析播放地址",
    "fields": {
      "media_type": "video",
      "media_url": {
        "steps": [
          { "css": "script:contains('player')" },
          { "regex": "url[\"']\\s*:\\s*[\"']([^\"']+)[\"']" }
        ],
        "fallback": [
          [
            { "css": "#player" },
            { "attr": "data-url" }
          ]
        ]
      },
      "video_type": {
        "steps": [
          { "const": "m3u8" }
        ]
      },
      "next_url": {
        "steps": [
          { "css": ".next a" },
          { "attr": "href" },
          { "filter": "absolute_url" }
        ],
        "nullable": true
      }
    }
  }
}
```

## 常见问题

### 1. 播放地址被加密

使用脚本解密或查找其他提取方式：

```toml
media_url.steps = [
    { css = "script:contains('encrypt')" },
    { regex = "encrypt\\(\"([^\"]+)\"\\)" },
    { script = "custom_decrypt" }
]
```

### 2. 图片防盗链

配置 HTTP Referer：

```toml
[http]
headers = { "Referer" = "https://example.com/" }
```

### 3. 内容分页加载

需要处理分页的内容（如长图漫画）：

```toml
images.steps = [
    { css = { selector = ".page-image", all = true } },
    { attr = "data-src" },
    { filter = "absolute_url" }
]
# 结合分页逻辑处理
```

## 下一步

- 🔐 [登录流程](./login.md) - 处理用户认证
- 📖 [参考文档](../reference/steps.md) - 完整步骤参考
