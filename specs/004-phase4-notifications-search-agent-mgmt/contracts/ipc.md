# IPC Contracts: Phase 4

## New Handlers

### unread

- `unread:get()` → `Promise<Record<string, number>>`  
  返回 `{ [channelId]: count }`，仅 count > 0 的频道

- `unread:markRead(channelId: string)` → `Promise<void>`  
  将指定频道未读清零

- `unread:increment(channelId: string)` → `Promise<void>`  
  新消息到达时调用（主进程内部也可调用，供 WebSocket 通知时使用）

### search

- `search:query(params: { keyword: string; channelId?: string; fromId?: string })` → `Promise<SearchResult[]>`  
  返回匹配的消息列表，每条含 `message`、`channelName`、`fromName`

```ts
interface SearchResult {
  message: Message
  channelName: string
  fromName: string  // Agent name 或 "You"
}
```

### agents

- `agents:getStatus()` → `Promise<Record<string, 'online' | 'offline'>>`  
  返回 `{ [agentId]: status }`

- `agents:setApiKey(agentId, apiKey)` → `Promise<void>`（Phase 7）
- `agents:hasApiKey(agentId)` → `Promise<boolean>`（Phase 7）

### Events (optional)

- `unread:invalidated` — 未读变化时通知渲染进程
- `agents:statusChanged` — Agent 状态变化时通知
