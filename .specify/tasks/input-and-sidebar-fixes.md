# Feature Spec: 输入框与侧边栏优化

## 概述

修复 4 个 UI/UX 问题，提升消息输入体验和侧边栏折叠状态下的表现。

---

## 需求拆解

### 1. 侧边栏折叠时完全隐藏 Config/Logs 图标

**现状**：侧边栏折叠时（`w-14`），顶部区域仍显示 Logs（FileText）和 Settings（齿轮）按钮，导致 Config 图标漏出一半。

**期望**：折叠状态下，仅保留折叠/展开切换按钮（CollapseButton），Logs 和 Settings 完全隐藏。

**实现要点**：
- 条件渲染：`collapsed` 时为真时，不渲染 FileText 和 Settings 按钮
- 仅渲染 CollapseButton，居中或靠右

---

### 2. 消息发送快捷键

**现状**：代码中已有 `Enter`（无 Shift）发送的逻辑，但用户反馈"目前无法发送"。

**期望**：
- 快捷键：**Enter** 发送，**Shift+Enter** 换行（与 Slack 一致）
- 确保快捷键正确生效

**实现要点**：
- 当前 `MessageInput` 使用单行 `input`，`handleKeyDown` 已有 Enter 逻辑
- 改为 `textarea` 后，需明确：Enter 发送、Shift+Enter 换行
- 检查 `selectedChannelId` 等前置条件，必要时给出用户提示

---

### 3. 输入框右下角增加发送按钮

**期望**：在输入框右下角增加一个发送按钮，支持点击发送。

**实现要点**：
- 按钮位置：输入区域右下角
- 图标：使用 lucide-react 的 `Send` 或 `SendHorizonal`
- 与 Enter 快捷键功能一致，调用同一 `sendMessage`

---

### 4. 多行输入：自动换行与高度控制

**现状**：使用单行 `input`，无法多行输入。

**期望**：
- 自动换行
- 输入框高度随行数增长：min 1 行，max 5 行
- 超过 5 行时内部可上下滚动

**实现要点**：
- 将 `input` 改为 `textarea`
- 使用 `rows={1}` 作为最小高度，通过 JS 动态计算 `rows` 或使用 `min-height`/`max-height` + `overflow-y: auto`
- 推荐：`min-h` 对应 1 行，`max-h` 对应 5 行（如 `line-height` * 5），`overflow-y-auto`

---

## 技术方案

| 组件 | 改动 |
|------|------|
| `Sidebar.tsx` | 折叠时条件隐藏 Logs、Settings 按钮 |
| `MessageInput.tsx` | input → textarea；增加发送按钮；修正 Enter/Shift+Enter；min 1 行 max 5 行 |

## 验收条件

- [ ] 侧边栏折叠后，Config 与 Logs 图标完全不可见
- [ ] Enter 发送消息，Shift+Enter 换行
- [ ] 点击发送按钮可发送
- [ ] 输入多行时自动增高，最多 5 行，超出可滚动
