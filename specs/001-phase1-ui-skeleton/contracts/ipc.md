# IPC Contract: Agent Anchor Phase 1

**Context**: Electron 主进程通过 preload 暴露给渲染进程的 API。

## Exposed API (contextBridge)

```typescript
interface ElectronAPI {
  // Channels
  channels: {
    list: () => Promise<Channel[]>;
    get: (id: string) => Promise<Channel | null>;
  };
  // Agents
  agents: {
    list: () => Promise<Agent[]>;
    get: (id: string) => Promise<Agent | null>;
  };
  // Messages
  messages: {
    list: (channelId: string) => Promise<Message[]>;
  };
  // UI state (optional, can use Zustand + localStorage)
  sidebar: {
    getCollapsed: () => Promise<boolean>;
    setCollapsed: (collapsed: boolean) => Promise<void>;
  };
}
```

## Types

```typescript
interface Channel {
  id: string;
  name: string;
  description?: string;
  created_at: number;
}

interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  capabilities?: string[];
  created_at: number;
}

interface Message {
  id: string;
  channel_id: string;
  from_type: 'user' | 'agent';
  from_id: string;
  content: string;
  timestamp: number;
  thread_ts?: string;
}
```

## Error Handling

- IPC 失败时返回 `{ error: string }` 或 reject
- 渲染进程需处理空数组与 null
