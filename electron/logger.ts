/**
 * 本地日志系统 - 所有行为写入 userData/logs/agent-anchor.log
 * 便于排查问题，用户可在设置中查看日志路径
 */
import { app } from 'electron'
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'

const LOG_DIR = 'logs'
const LOG_FILE = 'agent-anchor.log'

let _logPath: string | null = null

function getLogPath(): string {
  if (!_logPath) {
    const dir = join(app.getPath('userData'), LOG_DIR)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    _logPath = join(dir, LOG_FILE)
  }
  return _logPath
}

function formatTime(): string {
  return new Date().toISOString()
}

function write(level: string, tag: string, message: string, data?: unknown): void {
  try {
    const path = getLogPath()
    const dataStr = data !== undefined ? ` ${JSON.stringify(data)}` : ''
    const line = `${formatTime()} [${level}] [${tag}] ${message}${dataStr}\n`
    appendFileSync(path, line, 'utf-8')
  } catch (e) {
    console.error('[Logger] write failed:', e)
  }
}

export const log = {
  info: (tag: string, message: string, data?: unknown) => write('INFO', tag, message, data),
  warn: (tag: string, message: string, data?: unknown) => write('WARN', tag, message, data),
  error: (tag: string, message: string, data?: unknown) => write('ERROR', tag, message, data),
  debug: (tag: string, message: string, data?: unknown) => write('DEBUG', tag, message, data),
}

export function getLogFilePath(): string {
  return getLogPath()
}

export function getLogsDir(): string {
  return join(app.getPath('userData'), LOG_DIR)
}

export function readLogContent(): string {
  const path = getLogPath()
  if (!existsSync(path)) return ''
  try {
    return readFileSync(path, 'utf-8')
  } catch {
    return ''
  }
}
