/**
 * 渲染进程日志 - 通过 IPC 发送到主进程写入本地文件
 */
function send(level: string, tag: string, message: string, data?: unknown): void {
  try {
    window.electronAPI?.app?.log?.(level, tag, message, data)
  } catch {
    // ignore
  }
}

export const logger = {
  info: (tag: string, message: string, data?: unknown) => send('info', tag, message, data),
  warn: (tag: string, message: string, data?: unknown) => send('warn', tag, message, data),
  error: (tag: string, message: string, data?: unknown) => send('error', tag, message, data),
  debug: (tag: string, message: string, data?: unknown) => send('debug', tag, message, data),
}
