import { useState, useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'

interface SettingsModalProps {
  onClose: () => void
  onSaveSuccess?: () => void
}

export function SettingsModal({ onClose, onSaveSuccess }: SettingsModalProps) {
  const [claudeKey, setClaudeKey] = useState('')
  const [hasKey, setHasKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [logsPath, setLogsPath] = useState<string>('')
  const [diagnostics, setDiagnostics] = useState<Record<string, unknown> | null>(null)
  const refreshClaudeConfig = useUIStore((s) => s.refreshClaudeConfig)

  useEffect(() => {
    window.electronAPI?.app?.getLogsPath?.().then(setLogsPath)
    window.electronAPI?.agents?.hasApiKey?.('claude').then(setHasKey)
  }, [])

  const handleSave = async () => {
    const trimmed = claudeKey.trim()
    setSaveError(null)
    if (!trimmed) return
    if (!window.electronAPI?.agents?.setApiKey) {
      setSaveError('IPC 不可用，请重启应用')
      return
    }
    try {
      await window.electronAPI.agents.setApiKey('claude', trimmed)
      const verified = await window.electronAPI?.agents?.hasApiKey?.('claude')
      setHasKey(!!verified)
      setSaved(true)
      setClaudeKey('')
      refreshClaudeConfig()
      if (verified && onSaveSuccess) onSaveSuccess()
    } catch (e) {
      setSaveError(String(e))
    }
    setTimeout(() => setSaved(false), 2000)
  }

  const handleShowDiagnostics = async () => {
    const d = await window.electronAPI?.app?.getDiagnostics?.()
    setDiagnostics(d ?? null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-4 border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Settings"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            设置
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Claude API
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              配置后可在 Add Agent 时直接创建 Claude agent，支持多个不同身份的 Claude。
            </p>
            {hasKey && (
              <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                已配置
              </p>
            )}
            <input
              type="password"
              value={claudeKey}
              onChange={(e) => setClaudeKey(e.target.value)}
              placeholder={hasKey ? '输入新 key 以更新' : 'sk-ant-...'}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              从 <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">console.anthropic.com</a> 获取
            </p>
            {saveError && <p className="mt-1 text-xs text-red-500">{saveError}</p>}
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              诊断
            </h3>
            <button
              type="button"
              onClick={handleShowDiagnostics}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 mb-2"
            >
              查看诊断信息
            </button>
            {diagnostics && (
              <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              日志
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              所有行为记录在本地，便于排查问题。
            </p>
            {logsPath && (
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mb-2 break-all">
                {logsPath}
              </p>
            )}
            <button
              type="button"
              onClick={() => window.electronAPI?.app?.openLogsFolder?.()}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              打开日志文件夹
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              关闭
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!claudeKey.trim()}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {saved ? '已保存' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
