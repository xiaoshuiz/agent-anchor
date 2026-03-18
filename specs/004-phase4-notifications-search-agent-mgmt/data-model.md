# Data Model: Phase 4

## New Table: channel_unread

```sql
CREATE TABLE channel_unread (
  channel_id TEXT PRIMARY KEY REFERENCES channels(id),
  count INTEGER NOT NULL DEFAULT 0,
  last_read_at INTEGER
);

CREATE INDEX idx_channel_unread_count ON channel_unread(count) WHERE count > 0;
```

- `count`: 该频道未读消息数
- `last_read_at`: 用户最后查看该频道的时间戳（秒），用于「进入后清零」逻辑

## Migration (DB_VERSION = 2)

- 若 `user_version < 2`，执行上述 `CREATE TABLE` 与 `CREATE INDEX`

## Search Query

- 表：`messages`（已有）
- 查询：`SELECT m.*, c.name as channel_name FROM messages m JOIN channels c ON m.channel_id = c.id WHERE m.content LIKE ? [AND m.channel_id = ?] [AND m.from_id = ?] ORDER BY m.timestamp DESC LIMIT 100`
- 参数：`%keyword%`、可选 channelId、可选 fromId

## Agent Status

- 不持久化，由 WebSocket 服务内存维护：`Map<agentId, WebSocket>`
- 渲染进程通过 IPC `agents:getStatus` 获取 `Record<agentId, 'online'|'offline'>`
