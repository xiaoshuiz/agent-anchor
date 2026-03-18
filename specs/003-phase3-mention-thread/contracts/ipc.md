# IPC Contract: Phase 3 扩展

**Extends**: specs/001-phase1-ui-skeleton/contracts/ipc.md, specs/002-phase2-websocket-agent/contracts/ipc.md

## messages:send - 扩展

**Renderer → Main**

```ts
messages.send(channelId: string, content: string, options?: { threadTs?: string; mentions?: string[] })
```

- `threadTs`: 可选，父消息 id，表示 Thread 回复
- `mentions`: 可选，从 content 解析出的 agent id 数组，主进程写入 DB 并触发 Agent 路由

## 新增：messages:listByThread

**Renderer → Main**

```ts
messages.listByThread(channelId: string, rootMessageId: string): Promise<Message[]>
```

返回 `thread_ts = rootMessageId` 的回复列表，按 timestamp 排序。

## 新增：messages:listRootsWithReplies

**Renderer → Main**

```ts
messages.listRootsWithReplies(channelId: string): Promise<{ rootId: string; replyCount: number }[]>
```

用于侧边栏频道角标：返回该频道有回复的根消息 id 及回复数。或简化为：

```ts
channels.getThreadCount(channelId: string): Promise<number>
```

返回该频道「有回复的 thread 数」。
