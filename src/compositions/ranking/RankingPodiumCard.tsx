import { shortenAddress } from '../../helpers/walletUi'
import type { RankingEntry } from '../../hooks/useRankings'

const medalStyles = [
  'border-amber-300/18 bg-[linear-gradient(180deg,rgba(255,216,122,0.12)_0%,rgba(255,255,255,0.03)_28%,rgba(255,255,255,0.015)_100%)]',
  'border-slate-200/14 bg-[linear-gradient(180deg,rgba(214,226,238,0.09)_0%,rgba(255,255,255,0.03)_28%,rgba(255,255,255,0.015)_100%)]',
  'border-orange-300/16 bg-[linear-gradient(180deg,rgba(231,167,116,0.1)_0%,rgba(255,255,255,0.03)_28%,rgba(255,255,255,0.015)_100%)]',
] as const

export function RankingPodiumCard({ entry, rank }: { entry: RankingEntry; rank: number }) {
  return (
    <article
      className={`relative overflow-hidden rounded-3xl border p-4 shadow-[0_18px_38px_rgba(0,0,0,0.16)] backdrop-blur ${medalStyles[rank - 1] ?? medalStyles[2]}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
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
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/8 pt-3">
        <div>
          <p className="ui-text-muted m-0 text-[10px] font-medium uppercase tracking-[0.18em]">Record</p>
          <p className="ui-text-strong mt-1 mb-0 text-sm font-medium">
            {entry.winCount}승 {entry.loseCount}패{entry.voidCount > 0 ? ` · 무효 ${entry.voidCount}` : ''}
          </p>
        </div>
        <StatPill label="언더독" value={String(entry.underdogHitCount)} />
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

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/16 px-3 py-2 text-right">
      <p className="ui-text-muted m-0 text-[10px] font-medium tracking-[0.12em]">{label}</p>
      <p className="ui-text-strong mt-1 mb-0 text-base font-semibold">{value}</p>
    </div>
  )
}
