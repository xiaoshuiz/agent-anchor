# Feature Specification: Phase 1 - 基础框架与 UI 骨架

**Feature Branch**: `feat/phase1-ui-skeleton`  
**Created**: 2025-03-17  
**Status**: Draft (待 Review)  
**Input**: 基于 docs/PLAN.md Phase 1 设计

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 打开应用并看到 Slack 风格三栏布局 (Priority: P1)

用户启动 Agent Anchor 后，应看到类似 Slack 的三栏布局：左侧边栏展示工作区/频道/Agent 列表，中间主区域展示当前选中频道或对话的消息列表，右侧可展示线程详情（Phase 1 可为占位或折叠）。

**Why this priority**: 这是用户首次接触产品的核心视觉与导航体验，决定产品认知。

**Independent Test**: 运行 `pnpm run dev`，应用窗口打开后，肉眼验证三栏结构存在且布局合理。

**Acceptance Scenarios**:

1. **Given** 应用已启动，**When** 用户查看主界面，**Then** 可见左侧边栏、中间主区域、右侧面板（或可折叠占位）
2. **Given** 侧边栏存在，**When** 用户查看，**Then** 可见「Channels」与「Agents」分组标题
3. **Given** 中间主区域存在，**When** 用户查看，**Then** 可见频道标题栏与消息展示区域
4. **Given** 底部存在，**When** 用户查看，**Then** 可见消息输入框占位

---

### User Story 2 - 侧边栏展示 Mock 频道与 Agent 列表 (Priority: P1)

侧边栏应展示至少一个 Mock 频道（如 #general）和至少一个 Mock Agent（如 Coder），供用户理解产品结构。

**Why this priority**: 无内容的空列表无法传达产品意图，Mock 数据是 Phase 1 的验收标准之一。

**Independent Test**: 启动应用，检查侧边栏是否显示 #general 和至少一个 Agent 名称。

**Acceptance Scenarios**:

1. **Given** 应用已启动，**When** 用户查看 Channels 区域，**Then** 可见 #general
2. **Given** 应用已启动，**When** 用户查看 Agents 区域，**Then** 可见至少一个 Agent（如 Coder）
3. **Given** 用户点击 #general，**When** 点击完成，**Then** 中间主区域标题显示 #general（选中态）

---

### User Story 3 - 主区域展示 Mock 消息列表 (Priority: P1)

中间主区域应展示 Mock 消息列表，包含消息气泡、发送者标识、时间戳。消息可来自「用户」或「Agent」。

**Why this priority**: 消息列表是核心交互区域，无消息则无法验证布局与样式。

**Independent Test**: 启动应用，选中 #general，检查主区域是否显示至少 2–3 条 Mock 消息。

**Acceptance Scenarios**:

1. **Given** 用户已选中 #general，**When** 查看主区域，**Then** 可见至少 2 条 Mock 消息
2. **Given** 消息存在，**When** 用户查看，**Then** 每条消息包含：发送者（用户/Agent 名）、内容、时间戳
3. **Given** 消息存在，**When** 用户查看，**Then** 消息气泡样式区分用户与 Agent（可选：左右对齐或颜色区分）

---

### User Story 4 - 输入框可输入文字（暂不发送）(Priority: P2)

底部输入框应可聚焦、可输入文字。Phase 1 不要求实际发送，仅验证输入能力。

**Why this priority**: 输入框是后续消息发送与 @提及 的基础，需尽早占位。

**Independent Test**: 点击输入框，输入文字，确认可输入且无报错。

**Acceptance Scenarios**:

1. **Given** 用户选中某频道，**When** 点击底部输入框，**Then** 可聚焦并输入文字
2. **Given** 用户已输入文字，**When** 按 Enter 或点击发送，**Then** Phase 1 可不做任何事（或仅 console.log），不报错

---

### User Story 5 - 深色/浅色主题切换 (Priority: P3)

应用应支持深色与浅色主题切换，切换后界面颜色随之更新。

**Why this priority**: 提升体验，非 Phase 1 核心，可后置。

**Independent Test**: 通过设置或快捷键切换主题，验证侧边栏、主区域、输入框颜色变化。

**Acceptance Scenarios**:

1. **Given** 应用在浅色模式，**When** 用户切换到深色，**Then** 界面整体变为深色风格
2. **Given** 应用在深色模式，**When** 用户切换到浅色，**Then** 界面整体变为浅色风格

---

### Edge Cases

- **空状态**：若 Mock 数据加载失败，应显示占位文案（如「暂无消息」），不白屏
- **窗口缩放**：侧边栏可固定宽度，主区域自适应；最小窗口宽度时侧边栏可折叠
- **无频道/Agent**：若 Mock 列表为空，侧边栏应显示空状态提示，不崩溃

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 应用 MUST 在 macOS 上以 Electron 窗口形式启动并展示三栏布局
- **FR-002**: 侧边栏 MUST 展示至少一个 Mock 频道（#general）和至少一个 Mock Agent
- **FR-003**: 主区域 MUST 展示 Mock 消息列表，每条消息包含发送者、内容、时间戳
- **FR-004**: 底部 MUST 提供可聚焦、可输入的文字输入框
- **FR-005**: 点击侧边栏频道/Agent 时，主区域 MUST 更新为对应选中态（高亮/标题更新）
- **FR-006**: 消息气泡 MUST 能区分用户消息与 Agent 消息（视觉上）
- **FR-007**: 应用 MUST 支持深色/浅色主题（Phase 1 可简化实现）

### Key Entities

- **Channel**: 频道，含 id、name（如 #general）、可选 description
- **Agent**: Agent，含 id、name（如 Coder）、可选 description、avatar
- **Message**: 消息，含 id、channelId、from（user | agent-id）、content、timestamp、可选 threadTs
- **User**: 当前用户，Phase 1 可简化为固定标识（如 "You"）

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户启动应用后 3 秒内可见完整三栏布局
- **SC-002**: Mock 消息列表在 100 条以内时滚动流畅，无卡顿
- **SC-003**: 输入框可连续输入 500 字符无异常
- **SC-004**: 主题切换后界面在 1 秒内完成视觉更新

---

## Out of Scope (Phase 1)

- 真实消息发送与持久化
- WebSocket / Agent 连接
- SQLite 数据库
- @提及 解析与补全
- Thread 详情面板完整实现
- 搜索、通知、未读标记
