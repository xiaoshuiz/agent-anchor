# Agent Anchor - 准备清单

## 开发环境

- [ ] Node.js 18+ 已安装
- [ ] pnpm 或 npm 已安装
- [ ] macOS 开发机（或虚拟机）
- [ ] Spec-Kit：Python 3.11+、`uv` 已安装（`pip install uv` 或 `brew install uv`）

## 设计参考

- [ ] 收集 Slack Desktop 截图（侧边栏、频道、消息、线程）
- [ ] 确定品牌色与字体（可先用 Slack 风格占位）
- [ ] 准备 Logo 与 Agent 默认头像

## 技术决策（已确认）

| 决策项 | 选择 |
|--------|------|
| 桌面框架 | **Electron** |
| 前端框架 | React |
| 样式 | Tailwind + shadcn/ui |
| 数据存储 | **SQLite** (better-sqlite3) |
| 开发约束 | **GitHub Spec-Kit** |

## 依赖包（预估）

### Electron + React + SQLite
- `electron`, `electron-builder`
- `better-sqlite3`
- `react`, `react-dom`, `react-router-dom`
- `zustand`, `@tanstack/react-query`
- `tailwindcss`, `tailwindcss-animate`
- `lucide-react`（图标）
- `date-fns`（时间格式化）

## Spec-Kit 初始化

- [x] 运行 `uvx --from git+https://github.com/github/spec-kit.git specify init .`
- [x] 将 `docs/PLAN.md` 核心内容同步到 `.specify/spec.md` 与 `plan.md`
- [x] 复制 `.claude/commands/` 到 `.cursor/commands/`（Cursor 使用）
- [x] 创建 `.specify/memory/constitution.md`（Agent Anchor 宪法）

## 第一个可运行版本目标

- 窗口打开，显示三栏布局
- 侧边栏有 Mock 频道和 Agent 列表
- 主区域显示 Mock 消息
- 输入框可输入文字（暂不发送）

完成以上即可进入 Phase 2。
