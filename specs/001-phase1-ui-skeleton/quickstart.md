# Quickstart: Phase 1 开发与构建

## 前置条件

- Node.js 18+
- pnpm
- macOS（开发与构建）

## 安装

```bash
pnpm install
```

若 Electron 报错，可运行：

```bash
node node_modules/electron/install.js
```

## 开发

```bash
pnpm run dev
```

应用启动后可见三栏布局。首次启动数据库为空，可预置 #general 或展示空状态。

## 构建

```bash
pnpm run build
```

产物在 `out/` 目录。

## 打包（macOS）

```bash
pnpm exec electron-builder --mac
```

需在 `package.json` 中配置 `build` 段（含 icon、mac 等）。

## CI/CD

合入 main 后，`.github/workflows/release.yml` 自动触发构建并发布 Release。

## 数据目录

SQLite 数据库路径：`~/Library/Application Support/agent-anchor/agent-anchor.db`（macOS）
