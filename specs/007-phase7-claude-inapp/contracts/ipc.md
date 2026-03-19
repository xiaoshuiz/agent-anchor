# IPC Contracts: Phase 7 (Claude 应用内)

## agents 扩展

- `agents:setApiKey(agentId: string, apiKey: string)` → `Promise<void>`  
  存储 API Key。agentId='claude' 为全局 Claude 配置。空 key 则删除。

- `agents:hasApiKey(agentId: string)` → `Promise<boolean>`  
  检查是否已配置。

## agents:create 扩展

- 新增参数 `provider?: 'claude' | 'websocket'`
- provider='claude' 时：id 可选（自动生成），需先配置 agents:setApiKey('claude', key)
- provider='websocket' 时：id 必填（原有逻辑）

## agents:getStatus 扩展

- provider='claude' 且已配置 API Key 的 agent 显示为 'online'
