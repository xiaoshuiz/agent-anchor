# Research: Phase 1 - 基础框架与 UI 骨架

**Date**: 2025-03-17 | **Status**: Complete

## Summary

Phase 1 技术栈已确定，无 NEEDS CLARIFICATION。本文件记录关键决策与备选方案。

## Decisions

### 1. 数据层：SQLite + 主进程

**Decision**: 使用 better-sqlite3，主进程访问，首次启动时创建 schema 并可选预置 #general。

**Rationale**: Constitution VI 要求；本地优先；单用户无需复杂 DB。

**Alternatives considered**: IndexedDB（渲染进程）— 违反 Constitution；JSON 文件 — 并发与扩展性差。

### 2. 主题：仅跟随系统

**Decision**: 使用 `prefers-color-scheme` 或 `prefers-color-scheme` + `mediaQuery`，无应用内切换。

**Rationale**: Spec 明确；简化实现。

### 3. 侧边栏折叠：持久化

**Decision**: 使用 electron-store 或 localStorage 持久化折叠状态。

**Rationale**: Spec FR-008；提升 UX。

### 4. 图标：SVG + icns

**Decision**: 设计 SVG 锚点图标，导出为 .icns 用于 macOS。

**Rationale**: Spec FR-009；品牌识别。

### 5. CI/CD：GitHub Actions

**Decision**: 合入 main 触发 workflow，build macOS 产物，创建 Release。

**Rationale**: Spec FR-011；electron-builder 支持。
