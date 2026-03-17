# Implementation Plan: Phase 1 - 基础框架与 UI 骨架

**Branch**: `001-phase1-ui-skeleton` | **Date**: 2025-03-17 | **Spec**: [spec.md](./spec.md)

## Summary

Phase 1 实现 Agent Anchor 的完整可执行框架：Slack 风格三栏布局、真实 SQLite 数据层、侧边栏折叠、系统主题跟随、Anchor 图标、空状态插画、Error Boundary、GitHub CI/CD 自动打包发布。无 Mock 数据，应用从首日即可运行。

## Technical Context

**Language/Version**: TypeScript 5.6+, Node.js 18+  
**Primary Dependencies**: Electron 33+, React 18+, Vite 5+, Tailwind CSS 3+, better-sqlite3, Zustand, date-fns, lucide-react  
**Storage**: SQLite (better-sqlite3)，主进程访问，路径 `app.getPath('userData')/agent-anchor.db`  
**Testing**: Vitest（可选 Phase 1），E2E 可选 Playwright  
**Target Platform**: macOS (primary), Electron 支持跨平台  
**Project Type**: desktop-app (Electron)  
**Performance Goals**: 启动 3s 内可见 UI；100 条消息内滚动 60fps  
**Constraints**: 主进程/渲染进程严格隔离；SQLite 仅主进程；无云端依赖  
**Scale/Scope**: 单用户本地；100+ 频道/Agent；1000+ 消息/频道

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven | ✅ PASS | 本 plan 即 spec-kit 产出 |
| II. Local-First | ✅ PASS | SQLite 本地，无云端 |
| III. Electron Process Boundaries | ✅ PASS | SQLite 主进程；React 渲染进程；preload 暴露 IPC |
| IV. Agent Protocol | ⏸ N/A | Phase 1 无 WebSocket/Agent |
| V. TypeScript Strictness | ✅ PASS | strict: true |
| VI. SQLite | ✅ PASS | 主进程 better-sqlite3 |
| VII. Observability | ✅ PASS | console 日志 |
| VIII. UI/UX Slack-like | ✅ PASS | 三栏、Slack 交互参考 |

## Project Structure

### Documentation (this feature)

```text
specs/001-phase1-ui-skeleton/
├── plan.md              # This file
├── research.md          # Phase 0 (minimal)
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # IPC contracts
└── tasks.md             # /speckit.tasks output
```

### Source Code (repository root)

```text
agent-anchor/
├── electron/
│   ├── main.ts          # 主进程：窗口、IPC、SQLite、DB 初始化
│   ├── preload.ts       # contextBridge 暴露 IPC
│   ├── db.ts            # better-sqlite3 封装、schema、migrations
│   └── ipc-handlers.ts  # IPC 路由
├── src/
│   ├── components/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ChannelList.tsx
│   │   │   ├── AgentList.tsx
│   │   │   └── CollapseButton.tsx
│   │   ├── Channel/
│   │   │   ├── ChannelHeader.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── MessageInput.tsx
│   │   └── ErrorBoundary/
│   │       └── ErrorFallback.tsx
│   ├── stores/
│   │   ├── uiStore.ts   # 侧边栏折叠、选中频道
│   │   └── themeStore.ts # 系统主题
│   ├── hooks/
│   │   ├── useChannels.ts
│   │   ├── useAgents.ts
│   │   └── useMessages.ts
│   ├── assets/
│   │   ├── icons/
│   │   │   └── anchor.svg
│   │   └── illustrations/
│   │       └── empty-state.svg
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .github/
│   └── workflows/
│       └── release.yml  # CI/CD
├── resources/
│   └── icon.icns       # macOS 图标
├── electron.vite.config.ts
├── package.json
└── tailwind.config.js
```

**Structure Decision**: Electron 主进程 + React 渲染进程。DB 与 IPC 在 electron/；UI 在 src/。符合 Constitution III。

## Phase 0: Research

无 NEEDS CLARIFICATION。技术栈已确定。research.md 见同目录。

## Phase 1: Design Artifacts

- data-model.md: Channel, Agent, Message 表结构
- contracts/: IPC 契约（channels, agents, messages CRUD）
- quickstart.md: 本地开发与构建步骤

## Complexity Tracking

无 Constitution 违反，无需填写。
