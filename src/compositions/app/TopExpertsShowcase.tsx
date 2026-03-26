import type { RankingEntry } from '../../hooks/useRankings'
import { RankingPodiumCard } from '../ranking/RankingPodiumCard'

type TopExpertsShowcaseProps = {
  rankings: RankingEntry[]
  isLoading: boolean
  errorMessage?: string
}

export function TopExpertsShowcase({ rankings, isLoading, errorMessage }: TopExpertsShowcaseProps) {
  const podium = rankings.slice(0, 3)

  if (!isLoading && !errorMessage && podium.length === 0) return null

  return (
    <section className="grid gap-3 md:mt-2 md:gap-4">
      <p className="ui-text-strong m-0 px-1 text-lg font-semibold">Top Expert</p>

      {isLoading ? (
        <>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 md:hidden">
            <div className="card-surface-soft card-shell-xl h-48 w-[calc(100vw-2rem)] max-w-[360px] shrink-0 snap-center" />
            <div className="card-surface-soft card-shell-xl h-48 w-[calc(100vw-2rem)] max-w-[360px] shrink-0 snap-center" />
            <div className="card-surface-soft card-shell-xl h-48 w-[calc(100vw-2rem)] max-w-[360px] shrink-0 snap-center" />
          </div>
          <div className="hidden gap-3 md:grid md:grid-cols-3">
            <div className="card-surface-soft card-shell-xl h-56" />
            <div className="card-surface-soft card-shell-xl h-56" />
            <div className="card-surface-soft card-shell-xl h-56" />
          </div>
        </>
      ) : errorMessage ? (
        <div className="ui-state-danger rounded-2xl border p-4">
          <p className="m-0 text-sm font-semibold">{errorMessage}</p>
        </div>
      ) : (
        <>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 md:hidden">
            {podium.map((entry, index) => (
              <div key={entry.address} className="w-[calc(100vw-2rem)] max-w-[360px] shrink-0 snap-center">
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
    </section>
  )
}
