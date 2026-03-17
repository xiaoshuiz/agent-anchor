export default function App() {
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="font-semibold text-lg">Agent Anchor</h1>
        </div>
        <nav className="flex-1 p-2">
          <div className="text-xs text-slate-400 uppercase tracking-wider px-2 py-1">
            Channels
          </div>
          <div className="px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"># general</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider px-2 py-1 mt-4">
            Agents
          </div>
          <div className="px-2 py-1 rounded hover:bg-slate-700 cursor-pointer">Coder</div>
        </nav>
      </aside>
      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-white dark:bg-slate-800 flex items-center px-4">
          <span className="font-medium"># general</span>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-slate-500 text-sm">Messages will appear here...</div>
        </div>
        <footer className="p-4 border-t bg-white dark:bg-slate-800">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
          />
        </footer>
      </main>
    </div>
  )
}
