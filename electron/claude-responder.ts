/**
 * In-app Claude responder - calls Anthropic API directly, no external bridge.
 */
import Anthropic from '@anthropic-ai/sdk'

export async function respondWithClaude(
  apiKey: string,
  userContent: string,
  context: {
    channelName?: string
    isDm?: boolean
    agentName?: string
    agentDescription?: string | null
  }
): Promise<string> {
  const client = new Anthropic({ apiKey })
  const identity = context.agentDescription
    ? `You are ${context.agentName}. ${context.agentDescription}`
    : `You are ${context.agentName} in Agent Anchor.`
  const system =
    context.isDm
      ? `${identity} The user is messaging you in a direct message. Reply concisely.`
      : `${identity} Someone mentioned you in #${context.channelName ?? 'channel'}. Reply concisely.`

  const resp = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: userContent }],
  })
  const text = resp.content?.find((c) => c.type === 'text')
  return (text as { text?: string } | undefined)?.text ?? '(no response)'
}
