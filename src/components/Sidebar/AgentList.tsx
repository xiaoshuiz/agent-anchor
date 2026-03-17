import { useAgents } from '@/hooks/useAgents'
import { EmptyState } from '@/components/Channel/EmptyState'

export function AgentList() {
  const { agents, loading } = useAgents()

  if (loading) {
    return (
      <div className="px-2 py-2 text-slate-400 text-sm">Loading...</div>
    )
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        title="No agents"
        description="Agents will appear when they register"
        variant="compact"
      />
    )
  }

  return (
    <div className="space-y-0.5">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="px-2 py-1.5 rounded hover:bg-slate-700 cursor-default transition-colors flex items-center gap-2"
        >
          <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs shrink-0">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <span className="truncate">{agent.name}</span>
        </div>
      ))}
    </div>
  )
}
