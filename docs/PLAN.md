# Agent Anchor - 本地 Agent 通信桌面应用规划

> 类似 Slack 的 Mac 桌面应用，用于与本机所有 Agent 沟通，支持 Agent 间 @提及 互通信

---

## 一、项目概述

**核心定位**：个人本地的「Agent 工作台」，类似 Slack 的 UI/UX，但面向：
- 用户 ↔ 本机 Agent 的对话
- Agent ↔ Agent 的协作（通过 @提及）

**关键差异**：不是多人协作工具，而是「人机 + 机机」的本地通信中枢。

---

## 二、需要准备的东西

### 2.1 技术选型（已确认）

| 维度 | 方案 | 说明 |
|------|------|------|
| **桌面框架** | **Electron** | 生态成熟，与 Slack 技术栈一致 |
| **前端框架** | **React 18+** | 组件生态丰富 |
| **状态管理** | **Zustand** 或 Jotai | 轻量，适合中小型应用 |
| **样式方案** | **Tailwind CSS** + **shadcn/ui** | 快速搭建 Slack 风格界面 |
| **本地通信** | **Electron IPC** + **本地 WebSocket** | 主进程与渲染进程通信，Agent 通过 WebSocket 接入 |
| **数据持久化** | **SQLite** (via `better-sqlite3`) | 主进程访问，消息历史、Agent 元数据 |
| **Agent 协议** | **自定义 JSON-RPC over WebSocket** | 统一 Agent 接入规范 |
| **开发约束** | **GitHub Spec-Kit** | Spec-Driven Development，规范仓库开发流程 |

### 2.2 开发环境

- **Node.js** 18+
- **pnpm** 或 npm
- **macOS** 开发/测试环境
- **Spec-Kit**：Python 3.11+、`uv` 包管理器（用于 spec-kit 工作流）

### 2.3 GitHub Spec-Kit 约束

