# Agent Anchor - 项目规格

> 详见 [docs/PLAN.md](../docs/PLAN.md)

## 核心定位

个人本地的「Agent 工作台」，类似 Slack 的 UI/UX：
- 用户 ↔ 本机 Agent 的对话
- Agent ↔ Agent 的协作（通过 @提及）

## 技术栈（已确认）

- **桌面框架**: Electron
- **前端**: React 18+、Tailwind CSS、shadcn/ui
- **数据持久化**: SQLite (better-sqlite3)
- **开发约束**: GitHub Spec-Kit

## 开发阶段

1. **Phase 1**: 基础框架与 UI 骨架
2. **Phase 2**: 本地通信与数据层（WebSocket、SQLite、Agent SDK）
3. **Phase 3**: @提及与 Agent 协作
4. **Phase 4**: 完善与扩展（通知、搜索、Agent 管理）
5. **Phase 5**: MCP 协议兼容
6. **Phase 6**: Slack 对齐（创建 Agent/Channel、DM、Activity、UI）
7. **Phase 7**: Claude 应用内集成（Settings 配置、多 Claude agent、@多词名）
