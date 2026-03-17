# Clarify: Phase 1 - 基础框架与 UI 骨架

**Created**: 2025-03-17  
**Status**: 待 Review  
**Purpose**: 在执行 `/speckit.plan` 前，识别规格中的模糊点与缺失决策

---

## Coverage Scan 结果

| 类别 | 状态 | 说明 |
|------|------|------|
| Functional Scope & Behavior | Partial | 核心场景清晰，Out of Scope 已声明 |
| Domain & Data Model | Partial | Channel/Agent/Message 已定义，缺唯一性、生命周期 |
| Interaction & UX Flow | Partial | 主流程有，缺 loading/error 状态细节 |
| Non-Functional | Missing | 性能、可访问性未量化 |
| Integration & Dependencies | Clear | Phase 1 无外部依赖 |
| Edge Cases & Failure | Partial | 有列举，缺具体处理策略 |
| Constraints & Tradeoffs | Clear | 技术栈已定 |
| Terminology | Clear | 与 PLAN 一致 |

---

## Clarification Questions（建议在 Plan 前回答）

### Q1. 侧边栏折叠行为 [Interaction & UX]

**当前描述**: 「最小窗口宽度时侧边栏可折叠」

**待澄清**:
- 折叠后是隐藏还是收窄为图标栏（如 Slack 的 collapsed sidebar）？
- 折叠/展开的触发方式：仅窗口宽度，还是支持用户手动点击按钮？
- 若支持手动，折叠状态是否需要持久化（如 localStorage）？

**建议答案（可写入 spec）**:  
*示例*：折叠后收窄为 48px 图标栏；支持窗口宽度 < 800px 自动折叠 + 顶部折叠按钮手动切换；折叠状态持久化到 localStorage。

---

### Q2. Mock 数据来源与结构 [Domain & Data]

**当前描述**: 「Mock 频道、Agent、消息」

**待澄清**:
- Mock 数据是硬编码在组件内，还是独立 JSON/TS 文件？
- Message 的 `from` 为 `user` 时，是否需要区分多个「用户」还是仅「当前用户」？
- Mock 消息是否包含 `threadTs`（线程回复）以提前占位 UI？

**建议答案（可写入 spec）**:  
*示例*：Mock 数据放在 `src/mocks/` 下独立文件；Phase 1 仅「当前用户」一种用户；Mock 含 1–2 条带 threadTs 的消息以占位线程 UI。

---

### Q3. 主题切换实现方式 [Non-Functional]

**当前描述**: 「支持深色/浅色主题」

**待澄清**:
- 是否跟随系统主题（prefers-color-scheme），还是仅应用内切换？
- 主题切换入口：设置页、快捷键，还是顶部栏图标？
- 是否需要支持「跟随系统」第三选项？

**建议答案（可写入 spec）**:  
*示例*：Phase 1 仅应用内切换，入口为侧边栏底部或 header 图标；不实现「跟随系统」；使用 Tailwind `dark:` 类 + Zustand 存储 preference。

---

### Q4. 消息气泡视觉规范 [Interaction & UX]

**当前描述**: 「消息气泡样式区分用户与 Agent」

**待澄清**:
- 用户消息与 Agent 消息的布局：用户靠右、Agent 靠左（如 iMessage），还是均左对齐仅颜色不同？
- Agent 消息是否显示头像？头像占位图规则？
- 时间戳格式：相对时间（如「2 分钟前」）还是绝对时间？是否支持 hover 显示完整时间？

**建议答案（可写入 spec）**:  
*示例*：用户靠右、Agent 靠左；Agent 显示 32x32 头像占位（首字母或默认图标）；时间戳默认相对时间，hover 显示 ISO 格式。

---

### Q5. 空状态与错误边界 [Edge Cases]

**当前描述**: 「Mock 数据加载失败应显示占位文案」

**待澄清**:
- Phase 1 Mock 为静态，是否真的存在「加载」？若不存在，空状态指「列表为空」时的展示？
- 若未来改为异步加载，错误态是否需要 Retry 按钮？
- 白屏/崩溃时是否有全局 Error Boundary？

**建议答案（可写入 spec）**:  
*示例*：Phase 1 无异步加载，空状态仅指「频道无消息」时显示「暂无消息」；Error Boundary 在 App 根组件包裹，捕获 React 渲染错误并显示 fallback UI。

---

## 建议的 Spec 补充（若采纳上述答案）

将上述「建议答案」整理后，可追加到 `spec-draft-phase1.md` 的以下位置：

1. **FR-008**（新增）: 侧边栏折叠行为（折叠宽度、触发方式、持久化）
2. **FR-009**（新增）: Mock 数据存放路径与结构约定
3. **Key Entities 补充**: Message 增加 `threadTs` 说明；User 明确为单用户
4. **Edge Cases 补充**: 明确「空状态」为无消息时的展示；Error Boundary 策略

---

## 下一步

1. **Review** 本文档与 `docs/spec-draft-phase1.md`
2. **决定** 是否采纳上述澄清问题与建议答案
3. **若采纳**：更新 spec-draft，然后执行 `/speckit.plan` 生成技术方案
4. **若跳过**：可直接执行 `/speckit.plan`，但需注意下游可能有返工风险
