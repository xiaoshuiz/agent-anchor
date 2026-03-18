# Feature Specification: Phase 3 - @提及与 Agent 协作

**Feature Branch**: `003-phase3-mention-thread`  
**Created**: 2025-03-17  
**Status**: Draft  
**Input**: 基于 docs/PLAN.md Phase 3 设计  
**Depends on**: Phase 1、Phase 2 已完成

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - @提及补全 (Priority: P1)

用户在主区域输入框输入 `@` 时，触发 Agent 列表补全下拉，显示已注册 Agent，用户可选择或输入部分名称过滤。补全后插入 `@agent-name` 格式。

**Why this priority**: 核心 @提及 输入体验。

**Independent Test**: 选中频道，输入 `@`，补全列表出现；输入 `@Co`，过滤 Coder；选择后插入 `@Coder`。

**Acceptance Scenarios**:

1. **Given** 用户选中某频道，**When** 输入 `@`，**Then** 显示 Agent 补全下拉列表
2. **Given** 补全列表出现，**When** 用户继续输入（如 `Co`），**Then** 列表按名称过滤
3. **Given** 用户选择某 Agent，**When** 点击或 Enter，**Then** 插入 `@agent-name` 到输入框
4. **Given** 无已注册 Agent，**When** 输入 `@`，**Then** 显示空状态或提示

---

### User Story 2 - 消息渲染高亮 @agent-name (Priority: P1)

消息渲染时，文本中的 `@agent-name` 应高亮显示（如可点击样式），与普通文本区分。

**Why this priority**: 视觉上明确 @提及 关系。

**Independent Test**: 发送含 `@Coder` 的消息，主区域消息气泡中 `@Coder` 高亮。

**Acceptance Scenarios**:

1. **Given** 消息含 `@agent-name`，**When** 渲染消息气泡，**Then** `@agent-name` 高亮显示
2. **Given** 消息含多个 `@mention`，**When** 渲染，**Then** 全部高亮
3. **Given** `@agent-name` 对应 Agent 不存在，**When** 渲染，**Then** 仍高亮但可标记为无效

---

### User Story 3 - 点击 @mention 跳转/筛选 (Priority: P2)

用户点击消息中的 `@agent-name` 时，可跳转或筛选：如跳转到该 Agent 的 DM 频道，或筛选「@该 Agent 的消息」。Phase 3 可先实现「筛选显示 @该 Agent 的消息」。跳转 DM 可 Phase 4。

**Why this priority**: 增强 @提及 关联性。

**Independent Test**: 点击 `@Coder`，主区域显示「@Coder 的消息」筛选视图或跳转 DM。

**Acceptance Scenarios**:

1. **Given** 用户点击消息中的 `@agent-name`，**When** 点击，**Then** 触发筛选或跳转（视实现而定）
2. **Given** 筛选激活，**When** 用户查看，**Then** 仅显示含该 @mention 的消息

---

### User Story 4 - Agent 间路由 (Priority: P1)

消息含 `mentions` 时，主进程应将消息转发给被 @ 的 Agent。Agent 通过 WebSocket 连接，主进程需维护已连接 Agent 映射，并向被 @ 的 Agent 推送 `message/mention` 通知。

**Why this priority**: Agent 协作的核心能力。

**Independent Test**: 用户发送「请 @Coder 帮忙重构」，Coder Agent 已连接，收到 `message/mention` 通知。

**Acceptance Scenarios**:

1. **Given** 用户发送含 `@Coder` 的消息，**When** 消息写入 DB，**Then** 主进程向已连接的 Coder Agent 推送 `message/mention`
2. **Given** 被 @ 的 Agent 未连接，**When** 消息发送，**Then** 消息仍写入 DB，Agent 重连后可拉取（可选 Phase 3）
3. **Given** 消息含多个 @mention，**When** 发送，**Then** 每个被 @ 的 Agent 都收到通知

---

### User Story 5 - Thread 支持：消息可回复形成线程 (Priority: P1)

用户可点击某条消息的「回复」按钮，在 Thread 面板中回复，形成线程。回复写入 messages 表，`thread_ts` 指向父消息。主区域显示根消息，Thread 面板显示该消息的回复列表。

**Why this priority**: Slack 风格 Thread 是核心交互。

**Independent Test**: 点击消息「回复」，Thread 面板打开，输入回复并发送，回复显示在 Thread 中。

**Acceptance Scenarios**:

1. **Given** 用户选中某条消息，**When** 点击「回复」，**Then** Thread 面板打开并显示该消息及回复
2. **Given** Thread 面板打开，**When** 用户输入回复并发送，**Then** 回复写入 messages（thread_ts=父消息 id），Thread 列表更新
3. **Given** 用户发送 Thread 回复，**When** 回复含 @mention，**Then** 同样触发 Agent 路由

---

### User Story 6 - 侧边栏展示 thread 数量 (Priority: P2)

频道侧边栏项可展示该频道未读/总 thread 数量（可选 Phase 3 简化为「有回复的 thread 数」）。Phase 3 可先实现「有回复数」角标。

**Why this priority**: 让用户知晓频道内讨论活跃度。

**Independent Test**: 某频道有 3 条消息有回复，侧边栏该频道旁显示 `3` 或类似角标。

**Acceptance Scenarios**:

1. **Given** 某频道有 N 条消息含回复（thread_ts 非空），**When** 侧边栏渲染，**Then** 显示 thread 数量角标
2. **Given** 频道无 thread，**When** 渲染，**Then** 不显示角标

---

### Edge Cases

- **@ 补全与输入冲突**：输入 `@` 后按 Esc 关闭补全，不插入内容
- **无效 @mention**：`@unknown-agent` 渲染时仍高亮，但点击可提示「Agent 不存在」
- **Thread 回复的 Agent 路由**：与主频道消息一致
- **空 mentions**：用户发送无 @ 的消息，不触发 Agent 路由

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 输入框输入 `@` 时 MUST 触发 Agent 补全下拉
- **FR-002**: 补全选择后 MUST 插入 `@agent-name` 格式
- **FR-003**: 消息渲染 MUST 高亮 `@agent-name`
- **FR-004**: 点击 `@agent-name` 可触发筛选或跳转（Phase 3 至少实现筛选）
- **FR-005**: 消息含 `mentions` 时 MUST 向已连接 Agent 推送 `message/mention`
- **FR-006**: 消息 MUST 支持 `thread_ts` 作为回复（Phase 2 已有，Phase 3 完善 UI）
- **FR-007**: Thread 面板 MUST 显示父消息及回复列表，支持回复输入
- **FR-008**: 侧边栏频道项 MUST 显示 thread 数量角标（有回复的消息数）

### Key Entities (extend Phase 2)

- **Message**: 新增 `mentions` 字段（JSON 数组，agent id 列表）
- **Thread**: 沿用 Phase 1 数据模型，Thread 面板 UI 完整实现

---

## Success Criteria *(mandatory)*

- **SC-001**: @ 补全在 300ms 内显示
- **SC-002**: 消息含 @mention 时，已连接 Agent 在 500ms 内收到 `message/mention`
- **SC-003**: Thread 回复发送后 2 秒内可见
- **SC-004**: 侧边栏 thread 数量角标与 DB 一致

---

## Out of Scope (Phase 3)

- 跳转 DM（Phase 4）
- Agent 未连接时消息的拉取（Phase 3 仅推送，不实现离线拉取）
- Python SDK 的 mention 示例（可选）
