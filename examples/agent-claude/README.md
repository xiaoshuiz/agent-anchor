# Claude Bridge (Optional)

**推荐**：在 app 内 Add Agent → Claude，输入 API Key 即可，无需运行此脚本。

本脚本为可选的外部桥接，适用于需要独立进程或自定义逻辑的场景。

## 使用

```bash
cd examples/agent-claude
pnpm install
ANTHROPIC_API_KEY=your_key node index.js
```

## 配置

| 环境变量 | 说明 | 默认 |
|----------|------|------|
| ANTHROPIC_API_KEY | 必填 | - |
| AGENT_ANCHOR_WS | WebSocket 地址 | ws://127.0.0.1:8765 |
| CLAUDE_AGENT_ID | Agent ID | claude |
