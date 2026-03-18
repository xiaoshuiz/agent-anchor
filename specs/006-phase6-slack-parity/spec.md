# Feature Specification: Phase 6 - Slack 对齐与能力增强

**Feature Branch**: `006-phase6-slack-parity`  
**Created**: 2025-03-17  
**Status**: Draft  
**Input**: 用户反馈 6 项需求

---

## 与现有 Spec 对照

| 需求 | 现有 Spec | 结论 |
|------|-----------|------|
| 1. 图标尺寸 | Phase 1 未规定具体尺寸 | **新增** |
| 2. 应用内创建 Agent | Phase 4「Agent 管理」未细化创建 | **新增** |
| 3. 创建 Channel + 添加 Agent | 无 | **新增** |
| 4. @mention 消息提醒 | Phase 4 有「新消息通知」，未区分 @me | **扩展** |
| 5. Channel / DM / Activity 分组 | 无，当前仅 Channels + Agents | **新增** |
| 6. 圆角/icon 等 UI 靠拢 Slack | Phase 1「参考 Slack」未细化 | **新增** |

---

## User Scenarios & Testing

### User Story 1 - 图标使用常规尺寸 (Priority: P1)

侧边栏 Agent 图标、频道图标、消息头像等使用 Slack 常规尺寸，避免过大。

**当前**：Agent 头像 `w-6 h-6` (24px)，消息头像 `w-8 h-8` (32px)  
**目标**：侧边栏图标约 18–20px（Slack 风格），消息头像可保持 28–32px

**Acceptance**:
- 侧边栏 Agent/频道项图标 ≤ 20px
- 视觉上与 Slack 截图一致

---

### User Story 2 - 应用内创建 Agent (Priority: P1)

用户可在应用内创建 Agent（类似 Slack 添加成员），无需通过 WebSocket 注册。

**Acceptance**:
- 侧边栏有「添加 Agent」入口（如 + 按钮）
- 弹窗/表单：id、name、description、capabilities（可选）
- 创建后写入 agents 表，侧边栏立即显示
- Agent 创建后为「离线」状态，待其通过 WebSocket 连接后变为在线

---

### User Story 3 - 创建 Channel 并将 Agent 拉入 (Priority: P1)

用户可创建新频道，并将指定 Agent 添加到频道中。

**Acceptance**:
- 侧边栏有「创建频道」入口
- 创建时输入频道名、描述（可选）
- 创建后可选择将哪些 Agent 加入该频道
- 需 channel_members 或等效关联表（channel_id, agent_id）

**Note**: 「拉入」的语义：Agent 加入频道后，可接收该频道的消息与 @mention。需扩展 WebSocket 或 Agent 订阅逻辑。

---

### User Story 4 - @mention 用户时消息提醒 (Priority: P1)

当 Agent（或他人）在消息中 @用户 时，即使用户正在查看其他内容，也应收到明确的消息提醒。

**Acceptance**:
- 消息 `mentions` 包含 `user` 时，触发系统通知
- 通知文案可区分「有人 @了你」与普通新消息
- 即使用户正在查看该频道，@me 也应提醒（可选：可配置）

---

### User Story 5 - Channel / 私信 / 活动 三分组 (Priority: P1)

侧边栏按 Slack 结构分为三组：**Channels**（频道）、**Direct Messages**（与 Agent 私信）、**Activity**（活动，如 Threads）。

**Acceptance**:
- **Channels**：现有频道列表，支持创建新频道
- **Direct Messages**：用户与单个 Agent 的私聊，点击 Agent 可进入 DM
- **Activity**：Threads 或「@我的」等聚合入口
- 数据模型：DM 需 channel 类型（type: 'channel' | 'dm'），dm 的 channel 表示 user+agent 的会话

---

### User Story 6 - UI 靠拢 Slack 设计 (Priority: P2)

圆角、图标风格、间距等尽量与 Slack 截图一致。

**Acceptance**:
- 按钮、输入框、卡片等使用 4–8px 圆角（rounded-md / rounded-lg）
- 图标使用 thin-line 风格（如 lucide-react 默认）
- 配色与 Slack 深色模式接近（深灰背景、紫色/蓝色强调）
- 分组标题、列表项间距参考 Slack

---

## Functional Requirements

- **FR-001**: 侧边栏图标尺寸 ≤ 20px
- **FR-002**: IPC `agents:create`，支持应用内创建 Agent
- **FR-003**: IPC `channels:create`，支持创建频道
- **FR-004**: 表 `channel_members`(channel_id, agent_id)，支持将 Agent 加入频道
- **FR-005**: 消息 `mentions` 含 `user` 时，触发 @me 专用通知
- **FR-006**: channels 表增加 `type` 列（'channel' | 'dm'），dm 关联 user+agent
- **FR-007**: 侧边栏三分组：Channels / Direct Messages / Activity
- **FR-008**: 全局圆角、图标、配色与 Slack 对齐

---

## Success Criteria

- SC-001: 图标尺寸符合常规，视觉协调
- SC-002: 可在应用内创建 Agent 与 Channel
- SC-003: 可将 Agent 加入指定 Channel
- SC-004: @用户 时收到提醒
- SC-005: 可与 Agent 私信，侧边栏三分组正确展示
- SC-006: UI 与 Slack 截图风格一致
