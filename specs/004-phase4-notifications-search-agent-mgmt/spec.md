# Feature Specification: Phase 4 - 通知、搜索与 Agent 管理

**Feature Branch**: `004-phase4-notifications-search-agent-mgmt`  
**Created**: 2025-03-17  
**Status**: Draft  
**Input**: 基于 docs/PLAN.md Phase 4 设计  
**Depends on**: Phase 1、Phase 2 已完成（Phase 3 可选，@mention 过滤需 Phase 3）

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 新消息系统通知 (Priority: P1)

当应用在后台或窗口未聚焦时，收到新消息（Agent 或用户发送）时，应显示系统原生通知（macOS Notification Center）。

**Why this priority**: 用户需要在不盯着窗口时也能感知新消息。

**Independent Test**: 应用最小化或切换窗口，通过 SDK 发送消息，系统通知出现。

**Acceptance Scenarios**:

1. **Given** 应用窗口未聚焦，**When** 某频道收到新消息，**Then** 显示系统通知（含频道名、消息摘要）
2. **Given** 应用窗口已聚焦且当前正在查看该频道，**When** 收到新消息，**Then** 不显示系统通知（避免打扰）
3. **Given** 用户已禁用系统通知，**When** 收到新消息，**Then** 尊重系统设置，不强制弹窗

---

### User Story 2 - 未读标记 (Priority: P1)

侧边栏频道旁显示未读消息数量；用户进入该频道查看后，未读数清零。

**Why this priority**: Slack 风格的核心 UX，帮助用户快速定位未读内容。

**Independent Test**: 在 #general 外收到消息，侧边栏 #general 旁显示红点或数字；点击进入后消失。

**Acceptance Scenarios**:

1. **Given** 用户当前不在某频道，**When** 该频道有新消息，**Then** 侧边栏该频道旁显示未读数量（或红点）
2. **Given** 用户进入某频道，**When** 查看消息列表，**Then** 该频道未读数清零
3. **Given** 多个频道有未读，**When** 用户查看侧边栏，**Then** 每个频道分别显示各自未读数

---

### User Story 3 - 关键词搜索 (Priority: P1)

用户可通过搜索框输入关键词，在消息内容中全文搜索，并展示匹配结果列表（含频道、发送者、时间、内容摘要）。

**Why this priority**: 历史消息检索是基础能力。

**Independent Test**: 输入关键词，点击搜索，显示匹配消息列表；点击某条跳转到对应频道并高亮。

**Acceptance Scenarios**:

1. **Given** 用户输入关键词，**When** 点击搜索或按 Enter，**Then** 返回匹配的消息列表（跨频道）
2. **Given** 搜索结果，**When** 用户点击某条，**Then** 跳转到对应频道并滚动到该消息
3. **Given** 无匹配结果，**When** 搜索，**Then** 显示「无结果」空状态
4. **Given** 关键词为空，**When** 搜索，**Then** 不执行搜索或提示输入

---

### User Story 4 - 按频道与 Agent 过滤 (Priority: P2)

搜索时可按频道、按发送者（Agent/用户）过滤，缩小搜索范围。

**Why this priority**: 提高搜索精准度。

**Independent Test**: 选择「#general」+「Coder」过滤，仅显示 #general 中 Coder 发送的消息。

**Acceptance Scenarios**:

1. **Given** 用户选择某频道过滤，**When** 搜索，**Then** 仅在所选频道内搜索
2. **Given** 用户选择某 Agent 过滤，**When** 搜索，**Then** 仅显示该 Agent 发送的消息
3. **Given** 同时选择频道与 Agent，**When** 搜索，**Then** 取交集

---

### User Story 5 - Agent 状态与能力展示 (Priority: P2)

侧边栏 Agent 列表展示 Agent 在线状态（已连接 WebSocket 为在线）；点击 Agent 可查看其能力（capabilities）与描述。

**Why this priority**: 用户需要知道哪些 Agent 可用、能做什么。

**Independent Test**: 启动 SDK 示例连接 WebSocket 并注册，侧边栏 Agent 显示在线；点击查看详情。

**Acceptance Scenarios**:

1. **Given** Agent 已连接 WebSocket 并注册，**When** 用户查看侧边栏，**Then** 该 Agent 显示在线状态（绿点等）
2. **Given** Agent 断开连接，**When** 用户查看侧边栏，**Then** 该 Agent 显示离线
3. **Given** 用户点击某 Agent，**When** 打开详情，**Then** 显示 name、description、capabilities
4. **Given** Agent 注册时未提供 capabilities，**When** 查看详情，**Then** 显示为空或「未声明」

---

### User Story 6 - Agent 详情面板（可选扩展）(Priority: P3)

在 Thread 面板区域或独立弹窗中，展示 Agent 详情（描述、能力、最近消息），支持从详情发起 DM（若 Phase 3 有 DM 概念则复用）。

**Why this priority**: 增强 Agent 可发现性；Phase 4 可做简化版（仅展示信息）。

**Independent Test**: 点击 Agent，打开详情面板，显示描述与能力。

**Acceptance Scenarios**:

1. **Given** 用户点击侧边栏 Agent，**When** 打开详情，**Then** 显示 Agent 名称、描述、capabilities 列表
2. **Given** 详情面板打开，**When** 用户点击关闭或点击空白，**Then** 面板关闭

---

### Edge Cases

- **通知权限**：首次请求通知权限时，若用户拒绝，应用内提示「已禁用通知」
- **搜索性能**：消息量 > 1000 时，搜索应在 2 秒内返回（可加 SQLite FTS 或简单 LIKE）
- **Agent 离线**：长时间未心跳的 Agent 可标记为离线（WebSocket 断开即离线）

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 新消息到达且窗口未聚焦时，MUST 显示系统原生通知（Electron Notification API）
- **FR-002**: 侧边栏频道 MUST 显示未读数量；进入频道后清零
- **FR-003**: 搜索 MUST 支持关键词全文检索（消息 content）
- **FR-004**: 搜索 MUST 支持按频道、按 from_id（Agent/用户）过滤
- **FR-005**: 搜索结果点击 MUST 跳转到对应频道并定位到该消息
- **FR-006**: Agent 列表 MUST 显示在线/离线状态（基于 WebSocket 连接）
- **FR-007**: Agent 详情 MUST 展示 name、description、capabilities
- **FR-008**: 未读状态 MUST 持久化（用户关闭应用再打开，未读仍存在直到用户查看）

### Key Entities (extend)

- **UnreadCount**: channelId → count，存于 SQLite 或 electron-store
- **SearchResult**: message + channelName + fromName
- **AgentStatus**: agentId → 'online' | 'offline'

---

## Success Criteria *(mandatory)*

- **SC-001**: 系统通知在消息到达后 1 秒内显示
- **SC-002**: 未读数量在消息到达后即时更新（与 IPC 刷新同步）
- **SC-003**: 搜索 1000 条消息内 < 2 秒返回
- **SC-004**: Agent 断开 WebSocket 后 5 秒内侧边栏显示离线

---

## Out of Scope (Phase 4)

- MCP 协议兼容（Phase 4 可选，可延后）
- @me 过滤（依赖 Phase 3 mentions 字段，若 Phase 3 未合入则不做）
- Agent 启停/配置（简化：仅展示状态与能力，不实现进程管理）
