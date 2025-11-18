# 流程示例

## 基础搜索流程

### 简单关键词搜索

```toml
# 规则文件：basic-search.toml

[meta]
name = "基础搜索示例"
author = "示例作者"
version = "1.0.0"
domain = "example.com"
media_type = "video"

[flows.search]
description = "关键词搜索视频"

[flows.search.entry.search]
url = "/search?q={{keyword}}&page={{page | 1}}"

[flows.search.actions]
# 1. 发送搜索请求
- type = "http_request"
  url = "{{entry.url}}"
  output = "response"

# 2. 提取搜索结果列表
- type = "selector_all"
  input = "{{response.body}}"
  query = ".search-result-item"
  extract = "outer_html"
  output = "result_items"

# 3. 解析每个结果项
- type = "loop_for_each"
  input = "{{result_items}}"
  as = "item_html"
  pipeline = [
    # 提取标题
    { type = "selector", input = "{{item_html}}", query = ".title", extract = "text", output = "title" },
    # 提取链接
    { type = "selector", input = "{{item_html}}", query = ".title a", extract = "attr:href", output = "url" },
    # 提取缩略图
    { type = "selector", input = "{{item_html}}", query = ".thumbnail img", extract = "attr:src", output = "cover" },
    # 提取描述
    { type = "selector", input = "{{item_html}}", query = ".description", extract = "text", output = "summary" }
  ]
  output = "parsed_items"

# 4. 转换为标准格式
- type = "map_field"
  input = "{{parsed_items}}"
  target = "item_summary"
  mappings = [
    { from = "title", to = "title" },
    { from = "url", to = "url" },
    { from = "cover", to = "cover" },
    { from = "summary", to = "summary" }
  ]
  output = "result"
```

## 高级发现流程

### 带筛选器的分类浏览

```toml
# 规则文件：discover-with-filters.toml

[meta]
name = "分类浏览示例"
author = "示例作者"
version = "1.0.0"
domain = "example.com"
media_type = "video"

[flows.discover]
description = "按分类浏览视频"

[flows.discover.entry.discover]
url = "/videos/{{category}}/{{sort}}/{{year}}/{{page | 1}}"

[flows.discover.entry.discover.filters]
category = {
  name = "分类",
  key = "category",
  options = [
    { name = "电影", value = "movie" },
    { name = "电视剧", value = "tv" },
    { name = "动漫", value = "anime" },
    { name = "纪录片", value = "documentary" }
  ]
}

sort = {
  name = "排序",
  key = "sort",
  options = [
    { name = "最新", value = "newest" },
    { name = "最热", value = "hottest" },
    { name = "评分", value = "rating" }
  ]
}

year = {
  name = "年份",
  key = "year",
  options = [
    { name = "2024", value = "2024" },
    { name = "2023", value = "2023" },
    { name = "2022", value = "2022" },
    { name = "2021", value = "2021" }
  ]
}

[flows.discover.actions]
# 1. 请求分类页面
- type = "http_request"
  url = "{{entry.url}}"
  output = "response"

# 2. 检查是否有结果
- type = "selector"
  input = "{{response.body}}"
  query = ".no-results"
  extract = "text"
  output = "no_results"

- type = "script"
  call = "utils.is_empty"
  with = { text = "{{no_results}}" }
  output = "has_results"

# 3. 提取视频列表
- type = "selector_all"
  input = "{{response.body}}"
  query = ".video-card"
  extract = "outer_html"
  output = "video_cards"
  condition = "{{has_results}}"

# 4. 批量解析视频信息
- type = "loop_for_each"
  input = "{{video_cards}}"
  as = "card_html"
  pipeline = [
    { type = "call", component = "parse_video_card", with = { html = "{{card_html}}" }, output = "video_info" }
  ]
  output = "videos"
  condition = "{{has_results}}"

# 5. 处理分页信息
- type = "selector"
  input = "{{response.body}}"
  query = ".pagination .next"
  extract = "attr:href"
  output = "next_page_url"

- type = "script"
  call = "utils.extract_page_number"
  with = { url = "{{next_page_url}}" }
  output = "next_page"

# 6. 返回结果
- type = "constant"
  value = {
    items = "{{videos || []}}",
    has_more = "{{next_page ? true : false}}",
    next_page = "{{next_page}}"
  }
  output = "result"
```

## 详情获取流程

### 视频详情页解析

