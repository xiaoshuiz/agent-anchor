# Tasks: Phase 3 - @提及与 Agent 协作

**Branch**: `003-phase3-mention-thread` | **Spec**: [spec.md](./spec.md)

## Phase 1: DB & IPC

- [ ] **T001** 在 db.ts 中增加 migration v2：`ALTER TABLE messages ADD COLUMN mentions TEXT`
- [ ] **T002** 扩展 `insertMessage` 支持 `mentions?: string[]`，写入 JSON 字符串
- [ ] **T003** 新增 `messagesListByThread(db, channelId, rootMessageId): Message[]`
- [ ] **T004** 新增 `getThreadCountByChannel(db, channelId): number`
- [ ] **T005** 扩展 IPC `messages:send` 支持 `threadTs`、`mentions` 参数
- [ ] **T006** 新增 IPC `messages:listByThread(channelId, rootMessageId)`
- [ ] **T007** 新增 IPC `channels:getThreadCount(channelId)`
- [ ] **T008** 更新 preload 与 electron.d.ts 暴露新 API

## Phase 2: WebSocket Agent 路由

- [ ] **T009** 在 websocket-server 中维护 `Map<agentId, WebSocket>`，agent/register 时绑定
- [ ] **T010** 扩展 message/send 支持 `mentions` 参数
- [ ] **T011** 消息写入后，遍历 mentions，向已连接的 Agent 推送 `message/mention`
- [ ] **T012** 用户通过 IPC 发送的消息，主进程解析 mentions 并触发 Agent 推送

## Phase 3: @ 补全 UI

- [ ] **T013** MessageInput：监听 `@` 输入，触发补全下拉
- [ ] **T014** MessageInput：补全列表按 Agent 名称过滤；选择后插入 `@agent-name`
- [ ] **T015** MessageInput：Esc 关闭补全；补全定位（光标位置）

## Phase 4: 消息高亮与回复

- [ ] **T016** MessageBubble：解析 content 中的 `@agent-name`，高亮渲染（可点击）
- [ ] **T017** MessageBubble：新增「回复」按钮，点击设置 selectedThreadRootId
- [ ] **T018** 新增 ThreadPanel 组件：显示父消息 + 回复列表 + 输入框
- [ ] **T019** 主区域 MessageList：仅显示 thread_ts 为 NULL 的根消息
- [ ] **T020** App 布局：Thread 面板在右侧，选中 thread 时显示

## Phase 5: 侧边栏与筛选

- [ ] **T021** ChannelList：调用 getThreadCount，显示 thread 数量角标
- [ ] **T022** 点击 @mention 触发筛选：uiStore 设置 mentionFilterAgentId，MessageList 过滤
- [ ] **T023** 解析 content 提取 mentions：工具函数 `parseMentions(content, agents): string[]`

## Phase 6: Polish

- [ ] **T024** 更新 examples/agent-node 示例：监听 message/mention，打印并可选回复
- [ ] **T025** 验证：@ 补全、高亮、Thread、Agent 推送、角标 端到端测试
