# Agent Anchor Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

**All feature work MUST follow the Spec-Kit workflow**:

- New features MUST start with `/speckit.specify` or equivalent spec creation
- Technical approach MUST be documented in `/speckit.plan` before implementation
- Work MUST be broken into tasks via `/speckit.tasks` before `/speckit.implement`
- Constitution updates use `/speckit.constitution`
- Reference `.specify/spec.md` and `.specify/plan.md` as single source of truth

**Rationale**: Spec-Kit ensures predictable outcomes and prevents "vibe coding". AI agents need unambiguous specifications to produce correct implementations.

### II. Local-First Architecture

**Agent Anchor is a local desktop application. Core functionality MUST NOT depend on external cloud services**:

- All data stored locally (SQLite)
- Agent communication via local WebSocket (127.0.0.1)
- No mandatory network calls for core messaging
- Optional: future MCP/remote Agent bridges are additive, not required

**Rationale**: The product is a local Agent workbench. Cloud dependencies would undermine the "communicate with my machine's agents" value proposition.

### III. Electron Process Boundaries

**Strict separation between main process and renderer process**:

- **Main process**: Window management, IPC, WebSocket server, SQLite (better-sqlite3), Agent registry
- **Renderer process**: React UI only; NO direct Node.js APIs, NO better-sqlite3
- **Preload**: Expose only whitelisted APIs via `contextBridge.exposeInMainWorld`
- Native modules (e.g. better-sqlite3) MUST run in main process only

**Rationale**: Electron security model requires context isolation. Violating process boundaries creates security vulnerabilities and breaks sandboxing.

### IV. Agent Protocol & @Mention Routing

**Agent communication MUST follow the defined protocol**:

- Agents register via `agent/register` (id, name, description, capabilities)
- Messages use JSON-RPC over WebSocket with `from`, `channel`, `content`, `mentions`, `thread_ts`
- `@agent-name` in content MUST be parsed and routed to the corresponding Agent
- Agent SDK (Node/Python) MUST be documented for external Agent authors

**Rationale**: Consistent protocol enables interoperability. @mention routing is the core differentiator for Agent-to-Agent collaboration.

### V. TypeScript Strictness

**TypeScript MUST be used with strict mode**:

- `strict: true`, `noUnusedLocals`, `noUnusedParameters` in tsconfig
- Prefer explicit types for public APIs and IPC contracts
- Avoid `any`; use `unknown` when type is truly dynamic

**Rationale**: Type safety reduces runtime errors and improves maintainability for a multi-process Electron app.

### VI. SQLite & Data Persistence

**SQLite (better-sqlite3) MUST be accessed only from the main process**:

- Database file in user data directory (e.g. `app.getPath('userData')`)
- Tables: messages, channels, agents, threads
- Use prepared statements; never concatenate user input into SQL
- Migrations MUST be versioned and reversible where possible

**Rationale**: better-sqlite3 is a native Node addon; it cannot run in the renderer. Centralizing DB access in main process ensures consistency and security.

### VII. Observability & Debugging

**Structured logging and error handling**:

- Main process: Use `console` or a lightweight logger with levels (debug, info, warn, error)
- Renderer: Use same pattern; errors MUST be surfaced to user when actionable
- WebSocket/Agent events SHOULD be loggable in development mode
- No sensitive data (tokens, full message content) in production logs

**Rationale**: Desktop apps are harder to debug than web apps. Good logging accelerates troubleshooting.

### VIII. UI/UX Consistency (Slack-like)

**The UI MUST maintain Slack-like conventions**:

- Three-panel layout: Sidebar | Channel/Chat | Thread/Detail
- Channels and Agents listed in sidebar
- Message list with timestamps, avatars, @mention highlighting
- Input box with @mention autocomplete
- Dark/light theme support

**Rationale**: Users expect familiar patterns. Slack's UX is the reference; deviations must be justified.

## Development Workflow

### Spec-Kit Commands (Cursor / Claude)

Available in `.cursor/commands/` and `.claude/commands/`:

- `/speckit.constitution` — Update project principles
- `/speckit.specify` — Create feature specification
- `/speckit.plan` — Create technical plan
- `/speckit.tasks` — Generate tasks
- `/speckit.implement` — Execute implementation

### Before Implementation

1. Ensure spec and plan exist in `.specify/` or `docs/`
2. Run `pnpm run dev` to verify app starts
3. For native modules: `node node_modules/electron/install.js` if Electron binary missing

### Compliance Checklist

- [ ] Spec/plan updated for new features
- [ ] No Node/native APIs in renderer
- [ ] Agent protocol followed for messaging
- [ ] TypeScript strict, no unnecessary `any`
- [ ] SQLite access only in main process

## Governance

**This constitution defines mandatory patterns for Agent Anchor**. Deviations require:

1. Documented rationale in PR or ADR
2. Approval from maintainers

**Amendment Process**:

1. Propose change with rationale
2. Update version: MAJOR (breaking principle), MINOR (new principle), PATCH (clarification)
3. Sync `.specify/templates/` if principle affects spec/plan/tasks structure
4. Commit: `docs: amend constitution to vX.Y.Z (summary)`

**Version**: 1.0.0 | **Ratified**: 2025-03-17 | **Last Amended**: 2025-03-17
