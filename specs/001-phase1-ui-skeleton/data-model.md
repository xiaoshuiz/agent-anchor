# Data Model: Phase 1 - 基础框架与 UI 骨架

**Date**: 2025-03-17

## Entities

### Channel

| Field | Type | Constraints |
|-------|------|-------------|
| id | TEXT | PRIMARY KEY, UUID |
| name | TEXT | NOT NULL, UNIQUE (e.g. #general) |
| description | TEXT | NULL |
| created_at | INTEGER | NOT NULL, Unix timestamp |

### Agent

| Field | Type | Constraints |
|-------|------|-------------|
| id | TEXT | PRIMARY KEY |
| name | TEXT | NOT NULL |
| description | TEXT | NULL |
| avatar | TEXT | NULL, URL or path |
| capabilities | TEXT | NULL, JSON array |
| created_at | INTEGER | NOT NULL |

### Message

| Field | Type | Constraints |
|-------|------|-------------|
| id | TEXT | PRIMARY KEY, UUID |
| channel_id | TEXT | NOT NULL, FK → channels |
| from_type | TEXT | NOT NULL, 'user' | 'agent' |
| from_id | TEXT | NOT NULL, 'user' or agent_id |
| content | TEXT | NOT NULL |
| timestamp | INTEGER | NOT NULL, Unix ms |
| thread_ts | TEXT | NULL, parent message id |

### User (implicit)

Phase 1 固定为单用户，无独立表。`from_type='user'`, `from_id='user'`。

## Schema (SQLite)

```sql
-- channels
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at INTEGER NOT NULL
);

-- agents
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar TEXT,
  capabilities TEXT,
  created_at INTEGER NOT NULL
);

-- messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES channels(id),
  from_type TEXT NOT NULL CHECK (from_type IN ('user', 'agent')),
  from_id TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  thread_ts TEXT REFERENCES messages(id)
);

CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_channel_ts ON messages(channel_id, timestamp);
```

## Migration (Phase 1)

- Version 1: 初始化上述 schema
- 首次启动可选：`INSERT INTO channels (id, name, created_at) VALUES ('...', '#general', ...)`

## State Transitions

- Channel/Agent: 创建后无删除（Phase 1）
- Message: 创建后只读（Phase 1 无编辑/删除）
