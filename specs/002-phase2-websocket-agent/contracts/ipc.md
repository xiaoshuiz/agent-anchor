# IPC Contract: Phase 2 扩展

**Extends**: [001-phase1-ui-skeleton/contracts/ipc.md](../001-phase1-ui-skeleton/contracts/ipc.md)

## 新增 API

```typescript
messages: {
  list: (channelId: string) => Promise<Message[]>;
  send: (channelId: string, content: string, threadTs?: string | null) => Promise<Message | { error: string }>;
}
```

- `send`: 用户发送消息，写入 SQLite，返回新消息或错误
- `threadTs`: 可选，回复某条消息时传入父消息 id

## 错误

- 频道不存在：`{ error: "Channel not found" }`
- 内容为空：`{ error: "Content cannot be empty" }`
