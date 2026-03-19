import { useState, useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'

interface CreateAgentModalProps {
  onClose: () => void
  onCreated: () => void
  onOpenSettings?: () => void
}

export function CreateAgentModal({ onClose, onCreated, onOpenSettings }: CreateAgentModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdName, setCreatedName] = useState('')
  const [hasClaudeKey, setHasClaudeKey] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customId, setCustomId] = useState('')
  const [customName, setCustomName] = useState('')
  const [customDesc, setCustomDesc] = useState('')
  const claudeConfigUpdatedTrigger = useUIStore((s) => s.claudeConfigUpdatedTrigger)

  useEffect(() => {
    window.electronAPI?.agents?.hasApiKey?.('claude').then(setHasClaudeKey)
  }, [claudeConfigUpdatedTrigger])

  const handleSubmitClaude = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('请输入名称')
      return
    }
    if (!hasClaudeKey) {
      setError('请先在设置中配置 Claude API Key')
      return
    }
    setSubmitting(true)
    try {
      const result = await window.electronAPI?.agents?.create?.({
        name: trimmedName,
        description: description.trim() || undefined,
        provider: 'claude',
      })
      if (result && 'error' in result) {
        setError(result.error)
        return
      }
      onCreated()
      setCreatedName(trimmedName)
      setShowSuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitCustom = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const id = customId.trim()
    const n = customName.trim()
    if (!id || !n) {
      setError('ID 和名称必填')
      return
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      setError('ID 仅限字母、数字、下划线、连字符')
      return
    }
    setSubmitting(true)
    try {
      const result = await window.electronAPI?.agents?.create?.({
        id,
        name: n,
        description: customDesc.trim() || undefined,
        provider: 'websocket',
      })
      if (result && 'error' in result) {
        setError(result.error)
        return
      }
      onCreated()
      onClose()
    } finally {
      setSubmitting(false)
    }
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
        aria-label="Add Agent"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            添加 Agent
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
        {showSuccess ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>{createdName}</strong> 已创建，可直接 DM 或 @{createdName} 对话。
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              完成
            </button>
          </div>
        ) : !showCustom ? (
          <form onSubmit={handleSubmitClaude} className="space-y-3">
            {!hasClaudeKey && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm">
                <p className="text-amber-800 dark:text-amber-200">
                  请先在设置中配置 Claude API Key
                </p>
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenSettings() }}
                    className="mt-2 text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    打开设置 →
                  </button>
                )}
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">
                名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Claude 写作助手"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">
                身份描述（可选）
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 擅长创意写作与润色"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting || !hasClaudeKey}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
              >
                {submitting ? '创建中...' : '创建'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-400"
            >
              添加 WebSocket 自定义 Agent →
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitCustom} className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              自定义 Agent 需通过 WebSocket 连接，见 examples/agent-node
            </p>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">ID *</label>
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="e.g. agent-coder"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">名称 *</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Coder"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">描述（可选）</label>
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCustom(false)} className="px-4 py-2 rounded-lg text-slate-600">
                返回
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
              >
                {submitting ? '创建中...' : '创建'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
