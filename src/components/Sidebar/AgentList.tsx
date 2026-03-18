import { useState } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { useAgentStatus } from '@/hooks/useAgentStatus'
import { EmptyState } from '@/components/Channel/EmptyState'
import { AgentDetail } from '@/components/AgentDetail/AgentDetail'

export function AgentList() {
  const { agents, loading } = useAgents()
  const status = useAgentStatus()
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

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
    <>
      <div className="space-y-0.5">
        {agents.map((agent) => {
          const isOnline = status[agent.id] === 'online'
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => setSelectedAgentId(agent.id)}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-700 cursor-pointer transition-colors flex items-center gap-2"
            >
              <div className="relative shrink-0">
                <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-[10px] shrink-0">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full border border-slate-800 ${
                    isOnline ? 'bg-green-500' : 'bg-slate-500'
                  }`}
                  title={isOnline ? 'Online' : 'Offline'}
                />
              </div>
              <span className="truncate">{agent.name}</span>
            </button>
          )
        })}
      </div>
      {selectedAgentId && (
        <AgentDetail
          agentId={selectedAgentId}
          onClose={() => setSelectedAgentId(null)}
        />
      )}
    </>
  )
}
