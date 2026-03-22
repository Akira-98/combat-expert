import type { RankingEntry, RankingViewer } from '../hooks/useRankings'
import { RankingLeaderboardRow } from './ranking/RankingLeaderboardRow'
import { RankingPodiumCard } from './ranking/RankingPodiumCard'
import { RankingViewerCard } from './ranking/RankingViewerCard'

type RankingPageProps = {
  rankings: RankingEntry[]
  viewer: RankingViewer | null
  updatedAt: string | null
  isLoading: boolean
  errorMessage?: string
  onRetry: () => void
  isConnected: boolean
}

function formatUpdatedAt(value: string | null) {
  if (!value) return '집계 시각 없음'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '집계 시각 없음'
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function RankingPage({ rankings, viewer, updatedAt, isLoading, errorMessage, onRetry, isConnected }: RankingPageProps) {
  const podium = rankings.slice(0, 3)
  const leaderboard = rankings.slice(3)

  return (
    <section className="grid gap-4">
      <div className="card-surface card-shell-xl overflow-hidden">
        <div className="border-b border-white/8 bg-[linear-gradient(135deg,rgba(255,107,0,0.22),rgba(11,15,20,0.4)_42%,rgba(255,255,255,0.03))] px-4 py-5 md:px-6 md:py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="ui-text-strong m-0 text-[28px] font-semibold tracking-tight md:text-[36px]">Top 격잘알 랭킹</h2>
              <p className="ui-text-muted mt-2 mb-0 text-xs md:text-sm">{formatUpdatedAt(updatedAt)}</p>
            </div>
          </div>
        </div>

        <RankingViewerCard viewer={viewer} isConnected={isConnected} />

        <div className="px-4 py-5 md:px-6 md:py-6">
          {isLoading ? (
            <RankingLoadingState />
          ) : errorMessage ? (
            <RankingErrorState errorMessage={errorMessage} onRetry={onRetry} />
          ) : (
            <div className="grid gap-5">
              <div className="grid gap-3 md:grid-cols-3">
                {podium.map((entry, index) => (
                  <RankingPodiumCard key={entry.address} entry={entry} rank={index + 1} />
                ))}
              </div>

              <div className="card-surface-soft card-shell-xl overflow-hidden">
                <div className="grid grid-cols-[72px_minmax(0,1fr)_88px] gap-2 border-b border-white/8 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 md:grid-cols-[84px_minmax(0,1fr)_112px_280px]">
                  <span>Rank</span>
                  <span>Player</span>
                  <span className="text-right">Score</span>
                  <span className="hidden md:block">Stats</span>
                </div>
                <div className="divide-y divide-white/6">
                  {leaderboard.map((entry, index) => (
                    <RankingLeaderboardRow key={entry.address} entry={entry} rank={index + 4} isViewer={viewer?.address === entry.address} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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
  return (
    <div className="ui-state-danger rounded-2xl border p-4">
      <p className="m-0 text-sm font-semibold">{errorMessage}</p>
      <button className="ui-btn-secondary mt-3 rounded-lg border px-3 py-2 text-sm font-semibold" onClick={onRetry} type="button">
        다시 불러오기
      </button>
    </div>
  )
}
