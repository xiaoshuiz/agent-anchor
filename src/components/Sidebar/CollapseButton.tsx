import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

export function CollapseButton() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <button
      onClick={toggleSidebar}
      className="p-1.5 rounded hover:bg-slate-700 transition-colors"
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed ? (
        <PanelLeft size={18} />
      ) : (
        <PanelLeftClose size={18} />
      )}
    </button>
  )
}
