import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAgents } from '@/hooks/useAgents'
import { useChannels } from '@/hooks/useChannels'
import { useUIStore } from '@/stores/uiStore'
import { CreateAgentModal } from '@/components/AgentDetail/CreateAgentModal'

interface DmListProps {
  onOpenSettings?: () => void
}

export function DmList({ onOpenSettings }: DmListProps) {
  const { agents, loading } = useAgents()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const refreshAgents = useUIStore((s) => s.refreshAgents)
  const selectedChannelId = useUIStore((s) => s.selectedChannelId)
  const setSelectedChannel = useUIStore((s) => s.setSelectedChannel)
  const setSelectedActivityView = useUIStore((s) => s.setSelectedActivityView)
  const { channels } = useChannels()
  const selectedChannel = channels.find((c) => c.id === selectedChannelId) as { dm_agent_id?: string; type?: string } | undefined
  const selectedDmAgentId = selectedChannel?.type === 'dm' ? selectedChannel?.dm_agent_id : null

  const refreshChannels = useUIStore((s) => s.refreshChannels)

  const openDm = async (agentId: string) => {
    const channel = await window.electronAPI?.channels?.getOrCreateDm?.(agentId)
    if (channel) {
      refreshChannels()
      setSelectedActivityView(null)
      setSelectedChannel(channel.id)
    }
  }

  if (loading) {
    return (
      <div className="px-2 py-2 text-slate-400 text-sm">Loading...</div>
    )
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setShowCreateModal(true)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <Plus className="w-4 h-4 shrink-0" />
        Add Agent
      </button>
      {agents.length === 0 ? (
        <div className="px-2 py-2 text-slate-500 text-sm">No agents yet. Click above to add one.</div>
      ) : agents.map((agent) => (
        <button
          key={agent.id}
          type="button"
          onClick={() => openDm(agent.id)}
          className={`w-full text-left px-2 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
            selectedDmAgentId === agent.id ? 'bg-violet-600 hover:bg-violet-600 text-white' : 'hover:bg-slate-700'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-[10px] shrink-0">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <span className="truncate">{agent.name}</span>
        </button>
      ))}
      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => refreshAgents()}
          onOpenSettings={onOpenSettings ? () => { setShowCreateModal(false); onOpenSettings() } : undefined}
        />
      )}
    </div>
  )
}
