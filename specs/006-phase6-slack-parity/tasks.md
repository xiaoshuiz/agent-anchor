# Phase 6 Tasks

## Phase 6.1 - 图标与 UI 调整 (US1, US6)

- [x] T001: 侧边栏 Agent 头像改为 w-5 h-5 (20px)
- [x] T002: 侧边栏 Channel 项使用 # 图标，尺寸 16px (w-4 h-4)
- [x] T003: 消息头像改为 w-7 (28px)，与 Slack 一致
- [x] T004: 侧边栏列表项使用 rounded-md
- [x] T005: 卡片、面板使用 rounded-lg，间距调整
- [x] T006: 配色：选中态使用紫色强调（参考 Slack）

## Phase 6.2 - 应用内创建 Agent (US2)

- [x] T007: db.ts insertAgent 已有
- [x] T008: IPC `agents:create` 实现
- [x] T009: CreateAgentModal 组件（id, name, description, capabilities）
- [x] T010: DmList 添加「+ Add Agent」按钮，打开 Modal
- [x] T011: 创建成功后刷新 agents 列表

## Phase 6.3 - 创建 Channel + 添加 Agent (US3)

- [x] T012: DB 迁移 v4：channel_members 表
- [x] T013: db.ts 新增 insertChannel、insertChannelMembers、getChannelMembers
- [x] T014: IPC `channels:create`、`channels:addMembers`
- [x] T015: CreateChannelModal 组件（name, description, 多选 Agent）
- [x] T016: ChannelList 添加「+ Create channel」按钮
- [x] T017: 创建成功后刷新 channels 列表

## Phase 6.4 - @mention 用户提醒 (US4)

- [x] T018: 主进程解析 message.mentions，若含 "user" 则触发 @me 通知
- [x] T019: 通知文案区分「Someone mentioned you」与普通新消息
- [x] T020: @me 时始终提醒（含当前频道）

## Phase 6.5 - Channel / DM / Activity 三分组 (US5)

- [x] T021: DB 迁移 v5：channels 表增加 type、dm_agent_id
- [x] T022: db.ts getOrCreateDm(agentId) 逻辑
- [x] T023: IPC `channels:getOrCreateDm`
- [x] T024: Sidebar 重组为 Channels / Direct Messages / Activity 三组
- [x] T025: DMs 列表：展示所有 Agent，点击即创建/打开 DM
- [x] T026: Activity：@Mentions 入口
- [x] T027: 选中 DM 时主区域展示该 DM 消息

## Phase 6.6 - Polish

- [x] T028: 端到端验证：创建 Agent → 创建 Channel → 添加 Agent → 发消息
- [x] T029: 文档更新：README 补充创建 Agent/Channel 说明