本仓库使用 [GitHub Spec-Kit](https://github.com/github/spec-kit) 进行 **Spec-Driven Development**，将规格作为可执行约束，指导 AI 编码 Agent 实现。

**初始化命令**（在已有仓库中）：
```bash
uvx --from git+https://github.com/github/spec-kit.git specify init . --ai claude
# 或 specify init . --ai copilot
```

**生成结构**：
```
.specify/
├── spec.md          # 项目目标、需求、约束
├── plan.md          # 技术方案、架构
├── tasks/           # 可执行任务单元
└── memory/
    └── constitution.md  # 项目宪法（必读）

.claude/commands/    # Claude 使用的 slash 命令
.cursor/commands/   # Cursor 使用的 slash 命令（与 .claude 同步）
.cursor/rules/      # Cursor 自动应用的规则
```

**四阶段工作流**：
1. **Specify** (`/speckit.specify`) — 定义做什么、为什么
2. **Plan** (`/speckit.plan`) — 技术方案与架构
3. **Tasks** (`/speckit.tasks`) — 拆解为可评审任务
4. **Implement** (`/speckit.implement`) — 按任务实现

**前置条件**：Git、Python 3.11+、`uv`、支持的 AI Agent（Claude / Copilot / Gemini / Codebuddy）

### 2.4 设计资源

- Slack 桌面端截图/录屏（参考布局、交互）
- 图标与品牌素材（Logo、Agent 头像占位）
- 色彩与字体规范（可参考 Slack 的深色/浅色主题）

---

## 三、架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Agent Anchor (Mac Desktop)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────┐ │
│  │  Sidebar    │  │   Channel/Chat    │  │   Thread / Detail   │ │
│  │  - Workspace│  │   - 消息列表      │  │   - 回复详情        │ │
│  │  - Channels │  │   - 输入框        │  │   - @提及解析       │ │
│  │  - Agents   │  │   - @提及补全     │  │                     │ │
│  └─────────────┘  └──────────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Local Message Bus (WebSocket / IPC)                             │
│  - 用户消息 → Agent                                               │
│  - Agent 消息 → 用户 / 其他 Agent                                  │
├─────────────────────────────────────────────────────────────────┤
│  Agent Runtime (本地进程 / 子进程)                                 │
│  - Agent A, Agent B, Agent C ...                                 │
│  - 通过 SDK 注册、收发消息、解析 @mention                           │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 核心概念映射

| Slack 概念 | Agent Anchor 映射 |
|------------|-------------------|
| Workspace | 单用户本地空间（可扩展多工作区） |
| Channel | 主题/任务频道（如 #coding, #research） |
| DM | 用户与单个 Agent 的私聊 |
| User | 用户 + 各 Agent（Agent 作为「虚拟成员」） |
| @mention | Agent 间协作触发（@agent-name 解析并路由） |
| Thread | 消息线程（保持与 Slack 一致） |

### 3.3 Agent 通信协议（草案）

```json
// Agent 注册
{
  "method": "agent/register",
  "params": {
    "id": "agent-coder",
    "name": "Coder",
    "description": "代码助手",
    "capabilities": ["code", "refactor"]
  }
}

// 消息格式（含 @提及）
{
  "type": "message",
  "from": "user" | "agent-id",
  "channel": "channel-id",
  "content": "请 @Coder 帮忙重构这段代码",
  "mentions": ["agent-coder"],
  "thread_ts": "optional-parent-ts"
}
```

---

## 四、开发计划（分阶段）

### Phase 1：基础框架与 UI 骨架（2-3 周）

1. **项目初始化**
   - Electron + React + TypeScript 脚手架
   - Tailwind + shadcn/ui 配置
   - 基础路由（侧边栏、主区域、详情面板）
   - 运行 `specify init .` 初始化 Spec-Kit，将本 PLAN 同步到 `.specify/spec.md` 与 `plan.md`

2. **Slack 风格布局**
   - 三栏布局：Sidebar | Channel | Thread
   - 可折叠侧边栏
   - 深色/浅色主题切换

3. **静态数据 Mock**
   - Mock 频道列表、Agent 列表、消息列表
   - 实现消息气泡、时间戳、头像占位

### Phase 2：本地通信与数据层（2-3 周）

1. **本地 WebSocket 服务**
   - Electron 主进程启动 WebSocket 服务（如 `ws://127.0.0.1:8765`）
   - 渲染进程通过 IPC 或直接连接收发消息

2. **SQLite 持久化**
   - 主进程使用 `better-sqlite3` 访问 SQLite
   - 消息表、频道表、Agent 表
   - 启动时加载历史消息

3. **Agent SDK（最小可用）**
   - 提供 Node/Python SDK 示例
   - Agent 可注册、发送消息、接收 @mention

### Phase 3：@提及与 Agent 协作（2 周）

1. **@提及解析**
   - 输入框输入 `@` 触发 Agent 列表补全
   - 消息渲染时高亮 @agent-name
   - 点击 @mention 跳转/筛选

2. **Agent 间路由**
   - 消息含 `mentions` 时，转发给对应 Agent
   - Agent 回复可继续 @其他 Agent，形成协作链

3. **Thread 支持**
   - 消息可回复形成线程
   - 侧边栏展示 thread 数量

### Phase 4：完善与扩展（持续）

1. **通知与提醒**
   - 系统通知（新消息、@me）
   - 未读标记

2. **搜索与过滤**
   - 按 Agent、频道、关键词搜索
   - 过滤 @我的消息

3. **Agent 管理**
   - Agent 启停、配置
   - 能力声明与发现

4. **可选：MCP 协议兼容**
   - 若社区有 MCP Agent，可做桥接层

---

## 五、目录结构建议

```
agent-anchor/
├── .specify/            # Spec-Kit 规格（约束仓库开发）
│   ├── spec.md
│   ├── plan.md
│   ├── tasks/
│   └── constitution.md
├── electron/            # Electron 主进程
│   ├── main.ts
│   ├── preload.ts
│   ├── websocket.ts
│   ├── db.ts            # better-sqlite3
│   └── agent-registry.ts
├── src/                 # React 渲染进程
│   ├── components/
│   │   ├── Sidebar/
│   │   ├── Channel/
│   │   ├── MessageList/
│   │   ├── MessageInput/
│   │   └── Thread/
│   ├── stores/
│   ├── hooks/
│   ├── types/
│   └── App.tsx
├── packages/
│   └── agent-sdk/       # Agent 接入 SDK (可选独立包)
├── docs/
│   └── PLAN.md
├── package.json
└── README.md
```

---

## 六、风险与依赖

| 风险 | 缓解措施 |
|------|----------|
| Electron 包体积 | 按需依赖，asar 打包，后续可评估 Tauri 迁移 |
| better-sqlite3 原生模块 | 确保 Electron 与 Node ABI 匹配，使用 electron-rebuild |
| Agent 生态分散 | 先支持自定义协议，预留 MCP/HTTP 适配层 |
| 本地 WebSocket 端口冲突 | 支持配置端口，启动时检测占用 |
| 消息量过大性能 | 虚拟列表、分页加载、SQLite 索引优化 |
| Spec-Kit 与现有文档同步 | 将 PLAN.md 核心内容同步到 `.specify/plan.md`，保持单一事实来源 |

---

## 七、下一步行动

1. **初始化 Spec-Kit**：`uvx --from git+https://github.com/github/spec-kit.git specify init .`
2. **同步规格**：将本 PLAN 核心内容写入 `.specify/spec.md` 与 `plan.md`
3. **搭建脚手架**：Electron + React + TypeScript，按上述目录结构初始化
4. **实现 Phase 1**：完成基础 UI 与 Mock 数据
5. **定义 Agent 协议**：输出正式版 JSON-RPC 规范文档
6. **编写 Agent SDK 示例**：至少一个 Node 或 Python 示例 Agent

---

*文档版本：v0.2 | 技术栈：Electron + SQLite + Spec-Kit | 最后更新：2025-03*
