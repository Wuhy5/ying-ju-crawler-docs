# 实践示例

本目录包含完整的媒体爬虫规则配置示例，展示各种实际应用场景。

## 示例列表

| 文件 | 描述 |
|------|------|
| [cache-example.md](./cache-example.md) | 缓存系统配置和使用示例 |
| [flow-example.md](./flow-example.md) | 完整流程编排和脚本使用示例 |

## 示例特点

### 缓存示例 (`cache-example.md`)
演示了缓存系统的各种使用场景：
- **会话缓存**: 存储登录凭证和临时数据
- **API 缓存**: 缓存 API 响应，避免重复请求
- **多级缓存**: 结合内存和磁盘缓存的策略
- **缓存监控**: 性能监控和缓存命中率统计

### 流程示例 (`flow-example.md`)
展示了完整的爬取流程实现：
- **搜索流程**: 关键词搜索和结果处理
- **发现流程**: 分类浏览和内容发现
- **详情解析**: 详情页面数据提取
- **认证处理**: 登录和会话管理
- **批量同步**: 大规模数据处理

## 使用方式

### 1. 学习配置模式

每个示例都包含：
- **完整的 TOML 配置**: 可直接使用的规则文件
- **详细解释**: 每个配置项的作用说明
- **最佳实践**: 推荐的配置方式和优化技巧

### 2. 复制和修改

```bash
# 复制示例作为起点
cp cache-example.md my-cache-config.toml

# 根据实际需求修改配置
# 编辑 my-cache-config.toml
```

### 3. 验证配置

使用 schema 工具验证配置：

```bash
# 验证 TOML 文件格式
cargo run --bin generate_schema -- validate my-cache-config.toml
```

## 学习路径

1. **基础配置**: 从 `cache-example.md` 开始，了解基本的缓存配置
2. **流程编排**: 学习 `flow-example.md` 中的完整爬取流程
3. **自定义脚本**: 掌握 Rhai/JavaScript/Python 脚本的使用
4. **性能优化**: 学习缓存策略和批量处理技巧

## 常见配置模式

### HTTP 请求配置

```toml
[config.http]
timeout = 10000
user_agent = "YingJu-Crawler/1.0"
retry_count = 3

[config.http.headers]
Authorization = "Bearer {{token}}"
Content-Type = "application/json"
```

### 缓存策略配置

```toml
[config.cache]
backend = "sqlite"
database_path = "./cache.db"

[config.cache.strategies.api]
ttl = 1800  # 30分钟
max_entries = 1000

[config.cache.strategies.session]
ttl = 3600  # 1小时
max_entries = 100
```

### 脚本模块配置

```toml
[scripting.engine]
type = "rhai"

[scripting.modules.utils]
code = '''
fn format_duration(seconds: i64) -> string {
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    let secs = seconds % 60;
    format!("{}:{:02}:{:02}", hours, minutes, secs)
}
'''
```

### 流水线步骤

```toml
[flows.search.actions]
- type = "http_request"
  url = "https://api.example.com/search?q={{query}}"
  output = "response"

- type = "parse_json"
  input = "{{response.body}}"
  output = "data"

- type = "map_field"
  input = "{{data.results}}"
  target = "item_summary"
  mappings = [
    { from = "title", to = "title" },
    { from = "url", to = "url" }
  ]
  output = "results"
```

## 调试和测试

### 1. 逐步验证

```toml
# 添加日志步骤调试流程
[flows.debug.actions]
- type = "log"
  message = "开始处理: {{input_data}}"

- type = "http_request"
  url = "https://api.example.com/data"
  output = "response"

- type = "log"
  message = "响应状态: {{response.status_code}}"
```

### 2. 错误处理

```toml
[flows.robust_request.actions]
- type = "http_request"
  url = "{{url}}"
  retry_count = 3
  on_error = "log_error"
  output = "response"

- type = "condition"
  if = "{{response.status_code}} != 200"
  then = [
    { type = "log", level = "error", message = "请求失败: {{response.status_code}}" },
    { type = "error", message = "API 请求失败" }
  ]
```

### 3. 性能监控

```toml
[scripting.modules.monitor]
code = '''
fn measure_time(start: i64, end: i64) -> map {
    let duration = end - start;
    #{ duration = duration, status = duration > 5000 ? "slow" : "ok" }
}
'''

[flows.monitored.actions]
- type = "script"
  call = "utils.current_time_millis"
  output = "start"

# 执行主要逻辑...

- type = "script"
  call = "utils.current_time_millis"
  output = "end"

- type = "script"
  call = "monitor.measure_time"
  with = { start = "{{start}}", end = "{{end}}" }
  output = "metrics"

- type = "log"
  message = "执行时间: {{metrics.duration}}ms ({{metrics.status}})"
```

## 最佳实践

### 配置组织
1. **分组相关配置**: 将相关配置放在一起
2. **使用有意义的名称**: 变量和函数使用描述性名称
3. **添加注释**: 解释复杂逻辑的目的

### 性能优化
1. **合理使用缓存**: 避免重复请求相同数据
2. **批量处理**: 减少请求次数
3. **异步执行**: 并行处理独立任务

### 错误处理
1. **优雅降级**: 失败时提供默认值
2. **重试机制**: 网络请求自动重试
3. **详细日志**: 便于问题诊断

### 维护性
1. **模块化**: 将复杂逻辑拆分为小函数
2. **版本控制**: 跟踪配置文件的变更
3. **文档化**: 记录配置的目的和使用方法

## 相关文档

- **[核心概念](/docs/core/concepts.md)** - 了解基础概念
- **[规则文件结构](/docs/core/rule-file.md)** - 掌握文件组织
- **[流水线系统](/docs/spec/pipeline.md)** - 深入理解执行流程
- **[字段映射](/docs/spec/field-mapping.md)** - 学习数据转换
- **[缓存配置](/docs/config/cache.md)** - 缓存系统详解
- **[脚本配置](/docs/config/scripting.md)** - 自定义逻辑编写
