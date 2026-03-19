import type { Agent } from '@/types/electron'

/**
 * Parse @agent-name patterns from content and return matching agent ids.
 * Supports multi-word names (e.g. @Claude Writer).
 * Matches @name or @agent-id (case-insensitive for name, exact for id).
 */
export function parseMentions(content: string, agents: Agent[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  const regex = /@([\w-]+(?:\s+[\w-]+)*)/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(content)) !== null) {
    const token = m[1].trim()
    const agent = agents.find(
      (a) => a.id === token || a.name.toLowerCase() === token.toLowerCase()
    )
    if (agent && !seen.has(agent.id)) {
      seen.add(agent.id)
      result.push(agent.id)
    }
  }
  return result
}
