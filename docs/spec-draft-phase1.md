# Feature Specification: Phase 1 - 基础框架与 UI 骨架

**Feature Branch**: `001-phase1-ui-skeleton`  
**Spec-Kit 规格**: `specs/001-phase1-ui-skeleton/spec.md`  
**Created**: 2025-03-17  
**Status**: Draft (已根据 Clarify 更新)  
**Input**: 基于 docs/PLAN.md Phase 1 设计 + Clarify 反馈

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 打开应用并看到 Slack 风格三栏布局 (Priority: P1)

用户启动 Agent Anchor 后，应看到类似 Slack 的三栏布局：左侧边栏展示工作区/频道/Agent 列表，中间主区域展示当前选中频道或对话的消息列表，右侧可展示线程详情（Phase 1 可为占位或折叠）。

**Why this priority**: 这是用户首次接触产品的核心视觉与导航体验，决定产品认知。

**Independent Test**: 运行 `pnpm run dev`，应用窗口打开后，肉眼验证三栏结构存在且布局合理。

**Acceptance Scenarios**:

1. **Given** 应用已启动，**When** 用户查看主界面，**Then** 可见左侧边栏、中间主区域、右侧面板（或可折叠占位）
2. **Given** 侧边栏存在，**When** 用户查看，**Then** 可见「Channels」与「Agents」分组标题
3. **Given** 侧边栏存在，**When** 用户查看，**Then** 可见专用折叠/展开按钮
4. **Given** 中间主区域存在，**When** 用户查看，**Then** 可见频道标题栏与消息展示区域
5. **Given** 底部存在，**When** 用户查看，**Then** 可见消息输入框

---

### User Story 2 - 侧边栏展示频道与 Agent 列表（真实数据）(Priority: P1)

侧边栏从真实数据层（SQLite）读取频道与 Agent 列表。首次启动时数据库为空，可预置默认 #general 频道，或展示空状态。无 Mock 数据，应用为可直接执行的完整应用。

**Why this priority**: 应用需从首日即可运行，使用真实数据结构，便于后续扩展。

**Independent Test**: 启动应用，检查侧边栏是否从数据层加载频道与 Agent；空数据时显示空状态插画。

**Acceptance Scenarios**:

1. **Given** 首次启动（空库），**When** 用户查看，**Then** 可见空状态或预置 #general
2. **Given** 存在频道与 Agent，**When** 用户查看侧边栏，**Then** 显示真实数据列表
3. **Given** 用户点击某频道，**When** 点击完成，**Then** 中间主区域标题更新为选中频道

---

### User Story 3 - 主区域展示消息列表（真实数据）(Priority: P1)

中间主区域从真实数据层读取消息。无消息时展示空状态插画。消息气泡、发送者、时间戳交互均参考 Slack。

**Why this priority**: 消息列表是核心交互区域，真实数据确保架构正确。

**Independent Test**: 启动应用，选中频道，检查主区域是否显示消息或空状态插画。

**Acceptance Scenarios**:

1. **Given** 频道无消息，**When** 用户查看主区域，**Then** 显示空状态插画（非纯文字）
2. **Given** 频道有消息，**When** 用户查看，**Then** 每条消息包含发送者、内容、时间戳，交互参考 Slack
3. **Given** 消息存在，**When** 用户查看，**Then** 消息气泡样式区分用户与 Agent（参考 Slack 左右布局）

---

### User Story 4 - 输入框可输入文字（暂不发送）(Priority: P2)

底部输入框可聚焦、可输入文字。Phase 1 不要求实际发送，仅验证输入能力。

**Why this priority**: 输入框是后续消息发送与 @提及 的基础。

**Independent Test**: 点击输入框，输入文字，确认可输入且无报错。

**Acceptance Scenarios**:

1. **Given** 用户选中某频道，**When** 点击底部输入框，**Then** 可聚焦并输入文字
2. **Given** 用户已输入文字，**When** 按 Enter 或点击发送，**Then** Phase 1 可不做任何事，不报错

---

### User Story 5 - 跟随系统主题 (Priority: P2)

应用主题跟随系统（prefers-color-scheme），无需应用内切换。

**Why this priority**: 简化实现，符合系统一致性。

**Independent Test**: 切换系统深色/浅色模式，验证应用主题随之更新。

**Acceptance Scenarios**:

1. **Given** 系统为浅色模式，**When** 应用启动，**Then** 应用为浅色主题
2. **Given** 系统为深色模式，**When** 应用启动，**Then** 应用为深色主题
3. **Given** 应用运行中，**When** 用户切换系统主题，**Then** 应用主题在合理时间内更新

---

### User Story 6 - 侧边栏折叠为图标栏 (Priority: P2)

侧边栏支持折叠，折叠后收窄为图标栏（约 48–64px）。有专用折叠/展开按钮，折叠状态可持久化。

