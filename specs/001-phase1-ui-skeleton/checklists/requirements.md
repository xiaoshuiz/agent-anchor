# Requirements Quality Checklist: Phase 1 - 基础框架与 UI 骨架

**Purpose**: 验证 spec.md 中需求的质量、完整性、清晰度与可测性  
**Created**: 2025-03-17  
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 - 三栏布局的宽度/比例是否在 spec 中明确？[Completeness, Spec §US1]
- [ ] CHK002 - 侧边栏折叠后的图标栏宽度（48–64px）是否已量化？[Completeness, Spec §FR-008]
- [ ] CHK003 - 空状态插画的视觉规范（尺寸、位置、文案）是否定义？[Gap, Spec §FR-003]
- [ ] CHK004 - Error Boundary fallback UI 的交互（重试/刷新）是否在 spec 中说明？[Completeness, Spec §FR-010]
- [ ] CHK005 - 首次启动预置 #general 与空状态展示的触发条件是否明确？[Clarity, Spec §US2]
- [ ] CHK006 - GitHub Release 产物的具体格式（.dmg/.zip/.app）是否指定？[Gap, Spec §FR-011]

## Requirement Clarity

- [ ] CHK007 - 「交互参考 Slack」是否对消息气泡、时间戳、头像有可操作的细化？[Clarity, Spec §FR-006]
- [ ] CHK008 - 「合理时间内更新」主题（US5）是否量化？[Clarity, Spec §US5] → SC-004 已定 2 秒
- [ ] CHK009 - Anchor 图标的「符合概念」是否有可验收的视觉标准？[Ambiguity, Spec §FR-009]
- [ ] CHK010 - 侧边栏「持久化」的存储位置（localStorage/electron-store）是否在 plan 中明确？[Clarity, plan.md]

## Requirement Consistency

- [ ] CHK011 - FR-002/FR-003 与「无 Mock」是否与 data-model 预置逻辑一致？[Consistency]
- [ ] CHK012 - Constitution VIII（Slack-like）与 FR-006 是否对齐？[Consistency]
- [ ] CHK013 - 主题「仅跟随系统」与 Constitution VIII「Dark/light theme support」是否冲突？[Consistency] → 已澄清仅系统

## Acceptance Criteria Quality

- [ ] CHK014 - SC-001「3 秒内」是否可客观测量（如 Performance API）？[Measurability, Spec §SC-001]
- [ ] CHK015 - SC-002「100 条流畅」是否定义帧率或滚动指标？[Measurability, Spec §SC-002]
- [ ] CHK016 - SC-005「15 分钟内」CI 完成是否包含失败重试策略？[Measurability, Spec §SC-005]

## Scenario Coverage

- [ ] CHK017 - 无频道、无 Agent、无消息三种空状态是否均有独立验收场景？[Coverage, Spec §US2, US3, US8]
- [ ] CHK018 - 窗口缩放时的侧边栏行为（折叠阈值）是否在 spec 或 plan 中定义？[Gap, Edge Cases]
- [ ] CHK019 - 系统主题切换时应用未聚焦，是否要求即时更新？[Coverage, Spec §US5]

## Edge Case Coverage

- [ ] CHK020 - 数据库文件损坏或无法创建时的降级行为是否定义？[Gap, Exception Flow]
- [ ] CHK021 - 持久化失败（如 localStorage 不可用）时折叠状态是否允许丢失？[Edge Case]
- [ ] CHK022 - CI 构建失败时是否要求通知（如 Issue/PR comment）？[Gap, Spec §FR-011]

## Non-Functional Requirements

- [ ] CHK023 - 可访问性（键盘导航、屏幕阅读器）是否在 Phase 1 范围？[Assumption] → Out of Scope 未提及
- [ ] CHK024 - 性能约束（内存、CPU）是否对 Electron 应用有上限？[Gap]

## Dependencies & Assumptions

- [ ] CHK025 - macOS 最低版本是否在 plan 或 README 中声明？[Dependency]
- [ ] CHK026 - electron-builder 的 mac 配置（target、arch）是否在 plan 中说明？[Dependency, plan.md]

## Notes

- 勾选完成：`[x]`
- 若某项为 Gap，需在 spec/plan 中补充或明确排除
- 本 checklist 验证需求质量，不验证实现
