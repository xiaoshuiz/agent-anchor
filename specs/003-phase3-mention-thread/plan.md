# Implementation Plan: Phase 3 - @提及与 Agent 协作

**Branch**: `003-phase3-mention-thread` | **Date**: 2025-03-17 | **Spec**: [spec.md](./spec.md)

## Summary

Phase 3 实现 @提及 解析与补全、消息高亮、Agent 间路由、Thread 支持及侧边栏 thread 角标。扩展 messages 表（mentions 字段）、WebSocket 协议（message/mention 推送）、IPC（thread 相关 API）。

## Technical Context

**Language/Version**: TypeScript 5.6+, Node.js 18+  
**Primary Dependencies**: 同 Phase 1/2  
**Storage**: SQLite，messages 表新增 mentions 列  
**Constraints**: Constitution I–VIII 全部遵守

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven | ✅ PASS | 本 plan 即 spec-kit 产出 |
| II. Local-First | ✅ PASS | 无云端 |
| III. Electron Process Boundaries | ✅ PASS | 主进程 DB/WebSocket；渲染进程 UI |
| IV. Agent Protocol | ✅ PASS | message/mention 推送，@mention 路由 |
| V. TypeScript Strictness | ✅ PASS | strict: true |
| VI. SQLite | ✅ PASS | 主进程 |
| VII. Observability | ✅ PASS | 日志 |
| VIII. UI/UX Slack-like | ✅ PASS | Thread、@补全 参考 Slack |

## Project Structure Changes

### electron/

- `db.ts`: 迁移 v2 增加 mentions 列；`insertMessage` 支持 mentions；新增 `messagesListByThread`、`getThreadCountByChannel`
- `websocket-server.ts`: 维护 `agentId -> WebSocket` 映射；`message/send` 支持 mentions；消息写入后向被 @ Agent 推送 `message/mention`
- `ipc-handlers.ts`: `messages:send` 支持 threadTs、mentions；新增 `messages:listByThread`、`channels:getThreadCount`

### src/

- `MessageInput.tsx`: @ 补全逻辑（useState 管理补全状态、过滤 Agent、插入文本）
- `MessageBubble.tsx`: 解析 content 中的 @agent-name，高亮渲染；点击触发筛选；新增「回复」按钮
- `MessageList.tsx`: 支持 root-only 模式（主区域只显示根消息）；点击回复打开 Thread
- 新增 `ThreadPanel/`: Thread 面板组件，显示父消息 + 回复列表 + 输入框
- `ChannelList.tsx`: 显示 thread 数量角标
- `uiStore.ts`: 新增 `selectedThreadRootId`、`mentionFilterAgentId` 等状态
- `preload` + `electron.d.ts`: 暴露新 IPC

## Data Model

见 [data-model.md](./data-model.md)。Migration v2: `ALTER TABLE messages ADD COLUMN mentions TEXT;`

## WebSocket Protocol

见 [contracts/websocket.md](./contracts/websocket.md)。核心：`message/mention` Server Push。

## IPC Contract

见 [contracts/ipc.md](./contracts/ipc.md)。

## Implementation Order

1. DB 迁移 + insertMessage 扩展
2. IPC 扩展（send 含 mentions、listByThread、getThreadCount）
3. WebSocket 维护 agent 映射 + message/mention 推送
4. MessageInput @ 补全
5. MessageBubble 高亮 + 回复按钮
6. ThreadPanel 组件
7. MessageList 根消息模式 + 回复入口
8. ChannelList thread 角标
9. 点击 @mention 筛选（可选简化）
