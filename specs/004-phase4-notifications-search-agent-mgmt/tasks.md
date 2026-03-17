# Tasks: Phase 4 - 通知、搜索与 Agent 管理

**Branch**: `004-phase4-notifications-search-agent-mgmt`

## Phase 1: Setup & DB

- [x] **T001** 创建 `specs/004-phase4-notifications-search-agent-mgmt/` 目录结构
- [x] **T002** DB 迁移 v2：新增 `channel_unread` 表
- [x] **T003** db.ts：实现 `getUnreadCounts`、`markChannelRead`、`incrementUnread`
- [x] **T004** db.ts：实现 `searchMessages(keyword, channelId?, fromId?)`

## Phase 2: IPC & WebSocket

- [x] **T005** ipc-handlers：`unread:get`、`unread:markRead`、`unread:increment`
- [x] **T006** ipc-handlers：`search:query`
- [x] **T007** websocket-server：维护 `agentId → WebSocket` 映射，连接/断开时更新
- [x] **T008** ipc-handlers：`agents:getStatus`，从 websocket-server 读取在线状态
- [x] **T009** preload + electron.d.ts：暴露 unread、search、agents.getStatus

## Phase 3: 系统通知

- [x] **T010** 主进程：新消息到达时，若 BrowserWindow 未聚焦，调用 `new Notification()`
- [x] **T011** 通知逻辑：排除当前正在查看的频道

## Phase 4: 未读标记

- [x] **T012** 新消息到达时调用 `unread:increment`（仅当目标频道非当前频道）
- [x] **T013** 用户切换频道时调用 `unread:markRead`
- [x] **T014** ChannelList：显示未读角标（数字或红点）
- [x] **T015** useUnread hook：订阅 unread 数据，支持 invalidated 刷新

## Phase 5: 搜索

- [x] **T016** Search 组件：搜索框、搜索按钮/Enter
- [x] **T017** Search 组件：结果列表（消息摘要、频道、发送者、时间）
- [x] **T018** Search 组件：按频道、按 Agent 过滤下拉
- [x] **T019** 点击搜索结果：跳转到对应频道并滚动到该消息
- [x] **T020** useSearch hook：调用 search:query，管理 loading/error
- [x] **T021** App 布局：搜索入口（ChannelHeader 或全局快捷键 Cmd+K）

## Phase 6: Agent 状态与详情

- [x] **T022** AgentList：Agent 项旁显示在线/离线状态（绿点/灰点）
- [x] **T023** useAgentStatus hook：获取 agents:getStatus，支持 statusChanged 刷新
- [x] **T024** AgentDetail 组件：展示 name、description、capabilities
- [x] **T025** 点击 Agent 打开 AgentDetail 面板（侧边或弹窗）

## Phase 7: Polish

- [ ] **T026** 通知权限：首次使用前请求，拒绝时应用内提示
- [x] **T027** 空状态：搜索无结果时显示友好提示
- [x] **T028** 验证：pnpm run build、tsc --noEmit 通过
