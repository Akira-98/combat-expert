import { useI18n } from '../../i18n'

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string
  message?: string
  onRetry: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="ui-state-danger-surface rounded-md border p-3 md:rounded-lg">
      <p className="ui-text-strong m-0 text-sm font-semibold">{title}</p>
      {message && <p className="ui-text-body mt-1 text-xs">{message}</p>}
      <button
        className="ui-btn-danger-soft mt-2 rounded-md border px-3 py-1.5 text-xs font-semibold"
        onClick={onRetry}
        type="button"
      >
        {t('common.retry')}
      </button>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="card-surface-soft card-shell border-dashed p-4 text-center">
      <p className="ui-text-strong m-0 text-sm font-semibold">{title}</p>
      <p className="ui-text-muted mt-1 text-xs">{description}</p>
    </div>
  )
}

export function GamesSkeletonList() {
  return (
    <div className="grid gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-md border border-slate-200 bg-slate-50 p-3 md:rounded-lg">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 flex gap-1.5">
            <div className="h-6 w-16 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-16 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-16 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MarketsSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="rounded-md border border-slate-200 bg-white p-3 md:rounded-lg">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
            {Array.from({ length: 6 }).map((_, itemIndex) => (
              <div key={itemIndex} className="h-10 animate-pulse rounded-md border border-slate-200 bg-slate-50 md:rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
