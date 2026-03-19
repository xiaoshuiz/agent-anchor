# Phase 7 Tasks

## Phase 7.1 - 数据与存储

- [x] T001: DB 迁移 v6：agents 表增加 provider 列
- [x] T002: insertAgent 支持 provider，claude 时自动生成 id
- [x] T003: getAgentById、agentsList 返回 provider
- [x] T004: agentKeysStore 使用 app.getPath('userData') 确保持久化

## Phase 7.2 - Claude 调用与 IPC

- [x] T005: electron/claude-responder.ts，调用 Anthropic API
- [x] T006: IPC agents:setApiKey、agents:hasApiKey
- [x] T007: messages:send 根据 agent.provider 路由 Claude vs WebSocket

## Phase 7.3 - Settings 与 Create Agent

- [x] T008: SettingsModal 组件，Claude API Key 配置
- [x] T009: Sidebar 齿轮图标，打开 Settings
- [x] T010: uiStore refreshClaudeConfig、claudeConfigUpdatedTrigger
- [x] T011: CreateAgentModal 简化为 Claude 主流程（name, description）
- [x] T012: CreateAgentModal 依赖 claudeConfigUpdatedTrigger 刷新 hasClaudeKey

## Phase 7.4 - @mention 多词

- [x] T013: parseMentions 正则支持多词名
- [x] T014: MessageInput 补全 query 使用完整 afterAt

## Phase 7.5 - 状态与文档

- [x] T015: agents:getStatus 中 claude 且已配置 = online
- [x] T016: README 更新 Claude 配置流程
