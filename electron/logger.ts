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

function getBaseDir(): string {
  try {
    return app.getPath('userData')
  } catch {
    return process.cwd()
  }
}

function getLogPath(): string {
  if (!_logPath) {
    const base = getBaseDir()
    const dir = join(base, LOG_DIR)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    _logPath = join(dir, LOG_FILE)
  }
  return _logPath
}

function formatTime(): string {
  return new Date().toISOString()
}

function write(level: string, tag: string, message: string, data?: unknown): void {
  const dataStr = data !== undefined ? ` ${JSON.stringify(data)}` : ''
  const line = `${formatTime()} [${level}] [${tag}] ${message}${dataStr}\n`
  try {
    const path = getLogPath()
    appendFileSync(path, line, 'utf-8')
  } catch (e) {
    console.error('[Logger] write failed:', e)
    console.log(line.trim())
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
  return join(getBaseDir(), LOG_DIR)
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
