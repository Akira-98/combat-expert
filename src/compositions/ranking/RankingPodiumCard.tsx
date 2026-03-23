import { shortenAddress } from '../../helpers/walletUi'
import type { RankingEntry } from '../../hooks/useRankings'

const podiumCardTone =
  'border-[color:var(--app-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.012)_100%)]'

export function RankingPodiumCard({ entry, rank }: { entry: RankingEntry; rank: number }) {
  return (
    <article
      className={`relative overflow-hidden rounded-3xl border p-4 shadow-[0_0_0_1px_color-mix(in_oklab,var(--app-border)_24%,transparent)] ${podiumCardTone}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-black/18 px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] text-slate-200">
            #{rank}
          </div>
          <p className="ui-text-strong m-0 truncate text-lg font-semibold md:text-xl">{entry.nickname || shortenAddress(entry.address, 6, 4)}</p>
          <p className="ui-text-muted mt-1 mb-0 truncate text-sm">{shortenAddress(entry.address, 7, 5)}</p>
        </div>
        <div className="text-right">
          <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">Score</p>
          <p className="ui-text-strong mt-1 mb-0 text-3xl font-semibold leading-none md:text-[2rem]">{entry.totalScore.toFixed(1)}</p>
        </div>
      </div>
      <div className="mt-5 border-t border-white/6 pt-3">
        <div>
          <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">Record</p>
          <p className="ui-text-strong mt-1 mb-0 text-sm font-medium">
            {entry.winCount}승 {entry.loseCount}패{entry.voidCount > 0 ? ` · 무효 ${entry.voidCount}` : ''}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <EntryMetrics entry={entry} />
      </div>
    </article>
  )
}

function EntryMetrics({ entry }: { entry: RankingEntry }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300">
      <span>적중 {entry.winCount}</span>
      <span>미적중 {entry.loseCount}</span>
      <span>언더독 {entry.underdogHitCount}</span>
      <span>총 {entry.eventCount}건</span>
    </div>
  )
}
