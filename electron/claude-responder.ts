/**
 * In-app Claude responder - calls Anthropic API directly, no external bridge.
 */
import Anthropic from '@anthropic-ai/sdk'

export async function respondWithClaude(
  apiKey: string,
  userContent: string,
  context: { channelName?: string; isDm?: boolean }
): Promise<string> {
  const client = new Anthropic({ apiKey })
  const system =
    context.isDm
      ? 'You are Claude in Agent Anchor. The user is messaging you in a direct message. Reply concisely.'
      : `You are Claude in Agent Anchor. Someone mentioned you in #${context.channelName ?? 'channel'}. Reply concisely.`

  const resp = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: userContent }],
  })
  const text = resp.content?.find((c) => c.type === 'text')
  return (text as { text?: string } | undefined)?.text ?? '(no response)'
}
