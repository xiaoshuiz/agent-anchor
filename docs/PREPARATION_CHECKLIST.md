# Agent Anchor - 准备清单

## 开发环境

- [ ] Node.js 18+ 已安装
- [ ] pnpm 或 npm 已安装
- [ ] 若选 Tauri：Rust + Cargo 已安装
- [ ] 若选 Electron：仅需 Node 即可
- [ ] macOS 开发机（或虚拟机）

## 设计参考

- [ ] 收集 Slack Desktop 截图（侧边栏、频道、消息、线程）
- [ ] 确定品牌色与字体（可先用 Slack 风格占位）
- [ ] 准备 Logo 与 Agent 默认头像

## 技术决策（需确认）

| 决策项 | 选项 | 建议 |
|--------|------|------|
| 桌面框架 | Tauri / Electron | Tauri（轻量） |
| 前端框架 | React / Vue | React |
| 样式 | Tailwind+shadcn / 其他 | Tailwind+shadcn |
| 数据存储 | SQLite / IndexedDB | SQLite |

## 依赖包（预估）

### Tauri + React
- `@tauri-apps/api`, `@tauri-apps/plugin-*`
- `react`, `react-dom`, `react-router-dom`
- `zustand`, `@tanstack/react-query`
- `tailwindcss`, `tailwindcss-animate`
- `lucide-react`（图标）
- `date-fns`（时间格式化）

### Electron + React（备选）
- `electron`, `electron-builder`
- 同上 React 生态

## 第一个可运行版本目标

- 窗口打开，显示三栏布局
- 侧边栏有 Mock 频道和 Agent 列表
- 主区域显示 Mock 消息
- 输入框可输入文字（暂不发送）

完成以上即可进入 Phase 2。
