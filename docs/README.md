# 媒体爬虫规范 (Media Crawler Specification)

## 版本: 1.0.0

本规范定义了一套统一、可扩展的多媒体数据采集规则格式，支持影视、音频、图书、漫画等多种媒体类型。

## 文档结构

- [核心概念](./core-concepts.md) - 规范的基础概念和设计理念
- [通用规范](./common-spec.md) - 所有媒体类型共享的通用配置
- [处理管道](./pipeline/README.md) - 数据提取的核心机制
- [媒体类型规范](./media-types/README.md) - 各种媒体类型的特定规范
  - [影视规范](./media-types/video.md)
  - [音频规范](./media-types/audio.md)
  - [图书规范](./media-types/book.md)
  - [漫画规范](./media-types/manga.md)
- [Schema 定义](./schema/README.md) - TOML 和 JSON Schema 定义
- [示例](./examples/README.md) - 完整的规则文件示例

## 快速开始

1. 阅读 [核心概念](./core-concepts.md) 了解规范的基本思想
2. 参考 [通用规范](./common-spec.md) 了解通用配置
3. 根据你的媒体类型查阅对应的 [媒体类型规范](./media-types/README.md)
4. 查看 [示例](./examples/README.md) 学习实际用法

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
  - 文档模块化
