import type { Agent } from '@/types/electron'

/**
 * Parse @agent-name patterns from content and return matching agent ids.
 * Supports multi-word names (e.g. @Claude Writer).
 * Matches known agent names/ids only - avoids greedy regex that would
 * capture "@FE-Tech-leader 你好" as one token and fail to match.
 */
export function parseMentions(content: string, agents: Agent[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  // Sort by length desc to match "Claude Writer" before "Claude"
  const sorted = [...agents].sort(
    (a, b) =>
      Math.max(b.name.length, b.id.length) - Math.max(a.name.length, a.id.length)
  )
  let i = 0
  while ((i = content.indexOf('@', i)) !== -1) {
    const after = content.slice(i + 1)
    for (const agent of sorted) {
      const nameLen = agent.name.length
      const idLen = agent.id.length
      const nameMatch =
        after.length >= nameLen &&
        after.slice(0, nameLen).toLowerCase() === agent.name.toLowerCase()
      const idMatch = after.length >= idLen && after.startsWith(agent.id)
      const len = nameMatch ? nameLen : idMatch ? idLen : 0
      if (len > 0) {
        const next = after[len]
        const atEnd = !next || /[\s\p{P}\p{Z}]/u.test(next)
        if (atEnd && !seen.has(agent.id)) {
          seen.add(agent.id)
          result.push(agent.id)
        }
        break
      }
    }
    i += 1
  }
  return result
}
