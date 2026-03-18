# Data Model: Phase 3 - @提及与 Thread

**Date**: 2025-03-17  
**Extends**: Phase 1 data-model.md

## Changes from Phase 1/2

### Message - 新增 mentions

| Field | Type | Constraints |
|-------|------|-------------|
| ... | (同 Phase 1) | |
| mentions | TEXT | NULL, JSON array of agent ids, e.g. `["agent-coder"]` |

### Migration

- **Version 2**: `ALTER TABLE messages ADD COLUMN mentions TEXT;`
- 默认 NULL，表示无 @mention
- 存储格式：`["agent-id-1","agent-id-2"]`

### Thread

沿用 Phase 1 定义，无变更。Thread 面板从 messages 表按 `thread_ts` 查询回复。

### Query: 有回复的消息数（侧边栏角标）

```sql
SELECT COUNT(DISTINCT thread_ts) FROM messages
WHERE channel_id = ? AND thread_ts IS NOT NULL;
```

或：统计根消息（thread_ts 为 NULL）且存在至少一条回复的消息数：

```sql
SELECT COUNT(*) FROM messages m1
WHERE m1.channel_id = ? AND m1.thread_ts IS NULL
AND EXISTS (SELECT 1 FROM messages m2 WHERE m2.thread_ts = m1.id);
```
