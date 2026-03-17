# WebSocket Protocol: Agent Anchor Phase 2

**Transport**: WebSocket, `ws://127.0.0.1:8765`  
**Format**: JSON-RPC 2.0 style

## Agent → Server (Requests)

### channels/list

获取频道列表（用于 SDK 获取 channelId）。

```json
{
  "jsonrpc": "2.0",
  "method": "channels/list",
  "params": {},
  "id": 0
}
```

响应：`{ "result": { "channels": [{ "id", "name", "description", "created_at" }, ...] } }`

### agent/register

注册 Agent，写入 agents 表。

```json
{
  "jsonrpc": "2.0",
  "method": "agent/register",
  "params": {
    "id": "agent-coder",
    "name": "Coder",
    "description": "代码助手",
    "avatar": null,
    "capabilities": ["code", "refactor"]
  },
  "id": 1
}
```

- `id`: 必填，唯一标识
- `name`: 必填
- `description`, `avatar`, `capabilities`: 可选

### message/send

Agent 发送消息到频道。

```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "agentId": "agent-coder",
    "channelId": "uuid-of-channel",
    "content": "Hello from Agent",
    "threadTs": null
  },
  "id": 2
}
```

- `agentId`: 必填，已注册的 Agent id
- `channelId`: 必填，必须是已存在的频道
- `content`: 必填，非空
- `threadTs`: 可选，父消息 id

## Server → Agent (Responses)

### Success

```json
{
  "jsonrpc": "2.0",
  "result": { "id": "agent-coder" },
  "id": 1
}
```

### Error

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid params"
  },
  "id": 1
}
```

## Server → Renderer (IPC, not WebSocket)

用户发送消息通过 IPC `messages:send`，与 WebSocket 的 message/send 逻辑复用 db.insertMessage。
