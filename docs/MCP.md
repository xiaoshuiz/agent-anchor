# MCP Protocol Compatibility

Agent Anchor exposes an **MCP (Model Context Protocol)** server so AI applications can interact with your local Agent workspace as tools.

## Endpoint

- **URL:** `http://127.0.0.1:8766/mcp`
- **Transport:** Streamable HTTP (MCP spec)
- **Port:** 8766 (configurable in code)

## Available Tools

| Tool | Input | Description |
|------|-------|-------------|
| `anchor_list_channels` | (none) | List all channels in Agent Anchor |
| `anchor_list_agents` | (none) | List all registered agents |
| `anchor_send_message` | `channelId` (string), `content` (string) | Send a message to a channel as the user |

## Client Configuration

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "agent-anchor": {
      "url": "http://127.0.0.1:8766/mcp"
    }
  }
}
```

Restart Claude Desktop after changing the config.

### Cursor

When Cursor supports MCP servers, add Agent Anchor in MCP settings:

- **Server URL:** `http://127.0.0.1:8766/mcp`

## Prerequisites

1. **Start Agent Anchor** before connecting MCP clients:
   ```bash
   pnpm run dev
   ```

2. The MCP server binds to `127.0.0.1` only (localhost) for security.

## Protocol Details

- MCP uses JSON-RPC 2.0 over Streamable HTTP
- Clients perform `initialize` → `tools/list` → `tools/call` flow
- Messages sent via `anchor_send_message` appear in the app in real time

See [specs/005-phase5-mcp-bridge/contracts/mcp.md](../specs/005-phase5-mcp-bridge/contracts/mcp.md) for the full contract.
