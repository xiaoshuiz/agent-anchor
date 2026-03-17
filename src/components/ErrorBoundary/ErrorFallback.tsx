import type { FallbackProps } from 'react-error-boundary'

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100 dark:bg-slate-900 p-8">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {message}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
