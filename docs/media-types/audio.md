# 音频规范

## 概述

音频规范用于音乐、播客、有声书、电台等音频内容的数据采集。

## 媒体类型标识

```toml
[meta]
media_type = "audio"
```

## 列表页字段

### 通用字段

继承自 [通用规范](../common-spec.md)：
- `title`: 标题
- `url`: 详情页 URL
- `cover`: 封面图 URL
- `description`: 简介
- `tags`: 标签数组

### 音频特定字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `audio_type` | String | 否 | 音频类型：`"music"` / `"podcast"` / `"audiobook"` / `"radio"` |
| `artist` | String/Array[String] | 否 | 艺术家/演唱者 |
| `album` | String | 否 | 专辑名称 |
| `duration` | Integer | 否 | 时长（秒） |
| `release_date` | String | 否 | 发行日期 |
| `track_count` | Integer | 否 | 曲目数量 |

---

## 详情页字段

### 通用字段

继承自 [通用规范](../common-spec.md)：
- `title`: 完整标题
- `cover`: 高清封面
- `description`: 详细描述
- `tags`: 标签数组
- `publish_date`: 发布日期
- `update_date`: 更新日期

### 音频特定字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `audio_type` | String | 是 | 音频类型 |
| `artist` | String/Array[String] | 否 | 艺术家 |
| `album` | String | 否 | 专辑 |
| `duration` | Integer | 否 | 总时长（秒） |
| `release_date` | String | 否 | 发行日期 |
| `publisher` | String | 否 | 发行商/出版社 |
| `genre` | Array[String] | 否 | 流派/类型 |
| `language` | String | 否 | 语言 |
| `isrc` | String | 否 | ISRC 码（音乐） |
| `isbn` | String | 否 | ISBN 码（有声书） |

### 播放相关字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `tracks` | Array[Track] | 是 | 曲目/章节列表 |
| `audio_quality` | Array[Quality] | 否 | 可用音质列表 |
| `lyrics` | String | 否 | 歌词（音乐） |

#### Track 对象

曲目或章节信息。

```toml
# 返回结构
# [
#   {
#     "title": "曲目标题",
#     "duration": 180,  # 秒
#     "url": "播放地址",
#     "track_number": 1
#   },
#   ...
# ]
```

#### Quality 对象

音质选项。

```toml
# 返回结构
# [
#   {
#     "quality": "无损",
#     "format": "FLAC",
#     "bitrate": "1411kbps",
#     "size": "45.2MB",
#     "url": "播放地址"
#   },
#   ...
# ]
```

---

## 完整示例

