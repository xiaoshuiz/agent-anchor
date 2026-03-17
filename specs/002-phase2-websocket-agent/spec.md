# Feature Specification: Phase 2 - 本地 WebSocket 与 Agent 通信

**Feature Branch**: `002-phase2-websocket-agent`  
**Created**: 2025-03-17  
**Status**: Draft  
**Input**: 基于 docs/PLAN.md Phase 2 设计  
**Depends on**: Phase 1 (001-phase1-ui-skeleton) 已完成

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 用户发送消息并持久化 (Priority: P1)

用户在主区域输入框输入文字并按 Enter 或点击发送后，消息应写入 SQLite 并立即显示在消息列表中。发送者显示为「用户」。

**Why this priority**: Phase 1 输入框为 no-op，Phase 2 需实现完整发送链路。

**Independent Test**: 选中频道，输入文字，按 Enter，消息出现在列表中。

**Acceptance Scenarios**:

1. **Given** 用户选中某频道，**When** 输入文字并按 Enter，**Then** 消息写入 SQLite 并显示在主区域
2. **Given** 用户发送消息，**When** 发送完成，**Then** 消息气泡显示在右侧（用户消息），含时间戳
3. **Given** 用户发送空消息或仅空格，**When** 按 Enter，**Then** 不发送，不报错

---

### User Story 2 - 主进程启动 WebSocket 服务 (Priority: P1)

应用启动时，Electron 主进程在本地启动 WebSocket 服务（如 `ws://127.0.0.1:8765`），供 Agent 连接。

**Why this priority**: Agent 需通过 WebSocket 接入，这是 Agent 通信的基础。

**Independent Test**: 启动应用，用 `wscat` 或类似工具连接 `ws://127.0.0.1:8765`，连接成功。

**Acceptance Scenarios**:

1. **Given** 应用已启动，**When** Agent 连接 `ws://127.0.0.1:8765`，**Then** 连接成功
2. **Given** 应用关闭，**When** 尝试连接，**Then** 连接失败
3. **Given** 端口被占用，**When** 应用启动，**Then** 有明确错误提示或日志

---

### User Story 3 - Agent 注册与列表更新 (Priority: P1)

Agent 通过 WebSocket 发送 `agent/register` 后，Agent 信息写入 SQLite，侧边栏 Agent 列表自动更新（或需刷新）。

**Why this priority**: 侧边栏需展示已注册的 Agent，支持后续 @提及。

**Independent Test**: 用 SDK 或脚本发送 agent/register，重启应用或刷新侧边栏，Agent 出现在列表中。

**Acceptance Scenarios**:

1. **Given** Agent 连接 WebSocket，**When** 发送 `agent/register`（含 id、name、description），**Then** Agent 写入 agents 表
2. **Given** Agent 已注册，**When** 用户查看侧边栏，**Then** Agent 出现在 Agents 列表中
3. **Given** Agent 重复注册（相同 id），**When** 发送 register，**Then** 更新或忽略（幂等）

---

### User Story 4 - Agent 发送消息 (Priority: P1)

Agent 通过 WebSocket 发送消息到指定频道，消息写入 SQLite 并显示在主区域。

**Why this priority**: 核心 Agent 通信能力。

**Independent Test**: Agent 发送消息，主区域显示 Agent 消息气泡（左侧）。

**Acceptance Scenarios**:

1. **Given** Agent 已注册，**When** 发送 `message`（含 channelId、content），**Then** 消息写入 messages 表并显示
2. **Given** Agent 消息，**When** 用户查看，**Then** 消息气泡显示在左侧，含 Agent 名称
3. **Given** Agent 发送到不存在的频道，**When** 发送，**Then** 返回错误或忽略

---

### User Story 5 - Agent SDK 最小可用 (Priority: P2)

提供 Node.js SDK 示例，Agent 可连接、注册、发送消息。Python SDK 可选。

**Why this priority**: 便于第三方 Agent 接入。

**Independent Test**: 运行 SDK 示例脚本，Agent 成功注册并发送一条消息。

**Acceptance Scenarios**:

1. **Given** 应用已启动，**When** 运行 Node SDK 示例，**Then** Agent 连接、注册、发送消息成功
2. **Given** SDK 示例，**When** 用户阅读，**Then** 有清晰注释与 README 说明用法

---

### Edge Cases

- **WebSocket 断开**：Agent 断开后，主进程不崩溃；Agent 可重连
- **无效 JSON**：收到非 JSON 或格式错误时，返回错误或忽略
- **频道不存在**：Agent 发送到无效 channelId 时，返回明确错误

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 应用 MUST 在启动时于主进程启动 WebSocket 服务（默认端口 8765）
- **FR-002**: 用户 MUST 可通过输入框发送消息，消息持久化到 SQLite
- **FR-003**: Agent MUST 通过 WebSocket 发送 `agent/register` 注册
- **FR-004**: Agent MUST 通过 WebSocket 发送 `message` 到指定频道
- **FR-005**: 协议 MUST 使用 JSON-RPC 2.0 或类似 JSON 格式
- **FR-006**: 消息 MUST 含 `from_type`（user/agent）、`from_id`、`channel_id`、`content`、`timestamp`
- **FR-007**: 提供 Node.js SDK 示例（至少连接、注册、发消息）

### Key Entities (extend Phase 1)

- **Channel**: 同 Phase 1
- **Agent**: 同 Phase 1，新增注册来源（WebSocket）
- **Message**: 同 Phase 1，新增用户发送能力

---

## Success Criteria *(mandatory)*

- **SC-001**: 用户发送消息后 3 秒内可见
- **SC-002**: WebSocket 连接建立 < 500ms（本地）
- **SC-003**: Agent 注册后侧边栏刷新可见

---

## Out of Scope (Phase 2)

- @提及 解析与补全（Phase 3）
- Thread 详情面板完整实现
- Agent 间 @mention 路由
- Python SDK（可选，非必须）
