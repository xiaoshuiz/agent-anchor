# Data Model: Phase 2 - WebSocket 与 Agent 接入

**Date**: 2025-03-17  
**Extends**: [001-phase1-ui-skeleton/data-model.md](../001-phase1-ui-skeleton/data-model.md)

## Changes from Phase 1

### Message 表新增

| Field | Type | Constraints |
|-------|------|-------------|
| mentions | TEXT | NULL, JSON array of agent_ids |

### Migration (Version 2)

```sql
ALTER TABLE messages ADD COLUMN mentions TEXT;
```

- `mentions`: 存储 @提及的 agent id 列表，如 `["agent-coder", "agent-research"]`
- Phase 1 已有消息该列为 NULL

## Agent 来源

- **用户消息**: `from_type='user'`, `from_id='user'`
- **Agent 消息**: `from_type='agent'`, `from_id=agent_id`
- Agent 通过 `agents` 表管理（Phase 1 已存在）
- Agent 可通过 WebSocket `agent/register` 动态注册，写入 `agents` 表

## State Transitions (Phase 2)

- **Message**: 用户通过输入框发送 → 写入 DB → 若有 mentions 则通过 WebSocket 转发给对应 Agent
- **Agent**: 可通过 WebSocket 注册，插入 `agents` 表
- **Agent 消息**: Agent 通过 WebSocket 发送 → 写入 DB → 广播给渲染进程
