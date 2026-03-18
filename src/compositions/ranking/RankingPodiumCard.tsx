import { shortenAddress } from '../../helpers/walletUi'
import type { RankingEntry } from '../../hooks/useRankings'

const medalStyles = [
  'border-amber-300/45 bg-[radial-gradient(circle_at_top,#f7d487_0%,#7c4b1f_50%,#14181f_100%)]',
  'border-slate-300/35 bg-[radial-gradient(circle_at_top,#dce5ee_0%,#556473_50%,#131921_100%)]',
  'border-orange-400/35 bg-[radial-gradient(circle_at_top,#eeb486_0%,#74462d_52%,#14181f_100%)]',
] as const

export function RankingPodiumCard({ entry, rank }: { entry: RankingEntry; rank: number }) {
  return (
    <article
      className={`relative overflow-hidden rounded-3xl border p-4 shadow-[0_20px_50px_rgba(0,0,0,0.22)] ${medalStyles[rank - 1] ?? medalStyles[2]}`}
    >
      <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[11px] font-black text-white">
        #{rank}
      </div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">Top Performer</p>
      <p className="m-0 pr-12 text-xl font-semibold text-white">{entry.nickname || shortenAddress(entry.address, 6, 4)}</p>
      <p className="mt-1 mb-0 text-sm text-white/75">{shortenAddress(entry.address, 7, 5)}</p>
      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-white/60">Score</p>
          <p className="m-0 text-4xl font-black leading-none text-white">{entry.totalScore.toFixed(1)}</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-black/15 px-3 py-2">
          <p className="m-0 text-[11px] text-white/70">언더독</p>
          <p className="m-0 text-lg font-bold text-white">{entry.underdogHitCount}</p>
        </div>
      </div>
      <div className="mt-5 border-t border-white/10 pt-3">
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
