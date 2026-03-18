# Troubleshooting

## macOS: "Agent Anchor.app 已损坏，无法打开"

从 GitHub Releases 下载的 `.dmg` 安装后，若出现「已损坏，无法打开」提示，通常是因为 **macOS Gatekeeper** 对未公证应用的隔离机制。当前 CI 构建的包未进行 Apple 公证，因此会触发此提示。

### 解决方法

**方法一：终端移除隔离属性（推荐）**

```bash
xattr -cr /Applications/Agent\ Anchor.app
```

或使用完整路径：

```bash
xattr -rd com.apple.quarantine "/Applications/Agent Anchor.app"
```

执行后即可正常打开应用。

**方法二：右键打开**

1. 按住 **Control** 键
2. 右键点击「Agent Anchor.app」
3. 选择「打开」
4. 在弹窗中再次点击「打开」

首次通过此方式打开后，系统会记住选择，之后可直接双击打开。

### 原因说明

- 从互联网下载的文件会被 macOS 添加 `com.apple.quarantine` 隔离属性
- 未经过 Apple 公证的应用会触发 Gatekeeper 检查
- 移除隔离属性或通过「打开」确认后，应用可正常运行

### 长期方案

若需完全避免此提示，需要：

1. **Apple Developer 账号**（$99/年）
2. 在 CI 中配置代码签名与公证（`CSC_*`、`APPLE_ID` 等 Secrets）
3. 构建时自动完成签名与公证

当前项目暂未配置上述流程，用户需按上述方法一或方法二处理。
