# 媒体爬虫规范 (Media Crawler Specification)

## 版本: 1.0.0

本规范定义了一套统一、可扩展的多媒体数据采集规则格式，支持影视、音频、图书、漫画等多种媒体类型。

## 文档结构

### 核心部分
- [核心概念](./core/concepts.md) - 规范的基础概念和设计理念
- [规则文件结构](./core/rule-file.md) - 规则文件的组成和组织方式

### 规范定义
- [Schema 定义](./spec/schema.md) - JSON Schema 规范和验证规则
- [媒体类型](./spec/media-types.md) - 支持的媒体类型和数据模型
- [字段映射](./spec/field-mapping.md) - 数据字段映射规范

### 配置指南
- [缓存配置](./config/cache.md) - 缓存系统的配置和使用
- [HTTP 配置](./config/http.md) - 网络请求的高级配置选项
- [脚本配置](./config/scripting.md) - 自定义脚本的配置和编写

### 组件和流程
- [组件概述](./components/overview.md) - 可重用组件的设计和使用
- [流程概述](./flows/overview.md) - 数据处理流程的构建方法

### 示例和参考
- [缓存配置示例](./examples/cache-example.md) - 缓存配置的实际应用
- [流程示例](./examples/flow-example.md) - 完整流程的实现案例

### 其他
- [免责声明](./disclaimer.md) - 使用规范的法律声明

## 快速开始

1. **了解基础概念**：阅读 [核心概念](./core/concepts.md) 了解规范的基本思想和设计理念
2. **学习规则结构**：查看 [规则文件结构](./core/rule-file.md) 了解如何组织规则文件
3. **选择媒体类型**：根据你的需求查阅 [媒体类型](./spec/media-types.md) 了解数据模型
4. **配置系统**：根据需要配置 [缓存](./config/cache.md)、[网络](./config/http.md) 和 [脚本](./config/scripting.md)
5. **构建流程**：学习 [组件](./components/overview.md) 和 [流程](./flows/overview.md) 的使用方法
6. **参考示例**：查看 [示例](./examples/) 目录中的完整实现案例

## 设计目标

1. **统一性**: 为不同类型的媒体提供统一的规范框架
2. **可扩展性**: 轻松添加新的媒体类型和处理步骤
3. **灵活性**: 通过管道机制应对各种复杂场景
4. **易用性**: 简洁的 TOML 格式，清晰的文档结构
5. **类型安全**: 提供完整的 Schema 定义和类型检查

## 版本历史

- **1.0.0** (2025-11-14)
  - 可扩展的多媒体规范
  - 添加音频、图书、漫画支持
  - 引入媒体类型系统
  - 完善 Schema 定义
  - 文档架构重构，按域组织内容