**Why this priority**: 提升空间利用，参考 Slack 交互。

**Independent Test**: 点击折叠按钮，侧边栏收窄为图标栏；再次点击展开。

**Acceptance Scenarios**:

1. **Given** 侧边栏展开，**When** 用户点击折叠按钮，**Then** 侧边栏收窄为图标栏
2. **Given** 侧边栏折叠，**When** 用户点击展开按钮，**Then** 侧边栏恢复完整宽度
3. **Given** 用户折叠侧边栏后关闭应用，**When** 再次启动，**Then** 折叠状态保持

---

### User Story 7 - 应用图标与品牌 (Priority: P2)

应用拥有符合「Anchor」概念的图标，并应用于窗口、任务栏、安装包。

**Why this priority**: 品牌识别与专业度。

**Independent Test**: 查看窗口标题栏、Dock/任务栏、打包后的 .app 图标。

**Acceptance Scenarios**:

1. **Given** 应用运行，**When** 用户查看窗口，**Then** 窗口显示 Anchor 图标
2. **Given** 应用打包完成，**When** 用户查看 .app 或安装包，**Then** 使用 Anchor 图标

---

### User Story 8 - 空状态插画与 Error Boundary (Priority: P2)

无数据时展示设计的空状态插画；应用有全局 Error Boundary，捕获渲染错误时显示 fallback UI，不白屏。

**Why this priority**: 提升体验与稳定性。

**Independent Test**: 清空数据触发空状态；人为制造组件错误，验证 Error Boundary 生效。

**Acceptance Scenarios**:

1. **Given** 频道无消息，**When** 用户查看主区域，**Then** 显示空状态插画（非纯文字）
2. **Given** 无频道/Agent，**When** 用户查看侧边栏，**Then** 显示相应空状态插画
3. **Given** 某组件抛出未捕获错误，**When** 错误发生，**Then** Error Boundary 捕获并显示 fallback，不白屏

---

### User Story 9 - GitHub CI/CD 自动打包发布 (Priority: P1)

合入 main 后，GitHub Actions 自动构建 macOS 应用并发布 Release（含安装包或 .app）。

**Why this priority**: 自动化交付，便于测试与分发。

**Independent Test**: 合并 PR 到 main，检查 Actions 是否成功，Release 是否生成。

**Acceptance Scenarios**:

1. **Given** PR 合入 main，**When** CI 触发，**Then** 构建成功并生成 macOS 产物
2. **Given** 构建成功，**When** 流程完成，**Then** 自动创建/更新 GitHub Release，附带构建产物

---

### Edge Cases

- **空状态**：无频道、无 Agent、无消息时，分别展示对应空状态插画
- **窗口缩放**：侧边栏可折叠为图标栏；主区域自适应
- **Error Boundary**：捕获 React 渲染错误，显示友好 fallback，支持重试或刷新
- **主题**：仅跟随系统，无应用内切换

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 应用 MUST 在 macOS 上以 Electron 窗口形式启动并展示三栏布局
- **FR-002**: 侧边栏 MUST 从真实数据层（SQLite）读取频道与 Agent，无 Mock 数据
- **FR-003**: 主区域 MUST 从真实数据层读取消息；无消息时展示空状态插画
- **FR-004**: 底部 MUST 提供可聚焦、可输入的文字输入框
- **FR-005**: 点击侧边栏频道/Agent 时，主区域 MUST 更新为对应选中态
- **FR-006**: 消息气泡、时间戳、头像等交互 MUST 参考 Slack
- **FR-007**: 应用 MUST 跟随系统主题（prefers-color-scheme）
- **FR-008**: 侧边栏 MUST 支持折叠为图标栏，有专用折叠/展开按钮，状态持久化
- **FR-009**: 应用 MUST 有符合 Anchor 概念的图标，应用于窗口与打包产物
- **FR-010**: 应用 MUST 有全局 Error Boundary，捕获错误时显示 fallback
- **FR-011**: 合入 main 后，GitHub Actions MUST 自动构建并发布 Release

### Key Entities

- **Channel**: 频道，id、name（如 #general）、description
- **Agent**: Agent，id、name、description、avatar
- **Message**: 消息，id、channelId、from（user | agent-id）、content、timestamp、threadTs
- **User**: 当前用户，固定标识

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户启动应用后 3 秒内可见完整三栏布局
- **SC-002**: 消息列表在 100 条以内时滚动流畅
- **SC-003**: 输入框可连续输入 500 字符无异常
- **SC-004**: 主题随系统切换在 2 秒内更新
- **SC-005**: CI 从合入到 Release 生成在 15 分钟内完成

---

## Out of Scope (Phase 1)

- 真实消息发送与持久化（输入框仅占位）
- WebSocket / Agent 实时连接
- @提及 解析与补全
- Thread 详情面板完整实现
- 搜索、通知、未读标记
- 应用内主题切换（仅跟随系统）