```toml
# ===========================
# 元数据
# ===========================
[meta]
name = "示例音乐网"
author = "李四"
version = "1.0.0"
domain = "music.example.com"
media_type = "audio"
description = "示例音乐数据源"
icon_url = "https://music.example.com/favicon.ico"

# ===========================
# HTTP 配置
# ===========================
[http]
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
timeout = 30

[http.headers]
Referer = "https://music.example.com/"

# ===========================
# 搜索入口
# ===========================
[search]
entry_url_template = "https://{domain}/api/search?keyword={keyword}&page={page}"
method = "GET"
response_type = "json"

# ===========================
# 分类发现
# ===========================
[discover]
entry_url_template = "https://{domain}/category/{cate_id}?page={page}"
response_type = "html"

[[discover.categories]]
name = "流行"
id = "pop"

[[discover.categories]]
name = "摇滚"
id = "rock"

[[discover.categories]]
name = "古典"
id = "classical"

[[discover.categories]]
name = "播客"
id = "podcast"

# ===========================
# 解析规则
# ===========================
[parse]
  
  # 列表页解析
  [parse.list]
    # JSON 格式
    item_selector = { type = "jsonpath", query = "$.data.items[*]" }
    
    [parse.list.fields]
      # 标题
      title = [
        { type = "jsonpath", query = "$.name" }
      ]
      
      # 详情页 URL
      url = [
        { type = "jsonpath", query = "$.id" },
        { type = "string", operation = "format", template = "https://{domain}/song/{input}" }
      ]
      
      # 封面
      cover = [
        { type = "jsonpath", query = "$.cover_url" }
      ]
      
      # 艺术家
      artist = [
        { type = "jsonpath", query = "$.artists[*].name" },
        { type = "string", operation = "join", delimiter = " / " }
      ]
      
      # 专辑
      album = [
        { type = "jsonpath", query = "$.album.name" }
      ]
      
      # 时长
      duration = [
        { type = "jsonpath", query = "$.duration" }
      ]
      
      # 音频类型
      audio_type = [
        { type = "jsonpath", query = "$.type" }
      ]

  # 详情页解析
  [parse.detail]
    
    [parse.detail.fields]
      # 标题
      title = [
        { type = "selector", query = "h1.song-title", extract = "text" }
      ]
      
      # 封面
      cover = [
        { type = "selector", query = "img.cover", extract = "attr:src" }
      ]
      
      # 描述
      description = [
        { type = "selector", query = "div.description", extract = "text" }
      ]
      
      # 艺术家
      artist = [
        { type = "selector", query = "div.artists a" },
        {
          type = "transform",
          operation = "map",
          pipeline = [
            { type = "selector", query = "self", extract = "text" }
          ]
        }
      ]
      
      # 专辑
      album = [
        { type = "selector", query = "div.album a", extract = "text" }
      ]
      
      # 时长
      duration = [
        { type = "selector", query = "span.duration", extract = "text" },
        { type = "regex", query = "(\\d+):(\\d+)" },  # 转换为秒数的脚本
      ]
      
      # 发行日期
      release_date = [
        { type = "selector", query = "span.release-date", extract = "text" }
      ]
      
      # 流派
      genre = [
        { type = "selector", query = "div.genre span" },
        {
          type = "transform",
          operation = "map",
          pipeline = [
            { type = "selector", query = "self", extract = "text" }
          ]
        }
      ]
      
      # 标签
      tags = [
        { type = "selector", query = "div.tags a" },
        {
          type = "transform",
          operation = "map",
          pipeline = [
            { type = "selector", query = "self", extract = "text" }
          ]
        }
      ]
      
      # 曲目列表（对于单曲，只有一个）
      tracks = [
        { type = "selector", query = "div#play-data", extract = "attr:data-track-id" },
        { type = "http_request", url_template = "https://{domain}/api/track/{input}", response_type = "json" },
        { type = "jsonpath", query = "$.data" }
        # 返回格式:
        # {
        #   "title": "歌曲名",
        #   "duration": 240,
        #   "url": "https://...",
        #   "track_number": 1
        # }
      ]
      
      # 音质选项
      audio_quality = [
        { type = "selector", query = "div#play-data", extract = "attr:data-track-id" },
        { type = "http_request", url_template = "https://{domain}/api/quality/{input}", response_type = "json" },
        { type = "jsonpath", query = "$.data.qualities[*]" }
        # 返回格式:
        # [
        #   {
        #     "quality": "标准",
        #     "format": "MP3",
        #     "bitrate": "128kbps",
        #     "url": "https://..."
        #   },
        #   {
        #     "quality": "高品质",
        #     "format": "MP3",
        #     "bitrate": "320kbps",
        #     "url": "https://..."
        #   },
        #   {
        #     "quality": "无损",
        #     "format": "FLAC",
        #     "bitrate": "1411kbps",
        #     "url": "https://..."
        #   }
        # ]
      ]
      
      # 歌词
      lyrics = [
        { type = "selector", query = "div#play-data", extract = "attr:data-track-id" },
        { type = "http_request", url_template = "https://{domain}/api/lyrics/{input}", response_type = "json" },
        { type = "jsonpath", query = "$.data.lyrics" }
      ]
```

---

## 字段说明补充

### `audio_type` 值规范

| 值 | 含义 |
|----|------|
| `"music"` | 音乐 |
| `"podcast"` | 播客 |
| `"audiobook"` | 有声书 |
| `"radio"` | 电台/广播 |

### 曲目数据结构

单曲：
```json
[
  {
    "title": "歌曲名",
    "duration": 240,
    "url": "播放地址",
    "track_number": 1
  }
]
```

专辑/播客：
```json
[
  {
    "title": "第1首/第1期",
    "duration": 180,
    "url": "播放地址",
    "track_number": 1
  },
  {
    "title": "第2首/第2期",
    "duration": 200,
    "url": "播放地址",
    "track_number": 2
  }
]
```

### 音质数据结构

```json
[
  {
    "quality": "标准",
    "format": "MP3",
    "bitrate": "128kbps",
    "size": "4.5MB",
    "url": "播放地址"
  },
  {
    "quality": "高品质",
    "format": "MP3",
    "bitrate": "320kbps",
    "size": "11.2MB",
    "url": "播放地址"
  },
  {
    "quality": "无损",
    "format": "FLAC",
    "bitrate": "1411kbps",
    "size": "45.6MB",
    "url": "播放地址"
  }
]
```

---

## 下一步

- 查看 [图书规范](./book.md) 了解图书媒体类型
- 参考 [音频示例](../examples/audio-example.toml) 查看完整配置
