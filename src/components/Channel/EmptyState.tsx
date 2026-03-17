interface EmptyStateProps {
  title: string
  description?: string
  variant?: 'default' | 'compact'
}

export function EmptyState({
  title,
  description,
  variant = 'default',
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <div className="px-2 py-3 text-slate-400 text-sm">
        <p className="font-medium">{title}</p>
        {description && <p className="text-xs mt-0.5">{description}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 mb-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-slate-400 dark:text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          {description}
        </p>
      )}
    </div>
  )
}
