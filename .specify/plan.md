# Agent Anchor - 技术方案

> 完整规划见 [docs/PLAN.md](../docs/PLAN.md)

## 架构

- **主进程**: electron/main.ts（窗口、IPC、WebSocket、SQLite）
- **预加载**: electron/preload.ts（contextBridge）
- **渲染进程**: src/（React、Tailwind）

## 目录结构

```
agent-anchor/
├── .specify/       # Spec-Kit 规格
├── electron/       # 主进程与预加载
├── src/            # React 渲染进程
├── docs/           # 规划文档
└── out/            # 构建输出
```

## 关键依赖

- electron-vite、electron、better-sqlite3
- react、zustand、tailwindcss、lucide-react
- @anthropic-ai/sdk（Phase 7 Claude 应用内）
- @modelcontextprotocol/sdk（Phase 5 MCP）

## Phase 7 补充

- Claude API Key 配置：Settings 入口，electron-store (agent-keys)
- 主进程 claude-responder 调用 Anthropic API
- agents.provider：claude | websocket
- @mention 支持多词名（parseMentions 正则扩展）
