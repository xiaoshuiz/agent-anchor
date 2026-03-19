# WebSocket Protocol: Phase 3 扩展

**Extends**: specs/002-phase2-websocket-agent/contracts/websocket.md

## message/send - 扩展 params

```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "agentId": "agent-coder",
    "channelId": "uuid",
    "content": "Hello @Coder",
    "threadTs": null,
    "mentions": ["agent-coder"]
  },
  "id": 2
}
```

- `mentions`: 可选，agent id 数组，表示消息中 @ 的 Agent

## Server → Agent: message/mention (Push)

当用户或其它 Agent 发送的消息中含 @该 Agent 时，主进程向该 Agent 的 WebSocket 连接推送：

```json
{
  "jsonrpc": "2.0",
  "method": "message/mention",
  "params": {
    "messageId": "uuid",
    "channelId": "uuid",
    "channelName": "#general",
    "fromType": "user",
    "fromId": "user",
    "content": "请 @Coder 帮忙重构",
    "mentions": ["agent-coder"],
    "threadTs": null,
    "timestamp": 1234567890
  }
}
```

- 无 `id` 字段，表示 Server Push，Agent 不需回复
- Agent 需在 `agent/register` 时建立连接，主进程维护 `agentId -> WebSocket` 映射

## Server → Agent: message/dm (Push)

当用户向该 Agent 的 DM 频道发送消息时推送（channel.type='dm' 且 dm_agent_id=agentId）：

```json
{
  "jsonrpc": "2.0",
  "method": "message/dm",
  "params": {
    "messageId": "uuid",
    "channelId": "uuid",
    "channelName": "DM with Claude",
    "fromType": "user",
    "fromId": "user",
    "content": "Hello",
    "timestamp": 1234567890
  }
}
```

---

## Agent 连接注册

Agent 连接后需先发送 `agent/register`，主进程将 `agentId` 与 `WebSocket` 绑定，后续 `message/mention` 与 `message/dm` 按此映射推送。
