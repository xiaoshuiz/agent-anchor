# Phase 6 Technical Plan - Slack 对齐与能力增强

## Technical Context

- **Base**: Phase 1–5 已完成（UI、WebSocket、@mention、Thread、通知、搜索、MCP）
- **DB**: SQLite，主进程 only
- **UI**: React + Tailwind，侧边栏/Channel/Thread 三栏

## Constitution Check

| 原则 | 符合 |
|------|------|
| I. Spec-Driven | ✓ |
| II. Local-First | ✓ 无云端依赖 |
| III. Electron 边界 | ✓ 新增 IPC，无渲染进程直接 DB |
| IV. Agent 协议 | ✓ channel_members 扩展，不破坏现有 WebSocket |
| V. TypeScript strict | ✓ |
| VI. SQLite 主进程 | ✓ |
| VII. 可观测性 | ✓ |
| VIII. Slack 风格 | ✓ 本 Phase 强化 |

## Data Model Changes

### channels 表

```sql
ALTER TABLE channels ADD COLUMN type TEXT DEFAULT 'channel' CHECK (type IN ('channel', 'dm'));
ALTER TABLE channels ADD COLUMN dm_agent_id TEXT REFERENCES agents(id);  -- 仅 type='dm' 时有效
```

- `type='channel'`: 普通频道
- `type='dm'`: 用户与 agent 的私聊，`dm_agent_id` 指向对方 Agent

### channel_members 表（新增）

```sql
CREATE TABLE channel_members (
  channel_id TEXT NOT NULL REFERENCES channels(id),
  agent_id TEXT NOT NULL REFERENCES agents(id),
  PRIMARY KEY (channel_id, agent_id)
);
```

- 仅对 `type='channel'` 的频道有效
- DM 不需要（user+agent 固定两人）

## IPC Additions

| IPC | 说明 |
|-----|------|
| `agents:create` | 创建 Agent (id, name, description, capabilities) |
| `channels:create` | 创建频道 (name, description) |
| `channels:addMembers` | 将 Agent 加入频道 (channelId, agentIds[]) |
| `channels:getOrCreateDm` | 获取或创建与某 Agent 的 DM |

## Component Changes

| 组件 | 变更 |
|------|------|
| Sidebar | 三分组：Channels / DMs / Activity；图标 20px |
| AgentList | 添加「创建 Agent」入口；点击 Agent 进入 DM |
| ChannelList | 添加「创建频道」入口 |
| 新建 CreateAgentModal | 表单创建 Agent |
| 新建 CreateChannelModal | 表单创建频道 + 选择 Agent |
| MessageBubble | 头像尺寸可微调 |
| 全局 | rounded-md/lg，配色靠拢 Slack |

## Notification Logic

- 现有：`onNewMessage(channelId)`，非当前频道时弹通知
- 新增：解析 `mentions`，若含 `user`，无论当前频道都弹「有人 @了你」类通知

## Implementation Order

1. **US1 + US6**：图标尺寸 + UI 圆角/配色（快速见效）
2. **US2**：创建 Agent
3. **US3**：创建 Channel + channel_members
4. **US4**：@me 通知增强
5. **US5**：DM 数据模型 + 三分组侧边栏
