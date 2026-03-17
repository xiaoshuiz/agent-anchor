# Implementation Plan: Phase 2 - 本地 WebSocket 与 Agent 通信

**Branch**: `002-phase2-websocket-agent` | **Date**: 2025-03-17 | **Spec**: [spec.md](./spec.md)

## Summary

Phase 2 实现本地 WebSocket 服务、用户消息发送持久化、Agent 注册与消息发送、Node.js SDK 示例。基于 Phase 1 的 SQLite 与 UI 骨架扩展。

## Technical Context

**Dependencies**: Phase 1 完成；ws (WebSocket 服务端)  
**WebSocket**: 主进程 `ws` 包，默认 `ws://127.0.0.1:8765`  
**Protocol**: JSON 消息，格式见 contracts/websocket.md  
**Storage**: 复用 Phase 1 SQLite schema，无迁移

## Project Structure (additions)

```text
agent-anchor/
├── electron/
│   ├── websocket-server.ts   # WebSocket 服务，消息路由
│   ├── db.ts                 # 扩展：insertMessage, insertAgent
│   └── ipc-handlers.ts       # 扩展：messages:send
├── src/
│   └── ...                   # 扩展 MessageInput 调用 messages:send
├── examples/
│   └── agent-node/            # Node.js SDK 示例
│       ├── index.js
│       └── README.md
└── specs/002-phase2-websocket-agent/
    ├── spec.md
    ├── plan.md
    ├── contracts/
    │   └── websocket.md
    └── tasks.md
```

## Protocol (JSON over WebSocket)

### Agent → Server

```json
// 注册
{ "jsonrpc": "2.0", "method": "agent/register", "params": { "id": "...", "name": "...", "description": "..." }, "id": 1 }

// 发送消息
{ "jsonrpc": "2.0", "method": "message/send", "params": { "channelId": "...", "content": "..." }, "id": 2 }
```

### Server → Agent

```json
// 成功
{ "jsonrpc": "2.0", "result": { ... }, "id": 1 }

// 错误
{ "jsonrpc": "2.0", "error": { "code": -32600, "message": "..." }, "id": 1 }
```

## Implementation Order

1. electron/websocket-server.ts：启动 ws 服务，解析 JSON
2. electron/db.ts：insertMessage, insertAgent
3. electron/ipc-handlers.ts：messages:send（用户发送）
4. preload + MessageInput：调用 messages:send
5. websocket-server：处理 agent/register、message/send
6. examples/agent-node：SDK 示例

## Constitution Check

| Principle | Status |
|-----------|--------|
| III. Electron Process Boundaries | ✅ WebSocket 在主进程；渲染进程通过 IPC 发送 |
| IV. Agent Protocol | ✅ JSON-RPC over WebSocket |
| VI. SQLite | ✅ 主进程写入 |
