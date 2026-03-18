# Feature Specification: Phase 5 - MCP Protocol Compatibility

**Feature Branch**: `cursor/mcp-protocol-compatibility-8d79`  
**Created**: 2025-03-17  
**Status**: Draft  
**Input**: docs/PLAN.md Phase 4 可选项「MCP 协议兼容」

---

## User Scenarios & Testing

### User Story 1 - MCP 客户端可连接 Agent Anchor (Priority: P1)

MCP 客户端（如 Claude Desktop、Cursor）可将 Agent Anchor 配置为 MCP 服务器，通过 Streamable HTTP 连接并发现可用工具。

**Why this priority**: 使 Agent Anchor 可被主流 AI 工具发现和使用。

**Independent Test**: 配置 Claude Desktop 连接 `http://127.0.0.1:8766/mcp`，验证可列出工具。

### User Story 2 - MCP 工具：列出频道与 Agent (Priority: P1)

MCP 客户端可调用 `anchor_list_channels`、`anchor_list_agents` 获取频道与 Agent 列表。

**Independent Test**: 通过 MCP 客户端调用工具，验证返回正确数据。

### User Story 3 - MCP 工具：发送消息 (Priority: P1)

MCP 客户端可调用 `anchor_send_message` 向指定频道发送用户消息。

**Independent Test**: 调用工具发送消息，在 Agent Anchor 应用内可见新消息。

---

## Functional Requirements

- **FR-001**: Agent Anchor 主进程启动 MCP HTTP 服务（Streamable HTTP），默认端口 8766
- **FR-002**: 暴露 MCP 工具：`anchor_list_channels`、`anchor_list_agents`、`anchor_send_message`
- **FR-003**: 工具实现复用现有 db/ipc 逻辑，符合 Constitution VI（SQLite 仅主进程）
- **FR-004**: 提供 Claude Desktop / Cursor MCP 配置示例文档

---

## Success Criteria

- SC-001: MCP 客户端可完成 initialize → tools/list → tools/call 流程
- SC-002: 发送的消息在应用内实时显示
- SC-003: 构建与类型检查通过