```toml
# 规则文件：video-detail.toml

[meta]
name = "视频详情示例"
author = "示例作者"
version = "1.0.0"
domain = "example.com"
media_type = "video"

[components.parse_video_card]
description = "解析视频卡片信息"

[components.parse_video_card.inputs]
html = "视频卡片HTML"

[components.parse_video_card.pipeline]
- type = "selector"
  input = "{{html}}"
  query = "h3 a"
  extract = "text"
  output = "title"

- type = "selector"
  input = "{{html}}"
  query = "h3 a"
  extract = "attr:href"
  output = "url"

- type = "selector"
  input = "{{html}}"
  query = ".thumbnail img"
  extract = "attr:data-src"
  output = "cover"

- type = "selector"
  input = "{{html}}"
  query = ".rating"
  extract = "text"
  output = "rating"

[flows.get_detail]
description = "获取视频详情"
output_model = "item_detail"

[flows.get_detail.entry.general]
url = "/video/{{video_id}}"

[flows.get_detail.actions]
# 1. 获取详情页面
- type = "http_request"
  url = "{{entry.url}}"
  output = "page_response"

# 2. 检查页面是否存在
- type = "script"
  call = "utils.check_page_exists"
  with = { response = "{{page_response}}" }
  output = "page_exists"

# 3. 解析基本信息
- type = "call"
  component = "parse_basic_info"
  with = { html = "{{page_response.body}}" }
  output = "basic_info"
  condition = "{{page_exists}}"

# 4. 解析媒体信息
- type = "call"
  component = "parse_media_info"
  with = { html = "{{page_response.body}}" }
  output = "media_info"
  condition = "{{page_exists}}"

# 5. 解析播放地址
- type = "call"
  component = "parse_video_sources"
  with = { html = "{{page_response.body}}" }
  output = "video_sources"
  condition = "{{page_exists}}"

# 6. 合并所有信息
- type = "script"
  call = "utils.merge_video_info"
  with = {
    basic = "{{basic_info}}",
    media = "{{media_info}}",
    sources = "{{video_sources}}"
  }
  output = "merged_info"
  condition = "{{page_exists}}"

# 7. 转换为标准格式
- type = "map_field"
  input = "{{merged_info}}"
  target = "item_detail"
  mappings = [
    { from = "title", to = "title" },
    { from = "description", to = "description" },
    { from = "cover_url", to = "cover" },
    { from = "director", to = "metadata.director" },
    { from = "actors", to = "metadata.actors" },
    { from = "genre", to = "metadata.genre" },
    { from = "release_date", to = "metadata.release_date" },
    { from = "duration", to = "metadata.duration" },
    { from = "rating", to = "metadata.rating" },
    { from = "play_urls", to = "content.video_url" },
    { from = "subtitles", to = "content.subtitles" }
  ]
  output = "result"
  condition = "{{page_exists}}"

# 8. 处理错误情况
- type = "constant"
  value = { error = "视频不存在或已下架" }
  output = "result"
  condition = "{{!page_exists}}"
```

## 用户认证流程

### 登录和会话管理

```toml
# 规则文件：user-auth.toml

[meta]
name = "用户认证示例"
author = "示例作者"
version = "1.0.0"
domain = "example.com"
media_type = "video"

[cache]
backend = "memory"
default_ttl = 7200  # 2小时会话

[scripting.modules.auth]
code = """
fn is_session_valid(session_id: string) -> bool {
    let cache_key = "session_" + session_id;
    let session_data = cache_get(cache_key);
    if session_data == null {
        return false;
    }

    let data = json_parse(session_data);
    let expires = data.expires;
    let now = current_timestamp();

    return now < expires;
}

fn create_session(user_id: string, username: string) -> string {
    let session_id = generate_uuid();
    let expires = current_timestamp() + 7200; // 2小时后过期

    let session_data = #{
        user_id: user_id,
        username: username,
        expires: expires,
        created_at: current_timestamp()
    };

    let cache_key = "session_" + session_id;
    cache_set(cache_key, json_stringify(session_data), 7200);

    session_id
}

fn get_user_session(username: string) -> string {
    let cache_key = "user_session_" + username;
    cache_get(cache_key)
}
"""

[flows.login]
description = "用户登录"

[flows.login.entry.general]
url = "/api/login"

[flows.login.actions]
# 1. 检查是否已有有效会话
- type = "script"
  call = "auth.get_user_session"
  with = { username = "{{username}}" }
  output = "existing_session"

- type = "script"
  call = "auth.is_session_valid"
  with = { session_id = "{{existing_session}}" }
  output = "session_valid"
  condition = "{{existing_session}}"

# 2. 如果会话无效，执行登录
- type = "http_request"
  url = "{{entry.url}}"
  method = "POST"
  headers = { "Content-Type": "application/json" }
  body = '{"username": "{{username}}", "password": "{{password}}"}'
  output = "login_response"
  condition = "{{!session_valid}}"

- type = "json_path"
  input = "{{login_response.body}}"
  query = "$.success"
  output = "login_success"
  condition = "{{!session_valid}}"

# 3. 创建新会话
- type = "script"
  call = "auth.create_session"
  with = { user_id = "{{login_response.user_id}}", username = "{{username}}" }
  output = "new_session"
  condition = "{{login_success}}"

- type = "cache_set"
  key = "user_session_{{username}}"
  value = "{{new_session}}"
  ttl = 7200
  condition = "{{login_success}}"

# 4. 返回结果
- type = "constant"
  value = {
    success = "{{session_valid || login_success}}",
    session_id = "{{existing_session || new_session}}",
    message = "{{session_valid ? '使用现有会话' : (login_success ? '登录成功' : '登录失败')}}"
  }
  output = "result"
```

