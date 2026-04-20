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
    <section className="grid gap-2.5">
      <div className="ui-leaderboard-hero card-shell relative overflow-hidden border px-4 py-3 md:px-5 md:py-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] md:items-center">
          <div className="min-w-0">
            <h2 className="ui-text-strong m-0 text-[30px] font-semibold tracking-[0.14em] md:text-[40px]">
              {t('ranking.pageTitle')}
            </h2>
            <p className="ui-text-body mt-2 mb-0 max-w-xl text-sm md:text-base">{t('ranking.pageDescription')}</p>
          </div>
          <RankingViewerCard viewer={viewer} isConnected={isConnected} />
        </div>
      </div>

      {isLoading ? (
        <RankingLoadingState />
      ) : errorMessage ? (
        <RankingErrorState errorMessage={errorMessage} onRetry={onRetry} />
      ) : (
        <div className="ui-leaderboard-list card-shell overflow-hidden border">
          <div className="ui-divider-faint ui-text-muted grid grid-cols-[72px_minmax(0,1fr)_88px] gap-2 border-b px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] md:grid-cols-[84px_minmax(0,1fr)_112px_280px]">
            <span>Rank</span>
            <span>Player</span>
            <span className="text-right">Score</span>
            <span className="hidden md:block">Stats</span>
          </div>
          <div className="ui-divider-faint divide-y">
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
