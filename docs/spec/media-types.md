# 媒体类型

## 媒体类型概述

媒体爬虫规范支持四种主要媒体类型，每种类型都有对应的数据模型和处理特点：

- **video**：视频内容（电影、电视剧、动漫等）
- **audio**：音频内容（音乐、播客、有声书等）
- **book**：图书内容（电子书、实体书等）
- **manga**：漫画内容（在线漫画、图画小说等）

## 视频类型 (video)

### 适用场景

视频类型适用于所有以视频为主要内容的网站，包括：
- 视频分享平台（YouTube、哔哩哔哩等）
- 影视网站（Netflix、爱奇艺等）
- 动漫平台
- 教育视频网站

### 数据模型

视频类型的数据结构包含：

#### 列表数据 (item_summary)
```json
{
  "id": "唯一标识符",
  "title": "视频标题",
  "url": "播放页面URL",
  "media_type": "video",
  "cover": "封面图片URL",
  "summary": "简介文字",
  "tags": ["标签1", "标签2"],
  "meta": {
    "duration": "时长（秒）",
    "resolution": "分辨率",
    "bitrate": "码率"
  }
}
```

#### 详情数据 (item_detail)
```json
{
  "id": "唯一标识符",
  "title": "视频标题",
  "url": "播放页面URL",
  "media_type": "video",
  "cover": "封面图片URL",
  "description": "详细描述",
  "metadata": {
    "director": "导演",
    "actors": ["演员1", "演员2"],
    "genre": "类型",
    "release_date": "发布日期",
    "duration": 7200,
    "language": "语言"
  },
  "tags": ["标签1", "标签2"],
  "content": {
    "video_url": "实际播放地址",
    "subtitles": ["字幕文件URL"],
    "chapters": [
      {"title": "章节名", "start_time": 0}
    ]
  }
}
```

### 配置示例

```toml
[meta]
name = "示例视频站"
media_type = "video"

[flows.get_detail]
output_model = "item_detail"

[flows.get_detail.actions]
# 提取视频详情的步骤...
```

## 音频类型 (audio)

### 适用场景

音频类型适用于音乐、播客等音频内容：
- 音乐流媒体平台（Spotify、网易云音乐）
- 播客平台
- 有声书网站
- 音频分享社区

### 数据模型

#### 列表数据
```json
{
  "id": "音频ID",
  "title": "音频标题",
  "url": "播放页面URL",
  "media_type": "audio",
  "cover": "封面图片URL",
  "summary": "简介",
  "tags": ["音乐", "流行"],
  "meta": {
    "duration": "时长（秒）",
    "bitrate": "码率",
    "format": "音频格式"
  }
}
```

#### 详情数据
```json
{
  "id": "音频ID",
  "title": "音频标题",
  "url": "播放页面URL",
  "media_type": "audio",
  "cover": "封面图片URL",
  "description": "详细介绍",
  "metadata": {
    "artist": "艺术家",
    "album": "专辑名",
    "genre": "流派",
    "release_date": "发布日期",
    "duration": 240,
    "language": "语言"
  },
  "tags": ["标签"],
  "content": {
    "audio_url": "音频文件URL",
    "lyrics": "歌词文本"
  }
}
```

## 图书类型 (book)

### 适用场景

图书类型适用于各种出版物：
- 电子书平台（Kindle、微信读书）
- 图书馆系统
- 学术论文数据库
- 漫画书店（非连续出版）

### 数据模型

#### 列表数据
```json
{
  "id": "图书ID",
  "title": "书名",
  "url": "详情页面URL",
  "media_type": "book",
  "cover": "封面图片URL",
  "summary": "内容简介",
  "tags": ["小说", "文学"],
  "meta": {
    "pages": "页数",
    "isbn": "ISBN编号",
    "format": "电子书/实体书"
  }
}
```

#### 详情数据
```json
{
  "id": "图书ID",
  "title": "书名",
  "url": "详情页面URL",
  "media_type": "book",
  "cover": "封面图片URL",
  "description": "详细介绍",
  "metadata": {
    "author": "作者",
    "publisher": "出版社",
    "isbn": "ISBN",
    "pages": 300,
    "language": "语言",
    "publication_date": "出版日期"
  },
  "tags": ["标签"],
  "content": {
    "download_url": "下载地址",
    "sample_pages": ["样章URL"]
  }
}
```

## 漫画类型 (manga)

### 适用场景

漫画类型专门用于连续出版的漫画作品：
- 在线漫画平台
- 漫画杂志
- 图画小说
- 网络连载漫画

### 数据模型

#### 列表数据
```json
{
  "id": "漫画ID",
  "title": "漫画标题",
  "url": "详情页面URL",
  "media_type": "manga",
  "cover": "封面图片URL",
  "summary": "剧情简介",
  "tags": ["少年漫画", "热血"],
  "meta": {
    "chapters": "章节数",
    "status": "连载状态",
    "last_update": "最后更新时间"
  }
}
```

#### 详情数据
```json
{
  "id": "漫画ID",
  "title": "漫画标题",
  "url": "详情页面URL",
  "media_type": "manga",
  "cover": "封面图片URL",
  "description": "详细剧情介绍",
  "metadata": {
    "author": "作者",
    "artist": "作画",
    "genre": "类型",
    "status": "连载/完结",
    "chapters": 100,
    "language": "语言"
  },
  "tags": ["标签"],
  "content": {
    "chapters": [
      {
        "number": 1,
        "title": "章节标题",
        "pages": ["图片URL1", "图片URL2"]
      }
    ]
  }
}
```

## 媒体类型选择指南

### 如何选择媒体类型

1. **主要内容类型**：根据网站主要提供的内容选择
2. **数据结构匹配**：选择最匹配的数据模型
3. **用户界面适配**：不同类型有不同的展示界面

### 类型转换

如果网站内容混合多种类型，可以：
- 创建多个规则文件，每个对应一种类型
- 使用脚本进行内容分类
- 选择主要类型，次要类型作为扩展字段

### 自定义扩展

对于特殊需求，可以在 `metadata` 和 `content` 字段中添加自定义数据，但应尽量使用标准字段以保持兼容性。