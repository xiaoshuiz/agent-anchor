# Agent Anchor - Node.js SDK 示例

通过 WebSocket 连接 Agent Anchor，注册 Agent 并发送消息。

## 前置条件

1. 安装依赖：`pnpm add ws`（项目根目录已包含）
2. 启动 Agent Anchor 应用：`pnpm run dev`

## 使用

### 1. 仅注册 Agent

```bash
node examples/agent-node/index.js
```

会连接并注册 Agent，但不会发送消息（需要 CHANNEL_ID）。

### 2. 注册并发送消息

获取 #general 频道 ID（可从应用首次启动时数据库预置，或通过 SQLite 查询）：

```bash
# macOS: 查询数据库获取 channel id
sqlite3 ~/Library/Application\ Support/agent-anchor/agent-anchor.db "SELECT id FROM channels LIMIT 1"
```

然后：

```bash
CHANNEL_ID=<上一步得到的uuid> node examples/agent-node/index.js
```

## 协议

- WebSocket 地址：`ws://127.0.0.1:8765`
- 格式：JSON-RPC 2.0
- 方法：`agent/register`、`message/send`

详见 `specs/002-phase2-websocket-agent/contracts/websocket.md`。
