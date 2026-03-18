# Implementation Plan: Phase 4 - 通知、搜索与 Agent 管理

**Branch**: `004-phase4-notifications-search-agent-mgmt` | **Date**: 2025-03-17 | **Spec**: [spec.md](./spec.md)

## Summary

Phase 4 实现系统通知、未读标记、关键词搜索（含频道/Agent 过滤）、Agent 在线状态与详情展示。基于 Phase 2 的 SQLite、WebSocket、IPC 扩展。

## Technical Context

**Dependencies**: Phase 1、Phase 2 完成  
**Notification**: Electron `Notification` API（主进程或渲染进程均可，渲染进程需用户交互触发权限）  
**Unread**: 新表 `channel_unread` 或 electron-store；主进程维护，IPC 暴露  
**Search**: SQLite `LIKE '%keyword%'` 或 FTS5（可选）；主进程查询，IPC `search:query`  
**Agent Status**: WebSocket 服务维护 `Map<agentId, ws>`，连接=在线，断开=离线

## Project Structure (additions)

```text
agent-anchor/
├── electron/
│   ├── db.ts                 # 扩展：channel_unread 表、searchMessages
│   ├── ipc-handlers.ts       # 扩展：unread、search、agentStatus
│   └── websocket-server.ts   # 扩展：维护 agentId → ws 映射，广播 status
├── src/
│   ├── components/
│   │   ├── Search/            # 搜索框、结果列表、过滤下拉
│   │   ├── AgentDetail/      # Agent 详情面板（可选弹窗）
│   │   └── Sidebar/           # 扩展：未读角标、Agent 在线状态
│   ├── hooks/
│   │   ├── useUnread.ts
│   │   ├── useSearch.ts
│   │   └── useAgentStatus.ts
│   └── stores/
│       └── searchStore.ts    # 搜索关键词、过滤条件
└── specs/004-phase4-notifications-search-agent-mgmt/
    ├── spec.md
    ├── plan.md
    ├── data-model.md
    ├── contracts/
    │   └── ipc.md
    └── tasks.md
```

## Data Model (additions)

### channel_unread 表

```sql
CREATE TABLE channel_unread (
  channel_id TEXT PRIMARY KEY REFERENCES channels(id),
  count INTEGER NOT NULL DEFAULT 0,
  last_read_at INTEGER  -- 用户最后查看时间，用于判断「进入后清零」
);
```

- 新消息到达：`INSERT OR REPLACE` 增加 count（若当前频道非用户所在则 +1）
- 用户进入频道：`UPDATE count=0, last_read_at=now`

### Search

- 复用 `messages` 表，`WHERE content LIKE ?`，按 channel_id、from_id 过滤
- 可选：FTS5 虚拟表加速（Phase 4 可先用 LIKE，后续优化）

## Implementation Order

1. **DB 迁移**：channel_unread 表、searchMessages 函数
2. **IPC**：unread:get、unread:markRead、search:query、agents:getStatus
3. **WebSocket**：维护 agentId→ws，连接/断开时更新并通知渲染进程
4. **主进程通知**：新消息时若窗口未聚焦则 `new Notification(...)`
5. **侧边栏**：未读角标、Agent 在线状态
6. **Search 组件**：搜索框、结果列表、过滤、跳转
7. **Agent 详情**：点击 Agent 打开详情面板

## Constitution Check

| Principle | Status |
|-----------|--------|
| III. Electron Process Boundaries | ✅ 搜索、未读在主进程；渲染进程通过 IPC |
| VI. SQLite | ✅ 主进程访问 channel_unread、search |
| VIII. UI/UX Consistency | ✅ 未读角标、搜索、Agent 详情符合 Slack 风格 |
