# 字段映射

## 映射的概念

字段映射是将解析层的数据转换为标准渲染层数据模型的过程。通过字段映射，可以将不同网站的数据格式统一为规范定义的标准格式。

## 映射类型

### 直接映射

最简单的映射方式，直接将源字段赋值给目标字段：

```toml
[flows.parse_data.actions]
- type = "map_field"
  input = "{{parsed_data}}"
  target = "item_summary"
  mappings = [
    { from = "title", to = "title" },
    { from = "link", to = "url" },
    { from = "image", to = "cover" }
  ]
  output = "result"
```

### 嵌套字段映射

处理嵌套对象中的字段：

```toml
mappings = [
  { from = "video.title", to = "title" },
  { from = "video.url", to = "url" },
  { from = "video.thumbnail", to = "cover" },
  { from = "meta.duration", to = "metadata.duration" }
]
```

### 数组字段映射

处理数组类型的数据：

```toml
mappings = [
  { from = "tags[]", to = "tags" },
  { from = "actors[]", to = "metadata.actors" }
]
```

## 目标数据模型

### item_summary (列表摘要)

用于搜索结果、分类列表等场景：

```json
{
  "id": "唯一标识符",
  "title": "标题",
  "url": "详情页面URL",
  "media_type": "媒体类型",
  "cover": "封面图片URL（可选）",
  "summary": "简介文字（可选）",
  "tags": ["标签数组（可选）"],
  "meta": {
    "duration": "时长（视频/音频）",
    "pages": "页数（图书）",
    "chapters": "章节数（漫画）"
  }
}
```

### item_detail (详情数据)

用于详情页面展示：

```json
{
  "id": "唯一标识符",
  "title": "标题",
  "url": "详情页面URL",
  "media_type": "媒体类型",
  "cover": "封面图片URL",
  "description": "详细描述",
  "metadata": {
    "director": "导演（视频）",
    "author": "作者（图书）",
    "artist": "作画（漫画）",
    "duration": "时长",
    "language": "语言",
    "release_date": "发布日期"
  },
  "tags": ["标签数组"],
  "content": {
    "video_url": "播放地址（视频）",
    "audio_url": "音频地址（音频）",
    "download_url": "下载地址（图书）",
    "chapters": "章节列表（漫画）"
  }
}
```

## 转换函数

### 内置转换函数

```toml
mappings = [
  { from = "title", to = "title", transform = "trim" },
  { from = "price", to = "metadata.price", transform = "parse_float" },
  { from = "date", to = "metadata.release_date", transform = "parse_date" }
]
```

支持的转换函数：
- `trim`：去除空白字符
- `lowercase`：转换为小写
- `uppercase`：转换为大写
- `parse_int`：转换为整数
- `parse_float`：转换为浮点数
- `parse_date`：解析日期字符串

### 自定义转换

使用脚本实现复杂的转换逻辑：

```toml
[scripting.modules.transform]
code = """
fn format_duration(seconds: i64) -> string {
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    let secs = seconds % 60;
    format!("{}:{:02}:{:02}", hours, minutes, secs)
}

fn clean_html_tags(text: string) -> string {
    regex_replace(text, r"<[^>]*>", "")
}
"""

[flows.parse_data.actions]
- type = "script"
  call = "transform.format_duration"
  with = { seconds = "{{raw_duration}}" }
  output = "formatted_duration"

- type = "script"
  call = "transform.clean_html_tags"
  with = { text = "{{raw_description}}" }
  output = "clean_description"

- type = "map_field"
  input = "{{parsed_data}}"
  target = "item_detail"
  mappings = [
    { from = "{{formatted_duration}}", to = "metadata.duration" },
    { from = "{{clean_description}}", to = "description" }
  ]
  output = "result"
```

## 映射验证

### 必填字段检查

```toml
[flows.parse_data.actions]
- type = "map_field"
  input = "{{parsed_data}}"
  target = "item_summary"
  mappings = [
    { from = "title", to = "title", required = true },
    { from = "url", to = "url", required = true },
    { from = "image", to = "cover" }
  ]
  output = "result"
```

### 类型验证

映射时自动进行类型检查：

```toml
mappings = [
  { from = "id", to = "id", type = "string" },
  { from = "view_count", to = "metadata.views", type = "integer" },
  { from = "rating", to = "metadata.rating", type = "float" },
  { from = "is_active", to = "metadata.active", type = "boolean" }
]
```

## 高级映射技巧

### 条件映射

基于条件进行映射：

```toml
[scripting.modules.conditional]
code = """
fn map_based_on_type(data: map, item_type: string) -> map {
    let result = #{};

    if item_type == "video" {
        result.title = data.video_title;
        result.url = data.video_url;
    } else if item_type == "book" {
        result.title = data.book_title;
        result.url = data.book_url;
    }

    result
}
"""

[flows.parse_data.actions]
- type = "script"
  call = "conditional.map_based_on_type"
  with = { data = "{{raw_data}}", item_type = "{{item_type}}" }
  output = "mapped_data"

- type = "map_field"
  input = "{{mapped_data}}"
  target = "item_summary"
  mappings = [
    { from = "title", to = "title" },
    { from = "url", to = "url" }
  ]
  output = "result"
```

