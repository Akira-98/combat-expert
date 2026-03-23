import type { RankingEntry } from '../../hooks/useRankings'
import { RankingPodiumCard } from '../ranking/RankingPodiumCard'

type TopExpertsShowcaseProps = {
  rankings: RankingEntry[]
  updatedAt: string | null
  isLoading: boolean
  errorMessage?: string
  onOpenRanking: () => void
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

export function TopExpertsShowcase({ rankings, updatedAt, isLoading, errorMessage, onOpenRanking }: TopExpertsShowcaseProps) {
  const podium = rankings.slice(0, 3)

  if (!isLoading && !errorMessage && podium.length === 0) return null

  return (
    <section className="card-surface card-shell-xl overflow-hidden">
      <div className="border-b border-white/8 bg-[linear-gradient(135deg,rgba(255,107,0,0.2),rgba(11,15,20,0.4)_42%,rgba(255,255,255,0.03))] px-4 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="ui-text-muted m-0 text-[11px] font-medium uppercase tracking-[0.18em]">Top Expert</p>
            <h2 className="ui-text-strong mt-2 mb-0 text-[28px] font-semibold tracking-tight md:text-[34px]">이번 주 포디움</h2>
            <p className="ui-text-muted mt-2 mb-0 text-xs md:text-sm">{formatUpdatedAt(updatedAt)}</p>
          </div>
          <button className="ui-btn-secondary rounded-xl border px-4 py-2 text-sm font-semibold" onClick={onOpenRanking} type="button">
            전체 랭킹 보기
          </button>
        </div>
      </div>

      <div className="px-4 py-5 md:px-6 md:py-6">
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="card-surface-soft card-shell-xl h-48 md:h-56" />
            <div className="card-surface-soft card-shell-xl h-48 md:h-56" />
            <div className="card-surface-soft card-shell-xl h-48 md:h-56" />
          </div>
        ) : errorMessage ? (
          <div className="ui-state-danger rounded-2xl border p-4">
            <p className="m-0 text-sm font-semibold">{errorMessage}</p>
          </div>
        ) : (
          <>
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 md:hidden">
              {podium.map((entry, index) => (
                <div key={entry.address} className="w-[calc(100vw-2.5rem)] max-w-[360px] shrink-0 snap-center">
                  <RankingPodiumCard entry={entry} rank={index + 1} />
                </div>
              ))}
            </div>
            <div className="hidden gap-3 md:grid md:grid-cols-3">
              {podium.map((entry, index) => (
                <RankingPodiumCard key={entry.address} entry={entry} rank={index + 1} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
