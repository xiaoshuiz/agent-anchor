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