### 批量映射

处理数组数据的映射：

```toml
[flows.parse_list.actions]
- type = "loop_for_each"
  input = "{{raw_items}}"
  as = "raw_item"
  pipeline = [
    { type = "map_field", input = "{{raw_item}}", target = "item_summary", mappings = [
      { from = "name", to = "title" },
      { from = "link", to = "url" },
      { from = "thumb", to = "cover" }
    ], output = "mapped_item" }
  ]
  output = "mapped_items"
```

### 合并映射

将多个数据源合并映射：

```toml
[flows.merge_data.actions]
- type = "script"
  call = "utils.merge_objects"
  with = { obj1 = "{{basic_info}}", obj2 = "{{extra_info}}" }
  output = "merged_data"

- type = "map_field"
  input = "{{merged_data}}"
  target = "item_detail"
  mappings = [
    { from = "title", to = "title" },
    { from = "description", to = "description" },
    { from = "basic.url", to = "url" },
    { from = "extra.cover", to = "cover" }
  ]
  output = "result"
```

## 映射模板

### 视频数据映射模板

```toml
[flows.map_video.actions]
- type = "map_field"
  input = "{{video_data}}"
  target = "item_detail"
  mappings = [
    { from = "title", to = "title", required = true },
    { from = "description", to = "description" },
    { from = "video_url", to = "url", required = true },
    { from = "thumbnail", to = "cover" },
    { from = "director", to = "metadata.director" },
    { from = "actors", to = "metadata.actors", type = "array" },
    { from = "duration", to = "metadata.duration", transform = "parse_int" },
    { from = "release_year", to = "metadata.release_date" },
    { from = "rating", to = "metadata.rating", type = "float" },
    { from = "genres", to = "tags", type = "array" },
    { from = "stream_url", to = "content.video_url" },
    { from = "subtitles", to = "content.subtitles", type = "array" }
  ]
  output = "result"
```

### 图书数据映射模板

```toml
[flows.map_book.actions]
- type = "map_field"
  input = "{{book_data}}"
  target = "item_detail"
  mappings = [
    { from = "title", to = "title", required = true },
    { from = "summary", to = "description" },
    { from = "detail_url", to = "url", required = true },
    { from = "cover_image", to = "cover" },
    { from = "author", to = "metadata.author" },
    { from = "publisher", to = "metadata.publisher" },
    { from = "isbn", to = "metadata.isbn" },
    { from = "pages", to = "metadata.pages", transform = "parse_int" },
    { from = "language", to = "metadata.language" },
    { from = "publish_date", to = "metadata.publication_date" },
    { from = "categories", to = "tags", type = "array" },
    { from = "download_link", to = "content.download_url" }
  ]
  output = "result"
```

## 映射调试

### 映射结果验证

```toml
[scripting.modules.validate]
code = """
fn validate_mapping(result: map, target_type: string) -> map {
    let errors = [];

    if target_type == "item_summary" {
        if !result.contains("title") {
            errors.push("缺少必填字段: title");
        }
        if !result.contains("url") {
            errors.push("缺少必填字段: url");
        }
    }

    #{ valid = errors.len() == 0, errors = errors }
}
"""

[flows.parse_data.actions]
- type = "map_field"
  input = "{{parsed_data}}"
  target = "item_summary"
  mappings = [...]
  output = "mapped_result"

- type = "script"
  call = "validate.validate_mapping"
  with = { result = "{{mapped_result}}", target_type = "item_summary" }
  output = "validation"

- type = "log"
  message = "映射验证结果: {{validation.valid ? '通过' : '失败 - ' + validation.errors.join(', ')}}"
```

### 映射性能监控

```toml
[scripting.modules.monitor]
code = """
fn measure_mapping_time(start_time: i64, end_time: i64) -> map {
    let duration = end_time - start_time;
    let performance = if duration < 100 {
        "excellent"
    } else if duration < 500 {
        "good"
    } else {
        "slow"
    };

    #{ duration = duration, performance = performance }
}
"""

[flows.monitored_mapping.actions]
- type = "script"
  call = "utils.current_time_millis"
  output = "mapping_start"

- type = "map_field"
  input = "{{data}}"
  target = "item_detail"
  mappings = [...]
  output = "result"

- type = "script"
  call = "utils.current_time_millis"
  output = "mapping_end"

- type = "script"
  call = "monitor.measure_mapping_time"
  with = { start_time = "{{mapping_start}}", end_time = "{{mapping_end}}" }
  output = "performance"

- type = "log"
  message = "字段映射性能: {{performance.duration}}ms ({{performance.performance}})"
```

通过合理使用字段映射，可以确保不同数据源的数据能够统一转换为标准格式，为上层应用提供一致的数据接口。