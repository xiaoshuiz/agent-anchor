# Phase 7 Technical Plan - Claude 应用内集成

## Technical Context

- **Base**: Phase 1–6 已完成
- **新增依赖**: @anthropic-ai/sdk
- **存储**: electron-store (agent-keys)，cwd: app.getPath('userData')

## Data Model Changes

### agents 表

```sql
ALTER TABLE agents ADD COLUMN provider TEXT DEFAULT 'websocket';
```

- `provider='claude'`: 主进程调用 Anthropic API
- `provider='websocket'`: 外部 WebSocket 连接（原有逻辑）

### insertAgent 扩展

- provider='claude' 时 id 可选，自动生成 `claude-${slugify(name)}`，冲突时追加 -2、-3

## IPC Additions

| IPC | 说明 |
|-----|------|
| `agents:setApiKey(agentId, apiKey)` | 存储 API Key（agentId='claude' 为全局配置） |
| `agents:hasApiKey(agentId)` | 检查是否已配置 |

## Component Changes

| 组件 | 变更 |
|------|------|
| Sidebar | 齿轮图标，打开 SettingsModal |
| 新建 SettingsModal | Claude API Key 配置 |
| CreateAgentModal | 简化为 Claude 主流程（name, description）；refreshClaudeConfig 触发刷新 |
| uiStore | claudeConfigUpdatedTrigger、refreshClaudeConfig |

## Message Flow

1. 用户发送消息（DM 或 @mention）
2. messages:send 插入用户消息
3. 获取 dm_agent_id 或 mentions 中的 agent
4. 若 agent.provider='claude' 且已配置 API Key：
   - 调用 respondWithClaude(apiKey, content, { agentName, agentDescription })
   - 插入 agent 回复
   - 通知渲染进程刷新
5. 否则：push message/dm 或 message/mention 到 WebSocket（原有逻辑）

## parseMentions 扩展

- 正则：`/@([\w\p{L}\p{N}_-]+(?:\s+[\w\p{L}\p{N}_-]+)*)/gu`
- 匹配 @Claude Writer、@Claude 写作助手 等（含中文）

## Implementation Order

1. agent.provider 迁移
2. claude-responder、agentKeysStore
3. agents:setApiKey、agents:hasApiKey
4. SettingsModal、refreshClaudeConfig
5. CreateAgentModal 简化、claudeConfigUpdatedTrigger
6. messages:send 路由逻辑
7. parseMentions 多词支持
