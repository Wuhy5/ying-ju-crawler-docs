# 影视规范

## 概述

影视规范用于电影、电视剧、综艺、纪录片等视频内容的数据采集。

## 媒体类型标识

```toml
[meta]
media_type = "video"
```

## 列表页字段

### 通用字段

继承自 [通用规范](../common-spec.md)：
- `title`: 标题
- `url`: 详情页 URL
- `cover`: 封面图 URL
- `description`: 简介
- `tags`: 标签数组

### 影视特定字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `video_type` | String | 否 | 视频类型：`"movie"` / `"tv"` / `"variety"` / `"documentary"` |
| `year` | String/Integer | 否 | 年份 |
| `rating` | Float | 否 | 评分（通常 0-10） |
| `region` | String | 否 | 地区/国家 |
| `language` | String | 否 | 语言 |
| `duration` | Integer | 否 | 时长（分钟） |
| `episode_count` | Integer | 否 | 总集数（电视剧） |
| `current_episode` | Integer | 否 | 当前更新到第几集 |
| `status` | String | 否 | 状态：`"ongoing"` / `"completed"` |

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

### 影视特定字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `video_type` | String | 是 | 视频类型 |
| `year` | String/Integer | 否 | 年份 |
| `rating` | Float | 否 | 评分 |
| `rating_count` | Integer | 否 | 评分人数 |
| `region` | String | 否 | 地区 |
| `language` | String | 否 | 语言 |
| `duration` | Integer | 否 | 单集时长（分钟） |
| `episode_count` | Integer | 否 | 总集数 |
| `status` | String | 否 | 状态 |
| `director` | String/Array[String] | 否 | 导演 |
| `actors` | Array[String] | 否 | 演员列表 |
| `genre` | Array[String] | 否 | 类型/流派 |
| `imdb_id` | String | 否 | IMDb ID |
| `douban_id` | String | 否 | 豆瓣 ID |

### 播放相关字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `play_lines` | Array[PlayLine] | 是 | 播放线路列表 |
| `download_links` | Array[DownloadLink] | 否 | 下载链接列表 |

#### PlayLine 对象

播放线路，包含多个播放源。

```toml
[[parse.detail.fields.play_lines]]
name = "线路一"
episodes = [
  { title = "第1集", url = "https://..." },
  { title = "第2集", url = "https://..." }
]
```

**结构**:
```toml
# 使用管道提取
play_lines = [
  # 返回结构如下的数组
  # [
  #   {
  #     "name": "线路名称",
  #     "episodes": [
  #       { "title": "第1集", "url": "播放地址" },
  #       ...
  #     ]
  #   },
  #   ...
  # ]
]
```

#### DownloadLink 对象

```toml
download_links = [
  # 返回结构如下的数组
  # [
  #   {
  #     "quality": "1080P",
  #     "format": "MP4",
  #     "size": "2.3GB",
  #     "url": "下载地址"
  #   },
  #   ...
  # ]
]
```

---

## 完整示例

