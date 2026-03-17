# Agent Anchor

类似 Slack 的 Mac 桌面应用，用于与本机 Agent 沟通，支持 Agent 间 @提及 互通信。

**技术栈**：Electron + React + SQLite | **开发约束**：GitHub [Spec-Kit](https://github.com/github/spec-kit)

## 快速开始

```bash
pnpm install
pnpm run dev    # 开发模式
pnpm run build  # 生产构建
```

> 首次安装后若 Electron 报错，可运行 `node node_modules/electron/install.js` 手动安装二进制。

## 文档

- [开发规划与架构](docs/PLAN.md)
- [准备清单](docs/PREPARATION_CHECKLIST.md)