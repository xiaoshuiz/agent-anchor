# Phase 7 Code Review

## 已修复

- **parseMentions 中文名**：原正则 `[\w-]+` 不匹配中文，已改为 `[\w\p{L}\p{N}_-]+`（u flag）支持 Unicode 字母

## 已知问题与建议

### P2 - 可后续优化

1. **API Key 清除**：Settings 无「清除」按钮，用户无法移除已配置的 Key。可增加「清除配置」按钮调用 `setApiKey('claude', '')`。

2. **Claude 模型版本**：`claude-3-5-sonnet-20241022` 写死，后续可配置或自动选用最新。

3. **并发请求**：用户快速连续发送多条消息时，会并发调用 Claude API，回复顺序可能与发送顺序不一致。可考虑简单队列或防抖。

4. **slugify 中文**：`slugify("Claude 写作助手")` 会去掉中文得到 `claude`，多个中文名可能产生相同 base。`ensureUniqueClaudeId` 会追加 -1、-2 避免冲突，行为正确。

### P3 - 文档与规范

5. **API Key 安全**：当前存于 electron-store 明文。可补充文档说明：Key 存于用户本地 app 目录，与常见 Electron 应用一致。

6. **错误边界**：Claude API 失败时插入 `Error: ${message}` 到消息。可考虑更友好的错误提示（如「Claude 暂时不可用，请检查网络或 API Key」）。

## 架构符合性

- ✓ SQLite 仅主进程
- ✓ React 仅渲染进程
- ✓ IPC 边界清晰
- ✓ TypeScript strict
