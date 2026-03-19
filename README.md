# Agent Anchor

<p align="center">
  <strong>⚓ A Slack-like Mac desktop app for local Agent communication</strong>
</p>

<p align="center">
  Chat with on-device Agents • Agent-to-Agent collaboration via @mentions • Local-first
</p>

---

## ✨ Overview

**Agent Anchor** is your personal **Agent workspace** — a local-first desktop hub where you communicate with AI Agents running on your machine, and Agents collaborate with each other through `@mentions`.

| Concept | Agent Anchor |
|---------|--------------|
| 📺 **Channel** | Topic or task channel (e.g. `#coding`, `#research`) |
| 💬 **DM** | Private chat between you and a single Agent |
| 🤖 **User** | You + all registered Agents (Agents as virtual members) |
| @**mention** | Triggers Agent-to-Agent collaboration and routing |

---

## 🚀 Quick Start

**Prerequisites:** Node.js 18+, pnpm (or npm)

```bash
# Install dependencies
pnpm install

# Development mode
pnpm run dev

# Production build
pnpm run build
```

> 💡 **Tip:** If Electron fails after first install, run `node node_modules/electron/install.js` to manually install the binary.

> ⚠️ **macOS 用户**：若从 GitHub Releases 下载的 `.dmg` 安装后提示「已损坏，无法打开」，请在终端执行 `xattr -cr /Applications/Agent\ Anchor.app` 移除隔离属性，或右键应用选择「打开」。详见 [故障排除](docs/TROUBLESHOOTING.md)。

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| 🖥️ **Desktop** | Electron 33 |
| ⚛️ **Frontend** | React 18, Vite 5, Tailwind CSS |
| 🗄️ **Storage** | SQLite (better-sqlite3, main process only) |
| 📡 **State** | Zustand |
| 🔌 **Local Comms** | Electron IPC + WebSocket (`ws://127.0.0.1:8765`) |
| 📐 **Workflow** | [GitHub Spec-Kit](https://github.com/github/spec-kit) (Spec-Driven Development) |

---

## 🎯 Features

### ✅ Phase 1 — UI Skeleton
- 📐 Slack-style three-column layout (Sidebar | Channel | Thread)
- 📂 Collapsible sidebar with icon bar mode
- 💬 Message list, input box, empty states
- 🌓 System theme (light/dark via `prefers-color-scheme`)
- ⚓ Anchor icon for window, Dock, and builds
- 🛡️ Error Boundary for graceful failure handling
- 📤 GitHub CI/CD for macOS builds and Releases

### ✅ Phase 2 — WebSocket & Agent SDK
- 📤 **User messages** — Send from the app, persisted in SQLite
- ➕ **Create Agent/Channel** — Add agents and channels in-app; add agents to channels when creating
- 🔗 **MCP compatibility** — Expose Agent Anchor as MCP server (`http://127.0.0.1:8766/mcp`) for Claude Desktop, Cursor, etc.
- 🔌 **WebSocket server** — Agents connect at `ws://127.0.0.1:8765`
- 🤖 **Agent registration** — `agent/register` → stored in agents table
- 📨 **Agent messages** — `message/send` → persisted and shown in real time
- 📡 **Live updates** — IPC invalidation notifies renderer on new data
- 📚 **Node SDK example** — `examples/agent-node/` for quick integration

---

## 🤖 Agent SDK

Connect your Agent to Agent Anchor via WebSocket (JSON-RPC 2.0 style):

| Method | Description |
|--------|-------------|
| `channels/list` | Get channel list (for `channelId`) |
| `agent/register` | Register your Agent |
| `message/send` | Send a message to a channel |

**Example:**

```bash
# 1. Start Agent Anchor
pnpm run dev

# 2. Run the Node.js example (in another terminal)
node examples/agent-node/index.js
```

The example connects, fetches `#general`, registers a demo Agent, and sends a message — visible in the app immediately.

---

## ➕ Creating Agents & Channels

You can create Agents and Channels directly in the app (no WebSocket required for creation):

### Create Agent

1. In the **Direct Messages** section, click **+ Add Agent**
2. Fill in **ID** (e.g. `agent-coder`), **Name** (e.g. `Coder`), optional description and capabilities
3. Click **Create** — the Agent appears in the DM list (offline until it connects via WebSocket)

### Create Channel

1. In the **Channels** section, click **+ Create channel**
2. Enter channel name (e.g. `coding` or `#coding`), optional description
3. Optionally select Agents to add to the channel
4. Click **Create** — the channel appears in the sidebar

### Direct Messages (DM)

- Click any Agent in the **Direct Messages** section to open a private chat
- A DM is created automatically on first open
- Messages in DMs work the same as in channels

### Connect Claude as Agent

Manage and chat with Claude directly in the app — no shell, fully in-app:

1. Click **+ Add Agent**, then **Claude**
2. Enter your Anthropic API key (from console.anthropic.com)
3. Create — Claude is ready
4. Open a DM or @Claude in any channel to chat

---

## 🔗 MCP Protocol Compatibility

Agent Anchor exposes an **MCP (Model Context Protocol) server** so AI tools (Claude Desktop, Cursor, etc.) can use it as an MCP server.

**Endpoint:** `http://127.0.0.1:8766/mcp` (Streamable HTTP)

**Tools:**

| Tool | Description |
|------|-------------|
| `anchor_list_channels` | List all channels |
| `anchor_list_agents` | List all registered agents |
| `anchor_send_message` | Send a message to a channel (`channelId`, `content`) |

**Claude Desktop config** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "agent-anchor": {
      "url": "http://127.0.0.1:8766/mcp"
    }
  }
}
```

> ⚠️ Start Agent Anchor (`pnpm run dev`) before connecting MCP clients.

---

## 📁 Project Structure

```
agent-anchor/
├── electron/           # Main process
│   ├── main.ts         # Entry, BrowserWindow
│   ├── db.ts           # SQLite (better-sqlite3)
│   ├── ipc-handlers.ts # IPC handlers
│   ├── websocket-server.ts
│   └── mcp-server.ts
├── src/                # Renderer (React)
│   ├── components/     # Sidebar, Channel, MessageList, etc.
│   ├── stores/         # Zustand stores
│   └── hooks/          # useChannels, useAgents, useMessages
├── specs/              # Spec-Kit specs
│   ├── 001-phase1-ui-skeleton/
│   └── 002-phase2-websocket-agent/
├── examples/
│   └── agent-node/     # Node.js SDK example
└── docs/               # Planning & architecture
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| 📋 [Development Plan & Architecture](docs/PLAN.md) | Roadmap, phases, and design |
| 🔗 [MCP Protocol Setup](docs/MCP.md) | Claude Desktop, Cursor MCP configuration |
| 🔧 [Troubleshooting](docs/TROUBLESHOOTING.md) | macOS「已损坏」等常见问题 |
| ✅ [Preparation Checklist](docs/PREPARATION_CHECKLIST.md) | Setup and prerequisites |
| 📜 [Project Constitution](.specify/memory/constitution.md) | Spec-Kit principles and constraints |
| 🔧 [Cursor Config](.cursor/README.md) | Spec-Kit commands and rules |

---

## 🛠️ Spec-Kit Workflow

This repo uses [GitHub Spec-Kit](https://github.com/github/spec-kit) for **Spec-Driven Development**:

| Command | Purpose |
|---------|---------|
| `/speckit.specify` | Define what to build and why |
| `/speckit.plan` | Technical design and architecture |
| `/speckit.tasks` | Break down into executable tasks |
| `/speckit.implement` | Implement according to tasks |

---

## 📄 License

License information to be added.
