# Claude Bridge for Agent Anchor

在 Agent Anchor 中管理并与之交互：将 Claude 作为可对话的 Agent，支持 DM 私聊与 @mention。

## 前置条件

1. **Anthropic API Key**：在 https://console.anthropic.com/ 获取
2. **Agent Anchor 已启动**：`pnpm run dev`

## 使用

```bash
cd examples/agent-claude
pnpm install
ANTHROPIC_API_KEY=your_key node index.js
```

## 工作流程

1. 在 Agent Anchor 中「Add Agent」，ID 填 `claude`，Name 填 `Claude`
2. 启动本桥接：`ANTHROPIC_API_KEY=sk-xxx node index.js`
3. 打开与 Claude 的 DM，或在任何频道 @Claude，即可对话

## 配置

| 环境变量 | 说明 | 默认 |
|----------|------|------|
| ANTHROPIC_API_KEY | 必填 | - |
| AGENT_ANCHOR_WS | WebSocket 地址 | ws://127.0.0.1:8765 |
| CLAUDE_AGENT_ID | Agent ID | claude |
