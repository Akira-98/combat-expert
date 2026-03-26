import type { RankingEntry, RankingViewer } from '../hooks/useRankings'
import { useI18n } from '../i18n'
import { RankingLeaderboardRow } from './ranking/RankingLeaderboardRow'
import { RankingViewerCard } from './ranking/RankingViewerCard'

type RankingPageProps = {
  rankings: RankingEntry[]
  viewer: RankingViewer | null
  isLoading: boolean
  errorMessage?: string
  onRetry: () => void
  isConnected: boolean
}

export function RankingPage({ rankings, viewer, isLoading, errorMessage, onRetry, isConnected }: RankingPageProps) {
  const { t } = useI18n()
  return (
    <section className="grid gap-3">
      <div className="px-4 pt-4 pb-1 md:px-4 md:pt-5 md:pb-1">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="ui-text-strong m-0 text-[28px] font-semibold tracking-tight md:text-[36px]">{t('ranking.pageTitle')}</h2>
          </div>
        </div>
      </div>

      <RankingViewerCard viewer={viewer} isConnected={isConnected} />

      {isLoading ? (
        <RankingLoadingState />
      ) : errorMessage ? (
        <RankingErrorState errorMessage={errorMessage} onRetry={onRetry} />
      ) : (
        <div className="card-surface-soft card-shell-xl overflow-hidden">
          <div className="grid grid-cols-[72px_minmax(0,1fr)_88px] gap-2 border-b border-white/8 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 md:grid-cols-[84px_minmax(0,1fr)_112px_280px]">
            <span>Rank</span>
            <span>Player</span>
            <span className="text-right">Score</span>
            <span className="hidden md:block">Stats</span>
          </div>
          <div className="divide-y divide-white/6">
            {rankings.map((entry, index) => (
              <RankingLeaderboardRow key={entry.address} entry={entry} rank={index + 1} isViewer={viewer?.address === entry.address} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function RankingLoadingState() {
  return (
    <div className="grid gap-3">
      <div className="card-surface-soft card-shell-xl h-32" />
      <div className="card-surface-soft card-shell-xl h-20" />
      <div className="card-surface-soft card-shell-xl h-20" />
    </div>
  )
}

function RankingErrorState({ errorMessage, onRetry }: { errorMessage: string; onRetry: () => void }) {
  const { t } = useI18n()
  return (
    <div className="ui-state-danger rounded-2xl border p-4">
      <p className="m-0 text-sm font-semibold">{errorMessage}</p>
      <button className="ui-btn-secondary mt-3 rounded-lg border px-3 py-2 text-sm font-semibold" onClick={onRetry} type="button">
        {t('common.retry')}
      </button>
    </div>
  )
}
