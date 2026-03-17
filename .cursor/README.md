# Cursor 配置 (Spec-Kit)

本目录包含 Spec-Kit 的 Cursor 适配，与 `.claude/commands/` 保持同步。

## 命令 (Slash Commands)

| 命令 | 用途 |
|------|------|
| `/speckit.constitution` | 更新项目宪法 |
| `/speckit.specify` | 创建功能规格 |
| `/speckit.plan` | 创建技术方案 |
| `/speckit.tasks` | 生成任务列表 |
| `/speckit.implement` | 执行实现 |
| `/speckit.clarify` | 澄清需求 |
| `/speckit.analyze` | 一致性分析 |
| `/speckit.checklist` | 生成检查清单 |

## 同步

`.cursor/commands/` 中的命令与 `.claude/commands/` 内容一致。若 Spec-Kit 升级，需重新复制：

```bash
cp .claude/commands/speckit.*.md .cursor/commands/
```

## Rules

`.cursor/rules/speckit-workflow.mdc` 会在所有对话中自动应用，确保 AI 遵循 Spec-Kit 工作流。
