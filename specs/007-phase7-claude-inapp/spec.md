# Feature Specification: Phase 7 - Claude 应用内集成

**Feature Branch**: `cursor/mcp-protocol-compatibility-8d79`  
**Created**: 2025-03  
**Status**: Implemented  
**Input**: 用户需求「在 app 内管理 agent 并与之交互，无需 shell」

---

## 与现有 Spec 对照

| 需求 | 现有 Spec | 结论 |
|------|-----------|------|
| Claude 配置入口 | Phase 4/6 未涉及 | **新增** |
| 应用内 Claude 对话 | Phase 2 WebSocket Agent | **扩展**：主进程直接调用 Anthropic API |
| 多 Claude agent | 无 | **新增** |
| @mention 多词名 | Phase 3 仅单词 | **扩展** |

---

## User Scenarios & Testing

### User Story 1 - Claude 专用配置入口 (Priority: P1)

用户可在应用内配置 Claude API Key，一次配置，所有 Claude agent 共用。

**Acceptance**:
- 侧边栏有设置入口（齿轮图标）
- 设置弹窗：Claude API Key 输入、保存
- 配置持久化，重启后仍有效
- 配置后 Create Agent 按钮可用

---

### User Story 2 - 应用内 Claude 对话 (Priority: P1)

用户向 Claude agent 发消息时，主进程直接调用 Anthropic API，无需运行外部 bridge 进程。

**Acceptance**:
- DM 或 @mention Claude agent 时，主进程调用 Claude API
- 回复自动插入消息列表
- 无需 shell 或 examples/agent-claude

---

### User Story 3 - 多 Claude agent 不同身份 (Priority: P1)

用户可创建多个 Claude agent，每个有不同名称和身份描述。

**Acceptance**:
- Add Agent 时输入名称、身份描述（可选）
- 每个 agent 有唯一 id（自动生成，如 claude-写作助手）
- 回复时使用 agent 的 name/description 作为 system prompt 上下文

---

### User Story 4 - @mention 多词名补全 (Priority: P1)

支持 @Claude Writer、@Claude 写作助手 等多词名称的补全与解析。

**Acceptance**:
- 输入 @ 后按内容过滤 agent 列表
- 选择后插入 @AgentName（含空格）
- parseMentions 正确解析多词名并匹配 agent id

---

## Functional Requirements

- **FR-001**: IPC `agents:setApiKey(agentId, apiKey)`、`agents:hasApiKey(agentId)`
- **FR-002**: 主进程 `claude-responder` 调用 Anthropic API
- **FR-003**: agents 表增加 `provider` 列（'claude' | 'websocket'）
- **FR-004**: 配置存储使用 electron-store，路径 `app.getPath('userData')`
- **FR-005**: Create Agent 时 provider='claude' 则无需 id，自动生成
- **FR-006**: messages:send 时根据 agent.provider 路由：claude 走 API，websocket 走 push
- **FR-007**: uiStore `claudeConfigUpdatedTrigger`，Settings 保存后触发 CreateAgentModal 刷新
- **FR-008**: parseMentions 支持多词匹配，含中文（`[\w\p{L}\p{N}_-]+`，u flag）

---

## Success Criteria

- SC-001: 设置中配置 API Key 后，Create Agent 按钮立即可用
- SC-002: 再次打开设置显示「已配置」
- SC-003: 创建 Claude agent 后可直接 DM 或 @mention 对话
- SC-004: 支持多个不同身份的 Claude agent
- SC-005: @Claude Writer 等多词名正确补全与解析
