# MCP Protocol Contract: Agent Anchor as MCP Server

**Transport**: Streamable HTTP, `http://127.0.0.1:8766/mcp`  
**Protocol**: MCP (JSON-RPC 2.0)

## Exposed Tools

### anchor_list_channels

List all channels in Agent Anchor.

**Input**: None (empty object)

**Output**: `{ channels: [{ id, name, description, created_at }, ...] }`

### anchor_list_agents

List all registered agents.

**Input**: None (empty object)

**Output**: `{ agents: [{ id, name, description, capabilities }, ...] }`

### anchor_send_message

Send a message to a channel as the user.

**Input**:
- `channelId` (string, required): Channel UUID
- `content` (string, required): Message content

**Output**: `{ id, channel_id, from_type, from_id, content, timestamp }` or error

---

## Client Configuration

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agent-anchor": {
      "url": "http://127.0.0.1:8766/mcp"
    }
  }
}
```

### Cursor

Add to Cursor MCP settings (when supported):

```
agent-anchor: http://127.0.0.1:8766/mcp
```
