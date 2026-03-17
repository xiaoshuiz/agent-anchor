import type { Agent } from '@/types/electron'

interface MessageContentProps {
  content: string
  agents: Agent[]
  onMentionClick?: (agentId: string) => void
  /** When true (user message), use lighter highlight for dark backgrounds */
  invertHighlight?: boolean
}

/**
 * Renders message content with @agent-name highlighted as clickable spans.
 */
export function MessageContent({ content, agents, onMentionClick, invertHighlight }: MessageContentProps) {
  const agentByName = new Map(agents.map((a) => [a.name.toLowerCase(), a]))
  const agentById = new Map(agents.map((a) => [a.id, a]))

  const parts: { type: 'text' | 'mention'; value: string; agentId?: string }[] = []
  const regex = /@([\w-]+)/g
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = regex.exec(content)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, m.index) })
    }
    const token = m[1]
    const agent = agentById.get(token) ?? agentByName.get(token.toLowerCase())
    parts.push({
      type: 'mention',
      value: `@${token}`,
      agentId: agent?.id,
    })
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) })
  }

  return (
    <span>
      {parts.map((p, i) =>
        p.type === 'mention' ? (
          <button
            key={i}
            type="button"
            onClick={() => p.agentId && onMentionClick?.(p.agentId)}
            className={`font-medium cursor-pointer hover:underline ${
              invertHighlight
                ? 'text-blue-200 hover:text-white'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {p.value}
          </button>
        ) : (
          <span key={i}>{p.value}</span>
        )
      )}
    </span>
  )
}