## 批量处理流程

### 同步全站数据

```toml
# 规则文件：bulk-sync.toml

[meta]
name = "批量同步示例"
author = "示例作者"
version = "1.0.0"
domain = "example.com"
media_type = "video"

[scripting.modules.bulk]
code = """
fn calculate_total_pages(total_items: i64, page_size: i64) -> i64 {
    (total_items + page_size - 1) / page_size
}

fn should_continue_sync(progress: map) -> bool {
    let processed = progress.processed;
    let total = progress.total;
    let has_errors = progress.errors > progress.max_errors;

    processed < total && !has_errors
}

fn update_progress(progress: map, increment: i64, error: bool) -> map {
    let new_progress = progress.clone();
    new_progress.processed += increment;
    if error {
        new_progress.errors += 1;
    }
    new_progress
}
"""

[flows.sync_all_videos]
description = "同步全站视频数据"

[flows.sync_all_videos.entry.general]
url = "/api/videos/list"

[flows.sync_all_videos.actions]
# 1. 获取总数
- type = "http_request"
  url = "{{entry.url}}?page=1&limit=1"
  output = "count_response"

- type = "json_path"
  input = "{{count_response.body}}"
  query = "$.total"
  output = "total_count"

- type = "script"
  call = "bulk.calculate_total_pages"
  with = { total_items = "{{total_count}}", page_size = 50 }
  output = "total_pages"

# 2. 初始化进度
- type = "constant"
  value = {
    processed = 0,
    total = "{{total_count}}",
    errors = 0,
    max_errors = 10,
    current_page = 1
  }
  output = "progress"

# 3. 分页处理
- type = "loop_while"
  condition = "{{progress.current_page <= total_pages}}"
  pipeline = [
    # 获取当前页数据
    { type = "http_request", url = "{{entry.url}}?page={{progress.current_page}}&limit=50", output = "page_response" },

    # 解析视频ID列表
    { type = "json_path", input = "{{page_response.body}}", query = "$.videos[*].id", output = "video_ids" },

    # 批量获取详情
    { type = "loop_for_each", input = "{{video_ids}}", as = "video_id", pipeline = [
      { type = "call", component = "get_video_detail", with = { video_id = "{{video_id}}" }, output = "detail" },
      { type = "call", component = "save_to_storage", with = { data = "{{detail}}" }, output = "save_result" },
      { type = "script", call = "bulk.update_progress", with = { progress = "{{progress}}", increment = 1, error = "{{!save_result.success}}" }, output = "progress" }
    ], output = "_" },

    # 更新页码
    { type = "script", call = "utils.increment", with = { value = "{{progress.current_page}}" }, output = "progress.current_page" }
  ]
  output = "_"

# 4. 生成报告
- type = "constant"
  value = {
    total_processed = "{{progress.processed}}",
    total_errors = "{{progress.errors}}",
    success_rate = "{{(progress.processed - progress.errors) as f64 / progress.processed as f64}}",
    completed_at = "{{current_timestamp()}}"
  }
  output = "sync_report"

- type = "log"
  message = "同步完成: 处理 {{progress.processed}} 项, 错误 {{progress.errors}} 项"
```

这些示例展示了不同复杂度的流程实现，从简单的搜索到复杂的批量处理，帮助用户理解如何构建完整的自动化任务。