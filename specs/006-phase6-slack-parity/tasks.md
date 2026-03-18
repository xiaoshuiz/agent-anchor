# Phase 6 Tasks

## Phase 6.1 - 图标与 UI 调整 (US1, US6)

- [x] T001: 侧边栏 Agent 头像改为 w-5 h-5 (20px)
- [x] T002: 侧边栏 Channel 项使用 # 图标，尺寸 16px (w-4 h-4)
- [x] T003: 消息头像改为 w-7 (28px)，与 Slack 一致
- [x] T004: 侧边栏列表项使用 rounded-md
- [ ] T005: 卡片、面板使用 rounded-lg，间距调整
- [ ] T006: 配色：选中态使用紫色/蓝色强调（参考 Slack）

## Phase 6.2 - 应用内创建 Agent (US2)

- [ ] T007: db.ts 新增 insertAgent（已有，确认可被 IPC 调用）
- [ ] T008: IPC `agents:create` 实现
- [ ] T009: CreateAgentModal 组件（id, name, description, capabilities）
- [ ] T010: AgentList 添加「+ 添加 Agent」按钮，打开 Modal
- [ ] T011: 创建成功后刷新 agents 列表

## Phase 6.3 - 创建 Channel + 添加 Agent (US3)

- [ ] T012: DB 迁移 v4：channel_members 表
- [ ] T013: db.ts 新增 insertChannel、insertChannelMembers、getChannelMembers
- [ ] T014: IPC `channels:create`、`channels:addMembers`
- [ ] T015: CreateChannelModal 组件（name, description, 多选 Agent）
- [ ] T016: ChannelList 添加「+ 创建频道」按钮
- [ ] T017: 创建成功后刷新 channels 列表

## Phase 6.4 - @mention 用户提醒 (US4)

- [ ] T018: 主进程解析 message.mentions，若含 "user" 则触发 @me 通知
- [ ] T019: 通知文案区分「有人 @了你」与普通新消息
- [ ] T020: 用户正在查看该频道时，@me 是否提醒（可先实现为始终提醒）

## Phase 6.5 - Channel / DM / Activity 三分组 (US5)

- [ ] T021: DB 迁移 v5：channels 表增加 type、dm_agent_id
- [ ] T022: db.ts getOrCreateDm(userId, agentId) 逻辑
- [ ] T023: IPC `channels:getOrCreateDm`
- [ ] T024: Sidebar 重组为 Channels / Direct Messages / Activity 三组
- [ ] T025: DMs 列表：展示与各 Agent 的私聊，点击进入
- [ ] T026: Activity 占位：可先展示「Threads」或「@我的」入口
- [ ] T027: 选中 DM 时主区域展示该 DM 消息

## Phase 6.6 - Polish

- [ ] T028: 端到端验证：创建 Agent → 创建 Channel → 添加 Agent → 发消息
- [ ] T029: 文档更新：README 补充创建 Agent/Channel 说明
