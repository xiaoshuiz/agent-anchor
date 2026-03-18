import { useEffect } from 'react'
import { ChannelList } from './ChannelList'
import { DmList } from './DmList'
import { CollapseButton } from './CollapseButton'
import { useUIStore } from '@/stores/uiStore'
import { AtSign } from 'lucide-react'

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed)
  const selectedActivityView = useUIStore((s) => s.selectedActivityView)
  const setSelectedActivityView = useUIStore((s) => s.setSelectedActivityView)

  useEffect(() => {
    window.electronAPI?.sidebar?.getCollapsed?.().then(setSidebarCollapsed)
  }, [setSidebarCollapsed])

  return (
    <aside
      className={`flex flex-col bg-slate-800 text-white transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-60'
      }`}
    >
      <div className="p-4 border-b border-slate-700 flex items-center justify-between shrink-0">
        {!collapsed && (
          <h1 className="font-semibold text-lg truncate">Agent Anchor</h1>
        )}
        <CollapseButton />
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {!collapsed && (
          <>
            <div className="text-xs text-slate-400 uppercase tracking-wider px-2 py-1">
              Channels
            </div>
            <ChannelList />
            <div className="text-xs text-slate-400 uppercase tracking-wider px-2 py-1 mt-4">
              Direct Messages
            </div>
            <DmList />
            <div className="text-xs text-slate-400 uppercase tracking-wider px-2 py-1 mt-4">
              Activity
            </div>
            <button
              type="button"
              onClick={() => setSelectedActivityView(selectedActivityView === 'mentions' ? null : 'mentions')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-sm ${
                selectedActivityView === 'mentions'
                  ? 'bg-violet-600 hover:bg-violet-600 text-white'
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              <AtSign className="w-4 h-4 shrink-0" />
              @Mentions
            </button>
          </>
        )}
      </nav>
    </aside>
  )
}
