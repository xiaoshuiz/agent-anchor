/**
 * Custom title bar for macOS when using titleBarStyle: 'hiddenInset'.
 * Provides a draggable region that matches app theme.
 */
export function TitleBar() {
  const isMac = navigator.platform.toUpperCase().includes('MAC')
  if (!isMac) return null

  return (
    <div
      className="h-11 shrink-0 bg-slate-800 border-b border-slate-700 flex items-center pl-20 pr-4"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <span className="text-sm font-medium text-slate-300 truncate">
        Agent Anchor
      </span>
    </div>
  )
}
