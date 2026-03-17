# Tasks: Phase 2 - 本地 WebSocket 与 Agent 通信

**Input**: Design documents from `specs/002-phase2-websocket-agent/`  
**Prerequisites**: Phase 1 完成；plan.md, spec.md, data-model.md, contracts/

## Phase 2.1: 用户消息发送

- [x] T201 [US1] Add electron/db.ts: insertMessage(channelId, fromType, fromId, content, threadTs?)
- [x] T202 [US1] Add electron/ipc-handlers.ts: messages:send handler
- [x] T203 [US1] Update electron/preload.ts: expose messages.send
- [x] T204 [US1] Update electron/types: Message in send response
- [x] T205 [US1] Update MessageInput.tsx: on Enter call messages.send, clear input, validate empty
- [x] T206 [US1] Add messages:subscribe or poll for new messages (renderer refresh); 或 MessageInput 发送后触发父组件刷新

**Checkpoint**: 用户可发送消息并持久化

## Phase 2.2: WebSocket 服务

- [x] T207 [US2] Add ws to package.json
- [x] T208 [US2] Create electron/websocket-server.ts: start server on port 8765
- [x] T209 [US2] Parse incoming JSON, route by method (agent/register, message/send)
- [x] T210 [US2] Update electron/main.ts: init WebSocket server on app ready

**Checkpoint**: WebSocket 可连接

## Phase 2.3: Agent 注册与消息

- [x] T211 [US3] Add electron/db.ts: insertAgent (upsert by id)
- [x] T212 [US3] Handle agent/register in websocket-server: insertAgent, reply success
- [x] T213 [US4] Handle message/send in websocket-server: validate channel, insertMessage
- [x] T214 [US4] Notify renderer of new Agent/Message (IPC broadcast or poll)

**Checkpoint**: Agent 可注册、发消息

## Phase 2.4: 渲染进程实时更新

- [x] T215 Add IPC messages:onNewMessage or use polling in useMessages
- [x] T216 useMessages 支持刷新：发送后 refetch，或 main 进程 broadcast

**Checkpoint**: 新消息实时显示

## Phase 2.5: Node SDK 示例

- [x] T217 Create examples/agent-node/index.js: connect, register, send message
- [x] T218 Create examples/agent-node/README.md: 使用说明

**Checkpoint**: SDK 示例可运行