```toml
# ===========================
# 元数据
# ===========================
[meta]
name = "示例影视网"
author = "张三"
version = "1.0.0"
domain = "video.example.com"
media_type = "video"
description = "示例影视数据源"
icon_url = "https://video.example.com/favicon.ico"

# ===========================
# HTTP 配置
# ===========================
[http]
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
timeout = 30

[http.headers]
Referer = "https://video.example.com/"

# ===========================
# 脚本配置
# ===========================
[scripting]
engine = "javascript"
source_dir = "scripts"

[scripting.files]
decoder = "video_decrypt.js"

# ===========================
# 搜索入口
# ===========================
[search]
entry_url_template = "https://{domain}/search?keyword={keyword}&page={page}"
method = "GET"
response_type = "html"

# ===========================
# 分类发现入口
# ===========================
[discover]
entry_url_template = "https://{domain}/category/{cate_id}?page={page}"
response_type = "html"

[[discover.categories]]
name = "电影"
id = "movie"

[[discover.categories]]
name = "电视剧"
id = "tv"

[[discover.categories]]
name = "综艺"
id = "variety"

# ===========================
# 解析规则
# ===========================
[parse]
  
  # 列表页解析
  [parse.list]
    item_selector = { type = "selector", query = "div.video-item" }
    
    [parse.list.fields]
      # 标题
      title = [
        { type = "selector", query = "h3.title a", extract = "text" }
      ]
      
      # 详情页 URL
      url = [
        { type = "selector", query = "h3.title a", extract = "attr:href" },
        { type = "string", operation = "prepend", prefix = "https://{domain}" }
      ]
      
      # 封面
      cover = [
        { type = "selector", query = "img.cover", extract = "attr:data-src" }
      ]
      
      # 视频类型
      video_type = [
        { type = "selector", query = "span.type", extract = "text" }
      ]
      
      # 年份
      year = [
        { type = "selector", query = "span.year", extract = "text" }
      ]
      
      # 评分
      rating = [
        { type = "selector", query = "span.rating", extract = "text" }
      ]
      
      # 地区
      region = [
        { type = "selector", query = "span.region", extract = "text" }
      ]
      
      # 状态和集数
      status = [
        { type = "selector", query = "span.status", extract = "text" }
      ]
      
      current_episode = [
        { type = "selector", query = "span.episode", extract = "text" },
        { type = "regex", query = "更新至(\\d+)集", group = 1 }
      ]

  # 详情页解析
  [parse.detail]
    
    [parse.detail.fields]
      # 标题
      title = [
        { type = "selector", query = "h1.detail-title", extract = "text" }
      ]
      
      # 封面
      cover = [
        { type = "selector", query = "div.poster img", extract = "attr:src" }
      ]
      
      # 详细描述
      description = [
        { type = "selector", query = "div.description", extract = "text" },
        { type = "string", operation = "trim" }
      ]
      
      # 视频类型
      video_type = [
        { type = "selector", query = "span.meta-type", extract = "text" }
      ]
      
      # 年份
      year = [
        { type = "selector", query = "span.meta-year", extract = "text" }
      ]
      
      # 评分
      rating = [
        { type = "selector", query = "span.rating-score", extract = "text" }
      ]
      
      # 导演
      director = [
        { type = "selector", query = "div.director a", extract = "text" }
      ]
      
      # 演员列表
      actors = [
        { type = "selector", query = "div.actors a" },
        {
          type = "transform",
          operation = "map",
          pipeline = [
            { type = "selector", query = "self", extract = "text" }
          ]
        }
      ]
      
      # 类型/流派
      genre = [
        { type = "selector", query = "div.genre a" },
        {
          type = "transform",
          operation = "map",
          pipeline = [
            { type = "selector", query = "self", extract = "text" }
          ]
        }
      ]
      
      # 地区
      region = [
        { type = "selector", query = "span.meta-region", extract = "text" }
      ]
      
      # 语言
      language = [
        { type = "selector", query = "span.meta-language", extract = "text" }
      ]
      
      # 总集数
      episode_count = [
        { type = "selector", query = "span.meta-episodes", extract = "text" }
      ]
      
      # 状态
      status = [
        { type = "selector", query = "span.meta-status", extract = "text" }
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
      
      # 播放线路（复杂示例：需要解密）
      play_lines = [
        # 1. 获取加密的播放数据
        { type = "selector", query = "div#player-data", extract = "attr:data-enc" },
        # 2. 调用脚本解密
        { type = "script", call = "decoder.decrypt" },
        # 3. 解密后是 JSON 格式，包含播放线路
        # 返回格式:
        # [
        #   {
        #     "name": "线路一",
        #     "episodes": [
        #       { "title": "第1集", "url": "https://..." },
        #       { "title": "第2集", "url": "https://..." }
        #     ]
        #   }
        # ]
      ]
```

---

## 字段说明补充

### `video_type` 值规范

| 值 | 含义 |
|----|------|
| `"movie"` | 电影 |
| `"tv"` | 电视剧 |
| `"variety"` | 综艺 |
| `"documentary"` | 纪录片 |
| `"anime"` | 动漫 |

### `status` 值规范

| 值 | 含义 |
|----|------|
| `"ongoing"` | 连载中 |
| `"completed"` | 已完结 |

### 播放线路数据结构

播放线路应返回以下结构的 JSON：

```json
[
  {
    "name": "线路名称",
    "episodes": [
      {
        "title": "集数标题",
        "url": "播放地址"
      }
    ]
  }
]
```

对于电影（单集），可以简化为：

```json
[
  {
    "name": "播放源1",
    "episodes": [
      {
        "title": "正片",
        "url": "播放地址"
      }
    ]
  }
]
```

---

## 下一步

- 查看 [音频规范](./audio.md) 了解音频媒体类型
- 参考 [影视示例](../examples/video-example.toml) 查看完整配置
